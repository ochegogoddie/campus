import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  AUTH_CODE_TTL_MINUTES,
  createAuthCode,
  LOGIN_CODE_PURPOSE,
} from "@/lib/auth-codes";
import { resolveEmailDeliveryError, sendVerificationEmail } from "@/lib/brevo";
import { ADMIN_USERNAME, isBuiltInAdmin } from "@/lib/admin";

const requestCodeSchema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  const visible = localPart.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(localPart.length - 2, 1))}@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = requestCodeSchema.parse(body);
    const normalizedIdentifier = identifier.trim();

    if (normalizedIdentifier.toLowerCase() === ADMIN_USERNAME) {
      return NextResponse.json(
        {
          error:
            "The built-in admin account still uses direct sign-in and does not require an email code.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: normalizedIdentifier, mode: "insensitive" } },
          {
            email: {
              equals: normalizedIdentifier.toLowerCase(),
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect username, email, or password." },
        { status: 400 }
      );
    }

    if (isBuiltInAdmin(user)) {
      return NextResponse.json(
        {
          error:
            "The built-in admin account still uses direct sign-in and does not require an email code.",
        },
        { status: 400 }
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "This account is temporarily locked." },
        { status: 423 }
      );
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Verify your email address before logging in." },
        { status: 403 }
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect username, email, or password." },
        { status: 400 }
      );
    }

    const { challengeId, code } = await createAuthCode({
      email: user.email,
      purpose: LOGIN_CODE_PURPOSE,
      userId: user.id,
      ttlMinutes: AUTH_CODE_TTL_MINUTES,
    });

    await sendVerificationEmail({
      toEmail: user.email,
      toName: user.name,
      subject: "Your Campus Gigs login code",
      heading: "Confirm this login attempt",
      intro: "Use this code to finish signing in to your Campus Gigs account.",
      code,
      expiresInMinutes: AUTH_CODE_TTL_MINUTES,
    });

    return NextResponse.json({
      message: "A login code has been sent to your email.",
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

    console.error("Login code request error:", error);

    const emailDeliveryError = resolveEmailDeliveryError(
      error,
      "Failed to send login code."
    );

    if (emailDeliveryError.handled) {
      return NextResponse.json(
        { error: emailDeliveryError.message },
        { status: emailDeliveryError.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to send login code." },
      { status: 500 }
    );
  }
}
