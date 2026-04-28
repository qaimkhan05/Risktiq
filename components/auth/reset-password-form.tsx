"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <p className="text-sm text-danger">Missing or invalid reset token.</p>;
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
          setStatus("Passwords do not match.");
          return;
        }

        setLoading(true);

        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            password
          })
        });

        const result = (await response.json()) as { error?: string; message?: string };
        setLoading(false);

        if (!response.ok) {
          setStatus(result.error || "Unable to reset password.");
          return;
        }

        setStatus(result.message || "Password reset successful.");
        window.setTimeout(() => {
          router.push("/login");
        }, 1000);
      }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose a new password</h2>
        <p className="text-sm text-muted-foreground">
          Update your credentials and all previous sessions will be invalidated automatically.
        </p>
      </div>
      <Field label="New password">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter new password"
          required
        />
      </Field>
      <Field label="Confirm password">
        <Input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat new password"
          required
        />
      </Field>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
