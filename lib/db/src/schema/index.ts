export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TradingProfile = {
  id: string;
  userId: string;
  fullName: string;
  tradingStyle: string;
  dailyTradeLimit: number;
  weeklyTradeLimit: number;
  monthlyProfitTarget: number;
  monthlyLossLimit: number;
  preferredStrategies: string;
  riskPerTrade: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Trade = {
  id: string;
  userId: string;
  tradeDate: Date;
  assetName: string;
  direction: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnlAmount: number;
  riskRewardRatio: number;
  strategyUsed: string;
  screenshotUrl: string | null;
  emotionalBefore: string;
  emotionalAfter: string;
  mistakeMade: string | null;
  lessonsLearned: string | null;
  tradeNotes: string | null;
  outcome: string;
  overtradingFlag: boolean;
  revengeTradingFlag: boolean;
  emotionalWarning: boolean;
  consecutiveLossFlag: boolean;
  ruleBreakCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DailyReflection = {
  id: string;
  userId: string;
  reflectionDate: Date;
  wins: string;
  challenges: string;
  disciplineScore: number;
  psychologyScore: number;
  performanceScore: number;
  gratitude: string | null;
  tomorrowFocus: string | null;
  journalCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt: Date | null;
};

export type VerificationToken = {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
  createdAt: Date;
};

export type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
};
