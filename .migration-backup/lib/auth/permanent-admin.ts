import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { canUseDatabaseAtRuntime } from "@/lib/runtime";

const FALLBACK_ADMIN_EMAIL = "qaim22@gmail.com";
const FALLBACK_ADMIN_PASSWORD = "qaqaqa12";
const FALLBACK_ADMIN_NAME = "Qaim Admin";

function getPermanentAdminConfig() {
  const email = (process.env.PERMANENT_ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL).toLowerCase();
  const password = process.env.PERMANENT_ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;
  const name = process.env.PERMANENT_ADMIN_NAME || FALLBACK_ADMIN_NAME;

  return {
    email,
    password,
    name
  };
}

let permanentAdminSyncPromise: Promise<void> | null = null;

async function upsertPermanentAdminUser() {
  const { email, password, name } = getPermanentAdminConfig();
  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: {
      email
    },
    update: {
      name,
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash
    },
    create: {
      name,
      email,
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash
    }
  });
}

export async function syncPermanentAdminUser() {
  if (!canUseDatabaseAtRuntime()) {
    return;
  }

  if (!permanentAdminSyncPromise) {
    permanentAdminSyncPromise = upsertPermanentAdminUser().catch((error) => {
      permanentAdminSyncPromise = null;
      throw error;
    });
  }

  await permanentAdminSyncPromise;
}

export function isPermanentAdminEmail(email: string) {
  return email.toLowerCase() === getPermanentAdminConfig().email;
}
