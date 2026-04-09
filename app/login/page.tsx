import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ChatCircleIcon, CheckCircleIcon, FolderStackIcon } from "@/components/ui/icons";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hero-card">
            <span className="page-badge">Login</span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Sign in to your account.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Use your username or email to continue.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                "Open your messages after login",
                "Check your gigs and projects",
                "Manage your profile and notifications",
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
                <FolderStackIcon className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Projects and gigs
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Open your work items quickly after signing in.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                <ChatCircleIcon className="h-5 w-5 text-cyan-500" />
                <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Messages
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Continue your conversations in one place.
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
