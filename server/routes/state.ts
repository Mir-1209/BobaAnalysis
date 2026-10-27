import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable, dayLogsTable, assignmentsTable } from "../db/index.js";
import { parse, HttpError } from "../lib/http.js";
import { me } from "../lib/session.js";
import { rateLimit } from "../lib/rate-limit.js";
import { mergeStates, emptyDay, isDay } from "../../shared/rules.js";
import { applyEvents, assertRecentDay, assignmentSchema, dayPatchSchema, eventSchema, fullSettings, importSchema, loadState, replaceState, settingsSchema } from "../lib/state.js";

const router: IRouter = Router();

router.get("/state", async (req, res) => {
  res.json({ state: await loadState(me(req).id) });
});

/** The browser batches answers, finished lessons and focus minutes and sends them here. */
router.post("/events", rateLimit("events", 240, 60, "user"), async (req, res) => {
  const { events } = parse(z.object({ events: z.array(eventSchema).min(1).max(200) }), req.body);
  for (const e of events) assertRecentDay(e.day);
  res.json(await applyEvents(me(req).id, events));
});

/** One-time move of guest progress (kept in the browser) into the account. */
router.post("/import", rateLimit("import", 10, 3600, "user"), async (req, res) => {
  const user = me(req);
  const incoming = parse(importSchema, req.body);
  const current = await loadState(user.id, 4000);
  const merged = mergeStates(current, { ...incoming, settings: current.settings });
  await replaceState(user.id, merged);
  res.json({ state: await loadState(user.id) });
});

router.put("/settings", async (req, res) => {
  const user = me(req);
  const patch = parse(settingsSchema, req.body);
  const settings = fullSettings({ ...user.settings, ...patch });
  await db.update(usersTable).set({ settings }).where(eq(usersTable.id, user.id));
  res.json({ settings });
});

/** Daily tracker check-in: mood, energy, note, ticked checklist items. */
router.put("/days/:day", async (req, res) => {
  const user = me(req);
  const day = String(req.params.day);
  if (!isDay(day)) throw new HttpError(400, "Bad day");
  const patch = parse(dayPatchSchema, req.body);
  const row = { userId: user.id, day, ...emptyDay(), ...patch };
  await db
    .insert(dayLogsTable)
    .values(row)
    .onConflictDoUpdate({
      target: [dayLogsTable.userId, dayLogsTable.day],
      set: {
        ...(patch.mood !== undefined ? { mood: sql`excluded.mood` } : {}),
        ...(patch.energy !== undefined ? { energy: sql`excluded.energy` } : {}),
        ...(patch.note !== undefined ? { note: sql`excluded.note` } : {}),
        ...(patch.done !== undefined ? { done: sql`excluded.done` } : {}),
      },
    });
  res.status(204).end();
});

router.put("/assignments/:id", async (req, res) => {
  const user = me(req);
  const a = parse(assignmentSchema, { ...req.body, id: req.params.id });
  const [{ count } = { count: 0 }] = await db.select({ count: sql<number>`count(*)::int` }).from(assignmentsTable).where(eq(assignmentsTable.userId, user.id));
  if (count >= 1000) throw new HttpError(400, "That's a lot of assignments. Clear some finished ones first.");
  await db
    .insert(assignmentsTable)
    .values({ userId: user.id, ...a })
    .onConflictDoUpdate({ target: [assignmentsTable.userId, assignmentsTable.id], set: { course: a.course, title: a.title, due: a.due, done: a.done, kind: a.kind } });
  res.status(204).end();
});

router.delete("/assignments/:id", async (req, res) => {
  const user = me(req);
  await db.delete(assignmentsTable).where(and(eq(assignmentsTable.userId, user.id), eq(assignmentsTable.id, String(req.params.id))));
  res.status(204).end();
});

/** Download everything we store about you, as JSON. */
router.get("/export", async (req, res) => {
  const user = me(req);
  const state = await loadState(user.id, 100_000);
  res.setHeader("Content-Disposition", 'attachment; filename="studycraft-export.json"');
  res.json({ exportedAt: new Date().toISOString(), account: { email: user.email, name: user.name, createdAt: user.createdAt }, ...state });
});

export default router;
