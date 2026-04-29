import { NextResponse } from "next/server";

import { consumeEmailVerificationToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");
  const loginUrl = new URL("/login", request.url);

  if (!email || !token) {
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const isValid = await consumeEmailVerificationToken(email, token);

  if (!isValid) {
    loginUrl.searchParams.set("verified", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  await prisma.user.updateMany({
    where: {
      email: email.toLowerCase()
    },
    data: {
      emailVerified: new Date()
    }
  });

  loginUrl.searchParams.set("verified", "success");
  return NextResponse.redirect(loginUrl);
}
