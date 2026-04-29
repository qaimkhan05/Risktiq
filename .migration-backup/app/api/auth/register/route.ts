import { NextResponse } from "next/server";

import { createEmailVerificationToken } from "@/lib/auth/tokens";
import { isEmailTransportConfigured, sendEmailVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/site";
import { registerSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await createEmailVerificationToken(email);
        const verificationUrl = `${getBaseUrl(request)}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
        await sendEmailVerificationEmail(email, verificationUrl);

        return NextResponse.json(
          {
            error: "This email is already registered but not verified yet.",
            previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.fullName,
        email,
        passwordHash
      }
    });
    const verificationToken = await createEmailVerificationToken(email);
    const verificationUrl = `${getBaseUrl(request)}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    await sendEmailVerificationEmail(email, verificationUrl);

    return NextResponse.json({
      message: "Account created. Verify your email before logging in.",
      userId: user.id,
      verificationRequired: true,
      previewVerificationUrl: isEmailTransportConfigured() ? null : verificationUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 }
    );
  }
}
