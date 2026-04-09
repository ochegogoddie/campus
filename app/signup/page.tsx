"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  FolderStackIcon,
  SparkIcon,
} from "@/components/ui/icons";

const roles = [
  {
    href: "/signup/freelancer",
    title: "Freelancer",
    description:
      "Register to apply for tasks and join projects.",
    icon: BriefcaseIcon,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    href: "/signup/client",
    title: "Client",
    description:
      "Register to post gigs and manage projects.",
    icon: FolderStackIcon,
    accent: "from-amber-500 to-orange-500",
  },
];

export default function SignupPage() {
  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_1.05fr]">
          <section className="hero-card">
            <BrandLockup />
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Choose your account type.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Select freelancer or client to continue with registration.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "Both account types use email verification",
                "Choose the role that matches how you will use the app",
                "You can sign in after your email is verified",
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

            <div className="mt-8">
              <Link href="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="page-badge">Create an account</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                Pick your entry point
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Choose the registration form that matches you.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <Link key={role.href} href={role.href} className="group">
                    <article className="section-card h-full p-6 transition-transform duration-200 group-hover:-translate-y-1">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${role.accent} text-white shadow-sm`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {role.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {role.description}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Continue
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-300"
              >
                Log in here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
