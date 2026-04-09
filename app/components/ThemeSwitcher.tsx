"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const Icon = isDark ? SunIcon : MoonIcon;
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  const buttonText = isDark ? "Light mode" : "Dark mode";

  return (
    <div className="fixed bottom-4 right-4 z-[70] rounded-full border border-slate-200 bg-white/88 p-1.5 shadow-[0_26px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/88">
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-105 dark:bg-slate-100 dark:text-slate-900"
        aria-label={label}
        aria-pressed={isDark}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{buttonText}</span>
      </button>
    </div>
  );
}
