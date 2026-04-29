import { Link } from "wouter";
import { CandlestickChart } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="container-shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <CandlestickChart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Risktiq</p>
            <p className="text-xs text-muted-foreground">Trading Intelligence Suite</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">Home</Link>
          <Link href="/contact" className="transition hover:text-foreground">Contact</Link>
          <Link href="/login" className="transition hover:text-foreground">Login</Link>
          <Link href="/register" className="transition hover:text-foreground">Create account</Link>
        </div>
      </div>
    </footer>
  );
}
