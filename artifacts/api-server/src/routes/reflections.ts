import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { dailyReflections } from "@workspace/db/schema";
import { reflectionSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";

const router: Router = Router();

router.post("/", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const payload = reflectionSchema.parse(req.body);
    const reflectionDate = new Date(`${payload.reflectionDate}T00:00:00`);

    const [existing] = await db
      .select()
      .from(dailyReflections)
      .where(and(eq(dailyReflections.userId, user.id), eq(dailyReflections.reflectionDate, reflectionDate)))
      .limit(1);

    let reflection;
    if (existing) {
      [reflection] = await db
        .update(dailyReflections)
        .set({
          wins: payload.wins,
          challenges: payload.challenges,
          disciplineScore: payload.disciplineScore,
          psychologyScore: payload.psychologyScore,
          performanceScore: payload.performanceScore,
          gratitude: payload.gratitude ?? null,
          tomorrowFocus: payload.tomorrowFocus ?? null,
          journalCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(dailyReflections.id, existing.id))
        .returning();
    } else {
      [reflection] = await db
        .insert(dailyReflections)
        .values({
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
        })
        .returning();
    }

    res.json({ message: "Reflection saved successfully.", reflection });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save reflection." });
  }
});

export default router;
