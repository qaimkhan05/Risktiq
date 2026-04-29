import { Link } from "wouter";
import { CandlestickChart } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/risktiq-ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <CandlestickChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Risktiq</p>
              <p className="text-xs text-muted-foreground">Trading Intelligence Suite</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/contact" className="transition hover:text-foreground">Contact</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Start Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
