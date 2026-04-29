import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { addDays } from "date-fns";
import { eq, and, gt } from "drizzle-orm";
import { db } from "./db";
import { sessions, users, type User } from "@workspace/db/schema";

const SESSION_COOKIE = "risktiq_session";
const SESSION_TTL_DAYS = 30;

export type AppUser = Pick<User, "id" | "email" | "name" | "image" | "role">;

export async function createSession(userId: string, res: Response) {
  const token = crypto.randomBytes(48).toString("hex");
  const expires = addDays(new Date(), SESSION_TTL_DAYS);
  await db.insert(sessions).values({ sessionToken: token, userId, expires });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
  return token;
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await db.delete(sessions).where(eq(sessions.sessionToken, token));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function getSessionUser(req: Request): Promise<AppUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const [record] = await db
    .select({
      sessionId: sessions.id,
      expires: sessions.expires,
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.sessionToken, token), gt(sessions.expires, new Date())))
    .limit(1);
  if (!record) return null;
  return { id: record.id, email: record.email, name: record.name, image: record.image, role: record.role };
}

export async function destroyAllUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export function requireUser() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    (req as Request & { user: AppUser }).user = user;
    next();
  };
}

export function requireAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    (req as Request & { user: AppUser }).user = user;
    next();
  };
}
