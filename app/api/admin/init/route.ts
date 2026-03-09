import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/admin/init — initialize admin user (one-time setup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initCode } = body;

    // Check if the init code is correct (same as admin registration code)
    const expectedCode = process.env.ADMIN_REGISTRATION_CODE || "110238870";
    if (initCode !== expectedCode) {
      return NextResponse.json({ error: "Invalid init code" }, { status: 403 });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: "password" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        username: "password",
        role: existingAdmin.role,
      });
    }

    // Hash the password
    const hashedPassword = await hash("username1", 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: "password",
        email: "admin@taskhive.local",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully!",
        username: "password",
        password: "username1",
        role: "ADMIN",
        email: "admin@taskhive.local",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user", details: String(error) },
      { status: 500 }
    );
  }
}
