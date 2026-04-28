import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await getCurrentSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Recover access without exposing your journal."
      description="Request a secure password reset link and regain access to your personal trading data safely."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
