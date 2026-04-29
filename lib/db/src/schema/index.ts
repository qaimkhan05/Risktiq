import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

function cuid() {
  return sql`gen_random_uuid()::text`;
}

export const users = pgTable("users", {
  id: text("id").primaryKey().default(cuid()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const tradingProfiles = pgTable("trading_profiles", {
  id: text("id").primaryKey().default(cuid()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  tradingStyle: text("trading_style").notNull(),
  dailyTradeLimit: integer("daily_trade_limit").notNull(),
  weeklyTradeLimit: integer("weekly_trade_limit").notNull(),
  monthlyProfitTarget: doublePrecision("monthly_profit_target").notNull(),
  monthlyLossLimit: doublePrecision("monthly_loss_limit").notNull(),
  preferredStrategies: text("preferred_strategies").notNull().default("[]"),
  riskPerTrade: doublePrecision("risk_per_trade").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const trades = pgTable(
  "trades",
  {
    id: text("id").primaryKey().default(cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tradeDate: timestamp("trade_date", { mode: "date" }).notNull(),
    assetName: text("asset_name").notNull(),
    direction: text("direction").notNull(),
    quantity: doublePrecision("quantity").notNull(),
    entryPrice: doublePrecision("entry_price").notNull(),
    exitPrice: doublePrecision("exit_price").notNull(),
    stopLoss: doublePrecision("stop_loss").notNull(),
    takeProfit: doublePrecision("take_profit").notNull(),
    pnlAmount: doublePrecision("pnl_amount").notNull(),
    riskRewardRatio: doublePrecision("risk_reward_ratio").notNull(),
    strategyUsed: text("strategy_used").notNull(),
    screenshotUrl: text("screenshot_url"),
    emotionalBefore: text("emotional_before").notNull(),
    emotionalAfter: text("emotional_after").notNull(),
    mistakeMade: text("mistake_made"),
    lessonsLearned: text("lessons_learned"),
    tradeNotes: text("trade_notes"),
    outcome: text("outcome").notNull(),
    overtradingFlag: boolean("overtrading_flag").notNull().default(false),
    revengeTradingFlag: boolean("revenge_trading_flag").notNull().default(false),
    emotionalWarning: boolean("emotional_warning").notNull().default(false),
    consecutiveLossFlag: boolean("consecutive_loss_flag").notNull().default(false),
    ruleBreakCount: integer("rule_break_count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userTradeDateIdx: index("trades_user_id_trade_date_idx").on(table.userId, table.tradeDate),
    userStrategyIdx: index("trades_user_id_strategy_idx").on(table.userId, table.strategyUsed),
  }),
);

export const goals = pgTable(
  "goals",
  {
    id: text("id").primaryKey().default(cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetValue: doublePrecision("target_value").notNull(),
    currentValue: doublePrecision("current_value").notNull().default(0),
    status: text("status").notNull().default("ACTIVE"),
    dueDate: timestamp("due_date", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userStatusIdx: index("goals_user_id_status_idx").on(table.userId, table.status),
  }),
);

export const dailyReflections = pgTable(
  "daily_reflections",
  {
    id: text("id").primaryKey().default(cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reflectionDate: timestamp("reflection_date", { mode: "date" }).notNull(),
    wins: text("wins").notNull(),
    challenges: text("challenges").notNull(),
    disciplineScore: integer("discipline_score").notNull(),
    psychologyScore: integer("psychology_score").notNull(),
    performanceScore: integer("performance_score").notNull(),
    gratitude: text("gratitude"),
    tomorrowFocus: text("tomorrow_focus"),
    journalCompleted: boolean("journal_completed").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userDateUnique: uniqueIndex("daily_reflections_user_date_unique").on(table.userId, table.reflectionDate),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey().default(cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    usedAt: timestamp("used_at", { mode: "date" }),
  },
  (table) => ({
    userExpiresIdx: index("password_reset_tokens_user_expires_idx").on(table.userId, table.expiresAt),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    identifierTokenUnique: uniqueIndex("verification_tokens_identifier_token_unique").on(
      table.identifier,
      table.token,
    ),
  }),
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().default(cuid()),
  sessionToken: varchar("session_token", { length: 128 }).notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type TradingProfile = typeof tradingProfiles.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type DailyReflection = typeof dailyReflections.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Session = typeof sessions.$inferSelect;
