import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <DashboardShell
      userName={user.email}
      profileName={user.profile?.fullName || user.name}
      isAdmin={user.role === "ADMIN"}
    >
      {children}
    </DashboardShell>
  );
}
