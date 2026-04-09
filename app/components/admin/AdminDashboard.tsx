"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BrandLockup } from "@/components/Brand";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { BriefcaseIcon, ChartIcon, FolderStackIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { getProjectCapacitySummary } from "@/lib/project-capacity";

type AdminTab = "overview" | "users" | "content" | "access";
type RoleFilter = "ALL" | "FREELANCER" | "CLIENT" | "ADMIN";
type UserRole = Exclude<RoleFilter, "ALL">;

interface AdminUser { id: string; username: string; name: string; email: string; role: UserRole; createdAt?: string; }
interface AdminGig { id: string; title: string; category: string; budget: number; status: string; createdAt: string; poster: { name: string }; _count: { applications: number }; }
interface AdminProject { id: string; title: string; category: string; status: string; visibility: string; maxMembers: number; createdAt: string; createdBy: { name: string }; _count: { members: number }; }
interface AdminStats {
  totalUsers: number; totalGigs: number; totalProjects: number; freelancers: number; clients: number; admins: number;
  activeGigs: number; completedGigs: number; openProjects: number; fullProjects: number;
  recentUsers: AdminUser[]; recentGigs: AdminGig[]; recentProjects: AdminProject[];
}

const protectedAdminUsername = "password";
const roleFilters: RoleFilter[] = ["ALL", "FREELANCER", "CLIENT", "ADMIN"];
const editableRoles: UserRole[] = ["FREELANCER", "CLIENT", "ADMIN"];

