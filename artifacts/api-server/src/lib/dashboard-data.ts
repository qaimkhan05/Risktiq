import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { tradingProfiles, trades, dailyReflections, goals } from "@workspace/db/schema";
import { buildDashboardSnapshot } from "./analytics/dashboard";
import { normalizeTradingProfile } from "./profile";

export async function getUserWorkspace(userId: string) {
  const [rawProfileArr, userTrades, userReflections, userGoals] = await Promise.all([
    db.select().from(tradingProfiles).where(eq(tradingProfiles.userId, userId)).limit(1),
    db.select().from(trades).where(eq(trades.userId, userId)).orderBy(desc(trades.tradeDate)),
    db
      .select()
      .from(dailyReflections)
      .where(eq(dailyReflections.userId, userId))
      .orderBy(desc(dailyReflections.reflectionDate)),
    db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt)),
  ]);
  const rawProfile = rawProfileArr[0] ?? null;
  const profile = normalizeTradingProfile(rawProfile);
  return {
    profile,
    trades: userTrades,
    reflections: userReflections,
    goals: userGoals,
    snapshot: buildDashboardSnapshot({
      profile: rawProfile,
      trades: userTrades,
      reflections: userReflections,
      goals: userGoals,
    }),
  };
}
