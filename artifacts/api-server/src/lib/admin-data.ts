import { ne, isNotNull, eq, desc, and, count } from "drizzle-orm";
import { db } from "./db";
import { users, tradingProfiles, trades, dailyReflections, goals } from "@workspace/db/schema";
import { normalizeTradingProfile } from "./profile";

export async function getAdminJournalWorkspace() {
  const [
    customerCountResult,
    verifiedCountResult,
    totalTradeCountResult,
    totalReflectionCountResult,
    customerUsers,
    recentPlatformTradesRaw,
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(ne(users.role, "ADMIN")),
    db.select({ value: count() }).from(users).where(and(ne(users.role, "ADMIN"), isNotNull(users.emailVerified))),
    db.select({ value: count() }).from(trades),
    db.select({ value: count() }).from(dailyReflections),
    db.select().from(users).where(ne(users.role, "ADMIN")).orderBy(desc(users.createdAt)),
    db
      .select({
        id: trades.id,
        userId: trades.userId,
        tradeDate: trades.tradeDate,
        assetName: trades.assetName,
        direction: trades.direction,
        pnlAmount: trades.pnlAmount,
        strategyUsed: trades.strategyUsed,
        outcome: trades.outcome,
        userEmail: users.email,
        userName: users.name,
      })
      .from(trades)
      .innerJoin(users, eq(trades.userId, users.id))
      .orderBy(desc(trades.tradeDate))
      .limit(18),
  ]);

  const customerJournals = await Promise.all(
    customerUsers.map(async (user) => {
      const [profileArr, userTrades, userReflections, userGoals] = await Promise.all([
        db.select().from(tradingProfiles).where(eq(tradingProfiles.userId, user.id)).limit(1),
        db.select().from(trades).where(eq(trades.userId, user.id)).orderBy(desc(trades.tradeDate)),
        db
          .select()
          .from(dailyReflections)
          .where(eq(dailyReflections.userId, user.id))
          .orderBy(desc(dailyReflections.reflectionDate))
          .limit(1),
        db.select().from(goals).where(eq(goals.userId, user.id)).orderBy(desc(goals.createdAt)).limit(3),
      ]);
      const recentTrades = userTrades.slice(0, 4);
      return {
        ...user,
        profile: normalizeTradingProfile(profileArr[0] ?? null),
        trades: recentTrades,
        reflections: userReflections,
        goals: userGoals,
        recentPnl: Number(recentTrades.reduce((sum, t) => sum + t.pnlAmount, 0).toFixed(2)),
        ruleBreaks: userTrades.reduce((sum, t) => sum + t.ruleBreakCount, 0),
        lastTradeAt: userTrades[0]?.tradeDate ?? null,
        lastReflection: userReflections[0] ?? null,
        _count: {
          trades: userTrades.length,
          reflections: userReflections.length,
          goals: userGoals.length,
        },
      };
    }),
  );

  const recentPlatformTrades = recentPlatformTradesRaw.map((t) => ({
    id: t.id,
    userId: t.userId,
    tradeDate: t.tradeDate,
    assetName: t.assetName,
    direction: t.direction,
    pnlAmount: t.pnlAmount,
    strategyUsed: t.strategyUsed,
    outcome: t.outcome,
    user: { email: t.userEmail, name: t.userName },
  }));

  return {
    customerCount: customerCountResult[0]?.value ?? 0,
    verifiedCustomerCount: verifiedCountResult[0]?.value ?? 0,
    totalTradeCount: totalTradeCountResult[0]?.value ?? 0,
    totalReflectionCount: totalReflectionCountResult[0]?.value ?? 0,
    customerJournals,
    recentPlatformTrades,
  };
}
