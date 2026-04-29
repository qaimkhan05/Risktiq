import { Router } from "express";
import { requireUser, type AppUser } from "../lib/auth";
import { getUserWorkspace } from "../lib/dashboard-data";

const router: Router = Router();

router.get("/", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const workspace = await getUserWorkspace(user.id);
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load dashboard." });
  }
});

export default router;
