import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";

export function RegisterForm() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewVerificationUrl, setPreviewVerificationUrl] = useState("");

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Create your workspace</h2>
        <p className="text-sm text-muted-foreground">
          Open a private trading journal account with secure analytics and disciplined review workflows.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setSuccess("");
          setPreviewVerificationUrl("");

          if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
          }

          setLoading(true);

          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              fullName: form.fullName,
              email: form.email,
              password: form.password,
            }),
          });

          const result = (await response.json()) as {
            error?: string;
            message?: string;
            previewVerificationUrl?: string | null;
          };

          if (!response.ok) {
            setError(result.error || "Unable to create account.");
            setPreviewVerificationUrl(result.previewVerificationUrl || "");
            setLoading(false);
            return;
          }

          setLoading(false);
          setSuccess(result.message || "Account created successfully.");
          setPreviewVerificationUrl(result.previewVerificationUrl || "");
          setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
        }}
      >
        <Field label="Full name">
          <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Enter your full name" required />
        </Field>
        <Field label="Email address">
          <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password" hint="Minimum 8 characters, including a number and uppercase letter.">
          <Input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder="Create a strong password" required />
        </Field>
        <Field label="Confirm password">
          <Input type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder="Repeat password" required />
        </Field>
        {success ? <p className="text-sm text-success">{success}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
        {previewVerificationUrl ? (
          <a
            href={previewVerificationUrl}
            className="block rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary transition hover:opacity-90"
          >
            Verify this account now
          </a>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">Sign in</Link>
      </p>
      {success ? (
        <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/login")}>
          Go to login
        </Button>
      ) : null}
    </div>
  );
}
