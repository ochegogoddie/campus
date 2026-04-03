"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const options = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[70] rounded-full border border-slate-200 bg-white/90 p-1 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-center gap-1">
        {options.map((option) => {
          const isActive = mounted && resolvedTheme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              aria-pressed={isActive}
              aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
