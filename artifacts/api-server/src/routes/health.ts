import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

const router: Router = Router();

router.get("/", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      status: "ok",
      app: "Risktiq",
      databaseProvider: "postgres",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      app: "Risktiq",
      databaseProvider: "postgres",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Database connectivity failed.",
    });
  }
});

export default router;
