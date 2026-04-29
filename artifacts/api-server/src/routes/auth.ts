import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "@workspace/db/schema";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../lib/validation";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  createSession,
  destroySession,
  getSessionUser,
  destroyAllUserSessions,
} from "../lib/auth";
import { syncPermanentAdminUser } from "../lib/permanent-admin";
import {
  createPasswordResetToken,
  consumePasswordResetToken,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
} from "../lib/tokens";
import {
  isEmailTransportConfigured,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "../lib/email";
import { getBaseUrl } from "../lib/site";

const router: Router = Router();

router.post("/register", async (req, res) => {
  try {
    await syncPermanentAdminUser().catch(() => {});
    const payload = registerSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    const baseUrl = getBaseUrl(req);

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await createEmailVerificationToken(email);
        const verificationUrl = `${baseUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
        await sendEmailVerificationEmail(email, verificationUrl);
        return res.status(409).json({
          error: "This email is already registered but not verified yet.",
          previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl,
        });
      }
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(payload.password);
    const [user] = await db
      .insert(users)
      .values({ name: payload.fullName, email, passwordHash })
      .returning();

    const verificationToken = await createEmailVerificationToken(email);
    const verificationUrl = `${baseUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    await sendEmailVerificationEmail(email, verificationUrl);

    return res.json({
      message: "Account created. Verify your email before logging in.",
      userId: user.id,
      verificationRequired: true,
      previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to create account.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    await syncPermanentAdminUser().catch(() => {});
    const payload = loginSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user?.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (!user.emailVerified) {
      return res.status(401).json({ error: "EMAIL_NOT_VERIFIED" });
    }
    const matches = await verifyPassword(payload.password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    await createSession(user.id, res);
    return res.json({
      message: "Logged in.",
      user: { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role },
    });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to log in." });
  }
});

router.post("/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ message: "Logged out." });
});

router.get("/me", async (req, res) => {
  const user = await getSessionUser(req);
  res.json({ user });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    let previewResetUrl: string | null = null;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user) {
      const token = await createPasswordResetToken(user.id);
      const resetLink = `${getBaseUrl(req)}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetLink);
      previewResetUrl = isEmailTransportConfigured() ? null : resetLink;
    }
    res.json({
      message: "If an account exists for this email, a password reset link has been sent.",
      previewResetUrl,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to process request." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const payload = resetPasswordSchema.parse(req.body);
    const user = await consumePasswordResetToken(payload.token);
    if (!user) {
      return res.status(400).json({ error: "This reset link is invalid or expired." });
    }
    const passwordHash = await hashPassword(payload.password);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    await destroyAllUserSessions(user.id);
    return res.json({ message: "Your password has been updated successfully." });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to reset password." });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const payload = forgotPasswordSchema.parse(req.body);
    const email = payload.email.toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return res.json({
        message: "If this account exists and is unverified, a new verification link has been generated.",
      });
    }
    if (user.emailVerified) {
      return res.json({ message: "This account is already verified." });
    }
    const verificationToken = await createEmailVerificationToken(email);
    const verificationUrl = `${getBaseUrl(req)}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    await sendEmailVerificationEmail(email, verificationUrl);
    return res.json({
      message: "A new verification link has been sent.",
      previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to resend verification email.",
    });
  }
});

router.get("/verify-email", async (req, res) => {
  const email = typeof req.query.email === "string" ? req.query.email : null;
  const token = typeof req.query.token === "string" ? req.query.token : null;
  const baseUrl = getBaseUrl(req);
  const loginRedirect = (status: string) => res.redirect(`${baseUrl}/login?verified=${status}`);

  if (!email || !token) return loginRedirect("invalid");
  const valid = await consumeEmailVerificationToken(email, token);
  if (!valid) return loginRedirect("invalid");
  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email.toLowerCase()));
  return loginRedirect("success");
});

export default router;
