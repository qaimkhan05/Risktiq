import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { consumePasswordResetToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = resetPasswordSchema.parse(await request.json());
    const user = await consumePasswordResetToken(payload.token);

    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        passwordHash: await hashPassword(payload.password),
        sessions: {
          deleteMany: {}
        }
      }
    });

    return NextResponse.json({
      message: "Your password has been updated successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 400 }
    );
  }
}
