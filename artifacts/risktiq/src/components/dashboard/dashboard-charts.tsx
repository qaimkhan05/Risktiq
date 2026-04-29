import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pieColors = ["#16ffbb", "#38bdf8", "#f97316", "#ef4444"];

export function DashboardCharts({
  pnlSeries,
  strategyRows,
  wins,
  losses,
}: {
  pnlSeries: Array<{ date: string; pnl: number; trades: number }>;
  strategyRows: Array<{ strategy: string; profit: number; winRate: number; totalTrades: number }>;
  wins: number;
  losses: number;
}) {
  const liveSeries = useMemo(
    () =>
      pnlSeries.slice(-14).map((point) => ({
        ...point,
        shortDate: point.date.slice(5).replace("-", "/"),
      })),
    [pnlSeries],
  );
  const pieData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];
  const [activeIndex, setActiveIndex] = useState(liveSeries.length ? liveSeries.length - 1 : 0);

  useEffect(() => {
    setActiveIndex(liveSeries.length ? liveSeries.length - 1 : 0);
  }, [liveSeries.length]);

  useEffect(() => {
    if (liveSeries.length < 2) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current >= liveSeries.length - 1 ? 0 : current + 1));
    }, 2200);
    return () => window.clearInterval(intervalId);
  }, [liveSeries.length]);

  const activePoint = liveSeries[activeIndex] ?? null;
  const latestPoint = liveSeries[liveSeries.length - 1] ?? null;
  const previousPoint = activeIndex > 0 ? liveSeries[activeIndex - 1] : null;
  const intradayPulse = activePoint && previousPoint ? activePoint.pnl - previousPoint.pnl : activePoint?.pnl ?? 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,248,255,0.9))] p-5 dark:bg-[linear-gradient(180deg,rgba(10,19,36,0.92),rgba(7,14,27,0.98))]">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">PnL Trend</p>
            <h3 className="text-xl font-semibold">Live daily performance widget</h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Your journal data is rendered as a live-style session feed, cycling across recent daily performance points.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] border border-border/60 bg-background/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stream status</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                <span className="text-sm font-semibold">Live</span>
              </div>
            </div>
            <div className="rounded-[20px] border border-border/60 bg-background/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected day</p>
              <p className="mt-2 text-sm font-semibold">{activePoint?.shortDate || "No data"}</p>
            </div>
            <div className="rounded-[20px] border border-border/60 bg-background/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Trades that day</p>
              <p className="mt-2 text-sm font-semibold">{activePoint?.trades ?? 0}</p>
            </div>
          </div>
        </div>

        {liveSeries.length ? (
          <>
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-border/60 bg-background/75 p-4">
                <p className="text-sm text-muted-foreground">Active P&amp;L</p>
                <p className={`mt-2 text-3xl font-semibold ${Number(activePoint?.pnl || 0) >= 0 ? "text-success" : "text-danger"}`}>
                  ${Number(activePoint?.pnl || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/60 bg-background/75 p-4">
                <p className="text-sm text-muted-foreground">Pulse change</p>
                <p className={`mt-2 text-3xl font-semibold ${intradayPulse >= 0 ? "text-success" : "text-danger"}`}>
                  {intradayPulse >= 0 ? "+" : ""}{intradayPulse.toFixed(2)}
                </p>
              </div>
              <div className="rounded-[22px] border border-border/60 bg-background/75 p-4">
                <p className="text-sm text-muted-foreground">Latest snapshot</p>
                <p className={`mt-2 text-3xl font-semibold ${Number(latestPoint?.pnl || 0) >= 0 ? "text-success" : "text-danger"}`}>
                  ${Number(latestPoint?.pnl || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveSeries} margin={{ left: 6, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="risktiqPerformanceFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.32} />
                      <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
                  <XAxis dataKey="shortDate" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip
                    cursor={{ stroke: "rgba(14, 165, 233, 0.22)", strokeWidth: 1.5 }}
                    contentStyle={{
                      borderRadius: "18px",
                      border: "1px solid rgba(203, 213, 225, 0.65)",
                      background: "rgba(255,255,255,0.97)",
                      boxShadow: "0 18px 34px rgba(15, 23, 42, 0.12)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke="#0f766e"
                    strokeWidth={3}
                    fill="url(#risktiqPerformanceFill)"
                    activeDot={{ r: 6, fill: "#0f766e", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                  {activePoint ? (
                    <ReferenceDot
                      x={activePoint.shortDate}
                      y={activePoint.pnl}
                      r={7}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="rounded-[22px] border border-dashed border-border/70 bg-background/70 p-10 text-center">
            <p className="text-lg font-semibold">No performance data yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add trades to your journal and this widget will start streaming daily P&amp;L activity.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Trade outcomes</p>
            <h3 className="text-xl font-semibold">Win vs loss balance</h3>
          </div>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Strategy leaderboard</p>
            <h3 className="text-xl font-semibold">Net P&amp;L by strategy</h3>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyRows.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis dataKey="strategy" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="profit" radius={[8, 8, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
