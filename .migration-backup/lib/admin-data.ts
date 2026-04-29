import { prisma } from "@/lib/prisma";
import { normalizeTradingProfile } from "@/lib/profile";

export async function getAdminJournalWorkspace() {
  const [customerCount, verifiedCustomerCount, totalTradeCount, totalReflectionCount, users, recentPlatformTrades] =
    await Promise.all([
      prisma.user.count({
        where: {
          role: {
            not: "ADMIN"
          }
        }
      }),
      prisma.user.count({
        where: {
          role: {
            not: "ADMIN"
          },
          emailVerified: {
            not: null
          }
        }
      }),
      prisma.trade.count(),
      prisma.dailyReflection.count(),
      prisma.user.findMany({
        where: {
          role: {
            not: "ADMIN"
          }
        },
        include: {
          profile: true,
          trades: {
            orderBy: {
              tradeDate: "desc"
            },
            take: 4
          },
          reflections: {
            orderBy: {
              reflectionDate: "desc"
            },
            take: 1
          },
          goals: {
            orderBy: {
              createdAt: "desc"
            },
            take: 3
          },
          _count: {
            select: {
              trades: true,
              reflections: true,
              goals: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.trade.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          tradeDate: "desc"
        },
        take: 18
      })
    ]);

  const customerJournals = users.map((user) => ({
    ...user,
    profile: normalizeTradingProfile(user.profile),
    recentPnl: Number(user.trades.reduce((sum, trade) => sum + trade.pnlAmount, 0).toFixed(2)),
    ruleBreaks: user.trades.reduce((sum, trade) => sum + trade.ruleBreakCount, 0),
    lastTradeAt: user.trades[0]?.tradeDate ?? null,
    lastReflection: user.reflections[0] ?? null
  }));

  return {
    customerCount,
    verifiedCustomerCount,
    totalTradeCount,
    totalReflectionCount,
    customerJournals,
    recentPlatformTrades
  };
}
