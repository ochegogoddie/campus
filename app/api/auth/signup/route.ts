import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isReservedUsername } from "@/lib/admin";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["FREELANCER", "CLIENT"]).default("FREELANCER"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, phone, password, name, role } = signupSchema.parse(body);

    if (isReservedUsername(username)) {
      return NextResponse.json(
        { error: "This username is reserved. Please choose a different username." },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken. Please choose a different username." },
        { status: 400 }
      );
    }

    // Check if email already exists (based on username)
    const emailToUse = `${username}@campus-gigs.local`;
    const existingEmail = await prisma.user.findUnique({
      where: { email: emailToUse },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "This username is already registered. Please try another." },
        { status: 400 }
      );
    }

    // Validate phone format if provided
    if (phone && !/^\+?[0-9\s\-()]+$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user with role
    const user = await prisma.user.create({
      data: {
        username,
        phone: phone || null,
        password: hashedPassword,
        name,
        email: emailToUse,
        role: role,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
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

    // Log the actual error for debugging
    console.error("Signup error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    // Check if it's a database connection error
    const errorMessage = String(error);
    
    if (errorMessage.includes("Can't reach database") || errorMessage.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    // Return more detailed error in development
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
