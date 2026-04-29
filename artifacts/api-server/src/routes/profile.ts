import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { tradingProfiles, users } from "@workspace/db/schema";
import { profileSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";
import { normalizeTradingProfile, serializePreferredStrategies } from "../lib/profile";

const router: Router = Router();

router.post("/", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = profileSchema.parse(req.body);
    const serialized = serializePreferredStrategies(payload.preferredStrategies);

    const [existing] = await db
      .select()
      .from(tradingProfiles)
      .where(eq(tradingProfiles.userId, user.id))
      .limit(1);

    let profile;
    if (existing) {
      [profile] = await db
        .update(tradingProfiles)
        .set({
          fullName: payload.fullName,
          tradingStyle: payload.tradingStyle,
          dailyTradeLimit: payload.dailyTradeLimit,
          weeklyTradeLimit: payload.weeklyTradeLimit,
          monthlyProfitTarget: payload.monthlyProfitTarget,
          monthlyLossLimit: payload.monthlyLossLimit,
          preferredStrategies: serialized,
          riskPerTrade: payload.riskPerTrade,
          updatedAt: new Date(),
        })
        .where(eq(tradingProfiles.id, existing.id))
        .returning();
    } else {
      [profile] = await db
        .insert(tradingProfiles)
        .values({
          userId: user.id,
          fullName: payload.fullName,
          tradingStyle: payload.tradingStyle,
          dailyTradeLimit: payload.dailyTradeLimit,
          weeklyTradeLimit: payload.weeklyTradeLimit,
          monthlyProfitTarget: payload.monthlyProfitTarget,
          monthlyLossLimit: payload.monthlyLossLimit,
          preferredStrategies: serialized,
          riskPerTrade: payload.riskPerTrade,
        })
        .returning();
    }

    await db.update(users).set({ name: payload.fullName, updatedAt: new Date() }).where(eq(users.id, user.id));

    res.json({ message: "Profile saved successfully.", profile: normalizeTradingProfile(profile) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save profile." });
  }
});

export default router;