const fmt = (value?: string) => (value ? new Date(value).toLocaleDateString() : "Unknown");
const roleTone = (role: UserRole) =>
  role === "ADMIN"
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
    : role === "CLIENT"
    ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filterRole, setFilterRole] = useState<RoleFilter>("ALL");
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to load admin statistics");
        setStats(await response.json());
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load admin statistics");
      } finally {
        setLoadingStats(false);
      }
    };
    void loadStats();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(`/api/admin/users?role=${filterRole}`);
        if (!response.ok) throw new Error("Failed to load users");
        const nextUsers = (await response.json()) as AdminUser[];
        setUsers(nextUsers);
        setRoleDrafts(Object.fromEntries(nextUsers.map((user) => [user.id, user.role])) as Record<string, UserRole>);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    void loadUsers();
  }, [filterRole]);

  const refreshStats = async () => {
    const response = await fetch("/api/admin/stats");
    if (!response.ok) throw new Error("Failed to refresh admin statistics");
    setStats(await response.json());
  };

  const refreshUsers = async () => {
    const response = await fetch(`/api/admin/users?role=${filterRole}`);
    if (!response.ok) throw new Error("Failed to refresh users");
    const nextUsers = (await response.json()) as AdminUser[];
    setUsers(nextUsers);
    setRoleDrafts(Object.fromEntries(nextUsers.map((user) => [user.id, user.role])) as Record<string, UserRole>);
  };

  const saveRole = async (user: AdminUser) => {
    const nextRole = roleDrafts[user.id];
    if (!nextRole || nextRole === user.role || user.username === protectedAdminUsername) return;
    try {
      setError("");
      setSavingUserId(user.id);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update role");
      }
      await Promise.all([refreshStats(), refreshUsers()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update role");
    } finally {
      setSavingUserId("");
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (user.username === protectedAdminUsername) return;
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) return;
    try {
      setError("");
      setDeletingUserId(user.id);
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete user");
      }
      await Promise.all([refreshStats(), refreshUsers()]);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.replace("/login");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  };

  const overviewCards = stats
    ? [
        { label: "Users", value: stats.totalUsers, icon: UsersIcon, accent: "text-cyan-600 dark:text-cyan-300" },
        { label: "Clients", value: stats.clients, icon: ChartIcon, accent: "text-violet-600 dark:text-violet-300" },
        { label: "Open gigs", value: stats.activeGigs, icon: BriefcaseIcon, accent: "text-amber-600 dark:text-amber-300" },
        { label: "Full teams", value: stats.fullProjects, icon: FolderStackIcon, accent: "text-rose-600 dark:text-rose-300" },
      ]
    : [];

  return (
    <div className="app-shell">
      <main className="page-shell space-y-8">
        <section className="hero-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div className="max-w-3xl">
              <BrandLockup href="/admin" />
              <p className="mt-8 page-badge">Admin workspace</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                Manage users, gigs, projects, and platform access from one protected dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                The built-in admin account uses username <span className="font-semibold">password</span>,
                its password is stored as a bcrypt hash in the database, and there is no admin signup form.
              </p>
            </div>
            <div className="max-w-md space-y-3">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Signed in as {session?.user?.name || "Platform Admin"}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Protected admin routes, protected built-in account, and no admin registration flow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/"><Button variant="outline">Back to app</Button></Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="rounded-[1.2rem] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</div>}

        <section className="section-card p-3">
          <div className="flex flex-wrap gap-2">
            {(["overview", "users", "content", "access"] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "border border-slate-300 bg-white/70 text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"
                }`}
              >
                {tab === "content" ? "Gigs & Projects" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "overview" && (
          loadingStats || !stats ? <Panel label={loadingStats ? "Loading overview..." : "Overview unavailable."} /> : (
            <div className="space-y-6">
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className="section-card p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"><Icon className="h-5 w-5" /></div>
                      <p className={`mt-5 text-3xl font-semibold ${item.accent}`}>{item.value}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    </article>
                  );
                })}
              </section>
              <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="section-card p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Latest users</p>
                  <div className="mt-5 space-y-3">
                    {stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size={44} tone="cyan" className="rounded-full" />
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username} - {user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(user.role)}`}>{user.role}</span>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Joined {fmt(user.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="section-card p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access posture</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[["Freelancers", stats.freelancers], ["Admins", stats.admins], ["Completed gigs", stats.completedGigs], ["Open projects", stats.openProjects]].map(([label, value]) => (
                      <div key={String(label)} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[1.25rem] border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                      <ShieldIcon className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-300" />
                      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                        This admin dashboard is now backed by live users, gigs, and projects data instead of placeholder panels.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )
        )}

        {activeTab === "users" && (
          loadingUsers ? <Panel label="Loading users..." /> : (
            <section className="section-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">User management</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">Review roles, protect the built-in admin, and remove accounts when needed</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roleFilters.map((role) => (
                    <button key={role} type="button" onClick={() => setFilterRole(role)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${filterRole === role ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "border border-slate-300 bg-white/70 text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200"}`}>
                      {role === "ALL" ? "All users" : role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {users.map((user) => {
                  const protectedUser = user.username === protectedAdminUsername;
                  const draftRole = roleDrafts[user.id] ?? user.role;
                  return (
                    <div key={user.id} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size={48} tone="amber" className="rounded-full" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(user.role)}`}>{user.role}</span>
                              {protectedUser && <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">Protected built-in admin</span>}
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{user.username} - {user.email}</p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Joined {fmt(user.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <select value={draftRole} disabled={protectedUser} onChange={(event) => setRoleDrafts((current) => ({ ...current, [user.id]: event.target.value as UserRole }))} className="app-select min-w-[12rem]">
                            {editableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <button type="button" disabled={protectedUser || draftRole === user.role || savingUserId === user.id} onClick={() => saveRole(user)} className="inline-flex items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-300">
                            {savingUserId === user.id ? "Saving..." : "Save role"}
                          </button>
                          <button type="button" disabled={protectedUser || deletingUserId === user.id} onClick={() => deleteUser(user)} className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                            {deletingUserId === user.id ? "Deleting..." : "Delete user"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )}

        {activeTab === "content" && (
          loadingStats || !stats ? <Panel label="Loading content..." /> : (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="section-card p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Recent gigs</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">Latest task activity</h2>
                  </div>
                  <Link href="/gigs" className="text-sm font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-300">Open gigs</Link>
                </div>
                <div className="mt-5 space-y-4">
                  {stats.recentGigs.map((gig) => (
                    <div key={gig.id} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tag-chip">{gig.category}</span>
                        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-300">{gig.status}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">{gig.title}</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Posted by {gig.poster.name} - {gig._count.applications} applications - {fmt(gig.createdAt)}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-300">KES {gig.budget}</p>
                        <Link href={`/gig/${gig.id}`}><Button variant="outline" size="sm">View gig</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="section-card p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Recent projects</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">Team capacity at a glance</h2>
                  </div>
                  <Link href="/projects" className="text-sm font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">Open projects</Link>
                </div>
                <div className="mt-5 space-y-4">
                  {stats.recentProjects.map((project) => {
                    const capacity = getProjectCapacitySummary(project._count.members, project.maxMembers);
                    const badge = capacity.status === "full"
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300"
                      : capacity.status === "almost-full"
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
                    return (
                      <div key={project.id} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tag-chip">{project.category.replace("-", " ")}</span>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}>{capacity.label}</span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">{project.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Created by {project.createdBy.name} - {project.visibility} - {fmt(project.createdAt)}</p>
                        <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${capacity.progress}%` }} /></div>
                        <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <span>{capacity.members}/{capacity.maxMembers} members</span>
                          <span>{capacity.detail}</span>
                        </div>
                        <div className="mt-4"><Link href={`/project/${project.id}`}><Button variant="outline" size="sm">View project</Button></Link></div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )
        )}

        {activeTab === "access" && (
          loadingStats || !stats ? <Panel label="Loading access details..." /> : (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="section-card p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"><ShieldIcon className="h-5 w-5" /></div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-slate-50">Built-in admin account</h2>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <p>Username: <span className="font-semibold text-slate-900 dark:text-slate-100">password</span></p>
                  <p>Password storage: <span className="font-semibold text-slate-900 dark:text-slate-100">bcrypt hash only</span></p>
                  <p>Signup route: <span className="font-semibold text-slate-900 dark:text-slate-100">disabled for admins</span></p>
                  <p>Deletion guard: <span className="font-semibold text-slate-900 dark:text-slate-100">built-in admin protected</span></p>
                </div>
              </section>
              <section className="section-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access snapshot</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[["Admins", stats.admins], ["Clients", stats.clients], ["Open gigs", stats.activeGigs], ["Open projects", stats.openProjects]].map(([label, value]) => (
                    <div key={String(label)} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )
        )}
      </main>
    </div>
  );
}

function Panel({ label }: { label: string }) {
  return <section className="section-card p-8"><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p></section>;
}
