import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ userId: string }> };
export const dynamic = "force-dynamic";

// GET /api/people/[userId] — public profile
export async function GET(req: NextRequest, { params }: Params) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      skills: true,
      university: true,
      major: true,
      yearsOfStudy: true,
      githubUrl: true,
      websiteUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      createdAt: true,
      postedGigs: {
        where: { status: "open" },
        select: { id: true, title: true, category: true, budget: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      createdProjects: {
        where: { visibility: "public" },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          skillsNeeded: true,
          visibility: true,
          createdAt: true,
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          postedGigs: true,
          createdProjects: true,
          gigApplications: true,
          projectMemberships: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Remap field names to match what the client page expects
  const mappedProjects = user.createdProjects.map((project) => ({
    ...project,
    skills: project.skillsNeeded,
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      skills: user.skills,
      university: user.university,
      major: user.major,
      yearsOfStudy: user.yearsOfStudy,
      githubUrl: user.githubUrl,
      websiteUrl: user.websiteUrl,
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      createdAt: user.createdAt,
      gigs: user.postedGigs,
      projects: mappedProjects,
      _count: {
        postedGigs: user._count.postedGigs,
        createdProjects: user._count.createdProjects,
        applications: user._count.gigApplications,
      },
    },
  });
}
