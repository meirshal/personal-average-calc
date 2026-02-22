import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

export default neonAuthMiddleware({
  loginUrl: "/admin/login",
});

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
