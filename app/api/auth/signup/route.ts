import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isReservedUsername } from "@/lib/admin";
import {
  AUTH_CODE_TTL_MINUTES,
  createAuthCode,
  SIGNUP_CODE_PURPOSE,
} from "@/lib/auth-codes";
import { resolveEmailDeliveryError, sendVerificationEmail } from "@/lib/brevo";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["FREELANCER", "CLIENT"]).default("FREELANCER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, phone, password, name, role } = signupSchema.parse(body);
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (isReservedUsername(normalizedUsername)) {
      return NextResponse.json(
        { error: "This username is reserved. Please choose a different username." },
        { status: 400 }
      );
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (
      existingByUsername &&
      existingByUsername.emailVerifiedAt &&
      existingByUsername.username === normalizedUsername
    ) {
      return NextResponse.json(
        { error: "Username already taken. Please choose a different username." },
        { status: 400 }
      );
    }

    if (existingByEmail?.emailVerifiedAt) {
      return NextResponse.json(
        { error: "This email is already registered. Please use another one." },
        { status: 400 }
      );
    }

    if (
      existingByUsername &&
      existingByEmail &&
      existingByUsername.id !== existingByEmail.id
    ) {
      return NextResponse.json(
        { error: "The username and email are already linked to different accounts." },
        { status: 400 }
      );
    }

    if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const pendingUser = existingByEmail || existingByUsername;

    if (
      pendingUser &&
      (pendingUser.username !== normalizedUsername || pendingUser.email !== normalizedEmail)
    ) {
      return NextResponse.json(
        {
          error:
            "An unverified account already exists with this username or email. Use the same details or request a new signup with different details.",
        },
        { status: 400 }
      );
    }

    const user = pendingUser
      ? await prisma.user.update({
          where: { id: pendingUser.id },
          data: {
            username: normalizedUsername,
            email: normalizedEmail,
            phone: phone || null,
            password: hashedPassword,
            name,
            role,
            emailVerifiedAt: null,
          },
        })
      : await prisma.user.create({
          data: {
            username: normalizedUsername,
            email: normalizedEmail,
            phone: phone || null,
            password: hashedPassword,
            name,
            role,
          },
        });

    const { code } = await createAuthCode({
      email: user.email,
      purpose: SIGNUP_CODE_PURPOSE,
      userId: user.id,
      ttlMinutes: AUTH_CODE_TTL_MINUTES,
    });

    await sendVerificationEmail({
      toEmail: user.email,
      toName: user.name,
      subject: "Verify your Campus Gigs account",
      heading: "Confirm your email address",
      intro:
        "Use this verification code to finish creating your Campus Gigs account.",
      code,
      expiresInMinutes: AUTH_CODE_TTL_MINUTES,
    });

    return NextResponse.json(
      {
        message: "Account created. A verification code has been sent to your email.",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: messages },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const field = error.meta?.target as string[] | undefined;
        const fieldName = field?.[0] || "field";
        return NextResponse.json(
          { error: `This ${fieldName} is already in use. Please try a different one.` },
          { status: 400 }
        );
      }
    }

    console.error("Signup error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    const errorMessage = String(error);

    const emailDeliveryError = resolveEmailDeliveryError(
      error,
      "An error occurred during signup. Please try again later."
    );

    if (emailDeliveryError.handled) {
      return NextResponse.json(
        { error: emailDeliveryError.message },
        { status: emailDeliveryError.status }
      );
    }
    
    if (errorMessage.includes("Can't reach database") || errorMessage.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    const isDevelopment = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      {
        error: "An error occurred during signup. Please try again later.",
        ...(isDevelopment && { 
          details: error instanceof Error ? error.message : String(error),
          stack: isDevelopment && error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
