import type { Settings } from "../../shared/rules.js";

interface FeedInput {
  userId: string;
  settings: Settings;
  assignments: Array<{ id: string; course: string; title: string; due: string | null; done: boolean; kind: string }>;
  appUrl: string;
  now?: Date;
}

/** RFC 5545 text escaping. */
export function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** Lines longer than 75 octets must be folded. Count UTF-8 bytes and never split a character. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > 74) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n");
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const ymd = (s: string) => s.slice(0, 10).replace(/-/g, "");

function nextDay(s: string): string {
  const d = new Date(`${s.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function buildCalendar({ userId, settings, assignments, appUrl, now = new Date() }: FeedInput): string {
  const dtstamp = stamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyCraft//Study Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:StudyCraft ⛏",
    "X-WR-CALDESC:Daily study blocks\\, exams and due dates from StudyCraft",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ];
  const event = (uid: string, props: string[]) => lines.push("BEGIN:VEVENT", `UID:${uid}@studycraft`, `DTSTAMP:${dtstamp}`, ...props, "END:VEVENT");
  const alarm = (minutes: number, text: string) => ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(text)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM"];

  // Daily study block, as floating local time so it follows whatever timezone your calendar is in.
  const [hh, mm] = settings.reminderTime.split(":");
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  const startDay = start.toISOString().slice(0, 10).replace(/-/g, "");
  const dur = Math.max(15, Math.min(240, settings.dailyGoalMinutes));
  event(`daily-${userId}`, [
    `DTSTART:${startDay}T${hh}${mm}00`,
    `DURATION:PT${dur}M`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${esc("⛏ Study block: mine some XP")}`,
    `DESCRIPTION:${esc(`Today's quests are waiting. Even 10 minutes keeps the streak alive.\n${appUrl}/home`)}`,
    `URL:${appUrl}/home`,
    ...alarm(0, "Time to study! Open StudyCraft."),
  ]);

  for (const ex of settings.exams) {
    event(`exam-${ex.id}-${userId}`, [
      `DTSTART;VALUE=DATE:${ymd(ex.date)}`,
      `DTEND;VALUE=DATE:${nextDay(ex.date)}`,
      `SUMMARY:${esc(`🐉 BOSS FIGHT: ${ex.course} ${ex.name}`)}`,
      `DESCRIPTION:${esc(`Exam day. Warm up with the cheat sheet: ${appUrl}/calc/cheatsheet`)}`,
      ...alarm(60 * 24 * 7, `${ex.name} is in one week. Start the boss-fight practice.`),
      ...alarm(60 * 24, `${ex.name} is tomorrow. Review your weak spots.`),
    ]);
  }

  for (const a of assignments) {
    if (!a.due || a.done) continue;
    const hasTime = /T\d{2}:\d{2}/.test(a.due);
    const when = hasTime
      ? [`DTSTART:${a.due.slice(0, 16).replace(/[-:]/g, "")}00`, "DURATION:PT30M"]
      : [`DTSTART;VALUE=DATE:${ymd(a.due)}`, `DTEND;VALUE=DATE:${nextDay(a.due)}`];
    event(`a-${a.id}-${userId}`, [...when, `SUMMARY:${esc(`📜 Due: ${a.course} · ${a.title}`)}`, ...alarm(60 * 24, `${a.title} is due tomorrow.`)]);
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
