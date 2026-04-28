import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/api-user";
import { prisma } from "@/lib/prisma";
import { reflectionSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = reflectionSchema.parse(await request.json());
    const reflectionDate = new Date(`${payload.reflectionDate}T00:00:00`);

    const reflection = await prisma.dailyReflection.upsert({
      where: {
        userId_reflectionDate: {
          userId: user.id,
          reflectionDate
        }
      },
      update: {
        wins: payload.wins,
        challenges: payload.challenges,
        disciplineScore: payload.disciplineScore,
        psychologyScore: payload.psychologyScore,
        performanceScore: payload.performanceScore,
        gratitude: payload.gratitude,
        tomorrowFocus: payload.tomorrowFocus,
        journalCompleted: true
      },
      create: {
        userId: user.id,
        reflectionDate,
        wins: payload.wins,
        challenges: payload.challenges,
        disciplineScore: payload.disciplineScore,
        psychologyScore: payload.psychologyScore,
        performanceScore: payload.performanceScore,
        gratitude: payload.gratitude,
        tomorrowFocus: payload.tomorrowFocus,
        journalCompleted: true
      }
    });

    return NextResponse.json({
      message: "Reflection saved successfully.",
      reflection
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save reflection." },
      { status: 400 }
    );
  }
}
