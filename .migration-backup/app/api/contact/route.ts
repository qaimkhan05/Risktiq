import { NextResponse } from "next/server";

import { sendContactMessageEmail } from "@/lib/email";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = contactSchema.parse(await request.json());
    const result = await sendContactMessageEmail(payload);

    return NextResponse.json({
      message: result.delivered
        ? "Your message has been sent. The Risktiq team will get back to you shortly."
        : `Your message was captured successfully. Direct support is also available at ${result.supportEmail}.`,
      supportEmail: result.supportEmail
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send your message right now." },
      { status: 400 }
    );
  }
}
