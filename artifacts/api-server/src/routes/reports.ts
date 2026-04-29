import { Router } from "express";
import { requireUser, type AppUser } from "../lib/auth";
import { buildWeeklyReportExport, buildMonthlyReportExport } from "../lib/reports";

const router: Router = Router();

function sendReport(
  res: import("express").Response,
  formatType: string | undefined,
  report: { pdf: Buffer; word: Buffer; excel: Buffer },
  baseFilename: string,
) {
  if (formatType === "excel") {
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${baseFilename}.xlsx"`);
    res.setHeader("Cache-Control", "no-store");
    return res.send(report.excel);
  }
  if (formatType === "word") {
    res.setHeader("Content-Type", "application/msword; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${baseFilename}.doc"`);
    res.setHeader("Cache-Control", "no-store");
    return res.send(report.word);
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${baseFilename}.pdf"`);
  res.setHeader("Cache-Control", "no-store");
  return res.send(report.pdf);
}

router.get("/weekly", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const formatType = typeof req.query.format === "string" ? req.query.format : undefined;
    const report = await buildWeeklyReportExport(user.id);
    return sendReport(res, formatType, report, "weekly-report");
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unable to export weekly report." });
  }
});

router.get("/monthly", requireUser(), async (req, res) => {
  try {
    const user = (req as typeof req & { user: AppUser }).user;
    const formatType = typeof req.query.format === "string" ? req.query.format : undefined;
    const report = await buildMonthlyReportExport(user.id);
    return sendReport(res, formatType, report, "monthly-report");
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unable to export monthly report." });
  }
});

export default router;
