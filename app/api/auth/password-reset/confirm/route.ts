import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  consumeAuthCode,
  PASSWORD_RESET_CODE_PURPOSE,
  SIGNUP_CODE_PURPOSE,
} from "@/lib/auth-codes";
import { isBuiltInAdmin, isReservedUsername } from "@/lib/admin";

const confirmResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  challengeId: z.string().min(1, "Reset challenge is missing"),
  code: z.string().length(6, "Enter the 6-digit reset code"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, challengeId, code, username, password } =
      confirmResetSchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    if (isReservedUsername(normalizedUsername)) {
      return NextResponse.json(
        {
          error:
            "This username is reserved and cannot be used for a password reset.",
        },
        { status: 400 }
      );
    }

    const conflictingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
        NOT: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      },
      select: { id: true },
    });

    if (conflictingUser) {
      return NextResponse.json(
        { error: "That username is already in use. Please choose another one." },
        { status: 400 }
      );
    }

    const challenge = await consumeAuthCode({
      challengeId,
      code,
      purpose: PASSWORD_RESET_CODE_PURPOSE,
    });

    if (
      !challenge?.user ||
      challenge.email.toLowerCase() !== normalizedEmail ||
      challenge.user.email.toLowerCase() !== normalizedEmail
    ) {
      return NextResponse.json(
        { error: "Invalid or expired password reset code." },
        { status: 400 }
      );
    }

    if (isBuiltInAdmin(challenge.user)) {
      return NextResponse.json(
        { error: "The built-in admin account cannot be reset here." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: challenge.user.id },
        data: {
          username: normalizedUsername,
          password: passwordHash,
          emailVerifiedAt: challenge.user.emailVerifiedAt ?? new Date(),
        },
      }),
      prisma.authCode.deleteMany({
        where: {
          userId: challenge.user.id,
          purpose: {
            in: [PASSWORD_RESET_CODE_PURPOSE, SIGNUP_CODE_PURPOSE],
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Your login details have been updated successfully.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That username is already in use. Please choose another one." },
        { status: 400 }
      );
    }

    console.error("Password reset confirm error:", error);
    return NextResponse.json(
      { error: "Failed to update login details." },
      { status: 500 }
    );
  }
}
