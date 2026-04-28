import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams?: {
    token?: string;
  };
}) {
  return (
    <AuthShell
      title="Set a new password securely."
      description="Use your secure reset token to update your password and invalidate existing active sessions."
    >
      <ResetPasswordForm token={searchParams?.token} />
    </AuthShell>
  );
}
