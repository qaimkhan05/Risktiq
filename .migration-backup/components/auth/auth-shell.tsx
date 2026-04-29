import Link from "next/link";
import { CandlestickChart } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container-shell flex min-h-screen flex-col py-6">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <CandlestickChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Risktiq</p>
              <p className="text-xs text-muted-foreground">Trading Intelligence Suite</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
        <div className="grid flex-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="glass-panel relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-0 -z-10 bg-grid bg-[size:24px_24px] opacity-20" />
            <p className="eyebrow">Account security</p>
            <h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold">Private journal vault</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Every trader accesses only their own data, reports, screenshots, and analytics.
                </p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
                <p className="text-sm font-semibold">Discipline-first workflow</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Move from raw trade logs to strategy clarity, psychology insight, and review habits.
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 md:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
