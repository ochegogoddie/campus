import type { ReactNode } from "react";

type AccentTone = "amber" | "cyan" | "emerald" | "violet";

const accentClasses: Record<AccentTone, string> = {
  amber: "text-amber-700 dark:text-amber-300",
  cyan: "text-cyan-700 dark:text-cyan-300",
  emerald: "text-emerald-700 dark:text-emerald-300",
  violet: "text-violet-700 dark:text-violet-300",
};

interface HeroStat {
  label: string;
  value: string;
  accent?: AccentTone;
}

interface PageHeroProps {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  stats?: HeroStat[];
  className?: string;
}

export default function PageHero({
  badge,
  title,
  description,
  actions,
  aside,
  stats = [],
  className = "",
}: PageHeroProps) {
  return (
    <section className={`hero-card ${className}`}>
      <div className="hero-card__glow" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)] lg:items-start">
        <div>
          {badge && <span className="page-badge">{badge}</span>}
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            {description}
          </p>
          {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          {stats.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="metric-card">
                  <p
                    className={`text-2xl font-semibold tracking-[-0.03em] ${
                      accentClasses[stat.accent ?? "amber"]
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {aside ? <div className="hero-side-panel">{aside}</div> : null}
      </div>
    </section>
  );
}
