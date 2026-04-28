import crypto from "crypto";
import { addHours, addDays } from "date-fns";

import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: addHours(new Date(), 2)
    }
  });

  return rawToken;
}

export async function consumePasswordResetToken(token: string) {
  const hashedToken = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: {
      token: hashedToken
    },
    include: {
      user: true
    }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: {
      id: record.id
    },
    data: {
      usedAt: new Date()
    }
  });

  return record.user;
}

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = email.toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: normalizedEmail
    }
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: hashedToken,
      expires: addDays(new Date(), 1)
    }
  });

  return rawToken;
}

export async function consumeEmailVerificationToken(email: string, token: string) {
  const normalizedEmail = email.toLowerCase();
  const hashedToken = hashToken(token);

  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: normalizedEmail,
        token: hashedToken
      }
    }
  });

  if (!record || record.expires < new Date()) {
    return false;
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: normalizedEmail,
        token: hashedToken
      }
    }
  });

  return true;
}
