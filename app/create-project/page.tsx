"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { FolderStackIcon, GlobeIcon, SparkIcon } from "@/components/ui/icons";

export default function CreateProjectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "web-app",
    skillsNeeded: "",
    maxMembers: "5",
    visibility: "public" as "public" | "private",
    readme: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          skillsNeeded: formData.skillsNeeded
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          maxMembers: parseInt(formData.maxMembers, 10),
          visibility: formData.visibility,
          readme: formData.readme || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create project");
      }

      router.push("/projects?success=true");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page-shell flex min-h-[70vh] items-center justify-center">
          <div className="section-card max-w-lg p-10 text-center">
            <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              Log in to create a project
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Project spaces are available once you sign in to your account.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Log in</Button>
              </Link>
            </div>
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
          badge="Create a project"
          title="Set up a collaboration space that looks organized before the first teammate joins."
          description="Structure your project with a clear title, team size, visibility settings, and a README that gives contributors immediate context."
          stats={[
            { label: "Team size target", value: formData.maxMembers, accent: "cyan" },
            { label: "Visibility", value: formData.visibility, accent: "amber" },
            { label: "Draft state", value: isLoading ? "Saving" : "Open", accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Use a strong project description so the right people join faster.",
                "Keep visibility public when you want discovery, private when you need control.",
                "Add a README to make your project feel immediately more serious.",
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

        {error && (
          <div className="rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="section-card p-6 sm:p-8">
          <div className="grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Project title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="app-input"
                placeholder="Name the project clearly"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="app-textarea"
                placeholder="Describe the goal, expected contributors, and where the project is headed."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Project type
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="app-select"
                >
                  <option value="web-app">Web App</option>
                  <option value="mobile">Mobile App</option>
                  <option value="research">Research</option>
                  <option value="business">Business</option>
                  <option value="startup">Startup</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Max team size
                </label>
                <input
                  id="maxMembers"
                  name="maxMembers"
                  type="number"
                  required
                  min="2"
                  max="20"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  className="app-input"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Skills needed
              </label>
              <input
                id="skillsNeeded"
                name="skillsNeeded"
                type="text"
                value={formData.skillsNeeded}
                onChange={handleChange}
                className="app-input"
                placeholder="Separate skills with commas"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Visibility
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData((previous) => ({ ...previous, visibility: "public" }))}
                  className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                    formData.visibility === "public"
                      ? "border-cyan-400 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/20"
                      : "border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950/45"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                      <GlobeIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">Public</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Anyone can view files and discussions.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((previous) => ({ ...previous, visibility: "private" }))}
                  className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                    formData.visibility === "private"
                      ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20"
                      : "border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950/45"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                      <FolderStackIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">Private</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Only contributors can access project content.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                README / project overview
              </label>
              <textarea
                id="readme"
                name="readme"
                value={formData.readme}
                onChange={handleChange}
                rows={6}
                className="app-textarea font-mono text-sm"
                placeholder="Use this space to outline setup notes, goals, and contribution guidelines."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="sm:min-w-[180px]" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create project"}
              </Button>
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
