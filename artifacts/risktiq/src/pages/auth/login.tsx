import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [loading, user, navigate]);

  return (
    <AuthShell
      title="Secure access to your trading intelligence."
      description="Log in to your personal journal workspace to review trades, track discipline, and export professional reports."
    >
      <LoginForm />
    </AuthShell>
  );
}
