/**
 * Seed default 30 subjects (from the original Bagrut calculator) for a school.
 *
 * Usage:
 *   bun scripts/seed-subjects.ts --school <slug>
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ============================================================
// Default categories (extracted from original index.html)
// ============================================================
const DEFAULT_CATEGORIES = [
  { id: "core", name: "מקצועות חובה", icon: "📚", sortOrder: 0 },
  { id: "science", name: "מדעים וטכנולוגיה", icon: "🔬", sortOrder: 1 },
  { id: "social", name: "חברה ורוח", icon: "🌍", sortOrder: 2 },
  { id: "extended", name: "הרחבות", icon: "📖", sortOrder: 3 },
  { id: "lang", name: "שפות", icon: "🗣️", sortOrder: 4 },
  { id: "arts", name: "אמנויות", icon: "🎨", sortOrder: 5 },
  { id: "other", name: "נוספים", icon: "⭐", sortOrder: 6 },
];

// ============================================================
// Default subjects (all 30 from the original calculator)
// ============================================================
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
  categoryId: string; // maps to DEFAULT_CATEGORIES[x].id
  units: number;
  hasLevels: boolean;
  dependsOnId?: string; // maps to another subject's id field
  depLabel?: string;
  depWeight?: number;
  sortOrder: number;
  levels?: LevelDef[];
  components?: ComponentDef[];
}

const DEFAULT_SUBJECTS: SubjectDef[] = [
  // ===== חובה (core) =====
  {
    id: "math",
    name: "מתמטיקה",
    categoryId: "core",
    units: 0, // determined by level
    hasLevels: true,
    sortOrder: 0,
    levels: [
      {
        label: '4 יח"ל',
        units: 4,
        sortOrder: 0,
        components: [
          { name: "שאלון 35481", weight: 0.65, sortOrder: 0 },
          { name: "שאלון 35482", weight: 0.35, sortOrder: 1 },
        ],
      },
      {
        label: '5 יח"ל',
        units: 5,
        sortOrder: 1,
        components: [
          { name: "שאלון 35581", weight: 0.6, sortOrder: 0 },
          { name: "שאלון 35582", weight: 0.4, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    id: "english",
    name: "אנגלית",
    categoryId: "core",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "שאלון E - 16481", weight: 0.27, sortOrder: 0 },
      { name: "שאלון F - 16583", weight: 0.26, sortOrder: 1 },
      { name: "שאלון G - 16582", weight: 0.27, sortOrder: 2 },
      { name: "בעל פה", weight: 0.2, sortOrder: 3 },
    ],
  },
  {
    id: "history",
    name: "היסטוריה",
    categoryId: "core",
    units: 2,
    hasLevels: false,
    sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "literature",
    name: "ספרות",
    categoryId: "core",
    units: 2,
    hasLevels: false,
    sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "tanach",
    name: 'תנ"ך',
    categoryId: "core",
    units: 2,
    hasLevels: false,
    sortOrder: 4,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "civics",
    name: "אזרחות",
    categoryId: "core",
    units: 2,
    hasLevels: false,
    sortOrder: 5,
    components: [
      { name: "פנימי", weight: 0.2, sortOrder: 0 },
      { name: "חיצוני", weight: 0.8, sortOrder: 1 },
    ],
  },
  {
    id: "language",
    name: "לשון",
    categoryId: "core",
    units: 2,
    hasLevels: false,
    sortOrder: 6,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "חיצוני", weight: 0.7, sortOrder: 1 },
    ],
  },
  // ===== מדעים (science) =====
  {
    id: "physics",
    name: "פיזיקה",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "מכניקה חיצוני", weight: 0.3, sortOrder: 1 },
      { name: "חשמל חיצוני", weight: 0.25, sortOrder: 2 },
      { name: "מעבדה חיצוני", weight: 0.15, sortOrder: 3 },
    ],
  },
  {
    id: "biology",
    name: "ביולוגיה",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.55, sortOrder: 1 },
      { name: "מעבדה חיצונית", weight: 0.15, sortOrder: 2 },
    ],
  },
  {
    id: "chemistry",
    name: "כימיה",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 2,
    components: [
      { name: "עבודת חקר", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.55, sortOrder: 1 },
      { name: "בעל פה חיצוני", weight: 0.15, sortOrder: 2 },
    ],
  },
  {
    id: "cs",
    name: "מדעי המחשב",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.24, sortOrder: 0 },
      { name: "בחינה חיצונית א'", weight: 0.36, sortOrder: 1 },
      { name: "בחינה חיצונית ב'", weight: 0.4, sortOrder: 2 },
    ],
  },
  {
    id: "medicine",
    name: "מדעי הרפואה",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 4,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "medicine_thesis",
    name: "מדעי הרפואה - עבודת גמר",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 5,
    components: [{ name: "פרויקט גמר", weight: 1.0, sortOrder: 0 }],
  },
  {
    id: "data_info",
    name: "מידע ונתונים",
    categoryId: "science",
    units: 5,
    hasLevels: false,
    sortOrder: 6,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  // ===== חברה (social) =====
  {
    id: "social",
    name: "מדעי החברה",
    categoryId: "social",
    units: 5,
    hasLevels: false,
    sortOrder: 0,
    components: [
      { name: "פסיכולוגיה א'", weight: 0.12, sortOrder: 0 },
      { name: "פסיכולוגיה ב'", weight: 0.28, sortOrder: 1 },
      { name: "שיטות מחקר", weight: 0.2, sortOrder: 2 },
      { name: "סוציולוגיה", weight: 0.4, sortOrder: 3 },
    ],
  },
  {
    id: "management",
    name: "מנהל וכלכלה",
    categoryId: "social",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "geography",
    name: "גאוגרפיה",
    categoryId: "social",
    units: 5,
    hasLevels: false,
    sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  // ===== הרחבות (extended) =====
  {
    id: "tanach_ext",
    name: 'תנ"ך מורחב',
    categoryId: "extended",
    units: 5,
    hasLevels: false,
    dependsOnId: "tanach",
    depLabel: 'ציון תנ"ך בסיסי',
    depWeight: 0.4,
    sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.18, sortOrder: 0 },
      { name: "חיצוני", weight: 0.42, sortOrder: 1 },
    ],
  },
  {
    id: "civics_ext",
    name: "אזרחות מורחב",
    categoryId: "extended",
    units: 5,
    hasLevels: false,
    dependsOnId: "civics",
    depLabel: "ציון אזרחות בסיסי",
    depWeight: 0.4,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.18, sortOrder: 0 },
      { name: "חיצוני", weight: 0.42, sortOrder: 1 },
    ],
  },
  // ===== שפות (lang) =====
  {
    id: "chinese",
    name: "סינית",
    categoryId: "lang",
    units: 5,
    hasLevels: false,
    sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  {
    id: "spanish",
    name: "ספרדית",
    categoryId: "lang",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
  {
    id: "french",
    name: "צרפתית",
    categoryId: "lang",
    units: 5,
    hasLevels: false,
    sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.3, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.7, sortOrder: 1 },
    ],
  },
  {
    id: "arabic",
    name: "ערבית",
    categoryId: "lang",
    units: 5,
    hasLevels: false,
    sortOrder: 3,
    components: [
      { name: "כתוב", weight: 0.5, sortOrder: 0 },
      { name: "בעל פה", weight: 0.2, sortOrder: 1 },
      { name: "חיצוני", weight: 0.3, sortOrder: 2 },
    ],
  },
  // ===== אמנויות (arts) =====
  {
    id: "dance",
    name: "מחול",
    categoryId: "arts",
    units: 5,
    hasLevels: false,
    sortOrder: 0,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "theater",
    name: "תאטרון",
    categoryId: "arts",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "music",
    name: "מוזיקה",
    categoryId: "arts",
    units: 5,
    hasLevels: false,
    sortOrder: 2,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  {
    id: "cinema",
    name: "קולנוע",
    categoryId: "arts",
    units: 5,
    hasLevels: false,
    sortOrder: 3,
    components: [
      { name: "פנימי", weight: 0.5, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.5, sortOrder: 1 },
    ],
  },
  // ===== נוספים (other) =====
  {
    id: "pe_ext",
    name: 'חנ"ג מורחב',
    categoryId: "other",
    units: 5,
    hasLevels: false,
    sortOrder: 0,
    components: [
      { name: "חיצוני", weight: 0.55, sortOrder: 0 },
      { name: "פנימי א'", weight: 0.2, sortOrder: 1 },
      { name: "פנימי ב'", weight: 0.25, sortOrder: 2 },
    ],
  },
  {
    id: "toshba",
    name: 'תושב"ע',
    categoryId: "other",
    units: 5,
    hasLevels: false,
    sortOrder: 1,
    components: [
      { name: "פנימי", weight: 0.4, sortOrder: 0 },
      { name: "בחינה חיצונית", weight: 0.6, sortOrder: 1 },
    ],
  },
];

// ============================================================
// Main seed function
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const schoolSlugIdx = args.indexOf("--school");

  if (schoolSlugIdx === -1 || !args[schoolSlugIdx + 1]) {
    console.error("Usage: bun scripts/seed-subjects.ts --school <slug>");
    process.exit(1);
  }

  const schoolSlug = args[schoolSlugIdx + 1];

  // Find the school
  const school = await db.query.schools.findFirst({
    where: eq(schema.schools.slug, schoolSlug),
  });

  if (!school) {
    console.error(`School with slug "${schoolSlug}" not found.`);
    process.exit(1);
  }

  console.log(`Seeding subjects for school: ${school.name} (${school.slug})`);

  // 1. Create categories
  const categoryMap: Record<string, string> = {}; // local id -> DB uuid

  for (const cat of DEFAULT_CATEGORIES) {
    const [inserted] = await db
      .insert(schema.categories)
      .values({
        schoolId: school.id,
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      })
      .returning();
    categoryMap[cat.id] = inserted.id;
    console.log(`  Category: ${cat.name} -> ${inserted.id}`);
  }

  // 2. Create subjects (first pass: without dependencies)
  const subjectMap: Record<string, string> = {}; // local id -> DB uuid

  for (const subj of DEFAULT_SUBJECTS) {
    const [inserted] = await db
      .insert(schema.subjects)
      .values({
        schoolId: school.id,
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
    console.log(`  Subject: ${subj.name} -> ${inserted.id}`);
  }

  // 3. Set up dependencies (second pass)
  for (const subj of DEFAULT_SUBJECTS) {
    if (subj.dependsOnId) {
      const dbSubjectId = subjectMap[subj.id];
      const dbDependsOnId = subjectMap[subj.dependsOnId];
      if (dbSubjectId && dbDependsOnId) {
        await db
          .update(schema.subjects)
          .set({ dependsOnId: dbDependsOnId })
          .where(eq(schema.subjects.id, dbSubjectId));
        console.log(
          `  Dependency: ${subj.name} depends on ${subj.dependsOnId}`
        );
      }
    }
  }

  // 4. Create levels and components
  for (const subj of DEFAULT_SUBJECTS) {
    const dbSubjectId = subjectMap[subj.id];

    if (subj.hasLevels && subj.levels) {
      // Create levels with their components
      for (const lvl of subj.levels) {
        const [insertedLevel] = await db
          .insert(schema.levels)
          .values({
            subjectId: dbSubjectId,
            label: lvl.label,
            units: lvl.units,
            sortOrder: lvl.sortOrder,
          })
          .returning();

        for (const comp of lvl.components) {
          await db.insert(schema.components).values({
            levelId: insertedLevel.id,
            subjectId: null,
            name: comp.name,
            weight: comp.weight,
            sortOrder: comp.sortOrder,
          });
        }
        console.log(
          `  Level: ${subj.name} / ${lvl.label} (${lvl.components.length} components)`
        );
      }
    } else if (subj.components) {
      // Create components directly on the subject
      for (const comp of subj.components) {
        await db.insert(schema.components).values({
          subjectId: dbSubjectId,
          levelId: null,
          name: comp.name,
          weight: comp.weight,
          sortOrder: comp.sortOrder,
        });
      }
      console.log(
        `  Components: ${subj.name} (${subj.components.length} components)`
      );
    }
  }

  console.log("\nSeed complete!");
  console.log(`  ${DEFAULT_CATEGORIES.length} categories`);
  console.log(`  ${DEFAULT_SUBJECTS.length} subjects`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
