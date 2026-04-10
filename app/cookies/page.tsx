import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/ui/icons";

const cookieCards = [
  {
    title: "Essential cookies",
    description:
      "These keep sign-in, verification, password reset, and basic session security working correctly.",
  },
  {
    title: "Consent preference",
    description:
      "We store your cookie choice so the banner does not keep showing on every page load.",
  },
  {
    title: "Optional cookies later",
    description:
      "If the product adds analytics or extra preference cookies later, this notice will be updated to reflect that clearly.",
  },
];

export default function CookiesPage() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-8">
        <section className="hero-card">
          <p className="page-badge">Cookie information</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
            Cookies help Task Hive stay secure, signed in, and consistent.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The platform uses cookies for authentication and security-sensitive flows.
            That includes keeping your session active, protecting account actions, and
            remembering the cookie choice you made on the site.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/">
              <Button>Back to home</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Go to login</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {cookieCards.map((card) => (
            <article key={card.title} className="section-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                <ShieldIcon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <section className="section-card p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-sm">
              <SparkIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                What this means
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                You can browse with confidence
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              "Authentication cookies help the website recognize your active session after login.",
              "Security-related cookies support verification, password recovery, and protected account actions.",
              "Your cookie preference is stored so we can remember your choice instead of asking every time.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
              >
                <CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-500" />
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
