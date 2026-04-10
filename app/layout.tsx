import type { Metadata } from "next";
import CookieBanner from "@/components/CookieBanner";
import AuthProvider from "@/components/providers/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Hive | Campus Gigs",
  description:
    "Professional campus marketplace for gigs, projects, collaboration, and student opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <SiteFooter />
            <CookieBanner />
          </AuthProvider>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
