"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BrandLockup } from "@/components/Brand";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import {
  BriefcaseIcon,
  ChatCircleIcon,
  ChartIcon,
  FolderStackIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getProjectCapacitySummary } from "@/lib/project-capacity";

type AdminTab = "overview" | "users" | "outreach" | "content" | "access";
type RoleFilter = "ALL" | "FREELANCER" | "CLIENT" | "ADMIN";
type UserRole = Exclude<RoleFilter, "ALL">;
type MessageAudience = "FREELANCER" | "CLIENT" | "USER";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  emailVerifiedAt?: string | null;
  lockedUntil?: string | null;
  createdAt?: string;
}
interface UserDetailDraft {
  name: string;
  username: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}
interface AdminGig { id: string; title: string; category: string; budget: number; status: string; createdAt: string; poster: { name: string }; _count: { applications: number }; }
interface AdminProject { id: string; title: string; category: string; status: string; visibility: string; maxMembers: number; createdAt: string; createdBy: { name: string }; _count: { members: number }; }
interface AdminStats {
  totalUsers: number; totalGigs: number; totalProjects: number; freelancers: number; clients: number; admins: number; lockedUsers: number;
  activeGigs: number; completedGigs: number; openProjects: number; fullProjects: number;
  recentUsers: AdminUser[]; recentGigs: AdminGig[]; recentProjects: AdminProject[];
}

const protectedAdminUsername = "password";
const roleFilters: RoleFilter[] = ["ALL", "FREELANCER", "CLIENT", "ADMIN"];
const editableRoles: UserRole[] = ["FREELANCER", "CLIENT", "ADMIN"];
const lockWindowOptions = [
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
  { label: "30 days", hours: 720 },
] as const;
const audienceOptions = [
  {
    value: "FREELANCER" as const,
    label: "All freelancers",
    description: "Broadcast one message to every freelancer account.",
  },
  {
    value: "CLIENT" as const,
    label: "All clients",
    description: "Broadcast one message to every client account.",
  },
  {
    value: "USER" as const,
    label: "One user",
    description: "Send a direct admin message to one selected user.",
  },
] as const;

