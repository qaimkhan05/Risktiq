import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || undefined;

  return (
    <AuthShell
      title="Set a new password securely."
      description="Use your secure reset token to update your password and invalidate existing active sessions."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
