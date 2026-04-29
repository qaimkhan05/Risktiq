import { Router } from "express";
import { db, createId, sanitizeDoc, sanitizeDocs } from "../lib/db";
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
  const { trades } = await db.getCollections();
  const list = sanitizeDocs(await trades.find({ userId: user.id }).sort({ tradeDate: -1 }).toArray());
  res.json({ trades: list });
});

router.post("/", requireUser(), async (req, res) => {
  try {
    const { tradingProfiles, trades } = await db.getCollections();
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = tradeSchema.parse(req.body);
    const tradeTimestamp = combineTradeDateTime(payload.tradeDate, payload.tradeTime);
    const pnlAmount = calculatePnl(payload);
    const riskRewardRatio = calculateRiskRewardRatio(payload);
    const outcome = determineTradeOutcome(pnlAmount);

    const [profileRaw, existingTradesRaw] = await Promise.all([
      tradingProfiles.findOne({ userId: user.id }),
      trades.find({ userId: user.id }).sort({ tradeDate: 1 }).toArray(),
    ]);
    const profile = sanitizeDoc(profileRaw);
    const existingTrades = sanitizeDocs(existingTradesRaw);

    const flags = detectTradeFlags({
      existingTrades,
      profile,
      tradeInput: payload,
      tradeTimestamp,
      outcome,
    });

    const now = new Date();
    const trade = {
      id: createId(),
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
      createdAt: now,
      updatedAt: now,
    };
    await trades.insertOne(trade);

    res.json({ message: "Trade saved successfully.", trade });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save trade." });
  }
});

export default router;
