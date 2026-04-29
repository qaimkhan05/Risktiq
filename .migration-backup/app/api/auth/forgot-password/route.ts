import { NextResponse } from "next/server";

import { createPasswordResetToken } from "@/lib/auth/tokens";
import { isEmailTransportConfigured, sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site";
import { forgotPasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const email = payload.email.toLowerCase();
    let previewResetUrl: string | null = null;

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (user) {
      const token = await createPasswordResetToken(user.id);
      const resetLink = `${getBaseUrl(request)}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetLink);
      previewResetUrl = isEmailTransportConfigured() ? null : resetLink;
    }

    return NextResponse.json({
      message: "If an account exists for this email, a password reset link has been sent.",
      previewResetUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process request." },
      { status: 400 }
    );
  }
}
