/**
 * Create a new school.
 *
 * Usage:
 *   npx tsx scripts/create-school.ts --name "ORT Rehovot" --slug "ort-rehovot"
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function parseArgs(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i + 1]) {
      parsed[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.name || !args.slug) {
    console.error(
      'Usage: npx tsx scripts/create-school.ts --name "School Name" --slug "school-slug"'
    );
    process.exit(1);
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(args.slug)) {
    console.error(
      "Slug must be lowercase alphanumeric with hyphens (e.g., ort-rehovot)"
    );
    process.exit(1);
  }

  try {
    const [school] = await db
      .insert(schema.schools)
      .values({
        name: args.name,
        slug: args.slug,
      })
      .returning();

    console.log("School created successfully!");
    console.log(`  ID:   ${school.id}`);
    console.log(`  Name: ${school.name}`);
    console.log(`  Slug: ${school.slug}`);
    console.log(`  URL:  /school/${school.slug}`);
  } catch (err: any) {
    if (err.code === "23505") {
      console.error(`A school with slug "${args.slug}" already exists.`);
    } else {
      throw err;
    }
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create school:", err);
  process.exit(1);
});
