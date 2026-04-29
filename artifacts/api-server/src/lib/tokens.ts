import crypto from "node:crypto";
import { addHours, addDays } from "date-fns";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { passwordResetTokens, verificationTokens, users } from "@workspace/db/schema";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  await db.insert(passwordResetTokens).values({
    userId,
    token: hashedToken,
    expiresAt: addHours(new Date(), 2),
  });
  return rawToken;
}

export async function consumePasswordResetToken(token: string) {
  const hashedToken = hashToken(token);
  const [record] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, hashedToken)).limit(1);
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
  const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
  return user ?? null;
}

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = email.toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalizedEmail));
  await db.insert(verificationTokens).values({
    identifier: normalizedEmail,
    token: hashedToken,
    expires: addDays(new Date(), 1),
  });
  return rawToken;
}

export async function consumeEmailVerificationToken(email: string, token: string) {
  const normalizedEmail = email.toLowerCase();
  const hashedToken = hashToken(token);
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, normalizedEmail), eq(verificationTokens.token, hashedToken)))
    .limit(1);
  if (!record || record.expires < new Date()) return false;
  await db
    .delete(verificationTokens)
    .where(and(eq(verificationTokens.identifier, normalizedEmail), eq(verificationTokens.token, hashedToken)));
  return true;
}
