import type { CSSProperties } from "react";

type AvatarTone = "amber" | "cyan" | "violet" | "slate";

const toneClasses: Record<AvatarTone, string> = {
  amber: "from-amber-500 via-orange-500 to-rose-500",
  cyan: "from-cyan-500 via-sky-500 to-blue-600",
  violet: "from-fuchsia-500 via-violet-500 to-indigo-600",
  slate: "from-slate-500 via-slate-600 to-slate-700",
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  tone?: AvatarTone;
}

export default function Avatar({
  name,
  src,
  size = 44,
  className = "",
  tone = "amber",
}: AvatarProps) {
  const style = { width: size, height: size } satisfies CSSProperties;
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-[18px] object-cover shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`inline-flex items-center justify-center rounded-[18px] bg-gradient-to-br ${toneClasses[tone]} text-sm font-semibold text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
