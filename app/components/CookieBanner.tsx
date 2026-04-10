"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ShieldIcon, SparkIcon } from "@/components/ui/icons";

const COOKIE_CONSENT_NAME = "task_hive_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const COOKIE_EVENT_NAME = "task-hive-cookie-consent-change";

type CookieChoice = "all" | "essential";

function readCookieChoice() {
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_NAME}=`));

  if (!cookieEntry) {
    return null;
  }

  const value = decodeURIComponent(cookieEntry.split("=").slice(1).join("="));

  return value === "all" || value === "essential" ? value : null;
}

function persistCookieChoice(choice: CookieChoice) {
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(choice)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secureFlag}`;
}

function subscribe(callback: () => void) {
  window.addEventListener(COOKIE_EVENT_NAME, callback);

  return () => {
    window.removeEventListener(COOKIE_EVENT_NAME, callback);
  };
}

function hasSavedCookieChoice() {
  if (typeof document === "undefined") {
    return true;
  }

  return Boolean(readCookieChoice());
}

export default function CookieBanner() {
  const hasChoice = useSyncExternalStore(
    subscribe,
    hasSavedCookieChoice,
    () => true
  );

  const handleChoice = (choice: CookieChoice) => {
    persistCookieChoice(choice);
    window.dispatchEvent(new Event(COOKIE_EVENT_NAME));
  };

  if (hasChoice) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 lg:px-8">
      <section className="pointer-events-auto mx-auto max-w-5xl overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white/96 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/96">
        <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldIcon className="h-3.5 w-3.5" />
              Cookie Notice
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              We use cookies to keep the platform secure and signed in.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Task Hive uses essential cookies for login sessions, password recovery,
              and account protection. You can allow all cookies now or keep only the
              essentials while we respect that choice across the site.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Auth sessions", "Security checks", "Consent preference"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <SparkIcon className="h-3.5 w-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Right now, the website mainly depends on essential cookies.
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              If we add optional cookies later, this same preference will be used to
              control them.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button type="button" onClick={() => handleChoice("all")} className="w-full">
                Accept all cookies
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleChoice("essential")}
                className="w-full"
              >
                Essential only
              </Button>
            </div>
            <Link
              href="/cookies"
              className="mt-4 inline-flex text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-cyan-300"
            >
              Learn more about cookies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
