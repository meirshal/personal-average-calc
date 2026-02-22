/**
 * List all schools and their admins.
 *
 * Usage:
 *   npx tsx scripts/list-schools.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const schoolsWithAdmins = await db.query.schools.findMany({
    with: {
      admins: true,
      categories: true,
      subjects: true,
    },
    orderBy: (schools, { asc }) => [asc(schools.createdAt)],
  });

  if (schoolsWithAdmins.length === 0) {
    console.log("No schools found. Create one with:");
    console.log(
      '  npx tsx scripts/create-school.ts --name "School Name" --slug "school-slug"'
    );
    process.exit(0);
  }

  console.log(`Found ${schoolsWithAdmins.length} school(s):\n`);

  for (const school of schoolsWithAdmins) {
    console.log(`${school.name}`);
    console.log(`  Slug:       ${school.slug}`);
    console.log(`  ID:         ${school.id}`);
    console.log(`  URL:        /school/${school.slug}`);
    console.log(`  Categories: ${school.categories.length}`);
    console.log(`  Subjects:   ${school.subjects.length}`);
    console.log(`  Created:    ${school.createdAt.toISOString()}`);

    if (school.admins.length > 0) {
      console.log(`  Admins:`);
      for (const admin of school.admins) {
        console.log(`    - ${admin.email} (added ${admin.createdAt.toISOString()})`);
      }
    } else {
      console.log(`  Admins:     (none)`);
    }
    console.log();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to list schools:", err);
  process.exit(1);
});
