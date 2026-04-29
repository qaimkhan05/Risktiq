import { NextResponse } from "next/server";

import { createEmailVerificationToken } from "@/lib/auth/tokens";
import { isEmailTransportConfigured, sendEmailVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site";
import { forgotPasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return NextResponse.json({
        message: "If this account exists and is unverified, a new verification link has been generated."
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "This account is already verified."
      });
    }

    const verificationToken = await createEmailVerificationToken(email);
    const verificationUrl = `${getBaseUrl(request)}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    await sendEmailVerificationEmail(email, verificationUrl);

    return NextResponse.json({
      message: "A new verification link has been sent.",
      previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to resend verification email." },
      { status: 400 }
    );
  }
}
