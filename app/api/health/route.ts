import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getCloudinaryConfig, getMissingEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnvMissing = getMissingEnv(["DATABASE_URL", "NEXTAUTH_SECRET"]);
  const cloudinary = getCloudinaryConfig();

  if (requiredEnvMissing.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        baseUrl: getAppBaseUrl(),
        checks: {
          database: "unknown",
          auth: "misconfigured",
          uploads: cloudinary.configured ? "configured" : "missing",
        },
        missingEnv: requiredEnvMissing,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      baseUrl: getAppBaseUrl(),
      checks: {
        database: "reachable",
        auth: "configured",
        uploads: cloudinary.configured ? "configured" : "missing",
      },
      missingEnv: cloudinary.configured ? [] : cloudinary.missing,
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
          uploads: cloudinary.configured ? "configured" : "missing",
        },
        missingEnv: cloudinary.configured ? [] : cloudinary.missing,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
