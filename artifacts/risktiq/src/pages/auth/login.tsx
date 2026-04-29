import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/risktiq-ui/button";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const verifiedState = params.get("verified");
  const emailFromUrl = params.get("email");
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  // State for resend logic within LoginPage
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [previewVerificationUrl, setPreviewVerificationUrl] = useState("");

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!loading && user) {
      navigate(callbackUrl, { replace: true });
    }
    // Clear verification params from URL after processing to avoid re-displaying messages
    // This will only happen if user is NOT logged in, and a verifiedState was processed.
    if (!loading && !user && (verifiedState === "success" || verifiedState === "invalid")) {
      const newParams = new URLSearchParams(params);
      newParams.delete("verified");
      newParams.delete("email");
      const newLocation = newParams.toString() ? `${location.split("?")[0]}?${newParams.toString()}` : location.split("?")[0];
      navigate(newLocation, { replace: true });
    }
  }, [loading, user, navigate, callbackUrl, verifiedState, emailFromUrl, location, params]);

  const handleResendVerification = async () => {
    if (!emailFromUrl) {
      setResendError("Email address is missing to resend verification link.");
      return;
    }
    setResendLoading(true);
    setResendError("");
    setResendNotice("");
    setPreviewVerificationUrl("");

    try {
      const resendResponse = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailFromUrl }),
      });
      const resendResult = (await resendResponse.json()) as {
        error?: string;
        message?: string;
        previewVerificationUrl?: string | null;
      };
      if (!resendResponse.ok) {
        setResendError(resendResult.error || "Failed to resend verification email.");
      } else {
        setResendNotice(resendResult.message || "Verification email sent.");
        setPreviewVerificationUrl(resendResult.previewVerificationUrl || "");
      }
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setResendLoading(false);
    }
  };

  let pageContent;

  if (verifiedState === "success") {
    pageContent = (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Email Verified Successfully!</h2>
        <p className="text-sm text-muted-foreground">
          Your email address has been verified. You can now log in to access your account.
        </p>
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="block w-full">
          <Button type="button" className="w-full">
            Continue to Login
          </Button>
        </Link>
      </div>
    );
  } else if (verifiedState === "invalid") {
    pageContent = (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Invalid Verification Link</h2>
        <p className="text-sm text-muted-foreground">
          The verification link you used is invalid or has expired. Please request a new one to verify your email.
        </p>
        {resendNotice ? <p className="text-sm text-success">{resendNotice}</p> : null}
        {resendError ? <p className="text-sm text-danger">{resendError}</p> : null}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={resendLoading || !emailFromUrl}
          onClick={handleResendVerification}
        >
          {resendLoading ? "Sending verification..." : "Request New Verification Link"}
        </Button>
        {previewVerificationUrl ? (
          <a
            href={previewVerificationUrl}
            className="block rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary transition hover:opacity-90 mt-4"
          >
            Verify this account now
          </a>
        ) : null}
        <div className="flex items-center justify-between text-sm mt-4">
          <Link href="/forgot-password" className="text-primary transition hover:opacity-80">
            Forgot password?
          </Link>
          <Link href="/register" className="text-muted-foreground transition hover:text-foreground">
            Create account
          </Link>
        </div>
      </div>
    );
  } else {
    pageContent = <LoginForm />;
  }

  return (
    <AuthShell
      title="Secure access to your trading intelligence."
      description="Log in to your personal journal workspace to review trades, track discipline, and export professional reports."
    >
      {pageContent}
    </AuthShell>
  );
}
