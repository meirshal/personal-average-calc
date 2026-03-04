/**
 * Add an admin email to a school.
 *
 * Usage:
 *   npx tsx scripts/add-admin.ts --email teacher@gmail.com --school ort-rehovot
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

  if (!args.email || !args.school) {
    console.error(
      "Usage: npx tsx scripts/add-admin.ts --email <email> --school <slug>"
    );
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(args.email)) {
    console.error("Invalid email format.");
    process.exit(1);
  }

  // Find the school
  const school = await db.query.schools.findFirst({
    where: eq(schema.schools.slug, args.school),
  });

  if (!school) {
    console.error(`School with slug "${args.school}" not found.`);
    process.exit(1);
  }

  const email = args.email.toLowerCase();

  // Find or create admin
  let admin = await db.query.admins.findFirst({
    where: eq(schema.admins.email, email),
  });

  if (!admin) {
    const [created] = await db
      .insert(schema.admins)
      .values({ email })
      .returning();
    admin = created;
  }

  // Check if already associated
  const existing = await db.query.adminSchools.findFirst({
    where: and(
      eq(schema.adminSchools.adminId, admin.id),
      eq(schema.adminSchools.schoolId, school.id)
    ),
  });

  if (existing) {
    console.error(
      `Admin "${email}" already has access to ${school.name} (${school.slug}).`
    );
    process.exit(1);
  }

  // Add admin -> school association
  await db.insert(schema.adminSchools).values({
    adminId: admin.id,
    schoolId: school.id,
  });

  console.log("Admin added successfully!");
  console.log(`  Email:  ${admin.email}`);
  console.log(`  School: ${school.name} (${school.slug})`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to add admin:", err);
  process.exit(1);
});
