import { Router } from "express";
import { db, createId, sanitizeDoc } from "../lib/db";
import { reflectionSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";

const router: Router = Router();

router.post("/", requireUser(), async (req, res) => {
  try {
    const { dailyReflections } = await db.getCollections();
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = reflectionSchema.parse(req.body);
    const reflectionDate = new Date(`${payload.reflectionDate}T00:00:00`);

    const existing = sanitizeDoc(await dailyReflections.findOne({ userId: user.id, reflectionDate }));

    let reflection;
    if (existing) {
      await dailyReflections.updateOne(
        { id: existing.id },
        {
          $set: {
            wins: payload.wins,
            challenges: payload.challenges,
            disciplineScore: payload.disciplineScore,
            psychologyScore: payload.psychologyScore,
            performanceScore: payload.performanceScore,
            gratitude: payload.gratitude ?? null,
            tomorrowFocus: payload.tomorrowFocus ?? null,
            journalCompleted: true,
            updatedAt: new Date(),
          },
        },
      );
      reflection = sanitizeDoc(await dailyReflections.findOne({ id: existing.id }));
    } else {
      const now = new Date();
      reflection = {
        id: createId(),
        userId: user.id,
        reflectionDate,
        wins: payload.wins,
        challenges: payload.challenges,
        disciplineScore: payload.disciplineScore,
        psychologyScore: payload.psychologyScore,
        performanceScore: payload.performanceScore,
        gratitude: payload.gratitude ?? null,
        tomorrowFocus: payload.tomorrowFocus ?? null,
        journalCompleted: true,
        createdAt: now,
        updatedAt: now,
      };
      await dailyReflections.insertOne(reflection);
    }

    res.json({ message: "Reflection saved successfully.", reflection });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save reflection." });
  }
});

export default router;
