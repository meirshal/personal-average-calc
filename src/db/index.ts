import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create database connection - fails gracefully at build time when no DATABASE_URL
function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Set it in .env.local or Vercel env vars."
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// We need to handle build-time where DATABASE_URL isn't available.
// Admin routes are dynamic (never pre-rendered).
let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// For backward compat with existing imports: `import { db } from "@/db"`
// This will throw at build time if accessed - that's OK because all routes
// using it are dynamic (not statically generated).
export const db = process.env.DATABASE_URL
  ? createDb()
  : (undefined as unknown as ReturnType<typeof createDb>);
