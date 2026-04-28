import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getCurrentSession();
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your private trading journal account."
      description="Start a premium workspace for logging execution, tracking strategy performance, and building disciplined trading habits."
    >
      <RegisterForm googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
