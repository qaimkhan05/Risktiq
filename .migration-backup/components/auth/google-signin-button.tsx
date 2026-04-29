"use client";

import { useState } from "react";
import { Chrome } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleSigninButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={async () => {
        setLoading(true);
        await signIn("google", { callbackUrl: "/dashboard" });
      }}
    >
      <Chrome className="h-4 w-4" />
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
