import { ProfileForm } from "@/components/forms/profile-form";
import { Card } from "@/components/risktiq-ui/card";
import { DashboardLayout, useWorkspace } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/components/auth/auth-provider";

function ProfileBody() {
  const { data, isLoading } = useWorkspace();
  const { user } = useAuth();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  const { profile } = data;

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
            fullName: profile?.fullName || user?.name || "",
            tradingStyle: profile?.tradingStyle || "Intraday",
            dailyTradeLimit: profile?.dailyTradeLimit ?? 3,
            weeklyTradeLimit: profile?.weeklyTradeLimit ?? 15,
            monthlyProfitTarget: profile?.monthlyProfitTarget ?? 5000,
            monthlyLossLimit: profile?.monthlyLossLimit ?? 2000,
            preferredStrategies: profile?.preferredStrategies || [],
            riskPerTrade: profile?.riskPerTrade ?? 1,
          }}
        />
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileBody />
    </DashboardLayout>
  );
}
