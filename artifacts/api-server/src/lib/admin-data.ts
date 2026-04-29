import { db, sanitizeDoc, sanitizeDocs } from "./db";
import { normalizeTradingProfile } from "./profile";

export async function getAdminJournalWorkspace() {
  const { users, tradingProfiles, trades, dailyReflections, goals } = await db.getCollections();
  const [
    customerCount,
    verifiedCustomerCount,
    totalTradeCount,
    totalReflectionCount,
    customerUsersRaw,
    recentPlatformTradesRaw,
  ] = await Promise.all([
    users.countDocuments({ role: { $ne: "ADMIN" } }),
    users.countDocuments({ role: { $ne: "ADMIN" }, emailVerified: { $exists: true, $ne: null } }),
    trades.countDocuments({}),
    dailyReflections.countDocuments({}),
    users.find({ role: { $ne: "ADMIN" } }).sort({ createdAt: -1 }).toArray(),
    trades.find({}).sort({ tradeDate: -1 }).limit(18).toArray(),
  ]);

  const customerUsers = sanitizeDocs(customerUsersRaw);
  const recentPlatformTradesDocs = sanitizeDocs(recentPlatformTradesRaw);
  const recentTradeUserIds = [...new Set(recentPlatformTradesDocs.map((trade) => trade.userId))];
  const recentTradeUsers = recentTradeUserIds.length
    ? sanitizeDocs(await users.find({ id: { $in: recentTradeUserIds } }).toArray())
    : [];
  const recentTradeUserMap = new Map(recentTradeUsers.map((user) => [user.id, user]));

  const customerJournals = await Promise.all(
    customerUsers.map(async (user) => {
      const [profileRaw, userTradesRaw, userReflectionsRaw, userGoalsRaw] = await Promise.all([
        tradingProfiles.findOne({ userId: user.id }),
        trades.find({ userId: user.id }).sort({ tradeDate: -1 }).toArray(),
        dailyReflections.find({ userId: user.id }).sort({ reflectionDate: -1 }).limit(1).toArray(),
        goals.find({ userId: user.id }).sort({ createdAt: -1 }).limit(3).toArray(),
      ]);
      const profile = sanitizeDoc(profileRaw);
      const userTrades = sanitizeDocs(userTradesRaw);
      const userReflections = sanitizeDocs(userReflectionsRaw);
      const userGoals = sanitizeDocs(userGoalsRaw);
      const recentTrades = userTrades.slice(0, 4);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt,
        profile: normalizeTradingProfile(profile),
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

  const recentPlatformTrades = recentPlatformTradesDocs.map((trade) => {
    const user = recentTradeUserMap.get(trade.userId);
    return {
      id: trade.id,
      userId: trade.userId,
      tradeDate: trade.tradeDate,
      assetName: trade.assetName,
      direction: trade.direction,
      pnlAmount: trade.pnlAmount,
      strategyUsed: trade.strategyUsed,
      outcome: trade.outcome,
      user: { email: user?.email ?? "", name: user?.name ?? null },
    };
  });

  return {
    customerCount,
    verifiedCustomerCount,
    totalTradeCount,
    totalReflectionCount,
    customerJournals,
    recentPlatformTrades,
  };
}
