import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { TradeForm } from "@/components/forms/trade-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getUserWorkspace } from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TradesPage() {
  const user = await requireUser();
  const { profile, trades, snapshot } = await getUserWorkspace(user.id);
  const strategies = profile?.preferredStrategies?.length
    ? profile.preferredStrategies
    : [...new Set(trades.map((trade) => trade.strategyUsed).filter(Boolean))];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <p className="text-sm text-muted-foreground">Trade Entry System</p>
        <h2 className="mt-2 text-2xl font-semibold">Log a new trade</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Auto-calculated P&amp;L, risk-reward ratio, outcome detection, and discipline flags are applied on save.
        </p>
        <div className="mt-6">
          <TradeForm strategySuggestions={strategies} defaultTradeLimit={profile?.dailyTradeLimit} />
        </div>
      </Card>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-muted-foreground">Daily summary</p>
            <p className="mt-2 text-2xl font-semibold">{snapshot.weeklyReport.totalTrades}</p>
            <p className="mt-2 text-sm text-muted-foreground">Trades this week in active review window</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Overtrading alerts</p>
            <p className="mt-2 text-2xl font-semibold text-warning">{snapshot.disciplineBreakdown.overtrading}</p>
            <p className="mt-2 text-sm text-muted-foreground">Rule breaches flagged automatically</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Revenge trading</p>
            <p className="mt-2 text-2xl font-semibold text-danger">{snapshot.disciplineBreakdown.revenge}</p>
            <p className="mt-2 text-sm text-muted-foreground">Detected after loss streaks and emotional entries</p>
          </Card>
        </div>

        <Card>
          <p className="text-sm text-muted-foreground">Trade history</p>
          <h2 className="mt-2 text-2xl font-semibold">Recent journal entries</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Strategy</th>
                  <th className="pb-3 font-medium">Outcome</th>
                  <th className="pb-3 font-medium">P&amp;L</th>
                  <th className="pb-3 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody>
                {trades.length ? (
                  trades.slice(0, 14).map((trade) => (
                    <tr key={trade.id} className="border-b border-border/40">
                      <td className="py-4">{formatDate(trade.tradeDate, "dd MMM - HH:mm")}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {trade.direction === "BUY" ? (
                            <ArrowUpRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-danger" />
                          )}
                          {trade.assetName}
                        </div>
                      </td>
                      <td className="py-4">{trade.strategyUsed}</td>
                      <td className="py-4">{trade.outcome}</td>
                      <td className={`py-4 font-semibold ${trade.pnlAmount >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(trade.pnlAmount)}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {trade.overtradingFlag ? <Badge tone="warning">Overtrade</Badge> : null}
                          {trade.revengeTradingFlag ? <Badge tone="danger">Revenge</Badge> : null}
                          {trade.emotionalWarning ? <Badge tone="warning">Emotional</Badge> : null}
                          {trade.consecutiveLossFlag ? <Badge tone="danger">Loss streak</Badge> : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      No trades logged yet. Add your first trade to start analytics and discipline tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
