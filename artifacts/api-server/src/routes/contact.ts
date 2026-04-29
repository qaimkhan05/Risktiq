import { Router } from "express";
import { contactSchema } from "../lib/validation";
import { sendContactMessageEmail } from "../lib/email";

const router: Router = Router();

router.post("/", async (req, res) => {
  try {
    const payload = contactSchema.parse(req.body);
    const result = await sendContactMessageEmail(payload);
    res.json({
      message: result.delivered
        ? "Your message has been sent. The Risktiq team will get back to you shortly."
        : `Your message was captured successfully. Direct support is also available at ${result.supportEmail}.`,
      supportEmail: result.supportEmail,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to send your message right now." });
  }
});

export default router;
