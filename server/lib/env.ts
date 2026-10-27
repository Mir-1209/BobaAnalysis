import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  APP_URL: z.string().url().default("http://localhost:5173"),
  SESSION_SECRET: z.string().min(32).optional(),
});

// On Vercel, fall back to the project's production domain so APP_URL is optional.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const result = schema.safeParse({
  ...process.env,
  APP_URL: process.env.APP_URL || (vercelUrl ? `https://${vercelUrl}` : undefined),
});
// A malformed optional value shouldn't take the whole API down; report it instead.
const parsed = result.success ? result.data : schema.parse({});
const invalidConfig = result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")} (${i.message})`);

/** Config the server refuses to run without in production. Requests get a clear 503 instead of a crash. */
export const missingConfig: string[] = [];

if (isProd && !parsed.SESSION_SECRET) missingConfig.push("SESSION_SECRET");
if (isProd && !process.env.DATABASE_URL && !process.env.POSTGRES_URL) missingConfig.push("DATABASE_URL");

export const env = {
  ...parsed,
  isProd,
  appUrl: parsed.APP_URL.replace(/\/$/, ""),
  sessionSecret: parsed.SESSION_SECRET ?? "dev-only-session-secret-not-for-production-use-0000",
};
missingConfig.push(...invalidConfig);
