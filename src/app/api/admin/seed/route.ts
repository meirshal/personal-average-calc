import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { categories, subjects, levels, components } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Default categories
const DEFAULT_CATEGORIES = [
  { id: "core", name: "מקצועות חובה", icon: "\u{1F4DA}", sortOrder: 0 },
  { id: "science", name: "מדעים וטכנולוגיה", icon: "\u{1F52C}", sortOrder: 1 },
  { id: "social", name: "חברה ורוח", icon: "\u{1F30D}", sortOrder: 2 },
  { id: "extended", name: "הרחבות", icon: "\u{1F4D6}", sortOrder: 3 },
  { id: "lang", name: "שפות", icon: "\u{1F5E3}\uFE0F", sortOrder: 4 },
  { id: "arts", name: "אמנויות", icon: "\u{1F3A8}", sortOrder: 5 },
  { id: "other", name: "נוספים", icon: "\u2B50", sortOrder: 6 },
];

// Default subjects
interface ComponentDef {
  name: string;
  weight: number;
  sortOrder: number;
}

interface LevelDef {
  label: string;
  units: number;
  sortOrder: number;
  components: ComponentDef[];
}

interface SubjectDef {
  id: string;
  name: string;
  categoryId: string;
  units: number;
  hasLevels: boolean;
  dependsOnId?: string;
  depLabel?: string;
  depWeight?: number;
  sortOrder: number;
  levels?: LevelDef[];
  components?: ComponentDef[];
}

