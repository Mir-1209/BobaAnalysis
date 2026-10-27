import { test } from "node:test";
import assert from "node:assert/strict";
import { applyEvent, emptyState, levelFromXp, streak, bestStreak, mergeStates, emptyDay, addDays, XP } from "./rules.js";

test("a first correct answer earns the bonus, later ones don't", () => {
  let s = emptyState();
  s = applyEvent(s, { t: "answer", q: "q1", ok: true, day: "2026-10-27", at: 1 });
  assert.equal(s.xp, XP.correct + XP.firstCorrect);
  s = applyEvent(s, { t: "answer", q: "q1", ok: true, day: "2026-10-27", at: 2 });
  assert.equal(s.xp, 2 * XP.correct + XP.firstCorrect);
  assert.equal(s.questions.q1!.box, 2);
  assert.equal(s.days["2026-10-27"]!.correct, 2);
});

test("wrong answers still earn effort XP and reset the review box", () => {
  let s = emptyState();
  s = applyEvent(s, { t: "answer", q: "q", ok: true, day: "2026-10-27", at: 0 });
  s = applyEvent(s, { t: "answer", q: "q", ok: false, day: "2026-10-27", at: 0 });
  assert.equal(s.questions.q!.box, 0);
  assert.equal(s.questions.q!.due, 10 * 60_000);
  assert.equal(s.xp, XP.correct + XP.firstCorrect + XP.wrong);
});

test("lessons only pay out once", () => {
  let s = emptyState();
  s = applyEvent(s, { t: "lesson", id: "l1", day: "2026-10-27" });
  s = applyEvent(s, { t: "lesson", id: "l1", day: "2026-10-27" });
  assert.equal(s.xp, XP.lesson);
  assert.equal(s.days["2026-10-27"]!.lessons, 1);
});

test("focus minutes are clamped", () => {
  const s = applyEvent(emptyState(), { t: "focus", minutes: 9999, day: "2026-10-27" });
  assert.equal(s.days["2026-10-27"]!.minutes, 180);
});

test("levels need a bit more XP each time", () => {
  assert.equal(levelFromXp(0).level, 0);
  assert.equal(levelFromXp(99).level, 0);
  assert.equal(levelFromXp(100).level, 1);
  assert.equal(levelFromXp(239).level, 1);
  assert.equal(levelFromXp(240).level, 2);
});

test("streaks count back from today and survive an unfinished today", () => {
  const today = "2026-10-27";
  const on = { ...emptyDay(), xp: 10 };
  const days = { [addDays(today, -1)]: on, [addDays(today, -2)]: on, [addDays(today, -4)]: on };
  assert.equal(streak(days, today), 2);
  assert.equal(streak({ ...days, [today]: on }, today), 3);
  assert.equal(bestStreak({ ...days, [today]: on }), 3);
});

test("addDays crosses months", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("merging keeps the larger counters", () => {
  let a = emptyState();
  a = applyEvent(a, { t: "answer", q: "x", ok: true, day: "2026-10-27" });
  let b = emptyState();
  b = applyEvent(b, { t: "answer", q: "x", ok: false, day: "2026-10-26" });
  b = applyEvent(b, { t: "lesson", id: "l", day: "2026-10-26" });
  const m = mergeStates(a, b);
  assert.equal(m.questions.x!.a, 1);
  assert.ok(m.lessons.l);
  assert.equal(Object.keys(m.days).length, 2);
  assert.ok(m.xp >= a.xp);
});
