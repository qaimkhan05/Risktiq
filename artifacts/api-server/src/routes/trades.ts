import { Router } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { trades, tradingProfiles } from "@workspace/db/schema";
import { tradeSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";
import {
  calculatePnl,
  calculateRiskRewardRatio,
  combineTradeDateTime,
  detectTradeFlags,
  determineTradeOutcome,
} from "../lib/analytics/trade-math";

const router: Router = Router();

router.get("/", requireUser(), async (req, res) => {
  const user = (req as typeof req & { user: AppUser }).user;
  const list = await db.select().from(trades).where(eq(trades.userId, user.id)).orderBy(desc(trades.tradeDate));
  res.json({ trades: list });
});

router.post("/", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = tradeSchema.parse(req.body);
    const tradeTimestamp = combineTradeDateTime(payload.tradeDate, payload.tradeTime);
    const pnlAmount = calculatePnl(payload);
    const riskRewardRatio = calculateRiskRewardRatio(payload);
    const outcome = determineTradeOutcome(pnlAmount);

    const [profileArr, existingTrades] = await Promise.all([
      db.select().from(tradingProfiles).where(eq(tradingProfiles.userId, user.id)).limit(1),
      db.select().from(trades).where(eq(trades.userId, user.id)).orderBy(asc(trades.tradeDate)),
    ]);

    const flags = detectTradeFlags({
      existingTrades,
      profile: profileArr[0] ?? null,
      tradeInput: payload,
      tradeTimestamp,
      outcome,
    });

    const [trade] = await db
      .insert(trades)
      .values({
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
        mistakeMade: payload.mistakeMade ?? null,
        lessonsLearned: payload.lessonsLearned ?? null,
        tradeNotes: payload.tradeNotes ?? null,
        outcome,
        overtradingFlag: flags.overtradingFlag,
        revengeTradingFlag: flags.revengeTradingFlag,
        emotionalWarning: flags.emotionalWarning,
        consecutiveLossFlag: flags.consecutiveLossFlag,
        ruleBreakCount: flags.ruleBreakCount,
      })
      .returning();

    res.json({ message: "Trade saved successfully.", trade });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save trade." });
  }
});

export default router;
