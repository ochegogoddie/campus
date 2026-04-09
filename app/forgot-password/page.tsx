"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

type ResetStep = "request" | "confirm";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [deliveryHint, setDeliveryHint] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const requestResetCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter the email address you registered with.");
      return false;
    }

    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Unable to send the password reset code.");
    }

    setEmail(data?.email || normalizedEmail);
    setChallengeId(data?.challengeId || "");
    setDeliveryHint(data?.maskedEmail || data?.email || normalizedEmail);
    setStep("confirm");
    setInfo(data?.message || "A password reset code has been sent to your email.");
    return true;
  };

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      await requestResetCode();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send the password reset code."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!username.trim().match(/^[a-zA-Z0-9_-]+$/)) {
      setError(
        "Username can only contain letters, numbers, underscores, and hyphens."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          challengeId,
          code,
          username,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update login details.");
      }

      router.push("/login?reset=success");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to update login details."
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
      await requestResetCode();
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the password reset code."
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
              Reset your login details.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Enter your registered email to receive a reset code.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "The code is sent to the email on your account",
                "You can set a new username and password",
                "Use the latest code from your inbox",
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
            <p className="page-badge">Password recovery</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
              {step === "request"
                ? "Request a reset code"
                : "Enter the code and choose new login details"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {step === "request"
                ? "We will send a code to the email address used during registration."
                : `Use the 6-digit code sent to ${deliveryHint || "your email"} and choose a new username and password.`}
            </p>

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

            {step === "request" ? (
              <form onSubmit={handleRequest} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Registered email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="app-input"
                    placeholder="you@example.com"
                  />
                </div>

                <Button className="mt-2 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending code..." : "Send reset code"}
                  {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Reset code
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

                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    New username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="app-input"
                    placeholder="your_new_username"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      New password
                    </label>
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Confirm password
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <Button className="mt-2 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Updating details..." : "Update login details"}
                  {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
                </Button>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setChallengeId("");
                      setDeliveryHint("");
                      setCode("");
                      setUsername("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isResending}
                    className="font-semibold text-cyan-700 transition-colors hover:text-cyan-600 disabled:opacity-60 dark:text-cyan-300"
                  >
                    {isResending ? "Sending a new code..." : "Send a new code"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
