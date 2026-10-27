import type { GameState } from "../../../shared/rules";
import { addDays, streak, bestStreak } from "../../../shared/rules";
import { ALL_QUESTIONS, LESSONS, UNITS } from "./index";
import type { Question } from "../types";
import { rng } from "../../lib/pixel";

// ── Boss fights = timed mock exams ───────────────────────────────────────
export interface Boss {
  id: string;
  name: string;
  mob: string;
  emoji: string;
  exam: 1 | 2 | 3 | "all";
  questions: number;
  minutes: number;
  hearts: number;
  blurb: string;
}

export const BOSSES: Boss[] = [
  { id: "exam1", name: "Exam 1: Foundations", mob: "The Warden", emoji: "🌑", exam: 1, questions: 12, minutes: 40, hearts: 5, blurb: "Functions, lines, exponentials, inverses, logs, polynomials and rational functions." },
  { id: "exam2", name: "Exam 2: Limits & Derivatives", mob: "The Wither", emoji: "💀", exam: 2, questions: 15, minutes: 50, hearts: 5, blurb: "Limits, continuity, asymptotes, the limit definition, derivative rules, sign charts, concavity, f′ graphs, tangent lines, piecewise smoothness. Modeled on the Sept 2025 and Feb 2026 Test 2 papers." },
  { id: "final", name: "The Final", mob: "Ender Dragon", emoji: "🐉", exam: "all", questions: 20, minutes: 75, hearts: 6, blurb: "Everything, A to Z: chain rule, applications, L'Hôpital and integrals included." },
  { id: "speed", name: "Speedrun (10 quick ones)", mob: "Blaze", emoji: "🔥", exam: "all", questions: 10, minutes: 12, hearts: 3, blurb: "Warm-up level questions only. Perfect for a 15-minute ADHD sprint." },
];

/** Picks a fresh, balanced set: exam-style first, spread across units, mixed difficulty. */
export function bossQuestions(boss: Boss, seed: number): Question[] {
  const r = rng(seed);
  const pool = ALL_QUESTIONS.filter(({ q, unit }) => {
    if (boss.id === "speed") return q.level === 1;
    if (boss.exam === "all") return q.level >= 2;
    return unit.exam === boss.exam && q.level >= 2;
  });
  const shuffled = [...pool].sort(() => r() - 0.5);
  shuffled.sort((a, b) => Number(Boolean(b.q.exam)) - Number(Boolean(a.q.exam)) || 0);
  const perUnit = new Map<string, number>();
  const cap = Math.max(2, Math.ceil(boss.questions / Math.max(1, new Set(pool.map((p) => p.unit.id)).size)) + 1);
  const picked: Question[] = [];
  for (const { q, unit } of shuffled) {
    if (picked.length >= boss.questions) break;
    const n = perUnit.get(unit.id) ?? 0;
    if (n >= cap) continue;
    perUnit.set(unit.id, n + 1);
    picked.push(q);
  }
  for (const { q } of shuffled) {
    if (picked.length >= boss.questions) break;
    if (!picked.includes(q)) picked.push(q);
  }
  return picked.sort(() => r() - 0.5);
}

// ── Mastery ──────────────────────────────────────────────────────────────
export function lessonMastery(state: GameState, lessonId: string): number {
  const ref = LESSONS.find((l) => l.lesson.id === lessonId);
  if (!ref) return 0;
  const qs = [...ref.lesson.blocks.flatMap((b) => (b.k === "check" ? [b.q] : [])), ...ref.lesson.questions];
  if (!qs.length) return state.lessons[lessonId] ? 1 : 0;
  const solved = qs.filter((q) => (state.questions[q.id]?.c ?? 0) > 0).length;
  const read = state.lessons[lessonId] ? 0.25 : 0;
  return Math.min(1, read + (0.75 * solved) / qs.length);
}

export function unitMastery(state: GameState, unitId: string): number {
  const u = UNITS.find((x) => x.id === unitId);
  if (!u) return 0;
  return u.lessons.reduce((s, l) => s + lessonMastery(state, l.id), 0) / u.lessons.length;
}

export function courseMastery(state: GameState): number {
  return UNITS.reduce((s, u) => s + unitMastery(state, u.id), 0) / UNITS.length;
}

/** Questions due for spaced review (got wrong recently, or their timer came up). */
export function dueReview(state: GameState, now = Date.now()): Question[] {
  const byId = new Map(ALL_QUESTIONS.map(({ q }) => [q.id, q]));
  return Object.entries(state.questions)
    .filter(([id, s]) => byId.has(id) && s.due <= now)
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due)
    .map(([id]) => byId.get(id)!)
    .slice(0, 30);
}

/** Lessons you haven't finished, in course order. */
export function nextUp(state: GameState) {
  return LESSONS.find((l) => !state.lessons[l.lesson.id]) ?? LESSONS[LESSONS.length - 1]!;
}

