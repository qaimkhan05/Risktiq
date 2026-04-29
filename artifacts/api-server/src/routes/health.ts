import { Router } from "express";
import { db, databaseEngine, databaseProvider } from "../lib/db";

const router: Router = Router();

router.get("/", async (_req, res) => {
  try {
    await db.ping();
    res.json({
      status: "ok",
      app: "Risktiq",
      databaseProvider,
      databaseEngine,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      app: "Risktiq",
      databaseProvider,
      databaseEngine,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Database connectivity failed.",
    });
  }
});

export default router;
