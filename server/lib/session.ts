import type { Request, Response, NextFunction, CookieOptions } from "express";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, sessionsTable, usersTable, type User } from "../db/index.js";
import { env } from "./env.js";
import { randomToken, sha256 } from "./crypto.js";
import { HttpError, clientIp } from "./http.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

// `__Host-` prefix forces Secure + Path=/ + no Domain, so subdomains can't plant or read it.
export const SESSION_COOKIE = env.isProd ? "__Host-sc_session" : "sc_session";
const SESSION_DAYS = 60;
const DAY = 86_400_000;

const cookieBase: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax",
  path: "/",
};

export async function createSession(req: Request, res: Response, userId: string): Promise<void> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
  await db.insert(sessionsTable).values({
    id: sha256(token),
    userId,
    expiresAt,
    userAgent: req.get("user-agent")?.slice(0, 300) ?? null,
    ip: clientIp(req),
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieBase, expires: expiresAt });
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  if (req.sessionId) await db.delete(sessionsTable).where(eq(sessionsTable.id, req.sessionId));
  res.clearCookie(SESSION_COOKIE, cookieBase);
}

export async function revokeOtherSessions(userId: string, exceptId?: string): Promise<void> {
  const rows = await db.select({ id: sessionsTable.id }).from(sessionsTable).where(eq(sessionsTable.userId, userId));
  for (const r of rows) {
    if (r.id !== exceptId) await db.delete(sessionsTable).where(eq(sessionsTable.id, r.id));
  }
}

/** Attaches req.user when a valid session cookie is present. Never rejects. */
export async function loadSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length < 20) return next();
  const id = sha256(token);
  const [row] = await db
    .select({ session: sessionsTable, user: usersTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(and(eq(sessionsTable.id, id), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);
  if (!row) {
    res.clearCookie(SESSION_COOKIE, cookieBase);
    return next();
  }
  req.user = row.user;
  req.sessionId = id;

  // Sliding expiry: refresh once the session is past half-life.
  const remaining = row.session.expiresAt.getTime() - Date.now();
  if (remaining < (SESSION_DAYS / 2) * DAY) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY);
    await db.update(sessionsTable).set({ expiresAt }).where(eq(sessionsTable.id, id));
    res.cookie(SESSION_COOKIE, token, { ...cookieBase, expires: expiresAt });
  }
  const lastActive = row.user.lastActiveAt?.getTime() ?? 0;
  if (Date.now() - lastActive > DAY / 4) {
    await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, row.user.id));
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw new HttpError(401, "Sign in to continue.", "unauthenticated");
  next();
}

/** Narrowing helper for handlers mounted behind requireAuth. */
export function me(req: Request): User {
  if (!req.user) throw new HttpError(401, "Sign in to continue.", "unauthenticated");
  return req.user;
}

export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
}

export function publicUser(u: User) {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt };
}
