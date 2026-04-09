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
import { ADMIN_USERNAME } from "@/lib/admin";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [challengeId, setChallengeId] = useState("");
  const [deliveryHint, setDeliveryHint] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    verificationCode: "",
  });
  const normalizedIdentifier = formData.identifier.trim().toLowerCase();
  const isAdminAttempt =
    step === "credentials" && normalizedIdentifier === ADMIN_USERNAME;

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
    setInfo("");
    setIsLoading(true);

    try {
      if (step === "credentials") {
        if (formData.identifier.trim().toLowerCase() === ADMIN_USERNAME) {
          const result = await signIn("credentials", {
            username: formData.identifier,
            password: formData.password,
            redirect: false,
          });

          if (result?.error === "CredentialsSignin") {
            throw new Error("Incorrect credentials");
          }

          if (result?.error || !result?.ok) {
            throw new Error("Unable to sign in right now. Please try again.");
          }
        } else {
          const response = await fetch("/api/auth/login/request-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: formData.identifier,
              password: formData.password,
            }),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || "Unable to send the login code.");
          }

          setChallengeId(data.challengeId || "");
          setDeliveryHint(data.maskedEmail || data.email || "");
          setStep("code");
          setInfo(data.message || "A login code has been sent to your email.");
        }
      } else {
        const result = await signIn("credentials", {
          challengeId,
          verificationCode: formData.verificationCode,
          redirect: false,
        });

        if (result?.error === "CredentialsSignin") {
          throw new Error("Invalid or expired login code.");
        }

        if (result?.error || !result?.ok) {
          throw new Error("Unable to finish login right now. Please try again.");
        }
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendLoginCode = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to resend the login code.");
      }

      setChallengeId(data.challengeId || "");
      setDeliveryHint(data.maskedEmail || data.email || "");
      setInfo(data.message || "A new login code has been sent to your email.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend the login code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BrandLockup />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
          {step === "credentials"
            ? "Sign in to your account"
            : "Check your email for the login code"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {step === "credentials"
            ? isAdminAttempt
              ? "Admin testing uses direct sign-in, so no email verification code is required here."
              : "Pick up your tasks, conversations, and collaborations right where you left them."
            : `Enter the 6-digit code sent to ${deliveryHint || "your email"} to finish signing in.`}
        </p>
      </div>

      {registered && (
        <div className="mt-6 rounded-[1.2rem] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          Account created successfully. Sign in to continue.
        </div>
      )}

      {reset === "success" && (
        <div className="mt-6 rounded-[1.2rem] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          Login details updated successfully. Sign in with your new username and password.
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

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {step === "credentials" ? (
          <>
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Username or email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="app-input"
                placeholder="Enter your username or email"
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
              {isAdminAttempt && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Admin login goes straight in with username and password for
                  easier testing.
                </p>
              )}
              {!isAdminAttempt && (
                <div className="mt-3 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-cyan-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="verificationCode"
              className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Login code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={formData.verificationCode}
              onChange={handleChange}
              className="app-input text-center text-lg tracking-[0.35em]"
              placeholder="123456"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setChallengeId("");
                  setDeliveryHint("");
                  setFormData((previous) => ({
                    ...previous,
                    verificationCode: "",
                  }));
                }}
                className="font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                Use different credentials
              </button>
              <button
                type="button"
                onClick={resendLoginCode}
                className="font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-cyan-300"
              >
                Send a new code
              </button>
            </div>
          </div>
        )}

        <Button className="mt-2 w-full" disabled={isLoading}>
          {isLoading
            ? step === "credentials"
              ? isAdminAttempt
                ? "Signing in..."
                : "Checking account..."
              : "Verifying code..."
            : step === "credentials"
            ? isAdminAttempt
              ? "Sign in as admin"
              : "Continue to email verification"
            : "Verify code and sign in"}
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
