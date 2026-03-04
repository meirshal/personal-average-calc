/**
 * Remove an admin by email.
 *
 * Usage:
 *   npx tsx scripts/remove-admin.ts --email teacher@gmail.com
 *   npx tsx scripts/remove-admin.ts --email teacher@gmail.com --school ort-rehovot
 *
 * With --school: removes only the association to that school.
 * Without --school: removes the admin entirely (and all associations).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
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

  if (!args.email) {
    console.error(
      "Usage: npx tsx scripts/remove-admin.ts --email <email> [--school <slug>]"
    );
    process.exit(1);
  }

  const email = args.email.toLowerCase();

  // Check if admin exists
  const admin = await db.query.admins.findFirst({
    where: eq(schema.admins.email, email),
    with: {
      adminSchools: {
        with: { school: true },
      },
    },
  });

  if (!admin) {
    console.error(`No admin found with email "${email}".`);
    process.exit(1);
  }

  if (args.school) {
    // Remove only the association to a specific school
    const school = await db.query.schools.findFirst({
      where: eq(schema.schools.slug, args.school),
    });

    if (!school) {
      console.error(`School with slug "${args.school}" not found.`);
      process.exit(1);
    }

    const deleted = await db
      .delete(schema.adminSchools)
      .where(
        and(
          eq(schema.adminSchools.adminId, admin.id),
          eq(schema.adminSchools.schoolId, school.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      console.error(
        `Admin "${email}" is not associated with ${school.name} (${school.slug}).`
      );
      process.exit(1);
    }

    console.log("Admin school association removed successfully!");
    console.log(`  Email:  ${admin.email}`);
    console.log(`  School: ${school.name} (${school.slug})`);
  } else {
    // Remove the admin entirely (cascade deletes adminSchools rows)
    await db.delete(schema.admins).where(eq(schema.admins.email, email));

    console.log("Admin removed successfully!");
    console.log(`  Email:  ${admin.email}`);
    if (admin.adminSchools.length > 0) {
      console.log(`  Schools removed from:`);
      for (const as of admin.adminSchools) {
        console.log(`    - ${as.school.name} (${as.school.slug})`);
      }
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to remove admin:", err);
  process.exit(1);
});
