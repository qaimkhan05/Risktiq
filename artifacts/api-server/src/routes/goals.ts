import { Router } from "express";
import { db, createId, sanitizeDoc, sanitizeDocs } from "../lib/db";
import { goalSchema } from "../lib/validation";
import { requireUser, type AppUser } from "../lib/auth";

const router: Router = Router();

router.get("/", requireUser(), async (req, res) => {
  const user = (req as typeof req & { user: AppUser }).user;
  const { goals } = await db.getCollections();
  const list = sanitizeDocs(await goals.find({ userId: user.id }).sort({ createdAt: -1 }).toArray());
  res.json({ goals: list });
});

router.post("/", requireUser(), async (req, res) => {
  try {
    const { goals } = await db.getCollections();
    const user = (req as typeof req & { user: AppUser }).user;
    const body = req.body as Record<string, unknown>;
    const payload = goalSchema.parse(body);
    const goalId = typeof body.id === "string" ? body.id : undefined;

    if (goalId) {
      const existing = sanitizeDoc(await goals.findOne({ id: goalId, userId: user.id }));
      if (!existing) {
        return res.status(404).json({ error: "Goal not found." });
      }
      await goals.updateOne(
        { id: goalId },
        {
          $set: {
            title: payload.title,
            description: payload.description ?? null,
            targetValue: payload.targetValue,
            currentValue: payload.currentValue,
            status: payload.status,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
            updatedAt: new Date(),
          },
        },
      );
      const goal = sanitizeDoc(await goals.findOne({ id: goalId }));
      return res.json({ message: "Goal saved successfully.", goal });
    }

    const now = new Date();
    const goal = {
      id: createId(),
      userId: user.id,
      title: payload.title,
      description: payload.description ?? null,
      targetValue: payload.targetValue,
      currentValue: payload.currentValue,
      status: payload.status,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      createdAt: now,
      updatedAt: now,
    };
    await goals.insertOne(goal);
    res.json({ message: "Goal saved successfully.", goal });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to save goal." });
  }
});

export default router;
