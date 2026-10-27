import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, assignmentsTable } from "../db/index.js";
import { env } from "../lib/env.js";
import { randomToken } from "../lib/crypto.js";
import { me, requireAuth } from "../lib/session.js";
import { rateLimit } from "../lib/rate-limit.js";
import { fullSettings } from "../lib/state.js";
import { buildCalendar } from "../lib/ics.js";

const router: IRouter = Router();

function feedUrl(key: string) {
  return `${env.appUrl}/api/calendar/${key}.ics`;
}

/**
 * Private calendar feed. Paste the URL into Google Calendar → Other calendars → From URL,
 * and you get a daily study block, every exam and every assignment due date.
 */
router.get("/calendar/:file", rateLimit("ics", 60, 3600), async (req, res) => {
  const key = String(req.params.file).replace(/\.ics$/, "");
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(key)) return void res.status(404).end();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.calendarKey, key));
  if (!user) return void res.status(404).end();
  const assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.userId, user.id));
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Cache-Control", "private, max-age=900");
  res.send(buildCalendar({ userId: user.id, settings: fullSettings(user.settings), assignments, appUrl: env.appUrl }));
});

router.get("/calendar-link", requireAuth, (req, res) => {
  res.json({ url: feedUrl(me(req).calendarKey) });
});

router.post("/calendar-link/rotate", requireAuth, async (req, res) => {
  const key = randomToken(24);
  await db.update(usersTable).set({ calendarKey: key }).where(eq(usersTable.id, me(req).id));
  res.json({ url: feedUrl(key) });
});

export default router;
