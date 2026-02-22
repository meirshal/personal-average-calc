"use client";

import { NeonAuthUIProvider, AuthView } from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";

export default function LoginClient() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <NeonAuthUIProvider
      authClient={authClient as any}
      social={{ providers: ["google"] }}
    >
      <AuthView />
    </NeonAuthUIProvider>
  );
}
