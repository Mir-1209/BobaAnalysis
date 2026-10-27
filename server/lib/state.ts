import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable, lessonProgressTable, questionStatsTable, dayLogsTable, assignmentsTable } from "../db/index.js";
import { DEFAULT_SETTINGS, applyEvent, emptyDay, addDays, dayKey, type GameEvent, type GameState, type Settings, type DayLog, type QuestionStat } from "../../shared/rules.js";
import { HttpError } from "./http.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const id = z.string().regex(/^[A-Za-z0-9:_.-]{1,96}$/, "bad id");
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "bad day");

export const eventSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("answer"), q: id, ok: z.boolean(), day, at: z.number().int().optional() }),
  z.object({ t: z.literal("lesson"), id, day, at: z.number().int().optional() }),
  z.object({ t: z.literal("focus"), minutes: z.number().min(0).max(180), day, at: z.number().int().optional() }),
]);

export const settingsSchema = z.object({
  theme: z.string().regex(/^[a-z-]{1,30}$/),
  font: z.enum(["pixel", "readable", "dyslexic"]),
  sound: z.boolean(),
  motion: z.boolean(),
  dailyGoalMinutes: z.number().int().min(5).max(600),
  dailyGoalQuestions: z.number().int().min(1).max(500),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  exams: z.array(z.object({ id, course: z.string().max(60), name: z.string().min(1).max(80), date: day })).max(40),
  displayName: z.string().max(60),
}).partial();

export const assignmentSchema = z.object({
  id,
  course: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  due: z.string().max(40).nullable(),
  done: z.boolean(),
  kind: z.string().max(20),
});

export const dayPatchSchema = z.object({
  mood: z.number().int().min(1).max(5).nullable(),
  energy: z.number().int().min(1).max(5).nullable(),
  note: z.string().max(4000),
  done: z.array(z.string().max(40)).max(50),
}).partial();

export function fullSettings(s: Partial<Settings> | null | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(s ?? {}), exams: s?.exams ?? [] };
}

/** Only accept event days close to "now" so nobody (or a stale tab) backfills a fake streak. */
export function assertRecentDay(d: string): void {
  const today = dayKey(new Date());
  if (d < addDays(today, -2) || d > addDays(today, 2)) throw new HttpError(400, "That day is too far from today.", "bad_day");
}

function toDayLog(r: typeof dayLogsTable.$inferSelect): DayLog {
  return { minutes: r.minutes, xp: r.xp, answered: r.answered, correct: r.correct, lessons: r.lessons, mood: r.mood, energy: r.energy, note: r.note, done: r.done };
}

function toStat(r: typeof questionStatsTable.$inferSelect): QuestionStat {
  return { a: r.attempts, c: r.correct, box: r.box, due: r.dueAt.getTime(), last: r.lastAt.getTime() };
}

export async function loadState(userId: string, sinceDays = 400): Promise<GameState> {
  const since = addDays(dayKey(), -sinceDays);
  const [[user], lessons, stats, days, assignments] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, userId)),
    db.select().from(lessonProgressTable).where(eq(lessonProgressTable.userId, userId)),
    db.select().from(questionStatsTable).where(eq(questionStatsTable.userId, userId)),
    db.select().from(dayLogsTable).where(and(eq(dayLogsTable.userId, userId), gte(dayLogsTable.day, since))),
    db.select().from(assignmentsTable).where(eq(assignmentsTable.userId, userId)).orderBy(assignmentsTable.createdAt),
  ]);
  if (!user) throw new HttpError(404, "Account not found");
  return {
    xp: user.xp,
    lessons: Object.fromEntries(lessons.map((l) => [l.lessonId, l.completedAt.getTime()])),
    questions: Object.fromEntries(stats.map((s) => [s.questionId, toStat(s)])),
    days: Object.fromEntries(days.map((d) => [d.day, toDayLog(d)])),
    assignments: assignments.map((a) => ({ id: a.id, course: a.course, title: a.title, due: a.due, done: a.done, kind: a.kind })),
    settings: fullSettings(user.settings),
  };
}

/**
 * Runs a batch of events through the shared rules and writes only the rows they touched.
 * Rows are locked (SELECT … FOR UPDATE) so two tabs answering at once can't lose XP.
 */
export async function applyEvents(userId: string, events: GameEvent[]): Promise<{ xp: number; gained: number }> {
  return db.transaction(async (tx) => {
    const [user] = await tx.select({ xp: usersTable.xp }).from(usersTable).where(eq(usersTable.id, userId)).for("update");
    if (!user) throw new HttpError(404, "Account not found");

    const qIds = [...new Set(events.flatMap((e) => (e.t === "answer" ? [e.q] : [])))];
    const lIds = [...new Set(events.flatMap((e) => (e.t === "lesson" ? [e.id] : [])))];
    const dKeys = [...new Set(events.map((e) => e.day))];

    let state: GameState = {
      xp: user.xp,
      lessons: {},
      questions: {},
      days: {},
      assignments: [],
      settings: DEFAULT_SETTINGS,
    };
    if (qIds.length) {
      const rows = await tx.select().from(questionStatsTable).where(and(eq(questionStatsTable.userId, userId), inArray(questionStatsTable.questionId, qIds))).for("update");
      for (const r of rows) state.questions[r.questionId] = toStat(r);
    }
    if (lIds.length) {
      const rows = await tx.select().from(lessonProgressTable).where(and(eq(lessonProgressTable.userId, userId), inArray(lessonProgressTable.lessonId, lIds)));
      for (const r of rows) state.lessons[r.lessonId] = r.completedAt.getTime();
    }
    const dRows = await tx.select().from(dayLogsTable).where(and(eq(dayLogsTable.userId, userId), inArray(dayLogsTable.day, dKeys))).for("update");
    for (const r of dRows) state.days[r.day] = toDayLog(r);

    const now = Date.now();
    for (const e of events) state = applyEvent(state, { ...e, at: now });

    await writeTouched(tx, userId, state, qIds, lIds, dKeys);
    await tx.update(usersTable).set({ xp: state.xp }).where(eq(usersTable.id, userId));
    return { xp: state.xp, gained: state.xp - user.xp };
  });
}

