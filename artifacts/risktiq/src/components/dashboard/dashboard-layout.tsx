import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CandlestickChart, Goal, LayoutDashboard, NotebookText, ScrollText, ShieldCheck, Target, UserCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/risktiq-ui/badge";
import { Card } from "@/components/risktiq-ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trades", label: "Trades", icon: NotebookText },
  { href: "/dashboard/reports", label: "Reports", icon: ScrollText },
  { href: "/dashboard/reflection", label: "Reflection", icon: Target },
  { href: "/dashboard/goals", label: "Goals", icon: Goal },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
];

export type Trade = {
  id: string;
  tradeDate: string;
  assetName: string;
  direction: string;
  strategyUsed: string;
  outcome: string;
  pnlAmount: number;
  overtradingFlag: boolean;
  revengeTradingFlag: boolean;
  emotionalWarning: boolean;
  consecutiveLossFlag: boolean;
  mistakeMade?: string | null;
  lessonsLearned?: string | null;
  tradeNotes?: string | null;
};

export type Reflection = {
  id: string;
  reflectionDate: string;
  wins: string;
  challenges: string;
  disciplineScore: number;
  psychologyScore: number;
  performanceScore: number;
  gratitude?: string | null;
  tomorrowFocus?: string | null;
};

export type Goal = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  targetValue: number;
  currentValue: number;
  dueDate?: string | null;
};

export type WorkspaceData = {
  profile: {
    fullName?: string | null;
    tradingStyle?: string | null;
    dailyTradeLimit?: number | null;
    weeklyTradeLimit?: number | null;
    monthlyProfitTarget?: number | null;
    monthlyLossLimit?: number | null;
    preferredStrategies?: string[];
    riskPerTrade?: number | null;
  } | null;
  trades: Trade[];
  reflections: Reflection[];
  goals: Goal[];
  snapshot: {
    summary: {
      totalTrades: number;
      winRate: number;
      winningTrades: number;
      losingTrades: number;
      netPnl: number;
      averagePnl: number;
      averageRiskRewardRatio: number;
      bestStrategy: string;
      worstStrategy: string;
      mostProfitableDay: { date: string; pnl: number } | null;
      monthlyGrowth: number;
      ruleBreakCount: number;
      disciplineScore: number;
      psychologyScore: number;
      performanceScore: number;
      journalStreak: number;
    };
    pnlSeries: Array<{ date: string; pnl: number; trades: number }>;
    strategyRows: Array<{ strategy: string; profit: number; winRate: number; totalTrades: number }>;
    calendarHeatmap: Array<{ date: string; dayLabel: string; weekLabel: string; trades: number; pnl: number }>;
    aiInsights: string[];
    reminderAlerts: string[];
    activeGoals: Array<{ id: string; title: string; status: string; targetValue: number; currentValue: number }>;
    weeklyReport: {
      totalTrades: number;
      weeklyPnl: number;
      ruleViolations: number;
      overtradingDays: number;
      emotionalTradingCount: number;
    };
    monthlyReport: {
      monthlyPnl: number;
      bestStrategy: { strategy: string } | null;
      worstStrategy: { strategy: string } | null;
      disciplineScore: number;
      topTrades: Trade[];
      biggestMistakes: Trade[];
    };
    habits: { averageDiscipline: number };
    disciplineBreakdown: { overtrading: number; revenge: number; emotional: number; lossStreak: number };
  };
};

export function useWorkspace() {
  return useQuery<WorkspaceData>({
    queryKey: ["dashboard-workspace"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </main>
    );
  }

  const isAdmin = user.role === "ADMIN";
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
            <p className="mt-2 text-lg font-semibold">{user.name || user.email}</p>
            <Badge className="mt-3">Private account</Badge>
            {isAdmin ? <Badge tone="warning" className="mt-3 ml-2">Admin</Badge> : null}
          </div>

          <nav className="mt-8 grid gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-foreground text-background shadow-[0_14px_30px_rgba(15,23,42,0.14)] dark:bg-primary dark:text-slate-950"
                      : "hover:bg-background/70",
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
