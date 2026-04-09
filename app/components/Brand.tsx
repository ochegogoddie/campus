import Link from "next/link";

interface BrandLockupProps {
  className?: string;
  compact?: boolean;
  href?: string;
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none">
        <defs>
          <linearGradient id="brand-gradient" x1="8" y1="6" x2="52" y2="56">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="52%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d="m19.5 12 12.5-7 12.5 7v14L32 33l-12.5-7V12Z"
          fill="url(#brand-gradient)"
          fillOpacity=".92"
        />
        <path
          d="m12 28 12-7 12 7v14l-12 7-12-7V28Z"
          fill="url(#brand-gradient)"
          fillOpacity=".72"
        />
        <path
          d="m28 28 12-7 12 7v14l-12 7-12-7V28Z"
          fill="url(#brand-gradient)"
          fillOpacity=".58"
        />
        <path
          d="m32 17 1.9 5 5.1 1.9-5.1 1.8-1.9 5.1-1.8-5.1-5.2-1.8 5.2-1.9 1.8-5Z"
          fill="#fffaf0"
        />
      </svg>
    </span>
  );
}

function BrandContent({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <BrandMark className={compact ? "h-11 w-11 rounded-[18px]" : ""} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
          Campus Gigs
        </span>
        <span className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50 sm:text-xl">
          Task Hive
        </span>
      </span>
    </>
  );
}

export function BrandLockup({
  className = "",
  compact = false,
  href,
}: BrandLockupProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandContent compact={compact} />
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`}>
      <BrandContent compact={compact} />
    </Link>
  );
}
