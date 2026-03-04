import { NextResponse } from "next/server";
import { neonAuth } from "@/lib/auth/server";
import { getAdminSchools } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { schools, adminSchools, admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSelectedSchoolId } from "@/lib/school-selection";
import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSchoolSchema = z.object({
  name: z.string().min(1, "שם בית ספר הוא שדה חובה"),
  slug: z
    .string()
    .min(1, "כתובת בית ספר היא שדה חובה")
    .regex(
      SLUG_REGEX,
      "כתובת בית ספר חייבת להכיל רק אותיות קטנות באנגלית, מספרים ומקפים"
    ),
});

// POST: Create a new school
export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();

    if (!user?.email) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchoolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, slug } = parsed.data;

    // Verify caller is an admin (has at least one school)
    const result = await getAdminSchools(user.email);

    if (!result) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
    }

    // Check slug uniqueness
    const existingSchool = await getDb()
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.slug, slug))
      .limit(1);

    if (existingSchool.length > 0) {
      return NextResponse.json(
        { error: "כתובת בית ספר כבר קיימת" },
        { status: 409 }
      );
    }

    // Create the school
    const [newSchool] = await getDb()
      .insert(schools)
      .values({ name, slug })
      .returning();

    // Get admin row for current user
    const [admin] = await getDb()
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.email, user.email))
      .limit(1);

    // Add admin -> school association
    await getDb().insert(adminSchools).values({
      adminId: admin.id,
      schoolId: newSchool.id,
    });

    // Auto-switch to the new school
    await setSelectedSchoolId(newSchool.id);

    return NextResponse.json(
      {
        id: newSchool.id,
        name: newSchool.name,
        slug: newSchool.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHENTICATED") {
        return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
      }
      if (error.message === "NOT_ADMIN") {
        return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
