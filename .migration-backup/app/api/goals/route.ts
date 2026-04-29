import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/api-user";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = goalSchema.parse(body);
    const goalId = typeof body.id === "string" ? body.id : undefined;

    if (goalId) {
      const existingGoal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId: user.id
        }
      });

      if (!existingGoal) {
        return NextResponse.json({ error: "Goal not found." }, { status: 404 });
      }
    }

    const goal = goalId
      ? await prisma.goal.update({
          where: {
            id: goalId
          },
          data: {
            title: payload.title,
            description: payload.description,
            targetValue: payload.targetValue,
            currentValue: payload.currentValue,
            status: payload.status,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null
          }
        })
      : await prisma.goal.create({
          data: {
            userId: user.id,
            title: payload.title,
            description: payload.description,
            targetValue: payload.targetValue,
            currentValue: payload.currentValue,
            status: payload.status,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null
          }
        });

    return NextResponse.json({
      message: "Goal saved successfully.",
      goal
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save goal." },
      { status: 400 }
    );
  }
}
