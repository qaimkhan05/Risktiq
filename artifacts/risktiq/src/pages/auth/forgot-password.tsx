import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useAuth } from "@/components/auth/auth-provider";

export default function ForgotPasswordPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [loading, user, navigate]);

  return (
    <AuthShell
      title="Recover access without exposing your journal."
      description="Request a secure password reset link and regain access to your personal trading data safely."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
