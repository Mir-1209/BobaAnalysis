// The game rules, shared by the browser (guest mode + instant feedback) and the API (source of truth
// for signed-in accounts). Pure functions only: same input, same output, on both sides.

export type Day = string; // "YYYY-MM-DD" in the student's own timezone

export interface QuestionStat {
  /** attempts */
  a: number;
  /** correct attempts */
  c: number;
  /** Leitner box 0–5. Higher box = you know it better = it comes back later. */
  box: number;
  /** when it should come back for review (epoch ms) */
  due: number;
  /** last attempt (epoch ms) */
  last: number;
}

export interface DayLog {
  minutes: number;
  xp: number;
  answered: number;
  correct: number;
  lessons: number;
  mood: number | null; // 1–5
  energy: number | null; // 1–5
  note: string;
  done: string[]; // ticked daily-checklist item ids
}

export interface Assignment {
  id: string;
  course: string;
  title: string;
  due: string | null; // ISO date or datetime
  done: boolean;
  kind: string; // homework | quiz | exam | project | reading | other
}

export interface Settings {
  theme: string;
  font: "pixel" | "readable" | "dyslexic";
  sound: boolean;
  motion: boolean;
  dailyGoalMinutes: number;
  dailyGoalQuestions: number;
  reminderTime: string; // "HH:MM"
  exams: Array<{ id: string; course: string; name: string; date: string }>;
  displayName: string;
}

export interface GameState {
  xp: number;
  lessons: Record<string, number>; // lessonId → completedAt (epoch ms)
  questions: Record<string, QuestionStat>;
  days: Record<Day, DayLog>;
  assignments: Assignment[];
  settings: Settings;
}

export type GameEvent =
  | { t: "answer"; q: string; ok: boolean; day: Day; at?: number }
  | { t: "lesson"; id: string; day: Day; at?: number }
  | { t: "focus"; minutes: number; day: Day; at?: number };

export const XP = {
  correct: 10,
  firstCorrect: 5, // bonus the first time you ever get a question right
  wrong: 2, // trying counts. Effort XP keeps the dopamine coming even on hard days.
  lesson: 50,
  focusPerMinute: 2,
} as const;

/** Leitner intervals in days for boxes 0..5. Box 0 comes back in 10 minutes. */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16] as const;
const DAY_MS = 86_400_000;

export const DEFAULT_SETTINGS: Settings = {
  theme: "overworld",
  font: "pixel",
  sound: true,
  motion: true,
  dailyGoalMinutes: 25,
  dailyGoalQuestions: 15,
  reminderTime: "19:00",
  exams: [],
  displayName: "",
};

export function emptyState(): GameState {
  return { xp: 0, lessons: {}, questions: {}, days: {}, assignments: [], settings: { ...DEFAULT_SETTINGS, exams: [] } };
}

export function emptyDay(): DayLog {
  return { minutes: 0, xp: 0, answered: 0, correct: 0, lessons: 0, mood: null, energy: null, note: "", done: [] };
}

export function nextStat(prev: QuestionStat | undefined, ok: boolean, now: number): QuestionStat {
  const s = prev ?? { a: 0, c: 0, box: 0, due: 0, last: 0 };
  const box = ok ? Math.min(5, s.box + 1) : 0;
  const due = ok ? now + BOX_DAYS[box]! * DAY_MS : now + 10 * 60_000;
  return { a: s.a + 1, c: s.c + (ok ? 1 : 0), box, due, last: now };
}

/** How much XP an event is worth, given the state before it. */
export function xpFor(state: GameState, e: GameEvent): number {
  switch (e.t) {
    case "answer": {
      if (!e.ok) return XP.wrong;
      const before = state.questions[e.q];
      return XP.correct + (!before || before.c === 0 ? XP.firstCorrect : 0);
    }
    case "lesson":
      return state.lessons[e.id] ? 0 : XP.lesson;
    case "focus":
      return Math.round(clampMinutes(e.minutes)) * XP.focusPerMinute;
  }
}

export function clampMinutes(m: number): number {
  return Math.max(0, Math.min(180, Number.isFinite(m) ? m : 0));
}

