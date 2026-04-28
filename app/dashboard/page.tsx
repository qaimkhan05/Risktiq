import Link from "next/link";

import { CalendarHeatmap } from "@/components/dashboard/calendar-heatmap";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getUserWorkspace } from "@/lib/dashboard-data";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const { profile, snapshot } = await getUserWorkspace(user.id);

  return (
    <div className="space-y-6">
      {!profile ? (
        <Card className="border-primary/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Onboarding required</p>
              <h2 className="mt-2 text-2xl font-semibold">Complete your trader profile before scaling your journal.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Define style, limits, targets, and preferred strategies so the platform can score discipline accurately.
              </p>
            </div>
            <Link href="/dashboard/profile">
              <Button>Complete profile setup</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Trades" value={String(snapshot.summary.totalTrades)} />
        <MetricCard
          label="Win Rate"
          value={formatPercent(snapshot.summary.winRate)}
          hint={`${snapshot.summary.winningTrades} wins / ${snapshot.summary.losingTrades} losses`}
          tone="success"
        />
        <MetricCard label="Net P&L" value={formatCurrency(snapshot.summary.netPnl)} tone={snapshot.summary.netPnl >= 0 ? "success" : "danger"} />
        <MetricCard label="Discipline Score" value={`${snapshot.summary.disciplineScore}/100`} />
        <MetricCard label="Rule Break Count" value={String(snapshot.summary.ruleBreakCount)} tone={snapshot.summary.ruleBreakCount ? "danger" : "default"} />
        <MetricCard label="Avg Risk Reward" value={snapshot.summary.averageRiskRewardRatio.toFixed(2)} />
        <MetricCard label="Monthly Growth" value={formatPercent(snapshot.summary.monthlyGrowth)} tone={snapshot.summary.monthlyGrowth >= 0 ? "success" : "danger"} />
        <MetricCard label="Journal Streak" value={`${snapshot.summary.journalStreak} days`} />
      </div>

      <DashboardCharts
        pnlSeries={snapshot.pnlSeries}
        strategyRows={snapshot.strategyRows}
        wins={snapshot.summary.winningTrades}
        losses={snapshot.summary.losingTrades}
      />

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <Card>
          <CalendarHeatmap cells={snapshot.calendarHeatmap} />
        </Card>
        <div className="grid gap-6">
          <Card>
            <p className="text-sm text-muted-foreground">AI habit analysis</p>
            <h3 className="mt-2 text-xl font-semibold">Smart suggestions for improvement</h3>
            <div className="mt-5 grid gap-3">
              {snapshot.aiInsights.map((insight) => (
                <div key={insight} className="rounded-[22px] border border-border/60 bg-background/60 p-4 text-sm leading-7">
                  {insight}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Alerts and reminders</p>
            <h3 className="mt-2 text-xl font-semibold">Execution warnings</h3>
            <div className="mt-5 grid gap-3">
              {snapshot.reminderAlerts.length ? (
                snapshot.reminderAlerts.map((alert) => (
                  <div key={alert} className="rounded-[22px] border border-warning/30 bg-warning/10 p-4 text-sm">
                    {alert}
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-success/30 bg-success/10 p-4 text-sm">
                  No pending journal alerts. Review rhythm is on track.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Strategy edge</p>
          <h3 className="mt-2 text-xl font-semibold">Best and worst performers</h3>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-success/30 bg-success/10 p-4">
              <p className="text-sm text-muted-foreground">Best strategy</p>
              <p className="mt-2 text-lg font-semibold">{snapshot.summary.bestStrategy}</p>
            </div>
            <div className="rounded-[22px] border border-danger/30 bg-danger/10 p-4">
              <p className="text-sm text-muted-foreground">Worst strategy</p>
              <p className="mt-2 text-lg font-semibold">{snapshot.summary.worstStrategy}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Psychology and habits</p>
          <h3 className="mt-2 text-xl font-semibold">Scoreboard</h3>
          <div className="mt-5 grid gap-4">
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Psychology Score</span>
              <Badge>{snapshot.summary.psychologyScore}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Performance Score</span>
              <Badge>{snapshot.summary.performanceScore}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Average Discipline</span>
              <Badge>{snapshot.habits.averageDiscipline}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Milestones</p>
          <h3 className="mt-2 text-xl font-semibold">Goal tracking</h3>
          <div className="mt-5 grid gap-4">
            {snapshot.activeGoals.length ? (
              snapshot.activeGoals.slice(0, 3).map((goal) => {
                const progress = goal.targetValue ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
                return (
                  <div key={goal.id} className="rounded-[22px] border border-border/60 bg-background/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{goal.title}</p>
                      <Badge>{goal.status}</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {goal.currentValue} / {goal.targetValue}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No active goals yet. Add one in the Goals section.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">Weekly report</p>
          <h3 className="mt-2 text-xl font-semibold">Current week summary</h3>
          <div className="mt-5 grid gap-4">
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
              <span className="font-semibold">{snapshot.weeklyReport.ruleViolations}</span>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Monthly report</p>
          <h3 className="mt-2 text-xl font-semibold">Current month summary</h3>
          <div className="mt-5 grid gap-4">
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Monthly P&amp;L</span>
              <span className="font-semibold">{formatCurrency(snapshot.monthlyReport.monthlyPnl)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Best strategy</span>
              <span className="font-semibold">{snapshot.monthlyReport.bestStrategy?.strategy || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border/60 bg-background/60 p-4">
              <span>Most profitable day</span>
              <span className="font-semibold">
                {snapshot.summary.mostProfitableDay
                  ? `${formatDate(snapshot.summary.mostProfitableDay.date)} - ${formatCurrency(snapshot.summary.mostProfitableDay.pnl)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
