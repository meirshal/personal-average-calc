import { getDb } from "@/db";
import {
  schools,
  categories as categoriesTable,
  subjects as subjectsTable,
  levels as levelsTable,
  components as componentsTable,
} from "@/db/schema";
import { eq, asc, inArray, or } from "drizzle-orm";
import type { SchoolConfig, CategoryConfig, SubjectConfig } from "./types";

/**
 * Fetch the full school configuration from the database.
 * Returns null if the school is not found.
 */
export async function getSchoolConfig(
  slug: string
): Promise<SchoolConfig | null> {
  const db = getDb();

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);

  if (!school) return null;

  // Fetch all categories for this school
  const cats = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.schoolId, school.id))
    .orderBy(asc(categoriesTable.sortOrder));

  // Fetch all subjects for this school
  const subs = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.schoolId, school.id))
    .orderBy(asc(subjectsTable.sortOrder));

  const subjectIds = subs.map((s) => s.id);

  // Fetch levels for this school's subjects
  const schoolLevels = subjectIds.length
    ? await db
        .select()
        .from(levelsTable)
        .where(inArray(levelsTable.subjectId, subjectIds))
        .orderBy(asc(levelsTable.sortOrder))
    : [];
  const levelIds = schoolLevels.map((l) => l.id);

  // Fetch components for this school's subjects/levels
  const schoolComps =
    subjectIds.length
      ? await db
          .select()
          .from(componentsTable)
          .where(
            levelIds.length
              ? or(
                  inArray(componentsTable.subjectId, subjectIds),
                  inArray(componentsTable.levelId, levelIds)
                )
              : inArray(componentsTable.subjectId, subjectIds)
          )
          .orderBy(asc(componentsTable.sortOrder))
      : [];

  // Build the config tree
  const categoriesConfig: CategoryConfig[] = cats.map((cat) => {
    const catSubjects = subs.filter((s) => s.categoryId === cat.id);

    const subjectsConfig: SubjectConfig[] = catSubjects.map((sub) => {
      const subLevels = schoolLevels.filter((l) => l.subjectId === sub.id);
      const directComps = schoolComps.filter(
        (c) => c.subjectId === sub.id && !c.levelId
      );

      return {
        id: sub.id,
        name: sub.name,
        categoryId: cat.id,
        units: sub.units,
        hasLevels: sub.hasLevels,
        levels: subLevels.map((lv) => ({
          id: lv.id,
          label: lv.label,
          units: lv.units,
          sortOrder: lv.sortOrder,
          components: schoolComps
            .filter((c) => c.levelId === lv.id)
            .map((c) => ({
              id: c.id,
              name: c.name,
              weight: c.weight,
              sortOrder: c.sortOrder,
            })),
        })),
        components: directComps.map((c) => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
          sortOrder: c.sortOrder,
        })),
        dependsOnId: sub.dependsOnId,
        depLabel: sub.depLabel,
        depWeight: sub.depWeight,
        sortOrder: sub.sortOrder,
      };
    });

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      subjects: subjectsConfig,
    };
  });

  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    categories: categoriesConfig,
  };
}
