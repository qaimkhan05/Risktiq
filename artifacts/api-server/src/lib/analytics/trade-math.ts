import { differenceInMinutes, endOfWeek, isSameDay, startOfWeek } from "date-fns";
import type { Trade, TradingProfile } from "@workspace/db/schema";

const negativeEmotions = new Set(["fearful", "anxious", "fomo", "angry", "revenge"]);

export const TRADE_OUTCOME = { WIN: "WIN", LOSS: "LOSS", BREAKEVEN: "BREAKEVEN" } as const;
export type TradeOutcomeValue = (typeof TRADE_OUTCOME)[keyof typeof TRADE_OUTCOME];

export type TradeInput = {
  tradeDate: string;
  tradeTime: string;
  direction: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  emotionalBefore: string;
  emotionalAfter: string;
};

export function combineTradeDateTime(tradeDate: string, tradeTime: string) {
  return new Date(`${tradeDate}T${tradeTime}:00`);
}

export function calculatePnl(input: Pick<TradeInput, "direction" | "quantity" | "entryPrice" | "exitPrice">) {
  const directionMultiplier = input.direction === "BUY" ? 1 : -1;
  return Number(((input.exitPrice - input.entryPrice) * input.quantity * directionMultiplier).toFixed(2));
}

export function calculateRiskRewardRatio(input: Pick<TradeInput, "direction" | "entryPrice" | "stopLoss" | "takeProfit">) {
  const risk = input.direction === "BUY" ? input.entryPrice - input.stopLoss : input.stopLoss - input.entryPrice;
  const reward = input.direction === "BUY" ? input.takeProfit - input.entryPrice : input.entryPrice - input.takeProfit;
  if (risk <= 0) return 0;
  return Number((Math.abs(reward) / Math.abs(risk)).toFixed(2));
}

export function determineTradeOutcome(pnlAmount: number): TradeOutcomeValue {
  if (pnlAmount > 0) return TRADE_OUTCOME.WIN;
  if (pnlAmount < 0) return TRADE_OUTCOME.LOSS;
  return TRADE_OUTCOME.BREAKEVEN;
}

export function detectTradeFlags({
  existingTrades,
  profile,
  tradeInput,
  tradeTimestamp,
  outcome,
}: {
  existingTrades: Trade[];
  profile: TradingProfile | null;
  tradeInput: TradeInput;
  tradeTimestamp: Date;
  outcome: TradeOutcomeValue;
}) {
  const dailyTradeCount = existingTrades.filter((trade) => isSameDay(trade.tradeDate, tradeTimestamp)).length;
  const weekStart = startOfWeek(tradeTimestamp, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(tradeTimestamp, { weekStartsOn: 1 });
  const weeklyTradeCount = existingTrades.filter(
    (trade) => trade.tradeDate >= weekStart && trade.tradeDate <= weekEnd,
  ).length;

  const overtradingFlag = Boolean(
    profile && (dailyTradeCount + 1 > profile.dailyTradeLimit || weeklyTradeCount + 1 > profile.weeklyTradeLimit),
  );

  const emotionalWarning =
    negativeEmotions.has(tradeInput.emotionalBefore.toLowerCase()) ||
    negativeEmotions.has(tradeInput.emotionalAfter.toLowerCase());

  const sortedTrades = [...existingTrades].sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime());
  const previousTrade = sortedTrades[sortedTrades.length - 1];

  const revengeTradingFlag = Boolean(
    previousTrade &&
      previousTrade.outcome === TRADE_OUTCOME.LOSS &&
      differenceInMinutes(tradeTimestamp, previousTrade.tradeDate) <= 90 &&
      negativeEmotions.has(tradeInput.emotionalBefore.toLowerCase()),
  );

  const trailingLosses = [...sortedTrades]
    .reverse()
    .slice(0, 2)
    .every((trade) => trade.outcome === TRADE_OUTCOME.LOSS);

  const consecutiveLossFlag = outcome === TRADE_OUTCOME.LOSS && trailingLosses;

  const ruleBreakCount = [overtradingFlag, revengeTradingFlag, emotionalWarning, consecutiveLossFlag].filter(Boolean)
    .length;

  return { overtradingFlag, revengeTradingFlag, emotionalWarning, consecutiveLossFlag, ruleBreakCount };
}
