import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

// Vercel's Neon/Postgres integrations expose POSTGRES_URL; accept either.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  // Don't crash on import: the API still boots and /api/healthz reports the database as down.
  console.error("DATABASE_URL is not set. Connect a Postgres database (Vercel → Storage → Neon).");
}

// Serverless-friendly: few connections per instance, released quickly.
// On Vercel, point DATABASE_URL at a pooled endpoint (e.g. Neon's "-pooler" host).
export const pool = new Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});
export const db = drizzle(pool, { schema });

export * from "./schema.js";
