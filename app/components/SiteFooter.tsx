import Link from "next/link";
import { BrandLockup } from "@/components/Brand";
import { ChatCircleIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";

const phoneHref = "tel:0110238870";
const whatsappHref =
  "https://wa.me/254110238870?text=Hello%20I%20would%20like%20to%20learn%20more%20about%20Task%20Hive";
const supportHref = "mailto:cyberstriker365@gmail.com";

const exploreLinks = [
  { href: "/gigs", label: "Browse Tasks" },
  { href: "/projects", label: "Explore Projects" },
  { href: "/people", label: "Meet the Community" },
  { href: "/signup", label: "Create an Account" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/55 py-6 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/45">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_1fr]">
            <div className="space-y-5">
              <BrandLockup />
              <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Task Hive gives campus talent a sharper, more credible home for gigs,
                collaboration, and fast-moving student opportunities.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  <ChatCircleIcon className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  href={phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Call
                </a>
                <a
                  href={supportHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <MailIcon className="h-4 w-4" />
                  Support
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Explore
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-700 transition-colors hover:text-amber-600 dark:text-slate-200 dark:hover:text-amber-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Support
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">
                Human help, fast response
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Use the contact buttons to start a WhatsApp chat, place a direct call,
                or reach support from anywhere in the product.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-slate-500 dark:text-slate-400">
                <p>Available for platform questions, gig posting help, and onboarding support.</p>
                <p>No visible email or phone number is shown on the page, only direct actions.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>&copy; 2026 Task Hive. Built for campus work that looks serious.</p>
            <p>WhatsApp, call, and support shortcuts are available on every page.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
