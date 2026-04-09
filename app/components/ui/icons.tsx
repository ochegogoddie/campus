import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function SvgIcon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </SvgIcon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </SvgIcon>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2.5" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 11h18" />
    </SvgIcon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 19h16" />
      <path d="M7 15V9" />
      <path d="M12 15V5" />
      <path d="M17 15v-3" />
    </SvgIcon>
  );
}

export function ChatCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 17.5 3.5 20l1.2-4.3A8.5 8.5 0 1 1 12 20a8.3 8.3 0 0 1-5-.5Z" />
      <path d="M8.5 10.5h.01" />
      <path d="M12 10.5h.01" />
      <path d="M15.5 10.5h.01" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.3 2.4 2.4 4.8-5.1" />
    </SvgIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </SvgIcon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </SvgIcon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A11 11 0 0 1 12 5c6 0 9.5 7 9.5 7a18.8 18.8 0 0 1-3.2 3.8" />
      <path d="M6.2 6.2A18.7 18.7 0 0 0 2.5 12S6 19 12 19c1.8 0 3.4-.5 4.8-1.2" />
      <path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
    </SvgIcon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </SvgIcon>
  );
}

export function FolderStackIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l1.5 2H18A2.5 2.5 0 0 1 20.5 9.5V16A2.5 2.5 0 0 1 18 18.5H6A2.5 2.5 0 0 1 3.5 16V8.5" />
      <path d="M6.5 3.5h6" />
    </SvgIcon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17" />
      <path d="M12 3c2.3 2.3 3.5 5.4 3.5 9S14.3 18.7 12 21" />
      <path d="M12 3C9.7 5.3 8.5 8.4 8.5 12s1.2 6.7 3.5 9" />
    </SvgIcon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </SvgIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </SvgIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </SvgIcon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5 6 6 0 1 0 19 14.5Z" />
    </SvgIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6.5 4.5h2.2a1.5 1.5 0 0 1 1.5 1.2l.6 3a1.5 1.5 0 0 1-.8 1.7l-1.3.7a14 14 0 0 0 4.6 4.6l.7-1.3a1.5 1.5 0 0 1 1.7-.8l3 .6a1.5 1.5 0 0 1 1.2 1.5v2.2a1.5 1.5 0 0 1-1.6 1.5C9.9 20.7 3.3 14.1 5 6.1a1.5 1.5 0 0 1 1.5-1.6Z" />
    </SvgIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </SvgIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3.5 5.5 6v5.2c0 4 2.7 7.6 6.5 9.3 3.8-1.7 6.5-5.3 6.5-9.3V6L12 3.5Z" />
      <path d="m9.3 11.9 1.8 1.8 3.7-4" />
    </SvgIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 1.6 4.2L18 8.8l-4.4 1.5L12 15l-1.6-4.7L6 8.8l4.4-1.6L12 3Z" />
      <path d="m18.5 15 .8 2.1 2.2.8-2.2.8-.8 2.1-.7-2.1-2.2-.8 2.2-.8.7-2.1Z" />
      <path d="m5 14 .7 1.7 1.8.7-1.8.7L5 18.8l-.6-1.7-1.8-.7 1.8-.7L5 14Z" />
    </SvgIcon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </SvgIcon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 16V5" />
      <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
      <path d="M4 18.5h16" />
    </SvgIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M15.5 18v-.8A3.2 3.2 0 0 0 12.3 14H8.8a3.2 3.2 0 0 0-3.3 3.2v.8" />
      <circle cx="10.5" cy="8.7" r="2.7" />
      <path d="M20 18v-.5a2.9 2.9 0 0 0-2.4-2.8" />
      <path d="M15.8 6.2a2.7 2.7 0 0 1 0 5.2" />
    </SvgIcon>
  );
}
