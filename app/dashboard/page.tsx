"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getProjectCapacitySummary } from "@/lib/project-capacity";
import {
  BriefcaseIcon,
  ChartIcon,
  ChatCircleIcon,
  FolderStackIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface UserStats {
  gigs: number;
  projects: number;
  applications: number;
  notifications: number;
  unreadMessages: number;
  totalUsers: number;
  clients: number;
  totalGigs: number;
  totalProjects: number;
}

interface DashboardProject {
  id: string;
  title: string;
  category: string;
  maxMembers: number;
  _count: {
    members: number;
  };
  createdBy: {
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    gigs: 0,
    projects: 0,
    applications: 0,
    notifications: 0,
    unreadMessages: 0,
    totalUsers: 0,
    clients: 0,
    totalGigs: 0,
    totalProjects: 0,
  });
  const [projectSnapshot, setProjectSnapshot] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status !== "authenticated") return;

    const fetchStats = async () => {
      try {
        const [statsResponse, projectsResponse] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/projects?take=4"),
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data);
        }

        if (projectsResponse.ok) {
          const projectData = await projectsResponse.json();
          setProjectSnapshot(projectData.projects || []);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-shell">
          <div className="hero-card animate-pulse">
            <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 h-10 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-8">
        <PageHero
          badge="Personal workspace"
          title={`Welcome back, ${session?.user?.name || "there"}.`}
          description="Track your platform activity, jump back into conversations, and move quickly between gigs, projects, and profile updates."
          actions={
            <>
              <Link href="/post-gig">
                <Button size="lg">Post a task</Button>
              </Link>
              <Link href="/create-project">
                <Button size="lg" variant="outline">
                  Create a project
                </Button>
              </Link>
            </>
          }
          stats={[
            { label: "Unread messages", value: `${stats.unreadMessages}`, accent: "cyan" },
            { label: "Applications", value: `${stats.applications}`, accent: "amber" },
            { label: "Notifications", value: `${stats.notifications}`, accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Keep your profile sharp so projects and gigs convert better.",
                "Move from notifications into messages without losing context.",
                "Use this dashboard as your launchpad for all platform activity.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <SparkIcon className="mt-0.5 h-5 w-5 text-amber-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Students registered",
              value: stats.totalUsers,
              icon: UsersIcon,
              accent: "text-cyan-600 dark:text-cyan-300",
            },
            {
              label: "Clients registered",
              value: stats.clients,
              icon: ChartIcon,
              accent: "text-violet-600 dark:text-violet-300",
            },
            {
              label: "Gigs posted",
              value: stats.totalGigs,
              icon: BriefcaseIcon,
              accent: "text-emerald-600 dark:text-emerald-300",
            },
            {
              label: "Projects active",
              value: stats.totalProjects,
              icon: FolderStackIcon,
              accent: "text-amber-600 dark:text-amber-300",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.label} className="section-card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
                  <Icon className="h-5 w-5" />
                </div>
                <p className={`mt-5 text-3xl font-semibold ${item.accent}`}>
                  {isLoading ? "..." : item.value.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
              </article>
            );
          })}
        </section>

        <section className="section-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Project capacity
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                Check whether running teams are full or still missing members
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-cyan-300"
            >
              View all projects
            </Link>
          </div>

          {projectSnapshot.length === 0 ? (
            <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-400">
              No active projects to show yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {projectSnapshot.map((project) => {
                const capacity = getProjectCapacitySummary(
                  project._count.members,
                  project.maxMembers
                );
                const statusClasses =
                  capacity.status === "full"
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
                    : capacity.status === "almost-full"
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";

                return (
                  <Link key={project.id} href={`/project/${project.id}`} className="group">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 transition-transform duration-200 group-hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/45">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                            {project.category.replace("-", " ")}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                            {project.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Created by {project.createdBy.name}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}
                        >
                          {capacity.label}
                        </span>
                      </div>
                      <div className="mt-5 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${capacity.progress}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>
                          {project._count.members}/{project.maxMembers} members
                        </span>
                        <span>{capacity.detail}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="section-card p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 shadow-sm">
                <ChartIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  My activity
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  Your current pace across the platform
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Gigs posted", value: stats.gigs },
                { label: "Projects joined", value: stats.projects },
                { label: "Applications", value: stats.applications },
                { label: "Unread messages", value: stats.unreadMessages },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {isLoading ? "..." : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Quick actions
            </p>
            <div className="mt-5 grid gap-4">
              {[
                {
                  href: "/messages",
                  title: "Open messages",
                  description: "Continue conversations with clients, freelancers, and teammates.",
                  icon: ChatCircleIcon,
                },
                {
                  href: "/profile",
                  title: "Update profile",
                  description: "Refresh your bio, links, skills, and public positioning.",
                  icon: UsersIcon,
                },
                {
                  href: "/projects",
                  title: "Browse projects",
                  description: "Jump into collaborations that match your current focus.",
                  icon: FolderStackIcon,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href} className="group">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-4 transition-transform duration-200 group-hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/45">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
