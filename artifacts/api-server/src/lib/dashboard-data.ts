import { db, sanitizeDoc, sanitizeDocs } from "./db";
import { buildDashboardSnapshot } from "./analytics/dashboard";
import { normalizeTradingProfile } from "./profile";

export async function getUserWorkspace(userId: string) {
  const { tradingProfiles, trades, dailyReflections, goals } = await db.getCollections();
  const [rawProfile, userTradesRaw, userReflectionsRaw, userGoalsRaw] = await Promise.all([
    tradingProfiles.findOne({ userId }),
    trades.find({ userId }).sort({ tradeDate: -1 }).toArray(),
    dailyReflections.find({ userId }).sort({ reflectionDate: -1 }).toArray(),
    goals.find({ userId }).sort({ createdAt: -1 }).toArray(),
  ]);
  const profileDoc = sanitizeDoc(rawProfile);
  const userTrades = sanitizeDocs(userTradesRaw);
  const userReflections = sanitizeDocs(userReflectionsRaw);
  const userGoals = sanitizeDocs(userGoalsRaw);
  const profile = normalizeTradingProfile(profileDoc);
  return {
    profile,
    trades: userTrades,
    reflections: userReflections,
    goals: userGoals,
    snapshot: buildDashboardSnapshot({
      profile: profileDoc,
      trades: userTrades,
      reflections: userReflections,
      goals: userGoals,
    }),
  };
}
