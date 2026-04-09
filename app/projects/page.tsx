"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import {
  FolderStackIcon,
  GlobeIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  maxMembers: number;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    members: number;
  };
}

const categories = ["web-app", "mobile", "research", "business", "startup"];

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [creatorFilter, setCreatorFilter] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const creator = new URLSearchParams(window.location.search).get("creator");
    setCreatorFilter(creator || "");
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const query = new URLSearchParams();
        if (selectedCategory) query.append("category", selectedCategory);
        if (creatorFilter) query.append("creator", creatorFilter);
        const response = await fetch(`/api/projects?${query.toString()}`);
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, creatorFilter]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-8">
        <PageHero
          badge="Collaboration hub"
          title="Project spaces that feel ready for serious teamwork."
          description="Browse public collaborations, find strong ideas early, and join campus teams through cleaner project cards, progress cues, and member visibility."
          actions={
            session ? (
              <Link href="/create-project">
                <Button size="lg">Create a project</Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg">Join to collaborate</Button>
              </Link>
            )
          }
          stats={[
            { label: "Visible projects", value: `${projects.length}`, accent: "cyan" },
            { label: "Project tracks", value: `${categories.length}`, accent: "amber" },
            { label: "Team-ready", value: "Always", accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Track team capacity before you click into the project.",
                "Move from discovery into discussions, files, and members without friction.",
                "Switch between categories to find the right collaboration rhythm.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <SparkIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        {!session && (
          <section className="section-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Explore first, join when ready
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Project browsing is open to guests so teams can make a strong first impression.
              </p>
            </div>
            <Link href="/signup">
              <Button>Sign up free</Button>
            </Link>
          </section>
        )}

        <section className="section-card p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === ""
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-300 bg-white/70 text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
              }`}
            >
              All projects
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-cyan-500 text-white"
                    : "border border-slate-300 bg-white/70 text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                }`}
              >
                {category.replace("-", " ")}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="section-card animate-pulse p-6">
                <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-5 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-6 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <section className="section-card p-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
              <FolderStackIcon className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              No projects found
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Try a different category or start the first project in this space.
            </p>
            {session && (
              <div className="mt-6">
                <Link href="/create-project">
                  <Button>Create a project</Button>
                </Link>
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const progress = Math.min(
                100,
                Math.round((project._count.members / project.maxMembers) * 100)
              );

              return (
                <Link key={project.id} href={`/project/${project.id}`} className="group">
                  <article className="section-card flex h-full flex-col p-6 transition-transform duration-200 group-hover:-translate-y-1">
                    <span className="tag-chip">{project.category.replace("-", " ")}</span>
                    <h2 className="mt-5 line-clamp-2 text-xl font-semibold text-slate-950 transition-colors group-hover:text-cyan-700 dark:text-slate-50 dark:group-hover:text-cyan-300">
                      {project.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {project.description}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.1rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                          <UsersIcon className="h-4 w-4" />
                          Team size
                        </div>
                        <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {project._count.members}/{project.maxMembers}
                        </p>
                      </div>
                      <div className="rounded-[1.1rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                          <GlobeIcon className="h-4 w-4" />
                          Created by
                        </div>
                        <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {project.createdBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>Team progress</span>
                        <span>{progress}% full</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
