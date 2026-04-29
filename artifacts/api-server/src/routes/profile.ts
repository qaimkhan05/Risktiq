import { Router } from "express";
import { db, createId, sanitizeDoc } from "../lib/db";
import { profileSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";
import { normalizeTradingProfile, serializePreferredStrategies } from "../lib/profile";

const router: Router = Router();

router.post("/", requireUser(), async (req, res) => {
  try {
    const { tradingProfiles, users } = await db.getCollections();
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = profileSchema.parse(req.body);
    const serialized = serializePreferredStrategies(payload.preferredStrategies);

    const existing = sanitizeDoc(await tradingProfiles.findOne({ userId: user.id }));

    let profile;
    if (existing) {
      await tradingProfiles.updateOne(
        { id: existing.id },
        {
          $set: {
            fullName: payload.fullName,
            tradingStyle: payload.tradingStyle,
            dailyTradeLimit: payload.dailyTradeLimit,
            weeklyTradeLimit: payload.weeklyTradeLimit,
            monthlyProfitTarget: payload.monthlyProfitTarget,
            monthlyLossLimit: payload.monthlyLossLimit,
            preferredStrategies: serialized,
            riskPerTrade: payload.riskPerTrade,
            updatedAt: new Date(),
          },
        },
      );
      profile = sanitizeDoc(await tradingProfiles.findOne({ id: existing.id }));
    } else {
      const now = new Date();
      profile = {
        id: createId(),
        userId: user.id,
        fullName: payload.fullName,
        tradingStyle: payload.tradingStyle,
        dailyTradeLimit: payload.dailyTradeLimit,
        weeklyTradeLimit: payload.weeklyTradeLimit,
        monthlyProfitTarget: payload.monthlyProfitTarget,
        monthlyLossLimit: payload.monthlyLossLimit,
        preferredStrategies: serialized,
        riskPerTrade: payload.riskPerTrade,
        createdAt: now,
        updatedAt: now,
      };
      await tradingProfiles.insertOne(profile);
    }

    await users.updateOne({ id: user.id }, { $set: { name: payload.fullName, updatedAt: new Date() } });

    res.json({ message: "Profile saved successfully.", profile: normalizeTradingProfile(profile) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save profile." });
  }
});

export default router;
