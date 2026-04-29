import { Router, type Request } from "express";
import { requireUser } from "../lib/auth";

const router: Router = Router();

const MAX_INLINE_BYTES = 2 * 1024 * 1024;

function parseDataUrlBody(req: Request) {
  const body = req.body as Record<string, unknown>;
  if (typeof body.fileDataUrl === "string" && body.fileDataUrl.startsWith("data:image/")) {
    return body.fileDataUrl;
  }
  return null;
}

router.post("/", requireUser(), async (req, res) => {
  try {
    const dataUrl = parseDataUrlBody(req);
    if (!dataUrl) {
      return res.status(400).json({ error: "No image provided. Send 'fileDataUrl' as a data: URL." });
    }
    const base64 = dataUrl.split(",")[1] ?? "";
    const sizeBytes = Math.floor((base64.length * 3) / 4);
    if (sizeBytes > MAX_INLINE_BYTES) {
      return res
        .status(400)
        .json({ error: "Screenshot is too large for the current storage mode. Use an image up to 2MB." });
    }
    return res.json({ url: dataUrl });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to upload screenshot." });
  }
});

export default router;
