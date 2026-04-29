import { Router } from "express";
import { requireAdmin } from "../lib/auth";
import { getAdminJournalWorkspace } from "../lib/admin-data";

const router: Router = Router();

router.get("/journal", requireAdmin(), async (_req, res) => {
  try {
    const data = await getAdminJournalWorkspace();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load admin journal." });
  }
});

export default router;
