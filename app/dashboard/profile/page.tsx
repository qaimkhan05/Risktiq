import { ProfileForm } from "@/components/forms/profile-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getUserWorkspace } from "@/lib/dashboard-data";

export default async function ProfilePage() {
  const user = await requireUser();
  const { profile } = await getUserWorkspace(user.id);

  return (
    <Card>
      <p className="text-sm text-muted-foreground">Profile setup</p>
      <h2 className="mt-2 text-2xl font-semibold">Trading identity and risk plan</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Configure your trading style, preferred strategies, and discipline limits so analytics, alerts, and scoring
        can adapt to your process.
      </p>
      <div className="mt-6">
        <ProfileForm
          initialValue={{
            fullName: profile?.fullName || user.name || "",
            tradingStyle: profile?.tradingStyle || "Intraday",
            dailyTradeLimit: profile?.dailyTradeLimit ?? 3,
            weeklyTradeLimit: profile?.weeklyTradeLimit ?? 15,
            monthlyProfitTarget: profile?.monthlyProfitTarget ?? 5000,
            monthlyLossLimit: profile?.monthlyLossLimit ?? 2000,
            preferredStrategies: profile?.preferredStrategies || [],
            riskPerTrade: profile?.riskPerTrade ?? 1
          }}
        />
      </div>
    </Card>
  );
}
