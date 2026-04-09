import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60";

    const variants = {
      default:
        "border-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 text-white shadow-[0_18px_40px_-24px_rgba(249,115,22,0.9)] hover:-translate-y-0.5 hover:brightness-105",
      outline:
        "border-slate-300/70 bg-white/70 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900",
      ghost:
        "border-transparent bg-transparent text-slate-700 hover:bg-slate-100/90 dark:text-slate-200 dark:hover:bg-slate-800/80",
    };

    const sizes = {
      sm: "px-3.5 py-2 text-sm",
      md: "px-4.5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`;

    return (
      <button ref={ref} className={classes} {...props} />
    );
  }
);

Button.displayName = "Button";
