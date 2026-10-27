// Applies pending SQL migrations from ./drizzle. Runs before every Vercel build.
// Skips quietly when no database is configured (e.g. a first preview deploy).
import { existsSync } from "node:fs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

if (existsSync(".env") && process.loadEnvFile) process.loadEnvFile(".env");
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.warn("⚠ No DATABASE_URL — skipping migrations. Connect a database in Vercel → Storage, then redeploy.");
  process.exit(0);
}
const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("✓ Database migrations applied");
} finally {
  await pool.end();
}
