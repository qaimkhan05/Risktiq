import { ExportButtons } from "@/components/reports/export-buttons";
import { Badge } from "@/components/risktiq-ui/badge";
import { Card } from "@/components/risktiq-ui/card";
import { DashboardLayout, useWorkspace } from "@/components/dashboard/dashboard-layout";
import { formatCurrency, formatDate } from "@/lib/utils";

function ReportsBody() {
  const { data, isLoading } = useWorkspace();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  const { snapshot } = data;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly report</p>
              <h2 className="mt-2 text-2xl font-semibold">Performance and discipline review</h2>
            </div>
            <ExportButtons type="weekly" />
          </div>
          <div className="mt-6 grid gap-4">
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Total trades</span>
              <span className="font-semibold">{snapshot.weeklyReport.totalTrades}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Weekly P&amp;L</span>
              <span className="font-semibold">{formatCurrency(snapshot.weeklyReport.weeklyPnl)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Rule violations</span>
              <Badge tone={snapshot.weeklyReport.ruleViolations ? "danger" : "success"}>
                {snapshot.weeklyReport.ruleViolations}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Overtrading days</span>
              <span className="font-semibold">{snapshot.weeklyReport.overtradingDays}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Emotional trading summary</span>
              <span className="font-semibold">{snapshot.weeklyReport.emotionalTradingCount}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly report</p>
              <h2 className="mt-2 text-2xl font-semibold">Deep-dive improvement review</h2>
            </div>
            <ExportButtons type="monthly" />
          </div>
          <div className="mt-6 grid gap-4">
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Monthly P&amp;L</span>
              <span className="font-semibold">{formatCurrency(snapshot.monthlyReport.monthlyPnl)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Best strategy of the month</span>
              <span className="font-semibold">{snapshot.monthlyReport.bestStrategy?.strategy || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Worst strategy of the month</span>
              <span className="font-semibold">{snapshot.monthlyReport.worstStrategy?.strategy || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Discipline score</span>
              <span className="font-semibold">{snapshot.monthlyReport.disciplineScore}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">Most profitable trades</p>
          <h3 className="mt-2 text-xl font-semibold">Monthly winners</h3>
          <div className="mt-6 grid gap-4">
            {snapshot.monthlyReport.topTrades.length ? (
              snapshot.monthlyReport.topTrades.map((trade) => (
                <div key={trade.id} className="rounded-[22px] border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{trade.assetName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trade.strategyUsed} - {formatDate(trade.tradeDate)}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-success">{formatCurrency(trade.pnlAmount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No trade data for the current month yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Biggest mistakes</p>
          <h3 className="mt-2 text-xl font-semibold">Improvement suggestions</h3>
          <div className="mt-6 grid gap-4">
            {snapshot.monthlyReport.biggestMistakes.length ? (
              snapshot.monthlyReport.biggestMistakes.map((trade) => (
                <div key={trade.id} className="rounded-[22px] border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{trade.assetName}</p>
                    <Badge tone="danger">{trade.strategyUsed}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{trade.mistakeMade}</p>
                  {trade.lessonsLearned ? <p className="mt-3 text-sm leading-7">{trade.lessonsLearned}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No mistakes logged yet. Keep documenting lessons for stronger monthly reviews.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsBody />
    </DashboardLayout>
  );
}
