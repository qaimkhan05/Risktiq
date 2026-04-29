import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");

    return NextResponse.json({
      status: "ok",
      app: "Risktiq",
      databaseProvider: process.env.DATABASE_PROVIDER || "sqlite",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        app: "Risktiq",
        databaseProvider: process.env.DATABASE_PROVIDER || "sqlite",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database connectivity failed."
      },
      { status: 503 }
    );
  }
}
