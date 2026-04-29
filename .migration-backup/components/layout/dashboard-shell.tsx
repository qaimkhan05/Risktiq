"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CandlestickChart, Goal, LayoutDashboard, NotebookText, ScrollText, ShieldCheck, Target, UserCircle2 } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trades", label: "Trades", icon: NotebookText },
  { href: "/dashboard/reports", label: "Reports", icon: ScrollText },
  { href: "/dashboard/reflection", label: "Reflection", icon: Target },
  { href: "/dashboard/goals", label: "Goals", icon: Goal },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle2 }
];

export function DashboardShell({
  children,
  userName,
  profileName,
  isAdmin
}: {
  children: React.ReactNode;
  userName: string;
  profileName?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const navItems = isAdmin
    ? [...baseNavItems, { href: "/dashboard/admin", label: "Admin Journal", icon: ShieldCheck }]
    : baseNavItems;

  return (
    <main className="min-h-screen py-6">
      <div className="container-shell grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit xl:sticky xl:top-6">
          <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <CandlestickChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Risktiq</p>
              <p className="text-xs text-muted-foreground">Trader console</p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-border/60 bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="mt-2 text-lg font-semibold">{profileName || userName}</p>
            <Badge className="mt-3">Private account</Badge>
            {isAdmin ? <Badge tone="warning" className="mt-3 ml-2">Admin</Badge> : null}
          </div>

          <nav className="mt-8 grid gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-foreground text-background shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:bg-primary dark:text-slate-950"
                      : "hover:bg-background/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 flex items-center justify-between gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Protected workspace</p>
              <h1 className="mt-2 text-3xl font-semibold">Risktiq Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Private execution analytics, discipline tracking, and performance reporting.
              </p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Data isolation enforced per authenticated user session
            </div>
          </Card>
          {children}
        </div>
      </div>
    </main>
  );
}
