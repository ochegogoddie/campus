import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAuthCode, PASSWORD_RESET_CODE_PURPOSE } from "@/lib/auth-codes";
import { sendVerificationEmail } from "@/lib/brevo";
import { isBuiltInAdmin } from "@/lib/admin";

const requestResetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || isBuiltInAdmin(user)) {
      return NextResponse.json(
        { error: "No account was found for that email address." },
        { status: 404 }
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          error:
            "Verify this email address first before trying to reset the password.",
        },
        { status: 400 }
      );
    }

    const { challengeId, code } = await createAuthCode({
      email: user.email,
      purpose: PASSWORD_RESET_CODE_PURPOSE,
      userId: user.id,
      ttlMinutes: 15,
    });

    await sendVerificationEmail({
      toEmail: user.email,
      toName: user.name,
      subject: "Your Campus Gigs password reset code",
      heading: "Reset your login details",
      intro:
        "Use this code to reset your Campus Gigs login details and choose a new username and password.",
      code,
      expiresInMinutes: 15,
    });

    return NextResponse.json({
      message: "A password reset code has been sent to your email.",
      challengeId,
      email: user.email,
      maskedEmail: maskEmail(user.email),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset code." },
      { status: 500 }
    );
  }
}
