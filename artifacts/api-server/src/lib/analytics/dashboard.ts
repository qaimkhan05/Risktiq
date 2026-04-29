import {
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import type { DailyReflection, Goal, Trade, TradingProfile } from "@workspace/db/schema";

const GOAL_STATUS = { ACTIVE: "ACTIVE", COMPLETED: "COMPLETED" } as const;
const TRADE_OUTCOME = { WIN: "WIN", LOSS: "LOSS" } as const;

type StrategySummary = {
  strategy: string;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
};

function safeAverage(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupStrategies(trades: Trade[]): StrategySummary[] {
  const strategyMap = new Map<string, StrategySummary>();
  for (const trade of trades) {
    const current = strategyMap.get(trade.strategyUsed) ?? {
      strategy: trade.strategyUsed,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      profit: 0,
    };
    current.totalTrades += 1;
    current.profit += trade.pnlAmount;
    if (trade.outcome === TRADE_OUTCOME.WIN) current.wins += 1;
    if (trade.outcome === TRADE_OUTCOME.LOSS) current.losses += 1;
    strategyMap.set(trade.strategyUsed, current);
  }
  return [...strategyMap.values()]
    .map((item) => ({
      ...item,
      profit: Number(item.profit.toFixed(2)),
      winRate: item.totalTrades ? Number(((item.wins / item.totalTrades) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.profit - a.profit);
}

function buildPnLSeries(trades: Trade[]) {
  const dailyMap = new Map<string, { date: string; pnl: number; trades: number }>();
  for (const trade of trades) {
    const key = format(trade.tradeDate, "yyyy-MM-dd");
    const current = dailyMap.get(key) ?? { date: key, pnl: 0, trades: 0 };
    current.pnl += trade.pnlAmount;
    current.trades += 1;
    dailyMap.set(key, current);
  }
  return [...dailyMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({ ...item, pnl: Number(item.pnl.toFixed(2)) }));
}

function buildCalendarHeatmap(trades: Trade[]) {
  const end = new Date();
  const start = subDays(end, 83);
  const interval = eachDayOfInterval({ start, end });
  return interval.map((day) => {
    const dayTrades = trades.filter((trade) => isSameDay(trade.tradeDate, day));
    const pnl = dayTrades.reduce((sum, trade) => sum + trade.pnlAmount, 0);
    return {
      date: format(day, "yyyy-MM-dd"),
      dayLabel: format(day, "dd"),
      weekLabel: format(day, "MMM"),
      trades: dayTrades.length,
      pnl: Number(pnl.toFixed(2)),
    };
  });
}

function buildStreak(reflections: DailyReflection[]) {
  if (!reflections.length) return 0;
  const sorted = [...reflections].sort((a, b) => b.reflectionDate.getTime() - a.reflectionDate.getTime());
  let streak = 0;
  let cursor = new Date();
  for (const reflection of sorted) {
    if (isSameDay(reflection.reflectionDate, cursor) || isSameDay(reflection.reflectionDate, subDays(cursor, 1))) {
      streak += 1;
      cursor = subDays(reflection.reflectionDate, 1);
      continue;
    }
    break;
  }
  return streak;
}

function buildCoachInsights({
  profile,
  trades,
  strategies,
  monthlyGrowth,
  reflections,
}: {
  profile: TradingProfile | null;
  trades: Trade[];
  strategies: StrategySummary[];
  monthlyGrowth: number;
  reflections: DailyReflection[];
}) {
  const insights: string[] = [];
  const overtradingTrades = trades.filter((trade) => trade.overtradingFlag).length;
  const revengeTrades = trades.filter((trade) => trade.revengeTradingFlag).length;
  const emotionalTrades = trades.filter((trade) => trade.emotionalWarning).length;
  const averageRR = safeAverage(trades.map((trade) => trade.riskRewardRatio));
  const bestStrategy = strategies[0];
  const worstStrategy = [...strategies].sort((a, b) => a.profit - b.profit)[0];
  const averageDiscipline = safeAverage(reflections.map((reflection) => reflection.disciplineScore));

  if (overtradingTrades > 0) insights.push(`${overtradingTrades} trade(s) breached your trade limits. Consider a hard stop after ${profile?.dailyTradeLimit ?? 0} trades.`);
  if (revengeTrades > 0) insights.push(`${revengeTrades} entries looked like revenge trading. Add a mandatory cooldown after losses.`);
  if (averageRR < 1.4 && trades.length > 0) insights.push(`Average risk-reward is ${averageRR.toFixed(2)}. Tighten stops or hold winners longer to improve expectancy.`);
  if (bestStrategy) insights.push(`${bestStrategy.strategy} is your strongest setup with ${bestStrategy.winRate}% win rate across ${bestStrategy.totalTrades} trades.`);
  if (worstStrategy && worstStrategy.profit < 0) insights.push(`Scale back ${worstStrategy.strategy}; it is your weakest strategy by net P&L this period.`);
  if (emotionalTrades > 2) insights.push("Elevated emotion markers were detected repeatedly. Journal before execution to reduce impulsive entries.");
  if (monthlyGrowth < 0) insights.push("Monthly growth is negative. Reduce frequency, focus on A+ setups, and review your losing clusters.");
  if (averageDiscipline > 0 && averageDiscipline < 70) insights.push("Reflection scores indicate discipline drift. Use the daily reflection and habit tracker more consistently.");
  if (!insights.length) insights.push("Execution quality looks stable. Maintain process consistency and keep reinforcing your best-performing strategy.");

  return insights.slice(0, 5);
}

export function buildDashboardSnapshot({
  profile,
  trades,
  reflections,
  goals,
}: {
  profile: TradingProfile | null;
  trades: Trade[];
  reflections: DailyReflection[];
  goals: Goal[];
}) {
  const sortedTrades = [...trades].sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime());
  const totalTrades = trades.length;
  const winningTrades = trades.filter((trade) => trade.outcome === TRADE_OUTCOME.WIN);
  const losingTrades = trades.filter((trade) => trade.outcome === TRADE_OUTCOME.LOSS);
  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnlAmount, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnlAmount, 0));
  const netPnl = totalProfit - totalLoss;
  const winRate = totalTrades ? (winningTrades.length / totalTrades) * 100 : 0;
  const strategyRows = groupStrategies(trades);
  const bestStrategy = strategyRows[0];
  const worstStrategy = [...strategyRows].sort((a, b) => a.profit - b.profit)[0];
  const pnlSeries = buildPnLSeries(trades);

  const dayPerformance = [...pnlSeries].sort((a, b) => b.pnl - a.pnl);
  const mostProfitableDay = dayPerformance[0];
  const mostLossDay = [...pnlSeries].sort((a, b) => a.pnl - b.pnl)[0];

  const currentMonthStart = startOfMonth(new Date());
  const previousMonthStart = startOfMonth(subDays(currentMonthStart, 1));
  const previousMonthEnd = endOfMonth(previousMonthStart);

  const currentMonthPnl = trades.filter((trade) => trade.tradeDate >= currentMonthStart).reduce((sum, trade) => sum + trade.pnlAmount, 0);
  const previousMonthPnl = trades
    .filter((trade) => trade.tradeDate >= previousMonthStart && trade.tradeDate <= previousMonthEnd)
    .reduce((sum, trade) => sum + trade.pnlAmount, 0);

  const monthlyGrowth =
    previousMonthPnl === 0
      ? currentMonthPnl > 0
        ? 100
        : 0
      : ((currentMonthPnl - previousMonthPnl) / Math.abs(previousMonthPnl)) * 100;

  const disciplineFlags = trades.reduce(
    (acc, trade) => {
      acc.overtrading += Number(trade.overtradingFlag);
      acc.revenge += Number(trade.revengeTradingFlag);
      acc.emotional += Number(trade.emotionalWarning);
      acc.consecutiveLoss += Number(trade.consecutiveLossFlag);
      acc.ruleBreaks += trade.ruleBreakCount;
      return acc;
    },
    { overtrading: 0, revenge: 0, emotional: 0, consecutiveLoss: 0, ruleBreaks: 0 },
  );

  const reflectionDiscipline = safeAverage(reflections.map((r) => r.disciplineScore));
  const rulePenalty =
    disciplineFlags.ruleBreaks * 4 +
    disciplineFlags.overtrading * 3 +
    disciplineFlags.revenge * 5 +
    disciplineFlags.consecutiveLoss * 2;
  const disciplineScore = Math.max(0, Math.min(100, Math.round((reflectionDiscipline || 92) - rulePenalty / 2)));
  const psychologyScore = Math.round(safeAverage(reflections.map((r) => r.psychologyScore)) || 88);
  const performanceScore = Math.round(safeAverage(reflections.map((r) => r.performanceScore)) || winRate);

  const activeGoals = goals.filter((goal) => goal.status === GOAL_STATUS.ACTIVE || goal.status === GOAL_STATUS.COMPLETED);
  const journalStreak = buildStreak(reflections);
  const lastReflectionDate = reflections.sort((a, b) => b.reflectionDate.getTime() - a.reflectionDate.getTime())[0]?.reflectionDate;

  const weeklyStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyTrades = trades.filter((trade) => trade.tradeDate >= weeklyStart && trade.tradeDate <= weeklyEnd);
  const monthlyTrades = trades.filter((trade) => trade.tradeDate >= currentMonthStart);

  const weeklyReport = {
    totalTrades: weeklyTrades.length,
    weeklyPnl: Number(weeklyTrades.reduce((sum, t) => sum + t.pnlAmount, 0).toFixed(2)),
    strategyPerformance: groupStrategies(weeklyTrades),
    ruleViolations: weeklyTrades.reduce((sum, t) => sum + t.ruleBreakCount, 0),
    overtradingDays: [
      ...new Set(weeklyTrades.filter((t) => t.overtradingFlag).map((t) => format(t.tradeDate, "yyyy-MM-dd"))),
    ].length,
    emotionalTradingCount: weeklyTrades.filter((t) => t.emotionalWarning).length,
  };

  const monthlyReport = {
    totalTrades: monthlyTrades.length,
    monthlyPnl: Number(monthlyTrades.reduce((sum, t) => sum + t.pnlAmount, 0).toFixed(2)),
    topTrades: [...monthlyTrades].sort((a, b) => b.pnlAmount - a.pnlAmount).slice(0, 3),
    biggestMistakes: monthlyTrades.filter((t) => t.mistakeMade).slice(0, 4),
    bestStrategy: groupStrategies(monthlyTrades)[0] ?? null,
    worstStrategy: [...groupStrategies(monthlyTrades)].sort((a, b) => a.profit - b.profit)[0] ?? null,
    disciplineScore,
  };

  const reminderAlerts: string[] = [];
  if (!isToday(lastReflectionDate ?? new Date(0))) reminderAlerts.push("Daily reflection has not been completed today.");
  if (sortedTrades.length > 0 && !lastReflectionDate) reminderAlerts.push("You have trades logged but no reflection history yet.");
  const lastTradeDate = sortedTrades[sortedTrades.length - 1]?.tradeDate;
  if (lastTradeDate && !lastReflectionDate) reminderAlerts.push("Recent trades are missing journal context. Add a reflection to keep your review loop complete.");

  const aiInsights = buildCoachInsights({ profile, trades, strategies: strategyRows, monthlyGrowth, reflections });

  return {
    summary: {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: Number(winRate.toFixed(1)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalLoss: Number(totalLoss.toFixed(2)),
      netPnl: Number(netPnl.toFixed(2)),
      bestStrategy: bestStrategy?.strategy ?? "N/A",
      worstStrategy: worstStrategy?.strategy ?? "N/A",
      mostProfitableDay,
      mostLossDay,
      disciplineScore,
      ruleBreakCount: disciplineFlags.ruleBreaks,
      averageRiskRewardRatio: Number(safeAverage(trades.map((t) => t.riskRewardRatio)).toFixed(2)),
      monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
      psychologyScore,
      performanceScore,
      journalStreak,
    },
    strategyRows,
    pnlSeries,
    calendarHeatmap: buildCalendarHeatmap(trades),
    weeklyReport,
    monthlyReport,
    reminderAlerts,
    aiInsights,
    activeGoals,
    disciplineBreakdown: disciplineFlags,
    habits: {
      averageDiscipline: Number((safeAverage(reflections.map((r) => r.disciplineScore)) || 0).toFixed(1)),
      averagePsychology: Number((safeAverage(reflections.map((r) => r.psychologyScore)) || 0).toFixed(1)),
      averagePerformance: Number((safeAverage(reflections.map((r) => r.performanceScore)) || 0).toFixed(1)),
    },
  };
}

export type DashboardSnapshot = ReturnType<typeof buildDashboardSnapshot>;