const fmt = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "Unknown");
const fmtDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : "Not scheduled");
const isLocked = (lockedUntil?: string | null) => Boolean(lockedUntil && new Date(lockedUntil).getTime() > Date.now());
const toUserDetailDraft = (user: AdminUser): UserDetailDraft => ({
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone || "",
  emailVerified: Boolean(user.emailVerifiedAt),
});
const areUserDetailsDirty = (user: AdminUser, draft: UserDetailDraft) =>
  draft.name.trim() !== user.name ||
  draft.username.trim() !== user.username ||
  draft.email.trim().toLowerCase() !== user.email.toLowerCase() ||
  draft.phone.trim() !== (user.phone || "") ||
  draft.emailVerified !== Boolean(user.emailVerifiedAt);
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
  const [directoryUsers, setDirectoryUsers] = useState<AdminUser[]>([]);
  const [filterRole, setFilterRole] = useState<RoleFilter>("ALL");
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [detailDrafts, setDetailDrafts] = useState<Record<string, UserDetailDraft>>({});
  const [lockDrafts, setLockDrafts] = useState<Record<string, string>>({});
  const [messageAudience, setMessageAudience] = useState<MessageAudience>("FREELANCER");
  const [messageRecipientId, setMessageRecipientId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageFeedback, setMessageFeedback] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDirectoryUsers, setLoadingDirectoryUsers] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [savingDetailsUserId, setSavingDetailsUserId] = useState("");
  const [lockingUserId, setLockingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to load admin statistics");
      setStats((await response.json()) as AdminStats);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load admin statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadUsers = useCallback(async (role: RoleFilter) => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`/api/admin/users?role=${role}`);
      if (!response.ok) throw new Error("Failed to load users");
      const nextUsers = (await response.json()) as AdminUser[];
      setUsers(nextUsers);
      setRoleDrafts(
        Object.fromEntries(nextUsers.map((user) => [user.id, user.role])) as Record<string, UserRole>
      );
      setDetailDrafts(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, toUserDetailDraft(user)])
        ) as Record<string, UserDetailDraft>
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadDirectoryUsers = useCallback(async () => {
    try {
      setLoadingDirectoryUsers(true);
      const response = await fetch("/api/admin/users?role=ALL");
      if (!response.ok) throw new Error("Failed to load the user directory");
      setDirectoryUsers((await response.json()) as AdminUser[]);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load the user directory");
    } finally {
      setLoadingDirectoryUsers(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    void loadDirectoryUsers();
  }, [loadDirectoryUsers, loadStats]);

  useEffect(() => {
    void loadUsers(filterRole);
  }, [filterRole, loadUsers]);

  const refreshAllAdminData = useCallback(async () => {
    await Promise.all([loadStats(), loadUsers(filterRole), loadDirectoryUsers()]);
  }, [filterRole, loadDirectoryUsers, loadStats, loadUsers]);

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
      await refreshAllAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update role");
    } finally {
      setSavingUserId("");
    }
  };

  const saveUserDetails = async (user: AdminUser) => {
    const draft = detailDrafts[user.id];

    if (!draft || user.username === protectedAdminUsername) {
      return;
    }

    if (!areUserDetailsDirty(user, draft)) {
      return;
    }

    try {
      setError("");
      setSavingDetailsUserId(user.id);

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          username: draft.username.trim(),
          email: draft.email.trim().toLowerCase(),
          phone: draft.phone.trim() || null,
          emailVerified: draft.emailVerified,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update user details");
      }

      setMessageFeedback(`Registration details updated for ${data?.name || user.name}.`);
      await refreshAllAdminData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update user details"
      );
    } finally {
      setSavingDetailsUserId("");
    }
  };

  const updateUserLock = async (user: AdminUser, lockedUntil: string | null) => {
    if (user.username === protectedAdminUsername) return;

    try {
      setError("");
      setLockingUserId(user.id);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockedUntil }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update the lock");
      }
      await refreshAllAdminData();
    } catch (lockError) {
      setError(lockError instanceof Error ? lockError.message : "Failed to update the lock");
    } finally {
      setLockingUserId("");
    }
  };

  const applyLockWindow = async (user: AdminUser) => {
    const selectedHours = Number(lockDrafts[user.id] || "24");

    if (!Number.isFinite(selectedHours) || selectedHours <= 0) {
      setError("Pick a valid lock duration before saving.");
      return;
    }

    const lockedUntil = new Date(Date.now() + selectedHours * 60 * 60 * 1000).toISOString();
    await updateUserLock(user, lockedUntil);
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
      await refreshAllAdminData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleSendAdminMessage = async () => {
    if (!messageContent.trim() || sendingMessage) return;

    if (messageAudience === "USER" && !messageRecipientId) {
      setError("Choose a user before sending a direct admin message.");
      return;
    }

    try {
      setError("");
      setMessageFeedback("");
      setSendingMessage(true);

      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: messageAudience,
          recipientId: messageAudience === "USER" ? messageRecipientId : undefined,
          content: messageContent.trim(),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send admin message");
      }

      setMessageFeedback(data?.message || "The admin message was sent successfully.");
      setMessageContent("");
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Failed to send admin message");
    } finally {
      setSendingMessage(false);
    }
  };

  const startDirectMessage = (user: AdminUser) => {
    setActiveTab("outreach");
    setMessageAudience("USER");
    setMessageRecipientId(user.id);
    setMessageFeedback(`Ready to message ${user.name}.`);
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

  const directMessageRecipients = useMemo(
    () => directoryUsers.filter((user) => user.id !== session?.user?.id && user.role !== "ADMIN"),
    [directoryUsers, session?.user?.id]
  );

  const selectedRecipient = directMessageRecipients.find((user) => user.id === messageRecipientId);

  return (
    <div className="app-shell">
      <main className="page-shell space-y-8">
        <section className="hero-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div className="max-w-3xl">
              <BrandLockup href="/admin" />
              <p className="mt-8 page-badge">Admin workspace</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                Manage users, outreach, projects, and platform access from one protected dashboard.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                The admin can now message all freelancers, message all clients,
                send direct one-to-one notes, and temporarily lock accounts that
                need moderation.
              </p>
            </div>
            <div className="max-w-md space-y-3">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                  Signed in as {session?.user?.name || "Platform Admin"}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Protected admin routes, broadcast messaging, user locks, and no admin registration flow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/messages"><Button variant="outline">Open inbox</Button></Link>
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

        {messageFeedback && (
          <div className="rounded-[1.2rem] border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            {messageFeedback}
          </div>
        )}

        <section className="section-card p-3">
          <div className="flex flex-wrap gap-2">
            {(["overview", "users", "outreach", "content", "access"] as AdminTab[]).map((tab) => (
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
                  {tab === "content"
                    ? "Gigs & Projects"
                    : tab === "outreach"
                    ? "Messaging"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                    {stats.recentUsers.map((user) => {
                      const lockedUser = isLocked(user.lockedUntil);

                      return (
                        <div key={user.id} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size={44} tone="cyan" className="rounded-full" />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                                {lockedUser && (
                                  <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username} - {user.email}</p>
                              {lockedUser && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                                  Locked until {fmtDateTime(user.lockedUntil)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(user.role)}`}>{user.role}</span>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Joined {fmt(user.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="section-card p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access posture</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[["Freelancers", stats.freelancers], ["Clients", stats.clients], ["Admins", stats.admins], ["Locked users", stats.lockedUsers], ["Completed gigs", stats.completedGigs], ["Open projects", stats.openProjects]].map(([label, value]) => (
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
                        Broadcast messages arrive as direct inbox messages for the selected audience, and temporary locks stop those users from signing in until the lock expires.
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
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">Edit registration details, change roles, send direct notes, and lock accounts when moderation is needed</h2>
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
                  const userLocked = isLocked(user.lockedUntil);
                  const draftRole = roleDrafts[user.id] ?? user.role;
                  const detailDraft = detailDrafts[user.id] ?? toUserDetailDraft(user);
                  const detailsDirty = areUserDetailsDirty(user, detailDraft);
                  const selectedLockHours = lockDrafts[user.id] ?? "24";
                  return (
                    <div key={user.id} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/45">
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size={48} tone="amber" className="rounded-full" />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(user.role)}`}>{user.role}</span>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                  user.emailVerifiedAt
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                                }`}>
                                  {user.emailVerifiedAt ? "Email verified" : "Email pending"}
                                </span>
                                {userLocked && <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">Locked now</span>}
                                {protectedUser && <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">Protected built-in admin</span>}
                              </div>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{user.username} - {user.email}</p>
                              {user.phone && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Phone {user.phone}</p>}
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Joined {fmt(user.createdAt)}</p>
                              {user.emailVerifiedAt && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">Verified on {fmtDateTime(user.emailVerifiedAt)}</p>}
                              {userLocked && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">Locked until {fmtDateTime(user.lockedUntil)}</p>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" disabled={user.role === "ADMIN"} onClick={() => startDirectMessage(user)}>
                              <ChatCircleIcon className="h-4 w-4" />
                              Message user
                            </Button>
                            {user.id === session?.user?.id ? (
                              <Button type="button" variant="outline" size="sm" disabled>
                                Current admin
                              </Button>
                            ) : (
                              <Link href={`/messages?with=${user.id}&name=${encodeURIComponent(user.name)}`}>
                                <Button type="button" variant="outline" size="sm">
                                  Open chat
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.95fr_1.1fr]">
                          <div className="rounded-[1.1rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Registration details</p>
                              <button
                                type="button"
                                disabled={protectedUser || !detailsDirty || savingDetailsUserId === user.id}
                                onClick={() => saveUserDetails(user)}
                                className="inline-flex items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-300"
                              >
                                {savingDetailsUserId === user.id ? "Saving..." : "Save details"}
                              </button>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Full name
                                </label>
                                <input
                                  type="text"
                                  value={detailDraft.name}
                                  disabled={protectedUser}
                                  onChange={(event) =>
                                    setDetailDrafts((current) => ({
                                      ...current,
                                      [user.id]: {
                                        ...detailDraft,
                                        name: event.target.value,
                                      },
                                    }))
                                  }
                                  className="app-input"
                                  placeholder="Full name"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Username
                                </label>
                                <input
                                  type="text"
                                  value={detailDraft.username}
                                  disabled={protectedUser}
                                  onChange={(event) =>
                                    setDetailDrafts((current) => ({
                                      ...current,
                                      [user.id]: {
                                        ...detailDraft,
                                        username: event.target.value,
                                      },
                                    }))
                                  }
                                  className="app-input"
                                  placeholder="Username"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={detailDraft.email}
                                  disabled={protectedUser}
                                  onChange={(event) =>
                                    setDetailDrafts((current) => ({
                                      ...current,
                                      [user.id]: {
                                        ...detailDraft,
                                        email: event.target.value,
                                      },
                                    }))
                                  }
                                  className="app-input"
                                  placeholder="Email address"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  value={detailDraft.phone}
                                  disabled={protectedUser}
                                  onChange={(event) =>
                                    setDetailDrafts((current) => ({
                                      ...current,
                                      [user.id]: {
                                        ...detailDraft,
                                        phone: event.target.value,
                                      },
                                    }))
                                  }
                                  className="app-input"
                                  placeholder="+254700000000"
                                />
                              </div>
                            </div>

                            <label className="mt-4 flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={detailDraft.emailVerified}
                                disabled={protectedUser}
                                onChange={(event) =>
                                  setDetailDrafts((current) => ({
                                    ...current,
                                    [user.id]: {
                                      ...detailDraft,
                                      emailVerified: event.target.checked,
                                    },
                                  }))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span>Mark this email as verified</span>
                            </label>
                          </div>

                          <div className="rounded-[1.1rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Role access</p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <select value={draftRole} disabled={protectedUser} onChange={(event) => setRoleDrafts((current) => ({ ...current, [user.id]: event.target.value as UserRole }))} className="app-select min-w-[12rem]">
                                {editableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                              </select>
                              <button type="button" disabled={protectedUser || draftRole === user.role || savingUserId === user.id} onClick={() => saveRole(user)} className="inline-flex items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-300">
                                {savingUserId === user.id ? "Saving..." : "Save role"}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-[1.1rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Temporary lock</p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                              <select value={selectedLockHours} disabled={protectedUser} onChange={(event) => setLockDrafts((current) => ({ ...current, [user.id]: event.target.value }))} className="app-select min-w-[12rem]">
                                {lockWindowOptions.map((option) => <option key={option.hours} value={String(option.hours)}>{option.label}</option>)}
                              </select>
                              <button type="button" disabled={protectedUser || lockingUserId === user.id} onClick={() => applyLockWindow(user)} className="inline-flex items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                                {lockingUserId === user.id ? "Updating..." : "Lock user"}
                              </button>
                              <button type="button" disabled={protectedUser || !userLocked || lockingUserId === user.id} onClick={() => updateUserLock(user, null)} className="inline-flex items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
                                Unlock user
                              </button>
                              <button type="button" disabled={protectedUser || deletingUserId === user.id} onClick={() => deleteUser(user)} className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                                {deletingUserId === user.id ? "Deleting..." : "Delete user"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )}

        {activeTab === "outreach" && (
          loadingStats || loadingDirectoryUsers || !stats ? <Panel label="Loading admin messaging..." /> : (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="section-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Admin messaging</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">Reach all freelancers, all clients, or one user from the same control panel</h2>
                  </div>
                  <Link href="/messages">
                    <Button variant="outline" size="sm">Open inbox</Button>
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {audienceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMessageAudience(option.value);
                        if (option.value !== "USER") {
                          setMessageRecipientId("");
                        }
                      }}
                      className={`rounded-[1.2rem] border p-4 text-left transition-all ${
                        messageAudience === option.value
                          ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                          : "border-slate-200 bg-white/70 text-slate-700 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-200"
                      }`}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className={`mt-2 text-sm leading-6 ${
                        messageAudience === option.value
                          ? "text-slate-200 dark:text-slate-700"
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                {messageAudience === "USER" && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Recipient
                    </label>
                    <select value={messageRecipientId} onChange={(event) => setMessageRecipientId(event.target.value)} className="app-select">
                      <option value="">Select a user</option>
                      {directMessageRecipients.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role.toLowerCase()})
                        </option>
                      ))}
                    </select>
                    {selectedRecipient && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Direct message target: {selectedRecipient.name} - @{selectedRecipient.username}</p>}
                  </div>
                )}

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Message
                  </label>
                  <textarea
                    rows={7}
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    placeholder={
                      messageAudience === "USER"
                        ? "Write a direct admin message for the selected user..."
                        : messageAudience === "FREELANCER"
                        ? "Write the announcement you want every freelancer to receive..."
                        : "Write the announcement you want every client to receive..."
                    }
                    className="app-textarea"
                  />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Recipients get this as a direct inbox message and as a fresh notification on the platform.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button type="button" disabled={sendingMessage || !messageContent.trim()} onClick={handleSendAdminMessage}>
                    {sendingMessage
                      ? "Sending..."
                      : messageAudience === "USER"
                      ? "Send direct message"
                      : `Send to all ${messageAudience.toLowerCase()}s`}
                  </Button>
                  {selectedRecipient && (
                    <Link href={`/messages?with=${selectedRecipient.id}&name=${encodeURIComponent(selectedRecipient.name)}`}>
                      <Button type="button" variant="outline">
                        Open chat with {selectedRecipient.name}
                      </Button>
                    </Link>
                  )}
                </div>
              </section>

              <section className="section-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Audience snapshot</p>
                <div className="mt-5 grid gap-4">
                  {[["Freelancers", stats.freelancers], ["Clients", stats.clients], ["Locked users", stats.lockedUsers], ["Direct-message-ready users", directMessageRecipients.length]].map(([label, value]) => (
                    <div key={String(label)} className="rounded-[1.25rem] border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/45">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-900/70 dark:bg-cyan-950/30">
                  <div className="flex items-start gap-3">
                    <ChatCircleIcon className="mt-0.5 h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                      Use direct messages for one person, or switch the audience pill to push one announcement to every freelancer or every client in a single action.
                    </p>
                  </div>
                </div>
              </section>
            </div>
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
                  <p>Moderation lock: <span className="font-semibold text-slate-900 dark:text-slate-100">stored in PostgreSQL and enforced at login</span></p>
                </div>
              </section>
              <section className="section-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Access snapshot</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[["Admins", stats.admins], ["Clients", stats.clients], ["Locked users", stats.lockedUsers], ["Open projects", stats.openProjects]].map(([label, value]) => (
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
