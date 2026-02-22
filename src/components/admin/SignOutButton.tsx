"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  return (
    <Button type="button" variant="ghost" onClick={handleSignOut} className={className}>
      <LogOut className="w-4 h-4" />
      {children}
    </Button>
  );
}