// ── Daily quests (3 per day, small on purpose: small wins build streaks) ─
export interface Quest { id: string; emoji: string; title: string; goal: number; progress: number; unit: string }

export function dailyQuests(state: GameState, day: string): Quest[] {
  const log = state.days[day];
  const answered = log?.answered ?? 0;
  const correct = log?.correct ?? 0;
  const minutes = log?.minutes ?? 0;
  const lessons = log?.lessons ?? 0;
  const s = state.settings;
  const r = rng(Number(day.replace(/-/g, "")));
  const variants: Quest[] = [
    { id: "lesson", emoji: "📖", title: "Finish 1 lesson", goal: 1, progress: lessons, unit: "lesson" },
    { id: "streak5", emoji: "🎯", title: "Get 5 questions right", goal: 5, progress: correct, unit: "correct" },
    { id: "review", emoji: "🔁", title: "Answer 8 questions (any!)", goal: 8, progress: answered, unit: "answered" },
  ];
  const third = variants[Math.floor(r() * variants.length)]!;
  return [
    { id: "focus", emoji: "🔥", title: `Focus for ${s.dailyGoalMinutes} minutes`, goal: s.dailyGoalMinutes, progress: minutes, unit: "min" },
    { id: "questions", emoji: "⚔️", title: `Answer ${s.dailyGoalQuestions} questions`, goal: s.dailyGoalQuestions, progress: answered, unit: "answered" },
    third,
  ];
}

// ── Advancements (achievements) ─────────────────────────────────────────
export interface Advancement { id: string; title: string; desc: string; icon: "star" | "diamond" | "flame" | "book" | "sword" | "dragon" | "emerald" | "heart" | "clock" | "potion"; test: (s: GameState) => boolean }

const totalCorrect = (s: GameState) => Object.values(s.questions).reduce((n, q) => n + q.c, 0);
const unitDone = (s: GameState, id: string) => UNITS.find((u) => u.id === id)!.lessons.every((l) => s.lessons[l.id]);
const minutesTotal = (s: GameState) => Object.values(s.days).reduce((n, d) => n + d.minutes, 0);

export const ADVANCEMENTS: Advancement[] = [
  { id: "first-blood", title: "Getting an Upgrade", desc: "Answer your first question right", icon: "star", test: (s) => totalCorrect(s) >= 1 },
  { id: "first-lesson", title: "Stone Age", desc: "Finish your first lesson", icon: "book", test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: "ten-right", title: "Acquire Hardware", desc: "Get 10 questions right", icon: "sword", test: (s) => totalCorrect(s) >= 10 },
  { id: "fifty-right", title: "Diamonds!", desc: "Get 50 questions right", icon: "diamond", test: (s) => totalCorrect(s) >= 50 },
  { id: "two-hundred", title: "Cover Me with Diamonds", desc: "Get 200 questions right", icon: "diamond", test: (s) => totalCorrect(s) >= 200 },
  { id: "streak3", title: "Hot Stuff", desc: "3-day streak", icon: "flame", test: (s) => bestStreak(s.days) >= 3 },
  { id: "streak7", title: "Sky's the Limit", desc: "7-day streak", icon: "flame", test: (s) => bestStreak(s.days) >= 7 },
  { id: "streak30", title: "Serious Dedication", desc: "30-day streak", icon: "flame", test: (s) => bestStreak(s.days) >= 30 },
  { id: "focus60", title: "Smelting Time", desc: "60 focus minutes total", icon: "clock", test: (s) => minutesTotal(s) >= 60 },
  { id: "focus600", title: "Ten Hours of Fire", desc: "600 focus minutes total", icon: "clock", test: (s) => minutesTotal(s) >= 600 },
  { id: "limits", title: "We Need to Go Deeper", desc: "Finish the Limits unit", icon: "potion", test: (s) => unitDone(s, "u6") },
  { id: "derivative", title: "Return to Sender", desc: "Finish The Derivative unit", icon: "emerald", test: (s) => unitDone(s, "u10") },
  { id: "rules", title: "Enchanter", desc: "Finish Derivative Rules", icon: "book", test: (s) => unitDone(s, "u11") },
  { id: "exam2ready", title: "Monster Hunter", desc: "Finish every Exam 2 unit", icon: "sword", test: (s) => UNITS.filter((u) => u.exam === 2).every((u) => unitDone(s, u.id)) },
  { id: "all", title: "The End?", desc: "Finish every lesson in Calc 1", icon: "dragon", test: (s) => LESSONS.every((l) => s.lessons[l.lesson.id]) },
  { id: "comeback", title: "Total Beelocation", desc: "Study on a day after missing one", icon: "heart", test: (s) => Object.keys(s.days).some((d) => s.days[d]!.xp > 0 && !s.days[addDays(d, -1)] && Object.keys(s.days).some((x) => x < addDays(d, -1))) },
];

export function unlockedAdvancements(s: GameState): string[] {
  return ADVANCEMENTS.filter((a) => a.test(s)).map((a) => a.id);
}

export { streak };
