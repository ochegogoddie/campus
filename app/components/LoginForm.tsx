"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("Incorrect credentials");
      }
    } catch {
      setError("Incorrect credentials");
      setIsLoading(false);
    }
  };

  return (
    <>
      <BrandLockup />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
          Sign in to your account
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Pick up your tasks, conversations, and collaborations right where you left
          them.
        </p>
      </div>

      {registered && (
        <div className="mt-6 rounded-[1.2rem] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          Account created successfully. Sign in to continue.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
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
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>

        <Button className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-amber-600 transition-colors hover:text-amber-500 dark:text-amber-300"
        >
          Sign up here
        </Link>
      </p>
    </>
  );
}
