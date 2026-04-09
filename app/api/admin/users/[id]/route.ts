import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBuiltInAdmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

// Middleware to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

const updateUserSchema = z.object({
  role: z.enum(["FREELANCER", "CLIENT", "ADMIN"]).optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if user is admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { role, name, bio } = updateUserSchema.parse(body);

    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { username: true },
    });

    if (isBuiltInAdmin(userToUpdate)) {
      return NextResponse.json(
        { error: "The built-in admin account cannot be modified here." },
        { status: 400 }
      );
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Check if user is admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true, username: true },
    });

    if (isBuiltInAdmin(userToDelete)) {
      return NextResponse.json(
        { error: "The built-in admin account cannot be deleted." },
        { status: 400 }
      );
    }

    if (userToDelete?.role === "ADMIN" && adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last admin user" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
