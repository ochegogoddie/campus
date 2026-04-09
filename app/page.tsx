"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChartIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  FolderStackIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface Gig {
  id: string;
  title: string;
  category: string;
  budget: number;
  duration: string;
  poster: { name: string };
  _count: { applications: number };
}

interface Project {
  id: string;
  title: string;
  category: string;
  _count: { members: number };
  maxMembers: number;
  createdBy: { name: string };
}

interface PlatformStats {
  totalGigs: number;
  totalProjects: number;
  freelancers: number;
  clients: number;
  totalUsers: number;
}

const pillars = [
  {
    title: "Fast project discovery",
    description:
      "Find serious campus work without scrolling through messy listings or dead-end groups.",
    icon: BriefcaseIcon,
  },
  {
    title: "Credible collaboration",
    description:
      "Launch projects, share files, and keep discussions inside one polished workspace.",
    icon: FolderStackIcon,
  },
  {
    title: "Professional student profiles",
    description:
      "Show your strengths with a profile that looks more like a portfolio than a placeholder.",
    icon: UsersIcon,
  },
];

const proofPoints = [
  "Campus-first categories for gigs, services, and team projects",
  "Built-in messaging and notifications to keep work moving",
  "Admin-ready controls for platform growth and moderation",
];

export default function Home() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PlatformStats>({
    totalGigs: 0,
    totalProjects: 0,
    freelancers: 0,
    clients: 0,
    totalUsers: 0,
  });
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setStatsLoaded(true);
      })
      .catch(() => setStatsLoaded(true));

    fetch("/api/gigs?take=3")
      .then((response) => response.json())
      .then((data) => setRecentGigs(data.gigs || []))
      .catch(() => {});

    fetch("/api/projects?take=2")
      .then((response) => response.json())
      .then((data) => setRecentProjects(data.projects || []))
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-16">
        <PageHero
          badge="Designed for ambitious campus work"
          title="Student opportunities should look as professional as the people behind them."
          description="Task Hive helps students post gigs, discover paid work, build public profiles, and launch collaboration projects inside a premium campus marketplace."
          actions={
            <>
              <Link href="/gigs">
                <Button size="lg">
                  Explore tasks
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline">
                  View projects
                </Button>
              </Link>
            </>
          }
          stats={[
            {
              label: "Tasks posted",
              value: statsLoaded ? `${stats.totalGigs}` : "...",
              accent: "amber",
            },
            {
              label: "Freelancers active",
              value: statsLoaded ? `${stats.freelancers}` : "...",
              accent: "cyan",
            },
            {
              label: "Projects running",
              value: statsLoaded ? `${stats.totalProjects}` : "...",
              accent: "emerald",
            },
          ]}
          aside={
            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <SparkIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Campus Signal
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Stronger trust, clearer discovery, better presentation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/65 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <section className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="section-card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="section-card p-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-sm">
                <ChartIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Why it stands out
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  A cleaner product experience from first click to final deal
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <p className="text-3xl font-semibold text-amber-600 dark:text-amber-300">
                  {statsLoaded ? stats.totalUsers : "..."}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  People visible across campus talent, project teams, and clients.
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <p className="text-3xl font-semibold text-cyan-600 dark:text-cyan-300">
                  {statsLoaded ? stats.clients : "..."}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Client-side accounts actively posting campus-ready work.
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {statsLoaded ? stats.totalProjects : "..."}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Collaboration spaces where teams can build together in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="section-card p-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm">
                <ChatCircleIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Built-in momentum
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  Surprising extras users actually feel
                </h2>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                "Live messaging between task owners, freelancers, and project members",
                "On-platform file sharing and discussions for project collaboration",
                "A persistent light and dark theme switcher across every page",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="page-badge">Fresh opportunities</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-slate-50">
                Recent tasks ready for action
              </h2>
            </div>
            <Link
              href="/gigs"
              className="text-sm font-semibold text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-300"
            >
              View all tasks
            </Link>
          </div>

          {recentGigs.length === 0 ? (
            <div className="section-card p-10 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                No tasks posted yet
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {session
                  ? "Be the first person to publish a premium-looking task listing."
                  : "Create an account to post the first task in the hive."}
              </p>
              <div className="mt-6">
                <Link href={session ? "/post-gig" : "/signup"}>
                  <Button>{session ? "Post the first task" : "Create an account"}</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {recentGigs.map((gig) => (
                <Link key={gig.id} href={`/gig/${gig.id}`} className="group">
                  <article className="section-card h-full p-6 transition-transform duration-200 group-hover:-translate-y-1">
                    <span className="tag-chip">{gig.category}</span>
                    <h3 className="mt-5 line-clamp-2 text-xl font-semibold text-slate-950 transition-colors group-hover:text-amber-600 dark:text-slate-50 dark:group-hover:text-amber-300">
                      {gig.title}
                    </h3>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Budget
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                          KES {gig.budget}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {gig.duration}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <span>{gig.poster.name}</span>
                      <span>{gig._count.applications} applicants</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="page-badge">Collaboration spaces</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-slate-50">
                Open projects with room to grow
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-cyan-300"
            >
              Explore projects
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="section-card p-10 text-center">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                No projects yet
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {session
                  ? "Launch the first collaboration space and bring your team together."
                  : "Sign up to start the first project on the platform."}
              </p>
              <div className="mt-6">
                <Link href={session ? "/create-project" : "/signup"}>
                  <Button variant="outline">
                    {session ? "Create a project" : "Join and create"}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {recentProjects.map((project) => {
                const fill = Math.min(
                  100,
                  Math.round((project._count.members / project.maxMembers) * 100)
                );

                return (
                  <Link key={project.id} href={`/project/${project.id}`} className="group">
                    <article className="section-card h-full p-6 transition-transform duration-200 group-hover:-translate-y-1">
                      <span className="tag-chip">{project.category.replace("-", " ")}</span>
                      <h3 className="mt-5 line-clamp-2 text-xl font-semibold text-slate-950 transition-colors group-hover:text-cyan-700 dark:text-slate-50 dark:group-hover:text-cyan-300">
                        {project.title}
                      </h3>
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        Created by {project.createdBy.name}
                      </p>
                      <div className="mt-5 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>
                          {project._count.members}/{project.maxMembers} members
                        </span>
                        <span>{fill}% full</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {!session && (
          <section className="hero-card">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="page-badge">Ready to join the hive?</p>
                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                  Build a profile, get discovered, and make your campus work look serious.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  Whether you want to hire, freelance, or collaborate, Task Hive gives
                  you a more polished starting point than a generic notice board.
                </p>
                <div className="mt-7">
                  <Link href="/signup">
                    <Button size="lg">
                      Create your account
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    title: "Better first impressions",
                    copy: "Cleaner task cards, clearer project spaces, and stronger user profiles.",
                  },
                  {
                    title: "Built for growth",
                    copy: "The admin area, messaging, and support entry points are ready to scale.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45"
                  >
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {item.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
