"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className = "", disabled, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
        className={`app-input pr-12 ${className}`.trim()}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((previous) => !previous)}
        className="absolute inset-y-0 right-3 my-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
      >
        {isVisible ? (
          <EyeOffIcon className="h-[18px] w-[18px]" />
        ) : (
          <EyeIcon className="h-[18px] w-[18px]" />
        )}
      </button>
    </div>
  );
}
