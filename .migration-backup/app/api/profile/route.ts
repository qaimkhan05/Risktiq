import { NextResponse } from "next/server";

import { getApiUser } from "@/lib/auth/api-user";
import { prisma } from "@/lib/prisma";
import { normalizeTradingProfile, serializePreferredStrategies } from "@/lib/profile";
import { profileSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = profileSchema.parse(await request.json());

    const profile = await prisma.tradingProfile.upsert({
      where: {
        userId: user.id
      },
      update: {
        fullName: payload.fullName,
        tradingStyle: payload.tradingStyle,
        dailyTradeLimit: payload.dailyTradeLimit,
        weeklyTradeLimit: payload.weeklyTradeLimit,
        monthlyProfitTarget: payload.monthlyProfitTarget,
        monthlyLossLimit: payload.monthlyLossLimit,
        preferredStrategies: serializePreferredStrategies(payload.preferredStrategies),
        riskPerTrade: payload.riskPerTrade
      },
      create: {
        userId: user.id,
        fullName: payload.fullName,
        tradingStyle: payload.tradingStyle,
        dailyTradeLimit: payload.dailyTradeLimit,
        weeklyTradeLimit: payload.weeklyTradeLimit,
        monthlyProfitTarget: payload.monthlyProfitTarget,
        monthlyLossLimit: payload.monthlyLossLimit,
        preferredStrategies: serializePreferredStrategies(payload.preferredStrategies),
        riskPerTrade: payload.riskPerTrade
      }
    });

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        name: payload.fullName
      }
    });

    return NextResponse.json({
      message: "Profile saved successfully.",
      profile: normalizeTradingProfile(profile)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save profile." },
      { status: 400 }
    );
  }
}
