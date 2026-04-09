"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

export function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to verify your email right now.");
      }

      router.push("/login?registered=true");
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify your email right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setInfo("");
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to resend the verification code.");
      }

      setInfo(data?.message || "A new verification code has been sent.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the verification code."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="page-shell flex min-h-[calc(100dvh-4rem)] items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hero-card">
            <BrandLockup />
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Verify your email before the account goes live.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              We sent a verification code to <span className="font-semibold">{email || "your email"}</span>.
              Enter it here to activate the new account.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "The code is short-lived for safer account activation",
                "If it expires, you can request a new one instantly",
                "After verification, normal users will still confirm login through email codes",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/login">
                <Button variant="outline">Back to login</Button>
              </Link>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6 sm:p-8">
            <p className="page-badge">Email verification</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
              Enter your 6-digit code
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use the latest code we sent to your email inbox to finish account setup.
            </p>

            {!email && (
              <div className="mt-6 rounded-[1.2rem] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                No email was provided for verification. Start again from signup.
              </div>
            )}

            {info && (
              <div className="mt-6 rounded-[1.2rem] border border-cyan-300 bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                {info}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Verification code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="app-input text-center text-lg tracking-[0.35em]"
                  placeholder="123456"
                />
              </div>

              <Button className="mt-2 w-full" disabled={!email || isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify email"}
                {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={resendCode}
                disabled={!email || isResending}
                className="font-semibold text-cyan-700 transition-colors hover:text-cyan-600 disabled:opacity-60 dark:text-cyan-300"
              >
                {isResending ? "Sending a new code..." : "Send a new code"}
              </button>
              <Link
                href="/signup"
                className="font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                Start again
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
