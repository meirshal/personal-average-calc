import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { subjects, components, levels, categories } from "@/db/schema";
import { eq, asc, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const componentSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(1),
  sortOrder: z.number().int().default(0),
});

const levelSchema = z.object({
  label: z.string().min(1),
  units: z.number().int().min(0),
  sortOrder: z.number().int().default(0),
  components: z.array(componentSchema).default([]),
});

const createSubjectSchema = z.object({
  name: z.string().min(1, "שם מקצוע הוא שדה חובה"),
  units: z.number().int().min(0).default(0),
  categoryId: z.string().uuid("קטגוריה לא תקינה"),
  hasLevels: z.boolean().default(false),
  dependsOnId: z.string().uuid().nullable().optional().default(null),
  depLabel: z.string().nullable().optional().default(null),
  depWeight: z.number().min(0).max(1).nullable().optional().default(null),
  sortOrder: z.number().int().optional().default(0),
  levels: z.array(levelSchema).optional().default([]),
  components: z.array(componentSchema).optional().default([]),
});

// GET: List all subjects for admin's school with components and levels
export async function GET() {
  try {
    const adminSchool = await requireAdmin();

    // Get categories for this school
    const cats = await getDb()
      .select()
      .from(categories)
      .where(eq(categories.schoolId, adminSchool.schoolId))
      .orderBy(asc(categories.sortOrder));

    // Get all subjects for this school
    const allSubjects = await getDb()
      .select()
      .from(subjects)
      .where(eq(subjects.schoolId, adminSchool.schoolId))
      .orderBy(asc(subjects.sortOrder));

    // Get all components and levels for these subjects
    const subjectIds = allSubjects.map((s) => s.id);

    const allLevels = subjectIds.length
      ? await getDb()
          .select()
          .from(levels)
          .where(inArray(levels.subjectId, subjectIds))
          .orderBy(asc(levels.sortOrder))
      : [];

    const levelIds = allLevels.map((l) => l.id);

    const allComponents = subjectIds.length
      ? await getDb()
          .select()
          .from(components)
          .where(
            levelIds.length
              ? or(
                  inArray(components.subjectId, subjectIds),
                  inArray(components.levelId, levelIds)
                )
              : inArray(components.subjectId, subjectIds)
          )
          .orderBy(asc(components.sortOrder))
      : [];

    // Build subject data with components and levels
    const subjectsWithData = allSubjects.map((subj) => {
      const subjLevels = allLevels.filter((l) => l.subjectId === subj.id);
      const subjComponents = allComponents.filter(
        (c) => c.subjectId === subj.id && !c.levelId
      );

      const levelsWithComponents = subjLevels.map((lvl) => ({
        ...lvl,
        components: allComponents.filter((c) => c.levelId === lvl.id),
      }));

      return {
        ...subj,
        levels: levelsWithComponents,
        components: subjComponents,
      };
    });

    // Group by category
    const grouped = cats.map((cat) => ({
      ...cat,
      subjects: subjectsWithData.filter((s) => s.categoryId === cat.id),
    }));

    return NextResponse.json({ categories: grouped, subjects: subjectsWithData });
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

// POST: Create new subject with components and levels
export async function POST(request: Request) {
  try {
    const adminSchool = await requireAdmin();
    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "נתונים לא תקינים", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify category belongs to this school
    const cat = await getDb()
      .select()
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);

    if (cat.length === 0 || cat[0].schoolId !== adminSchool.schoolId) {
      return NextResponse.json(
        { error: "קטגוריה לא שייכת לבית הספר" },
        { status: 400 }
      );
    }

    // Create subject
    const [created] = await getDb()
      .insert(subjects)
      .values({
        schoolId: adminSchool.schoolId,
        categoryId: data.categoryId,
        name: data.name,
        units: data.units,
        hasLevels: data.hasLevels,
        dependsOnId: data.dependsOnId,
        depLabel: data.depLabel,
        depWeight: data.depWeight,
        sortOrder: data.sortOrder,
      })
      .returning();

    // Create levels and their components
    if (data.hasLevels && data.levels.length > 0) {
      for (const lvl of data.levels) {
        const [createdLevel] = await getDb()
          .insert(levels)
          .values({
            subjectId: created.id,
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

    // Create direct components (non-level subjects)
    if (!data.hasLevels && data.components.length > 0) {
      for (const comp of data.components) {
        await getDb().insert(components).values({
          subjectId: created.id,
          levelId: null,
          name: comp.name,
          weight: comp.weight,
          sortOrder: comp.sortOrder,
        });
      }
    }

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
    console.error("Create subject error:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