async function writeTouched(tx: Tx, userId: string, state: GameState, qIds: string[], lIds: string[], dKeys: string[]) {
  const stats = qIds.map((q) => {
    const s = state.questions[q]!;
    return { userId, questionId: q, attempts: s.a, correct: s.c, box: s.box, dueAt: new Date(s.due), lastAt: new Date(s.last) };
  });
  if (stats.length) {
    await tx.insert(questionStatsTable).values(stats).onConflictDoUpdate({
      target: [questionStatsTable.userId, questionStatsTable.questionId],
      set: {
        attempts: sql`excluded.attempts`,
        correct: sql`excluded.correct`,
        box: sql`excluded.box`,
        dueAt: sql`excluded.due_at`,
        lastAt: sql`excluded.last_at`,
      },
    });
  }
  const lessons = lIds.filter((l) => state.lessons[l]).map((l) => ({ userId, lessonId: l, completedAt: new Date(state.lessons[l]!) }));
  if (lessons.length) await tx.insert(lessonProgressTable).values(lessons).onConflictDoNothing();
  const days = dKeys.map((d) => ({ userId, day: d, ...(state.days[d] ?? emptyDay()) }));
  if (days.length) {
    await tx.insert(dayLogsTable).values(days).onConflictDoUpdate({
      target: [dayLogsTable.userId, dayLogsTable.day],
      set: {
        minutes: sql`excluded.minutes`,
        xp: sql`excluded.xp`,
        answered: sql`excluded.answered`,
        correct: sql`excluded.correct`,
        lessons: sql`excluded.lessons`,
      },
    });
  }
}

/** Writes a whole (merged) state. Used once, when a guest's progress moves into a new account. */
export async function replaceState(userId: string, state: GameState): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(usersTable).set({ xp: state.xp }).where(eq(usersTable.id, userId));
    const stats = Object.entries(state.questions).map(([q, s]) => ({ userId, questionId: q, attempts: s.a, correct: s.c, box: s.box, dueAt: new Date(s.due), lastAt: new Date(s.last || Date.now()) }));
    for (let i = 0; i < stats.length; i += 500) {
      await tx.insert(questionStatsTable).values(stats.slice(i, i + 500)).onConflictDoUpdate({
        target: [questionStatsTable.userId, questionStatsTable.questionId],
        set: { attempts: sql`excluded.attempts`, correct: sql`excluded.correct`, box: sql`excluded.box`, dueAt: sql`excluded.due_at`, lastAt: sql`excluded.last_at` },
      });
    }
    const lessons = Object.entries(state.lessons).map(([l, at]) => ({ userId, lessonId: l, completedAt: new Date(at) }));
    if (lessons.length) await tx.insert(lessonProgressTable).values(lessons).onConflictDoNothing();
    const days = Object.entries(state.days).map(([d, log]) => ({ userId, day: d, ...log }));
    for (let i = 0; i < days.length; i += 500) {
      await tx.insert(dayLogsTable).values(days.slice(i, i + 500)).onConflictDoUpdate({
        target: [dayLogsTable.userId, dayLogsTable.day],
        set: { minutes: sql`excluded.minutes`, xp: sql`excluded.xp`, answered: sql`excluded.answered`, correct: sql`excluded.correct`, lessons: sql`excluded.lessons`, mood: sql`excluded.mood`, energy: sql`excluded.energy`, note: sql`excluded.note`, done: sql`excluded.done` },
      });
    }
    const assignments = state.assignments.map((a) => ({ userId, ...a }));
    if (assignments.length) await tx.insert(assignmentsTable).values(assignments).onConflictDoNothing();
  });
}

export const importSchema = z.object({
  xp: z.number().int().min(0).max(10_000_000),
  lessons: z.record(id, z.number()),
  questions: z.record(id, z.object({ a: z.number().int().min(0), c: z.number().int().min(0), box: z.number().int().min(0).max(5), due: z.number(), last: z.number() })),
  days: z.record(day, z.object({
    minutes: z.number().int().min(0).max(1440),
    xp: z.number().int().min(0),
    answered: z.number().int().min(0),
    correct: z.number().int().min(0),
    lessons: z.number().int().min(0),
    mood: z.number().int().min(1).max(5).nullable(),
    energy: z.number().int().min(1).max(5).nullable(),
    note: z.string().max(4000),
    done: z.array(z.string().max(40)).max(50),
  })),
  assignments: z.array(assignmentSchema).max(500),
});
