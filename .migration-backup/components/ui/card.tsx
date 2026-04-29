import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.94))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)] before:content-[''] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(13,18,32,0.96))] dark:shadow-[0_20px_60px_rgba(2,8,23,0.45)] dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]",
        className
      )}
    >
      {children}
    </div>
  );
}
