import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ChatCircleIcon, CheckCircleIcon, SparkIcon } from "@/components/ui/icons";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hero-card">
            <span className="page-badge">Welcome back</span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Sign in to the campus workspace that feels built for real work.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Access your dashboard, messages, projects, gigs, and profile from one
              sharper platform experience.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Reply faster with built-in messaging",
                "Track projects, gigs, and notifications in one place",
                "Keep your profile ready for the next opportunity",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                <SparkIcon className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                  More polished first impressions
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Cleaner cards, stronger branding, and better visual hierarchy.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                <ChatCircleIcon className="h-5 w-5 text-cyan-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Faster communication
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Reach collaborators and task posters without leaving the app.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6 sm:p-8">
            <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
