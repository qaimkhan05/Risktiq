import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import tradesRouter from "./trades";
import goalsRouter from "./goals";
import reflectionsRouter from "./reflections";
import contactRouter from "./contact";
import reportsRouter from "./reports";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: Router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/trades", tradesRouter);
router.use("/goals", goalsRouter);
router.use("/reflections", reflectionsRouter);
router.use("/contact", contactRouter);
router.use("/reports", reportsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/upload", uploadRouter);

export default router;
