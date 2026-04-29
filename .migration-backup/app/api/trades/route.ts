import { NextResponse } from "next/server";

import {
  calculatePnl,
  calculateRiskRewardRatio,
  combineTradeDateTime,
  detectTradeFlags,
  determineTradeOutcome
} from "@/lib/analytics/trade-math";
import { getApiUser } from "@/lib/auth/api-user";
import { prisma } from "@/lib/prisma";
import { tradeSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      tradeDate: "desc"
    }
  });

  return NextResponse.json({ trades });
}

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = tradeSchema.parse(await request.json());
    const tradeTimestamp = combineTradeDateTime(payload.tradeDate, payload.tradeTime);
    const pnlAmount = calculatePnl(payload);
    const riskRewardRatio = calculateRiskRewardRatio(payload);
    const outcome = determineTradeOutcome(pnlAmount);

    const [profile, existingTrades] = await Promise.all([
      prisma.tradingProfile.findUnique({
        where: {
          userId: user.id
        }
      }),
      prisma.trade.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          tradeDate: "asc"
        }
      })
    ]);

    const flags = detectTradeFlags({
      existingTrades,
      profile,
      tradeInput: payload,
      tradeTimestamp,
      outcome
    });

    const trade = await prisma.trade.create({
      data: {
        userId: user.id,
        tradeDate: tradeTimestamp,
        assetName: payload.assetName,
        direction: payload.direction,
        quantity: payload.quantity,
        entryPrice: payload.entryPrice,
        exitPrice: payload.exitPrice,
        stopLoss: payload.stopLoss,
        takeProfit: payload.takeProfit,
        pnlAmount,
        riskRewardRatio,
        strategyUsed: payload.strategyUsed,
        screenshotUrl: payload.screenshotUrl || null,
        emotionalBefore: payload.emotionalBefore,
        emotionalAfter: payload.emotionalAfter,
        mistakeMade: payload.mistakeMade,
        lessonsLearned: payload.lessonsLearned,
        tradeNotes: payload.tradeNotes,
        outcome,
        overtradingFlag: flags.overtradingFlag,
        revengeTradingFlag: flags.revengeTradingFlag,
        emotionalWarning: flags.emotionalWarning,
        consecutiveLossFlag: flags.consecutiveLossFlag,
        ruleBreakCount: flags.ruleBreakCount
      }
    });

    return NextResponse.json({
      message: "Trade saved successfully.",
      trade
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save trade." },
      { status: 400 }
    );
  }
}
