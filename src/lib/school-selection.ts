import { cookies } from "next/headers";

const COOKIE_NAME = "admin-school-id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Read the currently selected school ID from the cookie.
 * Returns undefined if no cookie is set.
 */
export async function getSelectedSchoolId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Set the selected school ID cookie.
 * httpOnly, sameSite lax, scoped to /admin, 1 year expiry.
 */
export async function setSelectedSchoolId(schoolId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, schoolId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: ONE_YEAR_SECONDS,
  });
}
