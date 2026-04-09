"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FolderStackIcon,
} from "@/components/ui/icons";

export default function ClientSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      setIsLoading(false);
      return;
    }

    if (!formData.username.match(/^[a-zA-Z0-9_-]+$/)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: "CLIENT",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      router.push(`/verify-account?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hero-card">
            <BrandLockup />
            <div className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 shadow-sm">
              <FolderStackIcon className="h-5 w-5" />
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Join as a client and publish work that looks trustworthy.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Post better-looking task briefs, discover campus talent, and manage work
              opportunities through a cleaner interface.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Post gigs and collaboration projects from one account",
                "Move faster with clearer cards, messaging, and profile context",
                "Give freelancers a stronger product experience from the start",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-amber-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/signup">
                <Button variant="outline">Back to role selection</Button>
              </Link>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6 sm:p-8">
            <p className="page-badge">Client account</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
              Create your client account
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Start with the essentials now and refine your profile after your first
              login.
            </p>

            {error && (
              <div className="mt-6 rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Full name or company name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Your name or team name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="your_username"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Use 3+ characters with letters, numbers, underscores, or hyphens.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="you@example.com"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  We will send a verification code here before the account becomes active.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="+254700000000"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Confirm password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <Button className="mt-2 w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create client account"}
                {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
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
