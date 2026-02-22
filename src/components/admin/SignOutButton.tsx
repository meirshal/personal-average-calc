"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

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
    <button type="button" onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
}
