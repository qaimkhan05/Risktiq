import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { goals } from "@workspace/db/schema";
import { goalSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";

const router: Router = Router();

router.get("/", requireUser(), async (req, res) => {
  const user = (req as typeof req & { user: AppUser }).user;
  const list = await db.select().from(goals).where(eq(goals.userId, user.id)).orderBy(desc(goals.createdAt));
  res.json({ goals: list });
});

router.post("/", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const body = req.body as Record<string, unknown>;
    const payload = goalSchema.parse(body);
    const goalId = typeof body.id === "string" ? body.id : undefined;

    if (goalId) {
      const [existing] = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
        .limit(1);
      if (!existing) {
        return res.status(404).json({ error: "Goal not found." });
      }
      const [goal] = await db
        .update(goals)
        .set({
          title: payload.title,
          description: payload.description ?? null,
          targetValue: payload.targetValue,
          currentValue: payload.currentValue,
          status: payload.status,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, goalId))
        .returning();
      return res.json({ message: "Goal saved successfully.", goal });
    }

    const [goal] = await db
      .insert(goals)
      .values({
        userId: user.id,
        title: payload.title,
        description: payload.description ?? null,
        targetValue: payload.targetValue,
        currentValue: payload.currentValue,
        status: payload.status,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      })
      .returning();
    res.json({ message: "Goal saved successfully.", goal });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save goal." });
  }
});

export default router;
