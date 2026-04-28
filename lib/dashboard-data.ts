import { prisma } from "@/lib/prisma";
import { buildDashboardSnapshot } from "@/lib/analytics/dashboard";
import { normalizeTradingProfile } from "@/lib/profile";

export async function getUserWorkspace(userId: string) {
  const [rawProfile, trades, reflections, goals] = await Promise.all([
    prisma.tradingProfile.findUnique({
      where: {
        userId
      }
    }),
    prisma.trade.findMany({
      where: {
        userId
      },
      orderBy: {
        tradeDate: "desc"
      }
    }),
    prisma.dailyReflection.findMany({
      where: {
        userId
      },
      orderBy: {
        reflectionDate: "desc"
      }
    }),
    prisma.goal.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);
  const profile = normalizeTradingProfile(rawProfile);

  return {
    profile,
    trades,
    reflections,
    goals,
    snapshot: buildDashboardSnapshot({
      profile: rawProfile,
      trades,
      reflections,
      goals
    })
  };
}
