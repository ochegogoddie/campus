import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifySignupCode } from "@/lib/auth-codes";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Enter the 6-digit verification code"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = verifySchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerifiedAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No pending account was found for that email address." },
        { status: 404 }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({
        message: "This email is already verified. You can sign in now.",
      });
    }

    const verifiedUser = await verifySignupCode(normalizedEmail, code);

    if (!verifiedUser) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email." },
      { status: 500 }
    );
  }
}
