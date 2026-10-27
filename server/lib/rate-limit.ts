import type { Request, Response, NextFunction } from "express";
import { sql } from "drizzle-orm";
import { db, rateLimitsTable } from "../db/index.js";
import { HttpError, clientIp } from "./http.js";

/**
 * Fixed-window counter in Postgres so the limit holds across all serverless instances.
 * Returns true when the request is allowed.
 */
export async function hit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const [row] = await db
    .insert(rateLimitsTable)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: rateLimitsTable.key,
      set: {
        count: sql`CASE WHEN ${rateLimitsTable.windowStart} = ${windowStart} THEN ${rateLimitsTable.count} + 1 ELSE 1 END`,
        windowStart,
      },
    })
    .returning({ count: rateLimitsTable.count });
  return (row?.count ?? 1) <= limit;
}

export async function assertLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  if (!(await hit(key, limit, windowSeconds))) {
    throw new HttpError(429, "Slow down a little — try again in a minute.", "rate_limited");
  }
}

export function rateLimit(name: string, limit: number, windowSeconds: number, by: "ip" | "user" = "ip") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const who = by === "user" && req.user ? `u:${req.user.id}` : `ip:${clientIp(req)}`;
    await assertLimit(`${name}:${who}`, limit, windowSeconds);
    next();
  };
}
