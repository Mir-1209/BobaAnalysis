import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable } from "../db/index.js";
import { fakeVerify, hashPassword, newId, randomToken, verifyPassword } from "../lib/crypto.js";
import { HttpError, parse, clientIp } from "../lib/http.js";
import { assertLimit } from "../lib/rate-limit.js";
import { createSession, destroySession, revokeOtherSessions, publicUser, me, requireAuth } from "../lib/session.js";

const router: IRouter = Router();

const email = z.string().trim().toLowerCase().email("That email doesn't look right").max(254);
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(200, "That's a bit long")
  .refine((p) => !/^(.)\1+$/.test(p) && !/^(password|12345678|qwertyui)/i.test(p), "Pick something harder to guess");

router.get("/auth/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.post("/auth/signup", async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(1, "What should we call you?").max(60), email, password }), req.body);
  await assertLimit(`signup:${clientIp(req)}`, 8, 3600);
  const [exists] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, body.email));
  if (exists) throw new HttpError(409, "There's already an account with that email. Sign in instead?", "email_taken");
  const [user] = await db
    .insert(usersTable)
    .values({ id: newId(), email: body.email, name: body.name, passwordHash: await hashPassword(body.password), calendarKey: randomToken(24), settings: { displayName: body.name } })
    .returning();
  await createSession(req, res, user!.id);
  res.status(201).json({ user: publicUser(user!) });
});

router.post("/auth/signin", async (req, res) => {
  const body = parse(z.object({ email, password: z.string().min(1).max(200) }), req.body);
  await assertLimit(`signin-ip:${clientIp(req)}`, 30, 900);
  await assertLimit(`signin-email:${body.email}`, 10, 900);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
  const ok = user ? await verifyPassword(body.password, user.passwordHash) : await fakeVerify(body.password);
  if (!user || !ok) throw new HttpError(401, "Wrong email or password.", "bad_credentials");
  await createSession(req, res, user.id);
  res.json({ user: publicUser(user) });
});

router.post("/auth/signout", async (req, res) => {
  await destroySession(req, res);
  res.status(204).end();
});

router.post("/auth/password", requireAuth, async (req, res) => {
  const user = me(req);
  const body = parse(z.object({ current: z.string().min(1).max(200), next: password }), req.body);
  await assertLimit(`pw:${user.id}`, 10, 900);
  if (!(await verifyPassword(body.current, user.passwordHash))) throw new HttpError(401, "Your current password isn't right.", "bad_credentials");
  await db.update(usersTable).set({ passwordHash: await hashPassword(body.next) }).where(eq(usersTable.id, user.id));
  await revokeOtherSessions(user.id, req.sessionId);
  res.status(204).end();
});

router.delete("/auth/account", requireAuth, async (req, res) => {
  const user = me(req);
  const body = parse(z.object({ password: z.string().min(1).max(200) }), req.body);
  if (!(await verifyPassword(body.password, user.passwordHash))) throw new HttpError(401, "That password isn't right.", "bad_credentials");
  await destroySession(req, res);
  // Every other table cascades from users.
  await db.delete(usersTable).where(eq(usersTable.id, user.id));
  res.status(204).end();
});

export default router;
