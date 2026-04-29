import { cn } from "@/lib/utils";

export function CalendarHeatmap({
  cells
}: {
  cells: Array<{ date: string; dayLabel: string; weekLabel: string; trades: number; pnl: number }>;
}) {
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm text-muted-foreground">Performance heatmap</p>
        <h3 className="text-xl font-semibold">84-day execution calendar</h3>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.date}
            className={cn(
              "rounded-2xl border p-3 text-center",
              cell.trades === 0 && "border-border/50 bg-background/40 text-muted-foreground",
              cell.pnl > 0 && "border-success/25 bg-success/10",
              cell.pnl < 0 && "border-danger/25 bg-danger/10"
            )}
            title={`${cell.date} | Trades: ${cell.trades} | PnL: ${cell.pnl}`}
          >
            <p className="text-xs text-muted-foreground">{cell.dayLabel}</p>
            <p className="mt-2 text-sm font-semibold">{cell.trades}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
