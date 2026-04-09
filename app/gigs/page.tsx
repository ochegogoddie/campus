"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import {
  BriefcaseIcon,
  FilterIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/ui/icons";

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  duration: string;
  poster: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    applications: number;
  };
}

const GIG_CATEGORIES = [
  {
    group: "Academic Gigs",
    items: [
      "Assignment Help",
      "Research Assistance",
      "Tutoring",
      "Notes Sharing",
      "Presentation Design",
      "Proofreading",
    ],
  },
  {
    group: "Tech Gigs",
    items: [
      "Website Development",
      "App Development",
      "Software Debugging",
      "UI/UX Design",
      "Database Setup",
    ],
  },
  {
    group: "Creative Gigs",
    items: ["Graphic Design", "Logo Design", "Video Editing", "Photography", "Music Production"],
  },
  {
    group: "Digital Work",
    items: [
      "Social Media Management",
      "Content Writing",
      "Blog Writing",
      "Copywriting",
      "Data Entry",
    ],
  },
  {
    group: "Physical / Local Gigs",
    items: [
      "House Cleaning",
      "Moving Help",
      "Event Setup",
      "Delivery Services",
      "Computer Repair",
    ],
  },
  {
    group: "Campus Specific",
    items: [
      "Printing Services",
      "Laptop Repair",
      "Project Assistance",
      "Poster Design",
      "Event Photography",
    ],
  },
  {
    group: "Other",
    items: ["General Task", "Consulting", "Mentoring", "Translation", "Miscellaneous"],
  },
];

export default function GigsPage() {
  const { data: session } = useSession();
  const [posterFilter, setPosterFilter] = useState("");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const poster = new URLSearchParams(window.location.search).get("poster");
    setPosterFilter(poster || "");
  }, []);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const params = new URLSearchParams();
        if (posterFilter) params.set("poster", posterFilter);
        const queryString = params.toString();
        const response = await fetch(`/api/gigs${queryString ? `?${queryString}` : ""}`);
        const data = await response.json();
        setGigs(data.gigs || []);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, [posterFilter]);

  useEffect(() => {
    let filtered = gigs;
    if (selectedCategory) {
      filtered = filtered.filter((gig) => gig.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter((gig) =>
        gig.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredGigs(filtered);
  }, [gigs, selectedCategory, searchTerm]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-8">
        <PageHero
          badge="Task marketplace"
          title="Discover campus gigs that already look worth applying to."
          description="Browse academic, technical, creative, and local tasks through a cleaner search and filter experience built for faster decisions."
          actions={
            session ? (
              <Link href="/post-gig">
                <Button size="lg">Post a task</Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg">Join to apply</Button>
              </Link>
            )
          }
          stats={[
            { label: "Available tasks", value: `${filteredGigs.length}`, accent: "amber" },
            { label: "Categories ready", value: `${GIG_CATEGORIES.length}`, accent: "cyan" },
            { label: "Guest browsing", value: session ? "Unlocked" : "Enabled", accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Search titles instantly and narrow down by category.",
                "Open task cards that highlight budget, timing, and applicant activity.",
                "Post new work quickly once you are signed in.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <SparkIcon className="mt-0.5 h-5 w-5 text-amber-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        {!session && (
          <section className="section-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Browsing as a guest
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You can explore every listing now and unlock applications after signup.
              </p>
            </div>
            <Link href="/signup">
              <Button>Sign up free</Button>
            </Link>
          </section>
        )}

        <section className="section-card p-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Search
              </p>
              <div className="mt-3 relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="app-input pl-11"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Categories
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    selectedCategory === ""
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "border border-slate-300 bg-white/70 text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                  }`}
                >
                  All categories
                </button>
                {GIG_CATEGORIES.flatMap((group) => group.items).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedCategory(item)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                      selectedCategory === item
                        ? "bg-amber-500 text-slate-950"
                        : "border border-slate-300 bg-white/70 text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="section-card animate-pulse p-6">
                <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-5 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-6 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredGigs.length === 0 ? (
          <section className="section-card p-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
              <BriefcaseIcon className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              No tasks match this view
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Try a different keyword or switch categories to reveal more opportunities.
            </p>
            {!session && (
              <div className="mt-6">
                <Link href="/signup">
                  <Button>Sign up to post a task</Button>
                </Link>
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredGigs.map((gig) => (
              <Link key={gig.id} href={`/gig/${gig.id}`} className="group">
                <article className="section-card flex h-full flex-col p-6 transition-transform duration-200 group-hover:-translate-y-1">
                  <span className="tag-chip">{gig.category}</span>
                  <h2 className="mt-5 line-clamp-2 text-xl font-semibold text-slate-950 transition-colors group-hover:text-amber-600 dark:text-slate-50 dark:group-hover:text-amber-300">
                    {gig.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {gig.description}
                  </p>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Budget
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                        KES {gig.budget}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {gig.duration}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span>{gig.poster.name}</span>
                    <span>{gig._count.applications} applicants</span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
