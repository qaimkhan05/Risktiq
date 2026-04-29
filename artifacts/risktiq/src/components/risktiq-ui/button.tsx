import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantStyles = {
  primary:
    "border border-foreground/5 bg-foreground text-background shadow-[0_14px_34px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.2)]",
  secondary:
    "border border-border/70 bg-card/90 text-foreground shadow-[0_10px_24px_rgba(148,163,184,0.12)] hover:-translate-y-0.5 hover:bg-card",
  ghost: "bg-transparent text-foreground hover:bg-card/70",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizeStyles = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
