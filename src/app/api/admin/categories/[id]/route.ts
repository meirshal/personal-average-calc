import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1, "שם קטגוריה הוא שדה חובה").optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// PUT: Update category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSchool = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await getDb()
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, id), eq(categories.schoolId, adminSchool.schoolId))
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "קטגוריה לא נמצאה" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon || null;
    if (parsed.data.sortOrder !== undefined)
      updateData.sortOrder = parsed.data.sortOrder;

    const [updated] = await getDb()
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    revalidatePath(`/school/${adminSchool.school.slug}`);

    return NextResponse.json(updated);
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

// DELETE: Delete category (cascades to subjects)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSchool = await requireAdmin();
    const { id } = await params;

    // Verify ownership
    const existing = await getDb()
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, id), eq(categories.schoolId, adminSchool.schoolId))
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "קטגוריה לא נמצאה" }, { status: 404 });
    }

    await getDb().delete(categories).where(eq(categories.id, id));

    revalidatePath(`/school/${adminSchool.school.slug}`);

    return NextResponse.json({ success: true });
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
