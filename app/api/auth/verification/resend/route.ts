import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthCode, SIGNUP_CODE_PURPOSE } from "@/lib/auth-codes";
import { sendVerificationEmail } from "@/lib/brevo";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No pending account was found for that email address." },
        { status: 404 }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "This email is already verified." },
        { status: 400 }
      );
    }

    const { code } = await createAuthCode({
      email: user.email,
      purpose: SIGNUP_CODE_PURPOSE,
      userId: user.id,
      ttlMinutes: 15,
    });

    await sendVerificationEmail({
      toEmail: user.email,
      toName: user.name,
      subject: "Your new Campus Gigs verification code",
      heading: "Here is your new verification code",
      intro: "Use this code to finish verifying your Campus Gigs account.",
      code,
      expiresInMinutes: 15,
    });

    return NextResponse.json({
      message: "A fresh verification code has been sent to your email.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
