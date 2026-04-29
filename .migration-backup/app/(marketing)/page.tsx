import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  CandlestickChart,
  CheckCircle2,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";

import { MarketingNav } from "@/components/layout/marketing-nav";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { LiveMarketChart } from "@/components/marketing/live-market-chart";
import { TickerTapeWidget } from "@/components/marketing/ticker-tape-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Private trader workspaces",
    description: "Every account has fully isolated data, protected auth, and secure trade records.",
    icon: ShieldCheck
  },
  {
    title: "Discipline intelligence",
    description: "Track overtrading, revenge sessions, emotional execution, and rule breaks in real time.",
    icon: Target
  },
  {
    title: "Strategy analytics",
    description: "See which setups actually scale, where losses cluster, and what deserves more capital.",
    icon: BarChart3
  },
  {
    title: "AI habit coaching",
    description: "Receive habit analysis, reflection prompts, and improvement suggestions based on your behavior.",
    icon: BrainCircuit
  }
];

const highlights = [
  "Live TradingView market desk on the homepage",
  "Private account data with secure isolated journaling",
  "Discipline, psychology, and habit intelligence in one dashboard",
  "Weekly and monthly reports with PDF and Excel export"
];

const workflows = [
  {
    title: "Capture every trade",
    description: "Log entries, exits, screenshots, emotions, mistakes, and lessons in one structured flow.",
    icon: CandlestickChart
  },
  {
    title: "Audit your discipline",
    description: "Track overtrading, revenge entries, streak breakdowns, and rule violations automatically.",
    icon: Radar
  },
  {
    title: "Scale what works",
    description: "See your strongest strategies, month-over-month growth, and the habits that actually improve PnL.",
    icon: BriefcaseBusiness
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />
      <section className="container-shell pt-6">
        <div className="rounded-[28px] border border-border/60 bg-card/55 px-4 py-3 shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur md:px-6">
          <TickerTapeWidget />
        </div>
      </section>
      <section className="container-shell relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-x-0 top-10 -z-10 mx-auto h-[540px] max-w-6xl rounded-full bg-accent/10 blur-3xl" />
        <div className="grid gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
          <div className="space-y-8 pt-4">
            <Badge>Modern Trading Journal Platform</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl font-semibold leading-[1.02] md:text-7xl">
                Journal precisely. Review professionally. Trade with live market context.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                Risktiq combines live TradingView charts, private trade journaling, discipline tracking, strategy
                analytics, and premium reporting into a fintech-grade workspace for serious traders.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="min-w-[180px]">
                  Launch Your Journal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="min-w-[180px]">
                  Access Dashboard
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-border/60 bg-card/70 p-5">
                <p className="text-sm text-muted-foreground">Protected accounts</p>
                <p className="mt-2 text-2xl font-semibold">1 user = 1 vault</p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-card/70 p-5">
                <p className="text-sm text-muted-foreground">Review rhythm</p>
                <p className="mt-2 text-2xl font-semibold">Daily to monthly</p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-card/70 p-5">
                <p className="text-sm text-muted-foreground">Live market desk</p>
                <p className="mt-2 text-2xl font-semibold">TradingView embedded</p>
              </div>
            </div>
          </div>
          <Card className="relative p-0">
            <div className="grid gap-6 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">Live Market Desk</p>
                  <h2 className="mt-2 text-2xl font-semibold">Embedded real-time charting</h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    No static screenshot here. The homepage now carries an actual TradingView widget with live market
                    context and switchable symbols.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-success">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-semibold">Live market feed</span>
                </div>
              </div>
              <LiveMarketChart />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-background/80 p-5">
                  <p className="text-sm text-muted-foreground">Weekly reports</p>
                  <p className="mt-4 text-3xl font-semibold">Auto generated</p>
                  <p className="mt-2 text-sm text-muted-foreground">P&amp;L, emotions, strategy, violations</p>
                </div>
                <div className="rounded-[24px] bg-background/80 p-5">
                  <p className="text-sm text-muted-foreground">Discipline engine</p>
                  <p className="mt-4 text-3xl font-semibold">Rule-aware</p>
                  <p className="mt-2 text-sm text-muted-foreground">Overtrading, revenge, emotional alerts</p>
                </div>
                <div className="rounded-[24px] bg-background/80 p-5">
                  <p className="text-sm text-muted-foreground">Strategy tracking</p>
                  <p className="mt-4 text-3xl font-semibold">Edge visibility</p>
                  <p className="mt-2 text-sm text-muted-foreground">Best/worst setup analytics</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-background/80 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Premium workflow</p>
                    <p className="mt-2 text-lg font-semibold">Chart the market, then journal the execution inside one product.</p>
                  </div>
                  <CalendarDays className="h-10 w-10 text-warning" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  The homepage now reflects the actual product promise: a serious trading workspace, not a static
                  brochure.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-shell py-8 md:py-14">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Core Platform</p>
            <h2 className="section-heading mt-2">Built around process, privacy, and performance</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Everything is structured so each trader sees only their own data, reviews their own mistakes, and builds a
            repeatable edge over time.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell py-8 md:py-14">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="h-full">
            <p className="eyebrow">Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold">From raw trades to repeatable execution</h2>
            <div className="mt-8 grid gap-5">
              {workflows.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-[24px] border border-border/60 bg-background/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-6">
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Data Safety</p>
                  <h3 className="mt-2 text-2xl font-semibold">Personal accounts stay isolated</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Each user logs into a private workspace. Trade history, screenshots, reflections, goals, and analytics
                remain tied to that authenticated account only.
              </p>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/14 text-warning">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="eyebrow">Behavioral Layer</p>
                  <h3 className="mt-2 text-2xl font-semibold">Discipline score is not decorative</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                The system actively flags overtrading, revenge patterns, emotional entries, and streak deterioration so
                users can correct execution before it compounds into drawdown.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-shell py-8 pb-20 md:py-14 md:pb-24">
        <Card className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">Launch</p>
              <h2 className="mt-2 font-[var(--font-display)] text-4xl font-semibold md:text-5xl">
                Turn the journal into your execution operating system.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                Create a private account, verify it properly, watch the live market feed, and start building a
                documented edge with professional analytics.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Link href="/register">
                <Button size="lg" className="min-w-[210px]">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="min-w-[210px]">
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
      <MarketingFooter />
    </main>
  );
}
