"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/ui/Avatar";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { SearchIcon, SparkIcon, UsersIcon } from "@/components/ui/icons";

interface Person {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  skills: string;
  university?: string;
  major?: string;
  yearsOfStudy?: string;
  githubUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
  _count: { postedGigs: number; createdProjects: number };
}

export default function PeoplePage() {
  const { data: session } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchPeople = useCallback(async (query: string, currentPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: "20" });
      if (query) params.set("search", query);
      const response = await fetch(`/api/people?${params}`);
      const data = await response.json();
      setPeople(data.users ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      // silent on purpose
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople(search, page);
  }, [search, page, fetchPeople]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell space-y-8">
        <PageHero
          badge="Community directory"
          title="Discover people with clearer profiles, better context, and stronger first impressions."
          description="Search the Task Hive community by name, university, or major, then open richer public profiles built to make collaboration easier."
          actions={
            !session ? (
              <Link href="/signup">
                <Button size="lg">Join the community</Button>
              </Link>
            ) : undefined
          }
          stats={[
            { label: "Community members", value: `${total}`, accent: "cyan" },
            { label: "Pages available", value: `${pages}`, accent: "amber" },
            { label: "Search state", value: search ? "Filtered" : "Open", accent: "emerald" },
          ]}
          aside={
            <div className="space-y-3">
              {[
                "Profiles surface skills, universities, and project activity at a glance.",
                "Use search to move from discovery to direct messaging faster.",
                "Every card now feels closer to a portfolio preview than a placeholder.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45"
                >
                  <SparkIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          }
        />

        <section className="section-card p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, university, or major..."
                className="app-input pl-11"
              />
            </div>
            <Button type="submit">Search</Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </section>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="section-card animate-pulse p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="mt-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : people.length === 0 ? (
          <section className="section-card p-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
              <UsersIcon className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              No people found
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
              {search ? "Try a different search term." : "Be the first to sign up and complete a profile."}
            </p>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {people.map((person) => {
              const skills: string[] = JSON.parse(person.skills || "[]");
              const isMe = session?.user?.id === person.id;

              return (
                <Link key={person.id} href={`/people/${person.id}`} className="group">
                  <article className="section-card h-full p-5 transition-transform duration-200 group-hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <Avatar name={person.name} src={person.avatar} size={52} tone="cyan" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-base font-semibold text-slate-950 transition-colors group-hover:text-cyan-700 dark:text-slate-50 dark:group-hover:text-cyan-300">
                            {person.name}
                          </p>
                          {isMe && (
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[0.7rem] font-semibold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                              You
                            </span>
                          )}
                        </div>
                        {person.university && (
                          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                            {person.university}
                          </p>
                        )}
                        {person.major && (
                          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                            {person.major}
                          </p>
                        )}
                      </div>
                    </div>

                    {person.bio && (
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {person.bio}
                      </p>
                    )}

                    {skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="tag-chip">
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            +{skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-[1rem] border border-slate-200 bg-white/70 px-3 py-3 text-slate-600 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Gigs
                        </p>
                        <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">
                          {person._count.postedGigs}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-slate-200 bg-white/70 px-3 py-3 text-slate-600 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Projects
                        </p>
                        <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">
                          {person._count.createdProjects}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </section>
        )}

        {pages > 1 && (
          <section className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((currentPage) => Math.min(pages, currentPage + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
