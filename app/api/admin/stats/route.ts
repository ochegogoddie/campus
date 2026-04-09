import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Middleware to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all statistics
    const [
      totalUsers,
      freelancers,
      clients,
      admins,
      totalGigs,
      activeGigs,
      completedGigs,
      totalProjects,
      openProjects,
      projectCapacity,
      recentUsers,
      recentGigs,
      recentProjects,
    ] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "FREELANCER" } }),
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.gig.count(),
        prisma.gig.count({ where: { status: "open" } }),
        prisma.gig.count({ where: { status: "completed" } }),
        prisma.project.count(),
        prisma.project.count({ where: { status: "open" } }),
        prisma.project.findMany({
          select: {
            maxMembers: true,
            _count: { select: { members: true } },
          },
        }),
        prisma.user.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
        prisma.gig.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            budget: true,
            status: true,
            createdAt: true,
            poster: { select: { name: true } },
            _count: { select: { applications: true } },
          },
        }),
        prisma.project.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            visibility: true,
            maxMembers: true,
            createdAt: true,
            createdBy: { select: { name: true } },
            _count: { select: { members: true } },
          },
        }),
      ]);

    const fullProjects = projectCapacity.filter(
      (project) => project._count.members >= project.maxMembers
    ).length;

    const stats = {
      totalUsers,
      totalGigs,
      totalProjects,
      freelancers,
      clients,
      admins,
      activeGigs,
      completedGigs,
      openProjects,
      fullProjects,
      recentUsers,
      recentGigs,
      recentProjects,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
