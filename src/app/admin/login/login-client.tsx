"use client";

import { NeonAuthUIProvider, AuthView } from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";

export default function LoginClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = authClient as any;

  return (
    <NeonAuthUIProvider
      authClient={client}
      social={{ providers: ["google"] }}
    >
      <AuthView />
    </NeonAuthUIProvider>
  );
}
