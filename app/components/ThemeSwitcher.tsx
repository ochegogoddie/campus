"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

const options = [
  { id: "light", label: "Light", icon: SunIcon },
  { id: "dark", label: "Dark", icon: MoonIcon },
] as const;

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[70] rounded-full border border-slate-200 bg-white/88 p-1.5 shadow-[0_26px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/88">
      <div className="flex items-center gap-1">
        {options.map((option) => {
          const isActive = mounted && resolvedTheme === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all sm:px-4 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              aria-pressed={isActive}
              aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
