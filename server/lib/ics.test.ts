import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCalendar, esc } from "./ics.js";
import { DEFAULT_SETTINGS } from "../../shared/rules.js";

test("escapes commas, semicolons and newlines", () => {
  assert.equal(esc("a,b;c\nd"), String.raw`a\,b\;c\nd`);
});

test("builds a daily block, exams and due dates", () => {
  const ics = buildCalendar({
    userId: "u1",
    settings: { ...DEFAULT_SETTINGS, reminderTime: "18:30", exams: [{ id: "e1", course: "Calc 1", name: "Midterm 2", date: "2026-11-10" }] },
    assignments: [
      { id: "a1", course: "Calc 1", title: "WebWork 7 — chain rule practice with a really long title so this line has to fold 🧮🧮🧮", due: "2026-11-02", done: false, kind: "homework" },
      { id: "a2", course: "Calc 1", title: "Done one", due: "2026-11-01", done: true, kind: "homework" },
    ],
    appUrl: "https://example.com",
    now: new Date("2026-10-27T12:00:00Z"),
  });
  assert.match(ics, /RRULE:FREQ=DAILY/);
  assert.match(ics, /T183000/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261110/);
  assert.match(ics, /DTEND;VALUE=DATE:20261111/);
  assert.match(ics, /WebWork 7/);
  assert.doesNotMatch(ics, /Done one/);
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${line}`);
});
