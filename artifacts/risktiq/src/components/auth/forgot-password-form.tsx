import { useState } from "react";
import { Button } from "@/components/risktiq-ui/button";
import { Field } from "@/components/risktiq-ui/field";
import { Input } from "@/components/risktiq-ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [previewResetUrl, setPreviewResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setStatus("");

        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        const result = (await response.json()) as {
          error?: string;
          message?: string;
          previewResetUrl?: string | null;
        };
        setStatus(result.error || result.message || "Request submitted.");
        setPreviewResetUrl(result.previewResetUrl || "");
        setLoading(false);
      }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send a secure password reset link if the account exists.
        </p>
      </div>
      <Field label="Email address">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </Field>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      {previewResetUrl ? (
        <a
          href={previewResetUrl}
          className="block rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary transition hover:opacity-90"
        >
          Reset this password now
        </a>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Send reset link"}
      </Button>
    </form>
  );
}
