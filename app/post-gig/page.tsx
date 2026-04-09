"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { SparkIcon, UploadIcon } from "@/components/ui/icons";

export default function PostGigPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "coding",
    skillsNeeded: "",
    budget: "",
    duration: "one-time",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const formDataPayload = new FormData();
        formDataPayload.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataPayload,
        });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
        const { url } = await response.json();
        urls.push(url);
      }
      setAttachments((previous) => [...previous, ...urls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeAttachment = (url: string) => {
    setAttachments((previous) => previous.filter((item) => item !== url));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gigs", {
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
          budget: parseFloat(formData.budget),
          duration: formData.duration,
          attachments,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post gig");
      }

      router.push("/gigs?success=true");
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
              Log in to post a task
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Posting is available once you sign in to your account.
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
          badge="Publish a task"
          title="Write a better brief and make the opportunity look serious from the start."
          description="Clear titles, budget visibility, useful attachments, and structured details help the right person say yes faster."
          stats={[
            { label: "Attachments added", value: `${attachments.length}`, accent: "cyan" },
            { label: "Budget field", value: formData.budget ? "Ready" : "Open", accent: "amber" },
            { label: "Posting state", value: isLoading ? "Saving" : "Draft", accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Use a strong title so people understand the task immediately.",
                "Attach files when the work needs briefs, references, or assets.",
                "List required skills to attract better-fit applicants.",
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

        {error && (
          <div className="rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="section-card p-6 sm:p-8">
          <div className="grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Task title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="app-input"
                placeholder="Write a title that explains the work clearly"
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
                placeholder="Describe the deliverables, expectations, and what a strong applicant should know."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="app-select"
                >
                  <option value="writing">Writing</option>
                  <option value="design">Design</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="coding">Coding</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Duration
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="app-select"
                >
                  <option value="one-time">One-time</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Budget
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                className="app-input"
                placeholder="Set the payment amount"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Required skills
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
              {formData.skillsNeeded && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skillsNeeded
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span key={skill} className="tag-chip">
                        {skill}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Attachments
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-[1.2rem] border border-dashed border-slate-300 bg-white/70 px-4 py-4 transition-colors hover:border-amber-400 dark:border-slate-700 dark:bg-slate-950/45">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <UploadIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {uploading ? "Uploading..." : "Upload supporting files"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PDF, images, docs, or text files up to 5 MB each.
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((url) => (
                    <li
                      key={url}
                      className="flex items-center justify-between rounded-[1rem] border border-slate-200 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/45"
                    >
                      <span className="truncate text-slate-600 dark:text-slate-300">
                        {url.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(url)}
                        className="font-semibold text-red-500 transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="sm:min-w-[180px]" disabled={isLoading}>
                {isLoading ? "Posting..." : "Post task"}
              </Button>
              <Link href="/gigs">
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
