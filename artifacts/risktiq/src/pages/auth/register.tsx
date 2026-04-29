import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/components/auth/auth-provider";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [loading, user, navigate]);

  return (
    <AuthShell
      title="Create your private trading journal account."
      description="Start a premium workspace for logging execution, tracking strategy performance, and building disciplined trading habits."
    >
      <RegisterForm />
    </AuthShell>
  );
}