/** Applies one event and returns a new state. Never mutates the input. */
export function applyEvent(state: GameState, e: GameEvent): GameState {
  const now = e.at ?? Date.now();
  const gained = xpFor(state, e);
  const day = { ...(state.days[e.day] ?? emptyDay()) };
  day.xp += gained;
  const next: GameState = { ...state, xp: state.xp + gained, days: { ...state.days, [e.day]: day } };
  switch (e.t) {
    case "answer":
      day.answered += 1;
      if (e.ok) day.correct += 1;
      next.questions = { ...state.questions, [e.q]: nextStat(state.questions[e.q], e.ok, now) };
      break;
    case "lesson":
      if (!state.lessons[e.id]) {
        day.lessons += 1;
        next.lessons = { ...state.lessons, [e.id]: now };
      }
      break;
    case "focus":
      day.minutes += Math.round(clampMinutes(e.minutes));
      break;
  }
  return next;
}

// ── Levels: like Minecraft, each level needs a bit more XP than the last ─────
export function levelFromXp(xp: number): { level: number; into: number; need: number; progress: number } {
  let level = 0;
  let floor = 0;
  let need = 100;
  while (xp >= floor + need) {
    floor += need;
    level += 1;
    need = 100 + level * 40;
  }
  const into = xp - floor;
  return { level, into, need, progress: into / need };
}

// ── Dates ────────────────────────────────────────────────────────────────────
export function dayKey(d: Date = new Date()): Day {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function addDays(day: Day, n: number): Day {
  const [y, m, d] = day.split("-").map(Number);
  return dayKey(new Date(y!, m! - 1, d! + n));
}

export function isDay(s: unknown): s is Day {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** A day "counts" toward the streak when you did anything that earned XP. */
export function activeDay(log: DayLog | undefined): boolean {
  return Boolean(log && (log.xp > 0 || log.minutes > 0));
}

/** Current streak, counting back from today. Today not done yet doesn't break it. */
export function streak(days: Record<Day, DayLog>, today: Day = dayKey()): number {
  let n = 0;
  let cursor = activeDay(days[today]) ? today : addDays(today, -1);
  while (activeDay(days[cursor])) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function bestStreak(days: Record<Day, DayLog>): number {
  const keys = Object.keys(days).filter((k) => activeDay(days[k])).sort();
  let best = 0;
  let run = 0;
  let prev: Day | null = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

/** Merges a guest (browser) state into an account state. Keeps the larger of every counter. */
export function mergeStates(a: GameState, b: GameState): GameState {
  const questions: Record<string, QuestionStat> = { ...a.questions };
  for (const [id, s] of Object.entries(b.questions)) {
    const p = questions[id];
    questions[id] = !p ? s : { a: Math.max(p.a, s.a), c: Math.max(p.c, s.c), box: Math.max(p.box, s.box), due: Math.max(p.due, s.due), last: Math.max(p.last, s.last) };
  }
  const lessons: Record<string, number> = { ...a.lessons };
  for (const [id, at] of Object.entries(b.lessons)) lessons[id] = lessons[id] ? Math.min(lessons[id]!, at) : at;
  const days: Record<Day, DayLog> = { ...a.days };
  for (const [k, d] of Object.entries(b.days)) {
    const p = days[k];
    days[k] = !p
      ? d
      : {
          minutes: Math.max(p.minutes, d.minutes),
          xp: Math.max(p.xp, d.xp),
          answered: Math.max(p.answered, d.answered),
          correct: Math.max(p.correct, d.correct),
          lessons: Math.max(p.lessons, d.lessons),
          mood: p.mood ?? d.mood,
          energy: p.energy ?? d.energy,
          note: p.note || d.note,
          done: [...new Set([...p.done, ...d.done])],
        };
  }
  const ids = new Set(a.assignments.map((x) => x.id));
  const dayXp = Object.values(days).reduce((sum, d) => sum + d.xp, 0);
  return {
    xp: Math.max(a.xp, b.xp, dayXp),
    lessons,
    questions,
    days,
    assignments: [...a.assignments, ...b.assignments.filter((x) => !ids.has(x.id))],
    settings: a.settings,
  };
}