const DEFAULT_SUBJECTS: SubjectDef[] = [
  {
    id: "math", name: "מתמטיקה", categoryId: "core", units: 0, hasLevels: true, sortOrder: 0,
    levels: [
      { label: '4 יח"ל', units: 4, sortOrder: 0, components: [
        { name: "שאלון 35481", weight: 0.65, sortOrder: 0 },
        { name: "שאלון 35482", weight: 0.35, sortOrder: 1 },
      ]},
      { label: '5 יח"ל', units: 5, sortOrder: 1, components: [
        { name: "שאלון 35581", weight: 0.6, sortOrder: 0 },
        { name: "שאלון 35582", weight: 0.4, sortOrder: 1 },
      ]},
    ],
  },
  {
    id: "english", name: "אנגלית", categoryId: "core", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "שאלון E - 16481", weight: 0.27, sortOrder: 0 },
      { name: "שאלון F - 16583", weight: 0.26, sortOrder: 1 },
      { name: "שאלון G - 16582", weight: 0.27, sortOrder: 2 },
      { name: "בעל פה", weight: 0.2, sortOrder: 3 },
    ],
  },
  {
    id: "history", name: "היסטוריה", categoryId: "core", units: 2, hasLevels: false, sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "literature", name: "ספרות", categoryId: "core", units: 2, hasLevels: false, sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "tanach", name: 'תנ"ך', categoryId: "core", units: 2, hasLevels: false, sortOrder: 4,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "civics", name: "אזרחות", categoryId: "core", units: 2, hasLevels: false, sortOrder: 5,
    components: [
      { name: "פנימי", weight: 0.2, sortOrder: 0 },
      { name: "חיצוני", weight: 0.8, sortOrder: 1 },
    ],
  },
  {
    id: "language", name: "לשון", categoryId: "core", units: 2, hasLevels: false, sortOrder: 6,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "physics", name: "פיזיקה", categoryId: "science", units: 5, hasLevels: false, sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "מכניקה חיצוני", weight: 0.3, sortOrder: 1 },
      { name: "חשמל חיצוני", weight: 0.25, sortOrder: 2 },
      { name: "מעבדה חיצוני", weight: 0.15, sortOrder: 3 },
    ],
  },
  {
    id: "biology", name: "ביולוגיה", categoryId: "science", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.55, sortOrder: 1 },
      { name: "מעבדה חיצונית", weight: 0.15, sortOrder: 2 },
    ],
  },
  {
    id: "chemistry", name: "כימיה", categoryId: "science", units: 5, hasLevels: false, sortOrder: 2,
    components: [
      { name: "עבודת חקר", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.55, sortOrder: 1 },
      { name: "בעל פה חיצוני", weight: 0.15, sortOrder: 2 },
    ],
  },
  {
    id: "cs", name: "מדעי המחשב", categoryId: "science", units: 5, hasLevels: false, sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.24, sortOrder: 0 },
      { name: "בחינה חיצונית א'", weight: 0.36, sortOrder: 1 },
      { name: "בחינה חיצונית ב'", weight: 0.4, sortOrder: 2 },
    ],
  },
  {
    id: "medicine", name: "מדעי הרפואה", categoryId: "science", units: 5, hasLevels: false, sortOrder: 4,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "medicine_thesis", name: "מדעי הרפואה - עבודת גמר", categoryId: "science", units: 5, hasLevels: false, sortOrder: 5,
    components: [{ name: "פרויקט גמר", weight: 1.0, sortOrder: 0 }],
  },
  {
    id: "data_info", name: "מידע ונתונים", categoryId: "science", units: 5, hasLevels: false, sortOrder: 6,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "social", name: "מדעי החברה", categoryId: "social", units: 5, hasLevels: false, sortOrder: 0,
    components: [
      { name: "פסיכולוגיה א'", weight: 0.12, sortOrder: 0 },
      { name: "פסיכולוגיה ב'", weight: 0.28, sortOrder: 1 },
      { name: "שיטות מחקר", weight: 0.2, sortOrder: 2 },
      { name: "סוציולוגיה", weight: 0.4, sortOrder: 3 },
    ],
  },
  {
    id: "management", name: "מנהל וכלכלה", categoryId: "social", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "geography", name: "גאוגרפיה", categoryId: "social", units: 5, hasLevels: false, sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  {
    id: "tanach_ext", name: 'תנ"ך מורחב', categoryId: "extended", units: 5, hasLevels: false, sortOrder: 0,
    dependsOnId: "tanach", depLabel: 'ציון תנ"ך בסיסי', depWeight: 0.4,
    components: [
      { name: "פנימי", weight: 0.18, sortOrder: 0 },
      { name: "חיצוני", weight: 0.42, sortOrder: 1 },
    ],
  },
  {
    id: "civics_ext", name: "אזרחות מורחב", categoryId: "extended", units: 5, hasLevels: false, sortOrder: 1,
    dependsOnId: "civics", depLabel: "ציון אזרחות בסיסי", depWeight: 0.4,
    components: [
      { name: "פנימי", weight: 0.18, sortOrder: 0 },
      { name: "חיצוני", weight: 0.42, sortOrder: 1 },
    ],
  },
  {
    id: "chinese", name: "סינית", categoryId: "lang", units: 5, hasLevels: false, sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  {
    id: "spanish", name: "ספרדית", categoryId: "lang", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  {
    id: "french", name: "צרפתית", categoryId: "lang", units: 5, hasLevels: false, sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "arabic", name: "ערבית", categoryId: "lang", units: 5, hasLevels: false, sortOrder: 3,
    components: [
      { name: "כתוב", weight: 0.5, sortOrder: 0 },
      { name: "בעל פה", weight: 0.2, sortOrder: 1 },
      { name: "חיצוני", weight: 0.3, sortOrder: 2 },
    ],
  },
  {
    id: "dance", name: "מחול", categoryId: "arts", units: 5, hasLevels: false, sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "theater", name: "תאטרון", categoryId: "arts", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "music", name: "מוזיקה", categoryId: "arts", units: 5, hasLevels: false, sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "cinema", name: "קולנוע", categoryId: "arts", units: 5, hasLevels: false, sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "pe_ext", name: 'חנ"ג מורחב', categoryId: "other", units: 5, hasLevels: false, sortOrder: 0,
    components: [
      { name: "חיצוני", weight: 0.55, sortOrder: 0 },
      { name: "פנימי א'", weight: 0.2, sortOrder: 1 },
      { name: "פנימי ב'", weight: 0.25, sortOrder: 2 },
    ],
  },
  {
    id: "toshba", name: 'תושב"ע', categoryId: "other", units: 5, hasLevels: false, sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
];

// POST: Seed default subjects for the admin's school
export async function POST() {
  try {
    const adminSchool = await requireAdmin();

    // Check if already seeded (idempotent - check both subjects and categories)
    const [subjectCount] = await getDb()
      .select({ count: count() })
      .from(subjects)
      .where(eq(subjects.schoolId, adminSchool.schoolId));

    const [categoryCount] = await getDb()
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.schoolId, adminSchool.schoolId));

    if (subjectCount.count > 0 || categoryCount.count > 0) {
      return NextResponse.json(
        { error: "בית הספר כבר מכיל מקצועות או קטגוריות. מחק את כל הנתונים לפני זריעה מחדש." },
        { status: 400 }
      );
    }

    // 1. Create categories
    const categoryMap: Record<string, string> = {};
    for (const cat of DEFAULT_CATEGORIES) {
      const [inserted] = await getDb()
        .insert(categories)
        .values({
          schoolId: adminSchool.schoolId,
          name: cat.name,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
        })
        .returning();
      categoryMap[cat.id] = inserted.id;
    }

    // 2. Create subjects (first pass: without dependencies)
    const subjectMap: Record<string, string> = {};
    for (const subj of DEFAULT_SUBJECTS) {
      const [inserted] = await getDb()
        .insert(subjects)
        .values({
          schoolId: adminSchool.schoolId,
          categoryId: categoryMap[subj.categoryId],
          name: subj.name,
          units: subj.units,
          hasLevels: subj.hasLevels,
          depLabel: subj.depLabel ?? null,
          depWeight: subj.depWeight ?? null,
          sortOrder: subj.sortOrder,
        })
        .returning();
      subjectMap[subj.id] = inserted.id;
    }

    // 3. Set up dependencies (second pass)
    for (const subj of DEFAULT_SUBJECTS) {
      if (subj.dependsOnId) {
        const dbSubjectId = subjectMap[subj.id];
        const dbDependsOnId = subjectMap[subj.dependsOnId];
        if (dbSubjectId && dbDependsOnId) {
          await getDb()
            .update(subjects)
            .set({ dependsOnId: dbDependsOnId })
            .where(eq(subjects.id, dbSubjectId));
        }
      }
    }

    // 4. Create levels and components
    for (const subj of DEFAULT_SUBJECTS) {
      const dbSubjectId = subjectMap[subj.id];

      if (subj.hasLevels && subj.levels) {
        for (const lvl of subj.levels) {
          const [insertedLevel] = await getDb()
            .insert(levels)
            .values({
              subjectId: dbSubjectId,
              label: lvl.label,
              units: lvl.units,
              sortOrder: lvl.sortOrder,
            })
            .returning();

          for (const comp of lvl.components) {
            await getDb().insert(components).values({
              levelId: insertedLevel.id,
              subjectId: null,
              name: comp.name,
              weight: comp.weight,
              sortOrder: comp.sortOrder,
            });
          }
        }
      } else if (subj.components) {
        for (const comp of subj.components) {
          await getDb().insert(components).values({
            subjectId: dbSubjectId,
            levelId: null,
            name: comp.name,
            weight: comp.weight,
            sortOrder: comp.sortOrder,
          });
        }
      }
    }

    revalidatePath(`/school/${adminSchool.school.slug}`);

    return NextResponse.json({
      success: true,
      message: `נוספו ${DEFAULT_CATEGORIES.length} קטגוריות ו-${DEFAULT_SUBJECTS.length} מקצועות`,
      categoriesCreated: DEFAULT_CATEGORIES.length,
      subjectsCreated: DEFAULT_SUBJECTS.length,
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
    console.error("Seed error:", error);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
