import { createHash, randomInt } from "node:crypto";
import { prisma } from "./prisma";

export const SIGNUP_CODE_PURPOSE = "SIGNUP_VERIFY";
export const LOGIN_CODE_PURPOSE = "LOGIN";
export const PASSWORD_RESET_CODE_PURPOSE = "PASSWORD_RESET";

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function createAuthCode(params: {
  email: string;
  purpose: string;
  userId?: string | null;
  ttlMinutes?: number;
}) {
  const code = generateVerificationCode();
  const now = new Date();
  const expiresAt = addMinutes(now, params.ttlMinutes ?? 10);

  await prisma.authCode.deleteMany({
    where: {
      email: params.email,
      purpose: params.purpose,
    },
  });

  const challenge = await prisma.authCode.create({
    data: {
      email: params.email,
      purpose: params.purpose,
      codeHash: hashCode(code),
      expiresAt,
      userId: params.userId ?? null,
    },
  });

  return {
    challengeId: challenge.id,
    code,
    expiresAt,
  };
}

export async function consumeAuthCode(params: {
  challengeId: string;
  code: string;
  purpose: string;
}) {
  const challenge = await prisma.authCode.findUnique({
    where: { id: params.challengeId },
    include: {
      user: true,
    },
  });

  if (!challenge || challenge.purpose !== params.purpose) {
    return null;
  }

  if (challenge.consumedAt || challenge.expiresAt <= new Date()) {
    return null;
  }

  if (challenge.codeHash !== hashCode(params.code.trim())) {
    return null;
  }

  await prisma.authCode.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  return challenge;
}

export async function verifySignupCode(email: string, code: string) {
  const challenges = await prisma.authCode.findMany({
    where: {
      email,
      purpose: SIGNUP_CODE_PURPOSE,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const matchingChallenge = challenges.find(
    (challenge) => challenge.codeHash === hashCode(code.trim())
  );

  if (!matchingChallenge?.user) {
    return null;
  }

  await prisma.$transaction([
    prisma.authCode.update({
      where: { id: matchingChallenge.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: matchingChallenge.user.id },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.authCode.deleteMany({
      where: {
        userId: matchingChallenge.user.id,
        purpose: SIGNUP_CODE_PURPOSE,
      },
    }),
  ]);

  return matchingChallenge.user;
}
