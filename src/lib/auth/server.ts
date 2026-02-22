import { createAuthServer, neonAuth } from "@neondatabase/auth/next/server";

let _authServer: ReturnType<typeof createAuthServer> | undefined;

export function getAuthServer() {
  if (!_authServer) {
    _authServer = createAuthServer();
  }
  return _authServer;
}

export { neonAuth };
