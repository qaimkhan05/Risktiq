"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/90 text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
    </button>
  );
}
