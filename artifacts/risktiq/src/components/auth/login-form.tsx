import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";
import { useAuth } from "@/components/auth/auth-provider";

export function LoginForm() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  const params = new URLSearchParams(window.location.search); // Re-added for callbackUrl
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Access your private journal, reports, and analytics.</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });
          const result = (await response.json()) as { error?: string };
          setLoading(false);
          if (!response.ok) {
            if (result.error === "EMAIL_NOT_VERIFIED") {
              setError("Your account is not verified yet. Verify your email before logging in.");
              return;
            }
            setError(result.error || "Invalid email or password.");
            return;
          }
          await refresh();
          queryClient.invalidateQueries();
          navigate(callbackUrl);
        }}
      >
        <Field label="Email address">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-primary transition hover:opacity-80">Forgot password?</Link>
          <Link href="/register" className="text-muted-foreground transition hover:text-foreground">Create account</Link>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Secure login"}
        </Button>
      </form>
    </div>
  );
}
