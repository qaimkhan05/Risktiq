import crypto from "node:crypto";
import { MongoClient, type Collection, type Db, type WithId } from "mongodb";
import type {
  DailyReflection,
  Goal,
  PasswordResetToken,
  Session,
  Trade,
  TradingProfile,
  User,
  VerificationToken,
} from "./schema";

export const databaseProvider = "mongodb";
export const databaseEngine = "mongodb";

function extractDatabaseNameFromUri(uri: string) {
  try {
    const pathname = new URL(uri).pathname.replace(/^\/+/, "");
    const [name] = pathname.split("/");
    return name ? decodeURIComponent(name) : null;
  } catch {
    return null;
  }
}

function buildConnectionConfig() {
  const rawDatabaseUrl = process.env.DATABASE_URL;
  const databaseUrl =
    rawDatabaseUrl && /^mongodb(\+srv)?:\/\//.test(rawDatabaseUrl) ? rawDatabaseUrl : undefined;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || databaseUrl;

  if (!uri) {
    throw new Error(
      "Set MONGODB_URI or MONGO_URL. DATABASE_URL is also supported when it contains a MongoDB connection string.",
    );
  }

  const dbName =
    process.env.MONGODB_DB_NAME || process.env.MONGO_DB_NAME || extractDatabaseNameFromUri(uri) || "risktiq";

  return { uri, dbName };
}

const { uri, dbName } = buildConnectionConfig();
const client = new MongoClient(uri);

const collectionNames = {
  users: "users",
  tradingProfiles: "trading_profiles",
  trades: "trades",
  goals: "goals",
  dailyReflections: "daily_reflections",
  passwordResetTokens: "password_reset_tokens",
  verificationTokens: "verification_tokens",
  sessions: "sessions",
} as const;

export type DatabaseCollections = {
  users: Collection<User>;
  tradingProfiles: Collection<TradingProfile>;
  trades: Collection<Trade>;
  goals: Collection<Goal>;
  dailyReflections: Collection<DailyReflection>;
  passwordResetTokens: Collection<PasswordResetToken>;
  verificationTokens: Collection<VerificationToken>;
  sessions: Collection<Session>;
};

function buildCollections(database: Db): DatabaseCollections {
  return {
    users: database.collection<User>(collectionNames.users),
    tradingProfiles: database.collection<TradingProfile>(collectionNames.tradingProfiles),
    trades: database.collection<Trade>(collectionNames.trades),
    goals: database.collection<Goal>(collectionNames.goals),
    dailyReflections: database.collection<DailyReflection>(collectionNames.dailyReflections),
    passwordResetTokens: database.collection<PasswordResetToken>(collectionNames.passwordResetTokens),
    verificationTokens: database.collection<VerificationToken>(collectionNames.verificationTokens),
    sessions: database.collection<Session>(collectionNames.sessions),
  };
}

async function ensureIndexes(collections: DatabaseCollections) {
  await Promise.all([
    collections.users.createIndex({ email: 1 }, { unique: true }),
    collections.tradingProfiles.createIndex({ userId: 1 }, { unique: true }),
    collections.trades.createIndex({ userId: 1, tradeDate: -1 }),
    collections.trades.createIndex({ userId: 1, strategyUsed: 1 }),
    collections.goals.createIndex({ userId: 1, status: 1 }),
    collections.dailyReflections.createIndex({ userId: 1, reflectionDate: 1 }, { unique: true }),
    collections.passwordResetTokens.createIndex({ token: 1 }, { unique: true }),
    collections.passwordResetTokens.createIndex({ userId: 1, expiresAt: 1 }),
    collections.passwordResetTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    collections.verificationTokens.createIndex({ identifier: 1 }, { unique: true }),
    collections.verificationTokens.createIndex({ token: 1 }, { unique: true }),
    collections.verificationTokens.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    collections.sessions.createIndex({ sessionToken: 1 }, { unique: true }),
    collections.sessions.createIndex({ userId: 1, expires: 1 }),
    collections.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

let databasePromise: Promise<Db> | null = null;

async function connectDatabase() {
  if (!databasePromise) {
    databasePromise = client
      .connect()
      .then(async () => {
        const database = client.db(dbName);
        await ensureIndexes(buildCollections(database));
        return database;
      })
      .catch((error) => {
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}

export async function getDatabase() {
  return connectDatabase();
}

export async function getCollections() {
  return buildCollections(await connectDatabase());
}

export async function pingDatabase() {
  const database = await connectDatabase();
  await database.command({ ping: 1 });
}

export function createId() {
  return crypto.randomUUID();
}

export function sanitizeDoc<T>(doc: WithId<T> | T | null | undefined): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc as T & { _id?: unknown };
  return rest as T;
}

export function sanitizeDocs<T>(docs: Array<WithId<T> | T>): T[] {
  return docs
    .map((doc) => sanitizeDoc(doc))
    .filter((doc): doc is T => doc !== null);
}

export const db = {
  getCollections,
  getDatabase,
  ping: pingDatabase,
};

export const pool = null;

export * from "./schema";
