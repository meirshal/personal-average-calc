import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { subjects, components, levels, categories } from "@/db/schema";
import { eq, and, asc, or, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const componentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  weight: z.number().min(0).max(1),
  sortOrder: z.number().int().default(0),
});

const levelSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1),
  units: z.number().int().min(0),
  sortOrder: z.number().int().default(0),
  components: z.array(componentSchema).default([]),
});

const updateSubjectSchema = z.object({
  name: z.string().min(1, "שם מקצוע הוא שדה חובה").optional(),
  units: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  hasLevels: z.boolean().optional(),
  dependsOnId: z.string().uuid().nullable().optional(),
  depLabel: z.string().nullable().optional(),
  depWeight: z.number().min(0).max(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
  levels: z.array(levelSchema).optional(),
  components: z.array(componentSchema).optional(),
});

// GET: Get single subject with all components and levels
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSchool = await requireAdmin();
    const { id } = await params;

    const [subject] = await getDb()
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.id, id),
          eq(subjects.schoolId, adminSchool.schoolId)
        )
      )
      .limit(1);

    if (!subject) {
      return NextResponse.json({ error: "מקצוע לא נמצא" }, { status: 404 });
    }

    // Get levels
    const subjLevels = await getDb()
      .select()
      .from(levels)
      .where(eq(levels.subjectId, id))
      .orderBy(asc(levels.sortOrder));

    // Get components scoped to this subject and its levels
    const levelIds = subjLevels.map((l) => l.id);
    const subjComponents = await getDb()
      .select()
      .from(components)
      .where(
        levelIds.length
          ? or(
              eq(components.subjectId, id),
              inArray(components.levelId, levelIds)
            )
          : eq(components.subjectId, id)
      )
      .orderBy(asc(components.sortOrder));

    const directComponents = subjComponents.filter(
      (c) => c.subjectId === id && !c.levelId
    );

    const levelsWithComponents = subjLevels.map((lvl) => ({
      ...lvl,
      components: subjComponents.filter((c) => c.levelId === lvl.id),
    }));

    // Get all categories for dropdown
    const allCategories = await getDb()
      .select()
      .from(categories)
      .where(eq(categories.schoolId, adminSchool.schoolId))
      .orderBy(asc(categories.sortOrder));

    // Get all subjects for dependency picker
    const allSubjects = await getDb()
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(eq(subjects.schoolId, adminSchool.schoolId))
      .orderBy(asc(subjects.sortOrder));

    return NextResponse.json({
      subject: {
        ...subject,
        levels: levelsWithComponents,
        components: directComponents,
      },
      categories: allCategories,
      allSubjects: allSubjects.filter((s) => s.id !== id),
    });
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

// PUT: Update subject + its components/levels
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSchool = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const [existing] = await getDb()
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.id, id),
          eq(subjects.schoolId, adminSchool.schoolId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "מקצוע לא נמצא" }, { status: 404 });
    }

    const data = parsed.data;

    // Update subject fields
    const updateFields: Record<string, unknown> = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.units !== undefined) updateFields.units = data.units;
    if (data.categoryId !== undefined) updateFields.categoryId = data.categoryId;
    if (data.hasLevels !== undefined) updateFields.hasLevels = data.hasLevels;
    if (data.dependsOnId !== undefined) updateFields.dependsOnId = data.dependsOnId;
    if (data.depLabel !== undefined) updateFields.depLabel = data.depLabel;
    if (data.depWeight !== undefined) updateFields.depWeight = data.depWeight;
    if (data.sortOrder !== undefined) updateFields.sortOrder = data.sortOrder;

    if (Object.keys(updateFields).length > 0) {
      await getDb()
        .update(subjects)
        .set(updateFields)
        .where(and(eq(subjects.id, id), eq(subjects.schoolId, adminSchool.schoolId)));
    }

    // Replace levels if provided
    if (data.levels !== undefined) {
      // Delete existing levels (cascades to their components)
      await getDb().delete(levels).where(eq(levels.subjectId, id));

      for (const lvl of data.levels) {
        const [createdLevel] = await getDb()
          .insert(levels)
          .values({
            subjectId: id,
            label: lvl.label,
            units: lvl.units,
            sortOrder: lvl.sortOrder,
          })
          .returning();

        for (const comp of lvl.components) {
          await getDb().insert(components).values({
            levelId: createdLevel.id,
            subjectId: null,
            name: comp.name,
            weight: comp.weight,
            sortOrder: comp.sortOrder,
          });
        }
      }
    }

    // Replace direct components if provided
    if (data.components !== undefined) {
      // Delete existing direct components (not level-based)
      const existingComps = await getDb()
        .select()
        .from(components)
        .where(eq(components.subjectId, id));

      for (const comp of existingComps) {
        if (!comp.levelId) {
          await getDb().delete(components).where(eq(components.id, comp.id));
        }
      }

      for (const comp of data.components) {
        await getDb().insert(components).values({
          subjectId: id,
          levelId: null,
          name: comp.name,
          weight: comp.weight,
          sortOrder: comp.sortOrder,
        });
      }
    }

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
    console.error("Update subject error:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}

// DELETE: Delete subject
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSchool = await requireAdmin();
    const { id } = await params;

    // Verify ownership
    const [existing] = await getDb()
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.id, id),
          eq(subjects.schoolId, adminSchool.schoolId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "מקצוע לא נמצא" }, { status: 404 });
    }

    // Clear any dependencies pointing to this subject
    const dependents = await getDb()
      .select()
      .from(subjects)
      .where(eq(subjects.dependsOnId, id));

    for (const dep of dependents) {
      await getDb()
        .update(subjects)
        .set({ dependsOnId: null, depLabel: null, depWeight: null })
        .where(eq(subjects.id, dep.id));
    }

    await getDb().delete(subjects).where(eq(subjects.id, id));

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
