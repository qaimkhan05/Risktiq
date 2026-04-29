import { LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/risktiq-ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function LogoutButton() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={async () => {
        await logout();
        navigate("/");
      }}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
