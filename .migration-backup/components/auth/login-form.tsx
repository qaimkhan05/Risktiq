"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { GoogleSigninButton } from "@/components/auth/google-signin-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const verifiedState = searchParams.get("verified");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    verifiedState === "success"
      ? "Email verified successfully. You can log in now."
      : verifiedState === "invalid"
        ? "Verification link is invalid or expired. Request a new one below."
        : ""
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [previewVerificationUrl, setPreviewVerificationUrl] = useState("");

  const canResendVerification = Boolean(email);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Access your private journal, reports, and analytics.</p>
      </div>

      {googleEnabled ? (
        <>
          <GoogleSigninButton />
          <div className="relative text-center text-sm text-muted-foreground">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/70" />
            <span className="relative bg-card px-4">or continue with email</span>
          </div>
        </>
      ) : null}

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");

          const response = await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          setLoading(false);

          if (response?.error) {
            if (response.error === "EMAIL_NOT_VERIFIED") {
              setError("Your account is not verified yet. Verify your email before logging in.");
              return;
            }

            setError("Invalid email or password.");
            return;
          }

          router.push(callbackUrl);
          router.refresh();
        }}
      >
        <Field label="Email address">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-primary transition hover:opacity-80">
            Forgot password?
          </Link>
          <Link href="/register" className="text-muted-foreground transition hover:text-foreground">
            Create account
          </Link>
        </div>
        {notice ? <p className="text-sm text-success">{notice}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Secure login"}
        </Button>
        {(error.includes("not verified") || verifiedState === "invalid") && canResendVerification ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={resendLoading}
            onClick={async () => {
              setResendLoading(true);
              setError("");
              const resendResponse = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
              });
              const resendResult = (await resendResponse.json()) as {
                error?: string;
                message?: string;
                previewVerificationUrl?: string | null;
              };
              setResendLoading(false);
              setNotice(resendResult.error || resendResult.message || "Verification email sent.");
              setPreviewVerificationUrl(resendResult.previewVerificationUrl || "");
            }}
          >
            {resendLoading ? "Sending verification..." : "Resend verification link"}
          </Button>
        ) : null}
        {previewVerificationUrl ? (
          <a
            href={previewVerificationUrl}
            className="block rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary transition hover:opacity-90"
          >
            Verify this account now
          </a>
        ) : null}
      </form>
    </div>
  );
}
