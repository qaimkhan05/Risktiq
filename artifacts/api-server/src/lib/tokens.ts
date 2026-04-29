import crypto from "node:crypto";
import { addHours, addDays } from "date-fns";
import { db, createId, sanitizeDoc } from "./db";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const { passwordResetTokens } = await db.getCollections();
  await passwordResetTokens.insertOne({
    id: createId(),
    userId,
    token: hashedToken,
    expiresAt: addHours(new Date(), 2),
    createdAt: new Date(),
    usedAt: null,
  });
  return rawToken;
}

export async function consumePasswordResetToken(token: string) {
  const hashedToken = hashToken(token);
  const { passwordResetTokens, users } = await db.getCollections();
  const record = sanitizeDoc(await passwordResetTokens.findOne({ token: hashedToken }));
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await passwordResetTokens.updateOne({ id: record.id }, { $set: { usedAt: new Date() } });
  return sanitizeDoc(await users.findOne({ id: record.userId }));
}

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = email.toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const { verificationTokens } = await db.getCollections();
  await verificationTokens.deleteMany({ identifier: normalizedEmail });
  await verificationTokens.insertOne({
    id: createId(),
    identifier: normalizedEmail,
    token: hashedToken,
    expires: addDays(new Date(), 1),
    createdAt: new Date(),
  });
  return rawToken;
}

export async function consumeEmailVerificationToken(email: string, token: string) {
  const normalizedEmail = email.toLowerCase();
  const hashedToken = hashToken(token);
  const { verificationTokens } = await db.getCollections();
  const record = sanitizeDoc(
    await verificationTokens.findOne({ identifier: normalizedEmail, token: hashedToken }),
  );
  if (!record || record.expires < new Date()) return false;
  await verificationTokens.deleteOne({ id: record.id });
  return true;
}
