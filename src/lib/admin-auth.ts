import { neonAuth } from "@/lib/auth/server";
import { getDb } from "@/db";
import { admins, schools } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AdminSchool {
  adminId: string;
  schoolId: string;
  school: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Look up an admin's school by their email.
 * Returns the admin's school info if found, null otherwise.
 */
export async function getAdminSchool(
  userEmail: string | null | undefined
): Promise<AdminSchool | null> {
  if (!userEmail) {
    return null;
  }

  const result = await getDb()
    .select({
      adminId: admins.id,
      schoolId: admins.schoolId,
      schoolName: schools.name,
      schoolSlug: schools.slug,
      schoolIdFromSchool: schools.id,
    })
    .from(admins)
    .innerJoin(schools, eq(admins.schoolId, schools.id))
    .where(eq(admins.email, userEmail))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    adminId: row.adminId,
    schoolId: row.schoolId,
    school: {
      id: row.schoolIdFromSchool,
      name: row.schoolName,
      slug: row.schoolSlug,
    },
  };
}

/**
 * Get the current session, verify admin status, and return school info.
 * Throws an error if the user is not authenticated or not an admin.
 */
export async function requireAdmin(): Promise<AdminSchool> {
  const { user } = await neonAuth();

  if (!user?.email) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const adminSchool = await getAdminSchool(user.email);

  if (!adminSchool) {
    throw new Error("NOT_ADMIN");
  }

  return adminSchool;
}
