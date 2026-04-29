import { db, createId, sanitizeDoc } from "./db";
import { hashPassword } from "./password";
import { logger } from "./logger";

const FALLBACK_ADMIN_EMAIL = "qaim22@gmail.com";
const FALLBACK_ADMIN_PASSWORD = "qaqaqa12";
const FALLBACK_ADMIN_NAME = "Qaim Admin";

function getPermanentAdminConfig() {
  return {
    email: (process.env.PERMANENT_ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL).toLowerCase(),
    password: process.env.PERMANENT_ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD,
    name: process.env.PERMANENT_ADMIN_NAME || FALLBACK_ADMIN_NAME,
  };
}

let permanentAdminSyncPromise: Promise<void> | null = null;

async function upsertPermanentAdminUser() {
  const { email, password, name } = getPermanentAdminConfig();
  const passwordHash = await hashPassword(password);
  const { users } = await db.getCollections();
  const existing = sanitizeDoc(await users.findOne({ email }));
  if (existing) {
    await users.updateOne(
      { id: existing.id },
      {
        $set: {
          name,
          role: "ADMIN",
          emailVerified: new Date(),
          passwordHash,
          updatedAt: new Date(),
        },
      },
    );
  } else {
    const now = new Date();
    await users.insertOne({
      id: createId(),
      name,
      email,
      emailVerified: now,
      image: null,
      passwordHash,
      role: "ADMIN",
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function syncPermanentAdminUser() {
  if (!permanentAdminSyncPromise) {
    permanentAdminSyncPromise = upsertPermanentAdminUser().catch((error) => {
      permanentAdminSyncPromise = null;
      logger.error({ err: error }, "Failed to sync permanent admin user");
      throw error;
    });
  }
  await permanentAdminSyncPromise;
}

export function isPermanentAdminEmail(email: string) {
  return email.toLowerCase() === getPermanentAdminConfig().email;
}
