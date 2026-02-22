import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { categories, subjects } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "שם קטגוריה הוא שדה חובה"),
  icon: z.string().optional().default(""),
  sortOrder: z.number().int().optional().default(0),
});

// GET: List all categories for admin's school
export async function GET() {
  try {
    const adminSchool = await requireAdmin();

    const cats = await getDb()
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.schoolId, adminSchool.schoolId))
      .orderBy(asc(categories.sortOrder));

    // Get subject counts per category
    const subjectCounts = await getDb()
      .select({
        categoryId: subjects.categoryId,
        count: count(),
      })
      .from(subjects)
      .where(eq(subjects.schoolId, adminSchool.schoolId))
      .groupBy(subjects.categoryId);

    const countMap: Record<string, number> = {};
    for (const sc of subjectCounts) {
      countMap[sc.categoryId] = sc.count;
    }

    const result = cats.map((cat) => ({
      ...cat,
      subjectCount: countMap[cat.id] ?? 0,
    }));

    return NextResponse.json(result);
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

// POST: Create new category
export async function POST(request: Request) {
  try {
    const adminSchool = await requireAdmin();
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, icon, sortOrder } = parsed.data;

    const [created] = await getDb()
      .insert(categories)
      .values({
        schoolId: adminSchool.schoolId,
        name,
        icon: icon || null,
        sortOrder,
      })
      .returning();

    revalidatePath(`/school/${adminSchool.school.slug}`);

    return NextResponse.json(created, { status: 201 });
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
