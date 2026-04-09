"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { BrandLockup } from "@/components/Brand";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  BriefcaseIcon,
  ChatCircleIcon,
  CloseIcon,
  FolderStackIcon,
  GridIcon,
  MenuIcon,
  UsersIcon,
} from "@/components/ui/icons";

type NotificationItem = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/gigs", label: "Tasks", icon: BriefcaseIcon },
      { href: "/projects", label: "Projects", icon: FolderStackIcon },
      { href: "/people", label: "People", icon: UsersIcon },
      ...(session
        ? [{ href: "/messages", label: "Messages", icon: ChatCircleIcon }]
        : []),
    ],
    [session]
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/user/stats");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadMessages(data.unreadMessages || 0);
        setUnreadNotifications(data.notifications || 0);
      } catch {
        // silent on purpose
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setMenuOpen(false);
    setShowNotifications(false);

    try {
      await signOut({ redirect: false });
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  const openNotifications = async () => {
    if (!showNotifications) {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
        await fetch("/api/notifications", { method: "PATCH" });
        setUnreadNotifications(0);
      } catch {
        // silent on purpose
      }
    }

    setShowNotifications((current) => !current);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeOverlays = () => {
    setMenuOpen(false);
    setShowNotifications(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/72 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/68">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLockup href="/" compact />

        <div className="hidden flex-1 items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            <GridIcon className="h-3.5 w-3.5" />
            Campus Pulse
          </span>
          <div className="ml-4 flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const messagesBadge =
                item.href === "/messages" && unreadMessages > 0 ? unreadMessages : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeOverlays}
                  className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {messagesBadge > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold text-white">
                      {messagesBadge > 9 ? "9+" : messagesBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-11 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <span onClick={closeOverlays}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </span>
              </Link>
              <Link href="/post-gig">
                <span onClick={closeOverlays}>
                  <Button size="sm">Post a Task</Button>
                </span>
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition-colors hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white/96 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/96">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Notifications
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Updates from gigs, projects, and messages
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label="Close notifications"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`border-b border-slate-100 px-4 py-3 text-sm dark:border-slate-900 ${
                              notification.read
                                ? "text-slate-600 dark:text-slate-300"
                                : "bg-amber-50/80 text-slate-900 dark:bg-amber-950/20 dark:text-slate-100"
                            }`}
                          >
                            <p>{notification.message}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/70 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/70">
                <Link href="/profile" className="inline-flex items-center gap-3" onClick={closeOverlays}>
                  <Avatar
                    name={session.user?.name || "User"}
                    size={38}
                    className="rounded-full"
                    tone="cyan"
                  />
                </Link>
                <div className="max-w-[9rem]">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {session.user?.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {session.user?.role === "ADMIN" ? "Platform admin" : "Active member"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeOverlays}>
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={closeOverlays}>
                <Button size="sm">Sign up free</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 transition-colors hover:text-slate-900 md:hidden dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200/70 bg-white/90 px-4 pb-5 pt-4 backdrop-blur-xl md:hidden dark:border-slate-800/70 dark:bg-slate-950/92">
          <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-slate-200 bg-white/80 p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-4 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeOverlays}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                  <Avatar
                    name={session.user?.name || "User"}
                    size={42}
                    className="rounded-full"
                    tone="violet"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.user?.role === "ADMIN" ? "Platform admin" : "Ready to work"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link href="/dashboard" onClick={closeOverlays}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/post-gig" onClick={closeOverlays}>
                    <Button className="w-full">Post a Task</Button>
                  </Link>
                  <Link href="/profile" onClick={closeOverlays}>
                    <Button variant="ghost" className="w-full justify-center">
                      Profile
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/login" onClick={closeOverlays}>
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeOverlays}>
                  <Button className="w-full">Sign up free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
