import { z } from "zod";

const emotionOptions = ["calm", "confident", "fearful", "anxious", "fomo", "angry", "disciplined", "revenge"];

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  fullName: z.string().min(2),
  tradingStyle: z.string().min(2),
  dailyTradeLimit: z.coerce.number().int().min(1),
  weeklyTradeLimit: z.coerce.number().int().min(1),
  monthlyProfitTarget: z.coerce.number(),
  monthlyLossLimit: z.coerce.number().positive(),
  preferredStrategies: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => {
      if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }),
  riskPerTrade: z.coerce.number().positive().max(100),
});

const screenshotUrlSchema = z.string().refine(
  (value) => {
    if (!value) return true;
    if (value.startsWith("data:image/")) return true;
    return z.string().url().safeParse(value).success;
  },
  { message: "Screenshot must be a valid URL or inline image." },
);

export const tradeSchema = z.object({
  tradeDate: z.string().min(1),
  tradeTime: z.string().min(1),
  assetName: z.string().min(1),
  direction: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive(),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().positive(),
  stopLoss: z.coerce.number().positive(),
  takeProfit: z.coerce.number().positive(),
  strategyUsed: z.string().min(1),
  screenshotUrl: screenshotUrlSchema.optional().or(z.literal("")),
  emotionalBefore: z.enum(emotionOptions as [string, ...string[]]),
  emotionalAfter: z.enum(emotionOptions as [string, ...string[]]),
  mistakeMade: z.string().optional(),
  lessonsLearned: z.string().optional(),
  tradeNotes: z.string().optional(),
});

export const reflectionSchema = z.object({
  reflectionDate: z.string().min(1),
  wins: z.string().min(5),
  challenges: z.string().min(5),
  disciplineScore: z.coerce.number().int().min(1).max(100),
  psychologyScore: z.coerce.number().int().min(1).max(100),
  performanceScore: z.coerce.number().int().min(1).max(100),
  gratitude: z.string().optional(),
  tomorrowFocus: z.string().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().min(0).default(0),
  status: z.enum(["ACTIVE", "COMPLETED", "MISSED"]).default("ACTIVE"),
  dueDate: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  subject: z.string().min(3, "Subject is required."),
  message: z.string().min(20, "Message should be at least 20 characters."),
});
