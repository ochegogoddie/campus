import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getCloudinaryConfig, getMissingEnv } from "@/lib/env";
import { getBrevoConfig } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnvMissing = getMissingEnv(["DATABASE_URL", "NEXTAUTH_SECRET"]);
  const cloudinary = getCloudinaryConfig();
  const email = getBrevoConfig();

  if (requiredEnvMissing.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        baseUrl: getAppBaseUrl(),
        checks: {
          database: "unknown",
          auth: "misconfigured",
          email: email.configured ? "configured" : "missing",
          uploads: cloudinary.configured ? "cloudinary" : "db-fallback",
        },
        missingEnv: [
          ...requiredEnvMissing,
          ...(email.configured ? [] : email.missing),
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const optionalMissing = [
      ...(email.configured ? [] : email.missing),
      ...(cloudinary.configured ? [] : cloudinary.missing),
    ];
    const status = optionalMissing.length > 0 ? "degraded" : "ok";

    return NextResponse.json({
      status,
      baseUrl: getAppBaseUrl(),
      checks: {
        database: "reachable",
        auth: "configured",
        email: email.configured ? "configured" : "missing",
        uploads: cloudinary.configured ? "cloudinary" : "db-fallback",
      },
      missingEnv: optionalMissing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        baseUrl: getAppBaseUrl(),
        checks: {
          database: "unreachable",
          auth: "configured",
          email: email.configured ? "configured" : "missing",
          uploads: cloudinary.configured ? "cloudinary" : "db-fallback",
        },
        missingEnv: [
          ...(email.configured ? [] : email.missing),
          ...(cloudinary.configured ? [] : cloudinary.missing),
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
