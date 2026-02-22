/**
 * Remove an admin by email.
 *
 * Usage:
 *   npx tsx scripts/remove-admin.ts --email teacher@gmail.com
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
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
      "Usage: npx tsx scripts/remove-admin.ts --email <email>"
    );
    process.exit(1);
  }

  const email = args.email.toLowerCase();

  // Check if admin exists
  const admin = await db.query.admins.findFirst({
    where: eq(schema.admins.email, email),
    with: { school: true },
  });

  if (!admin) {
    console.error(`No admin found with email "${email}".`);
    process.exit(1);
  }

  await db.delete(schema.admins).where(eq(schema.admins.email, email));

  console.log("Admin removed successfully!");
  console.log(`  Email:  ${admin.email}`);
  console.log(`  School: ${admin.school.name} (${admin.school.slug})`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to remove admin:", err);
  process.exit(1);
});
