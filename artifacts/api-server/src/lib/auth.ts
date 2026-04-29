import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { addDays } from "date-fns";
import { db, createId, sanitizeDoc } from "./db";
import type { User } from "@workspace/db/schema";

const SESSION_COOKIE = "risktiq_session";
const SESSION_TTL_DAYS = 30;

export type AppUser = Pick<User, "id" | "email" | "name" | "image" | "role">;

export async function createSession(userId: string, res: Response) {
  const token = crypto.randomBytes(48).toString("hex");
  const expires = addDays(new Date(), SESSION_TTL_DAYS);
  const { sessions } = await db.getCollections();
  await sessions.insertOne({
    id: createId(),
    sessionToken: token,
    userId,
    expires,
    createdAt: new Date(),
  });
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
    const { sessions } = await db.getCollections();
    await sessions.deleteOne({ sessionToken: token });
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function getSessionUser(req: Request): Promise<AppUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const { sessions, users } = await db.getCollections();
  const session = sanitizeDoc(await sessions.findOne({ sessionToken: token, expires: { $gt: new Date() } }));
  if (!session) return null;

  const user = sanitizeDoc(await users.findOne({ id: session.userId }));
  if (!user) return null;

  return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
}

export async function destroyAllUserSessions(userId: string) {
  const { sessions } = await db.getCollections();
  await sessions.deleteMany({ userId });
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
