import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Api } from "@/lib/api";
import { Btn, Empty, Panel } from "@/components/ui";
import { Heatmap, daysUntil } from "@/components/widgets";
import { addDays, type Assignment } from "../../shared/rules";

const KINDS = ["homework", "quiz", "exam", "project", "reading", "other"];
const KIND_EMO: Record<string, string> = { homework: "📜", quiz: "❓", exam: "🐉", project: "🏗️", reading: "📖", other: "📦" };
const COURSES = ["Calc 1", "ECS", "Other"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Google Calendar "create event" link: a daily repeating study block using your default notifications. */
export function googleDailyLink(time: string, minutes: number, appUrl: string): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const [h, m] = time.split(":").map(Number);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h!, m! + minutes);
  const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(end.getDate()).padStart(2, "0")}T${String(end.getHours()).padStart(2, "0")}${String(end.getMinutes()).padStart(2, "0")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "⛏ Study block (StudyCraft)",
    details: `Daily quests are waiting. Even 10 minutes keeps the streak alive.\n${appUrl}/home`,
    dates: `${ymd}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00/${endStr}`,
    recur: "RRULE:FREQ=DAILY",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function CalendarPanel() {
  const { user, state, updateSettings } = useStore();
  const [feed, setFeed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (user) Api.calendarLink().then((r) => setFeed(r.url)).catch(() => setFeed(null));
  }, [user]);
  const s = state.settings;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <Panel title="Google Calendar reminders" icon="clock">
      <div className="stack">
        <label className="field" style={{ maxWidth: 260 }}>
          <span>Daily study time</span>
          <input className="input" type="time" value={s.reminderTime} onChange={(e) => updateSettings({ reminderTime: e.target.value })} />
        </label>
        <div>
          <strong>Option 1 · Daily reminder (works right now)</strong>
          <p className="small muted" style={{ margin: "2px 0 6px" }}>Opens Google Calendar with a repeating {s.dailyGoalMinutes}-minute study block. Save it, and your phone will notify you every day using your normal Google Calendar notifications.</p>
          <a className="btn primary sm" href={googleDailyLink(s.reminderTime, s.dailyGoalMinutes, origin)} target="_blank" rel="noopener noreferrer">📅 Add daily reminder to Google Calendar</a>
        </div>
        <div>
          <strong>Option 2 · Live feed: study blocks + exams + due dates</strong>
          {user && feed ? (
            <>
              <p className="small muted" style={{ margin: "2px 0 6px" }}>Subscribe once and Google keeps it updated: every exam you add (with 1-week and 1-day warnings) and every assignment due date shows up automatically. Keep this link private.</p>
              <div className="row" style={{ gap: 4 }}>
                <input className="input mathy grow" readOnly value={feed} onFocus={(e) => e.target.select()} style={{ flex: "1 1 260px", fontSize: 13 }} />
                <Btn size="sm" onClick={() => { void navigator.clipboard?.writeText(feed); setCopied(true); }}>{copied ? "Copied ✓" : "Copy"}</Btn>
              </div>
              <div className="row" style={{ gap: 4, marginTop: 6 }}>
                <a className="btn sm gold" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feed.replace(/^https?:/, "webcal:"))}`} target="_blank" rel="noopener noreferrer">➕ Subscribe in Google Calendar</a>
                <Btn size="sm" kind="ghost" onClick={() => { if (confirm("Make a new link? The old one stops working.")) Api.rotateCalendar().then((r) => setFeed(r.url)); }}>🔄 New private link</Btn>
              </div>
              <p className="tiny muted">On desktop Google Calendar you can also go to Other calendars → + → From URL and paste it. Google refreshes subscribed calendars every few hours.</p>
            </>
          ) : (
            <p className="small muted" style={{ margin: "2px 0 0" }}>Make a free account (top right) to get your private live calendar feed.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Assignments() {
  const { state, saveAssignment, deleteAssignment, today } = useStore();
  const [course, setCourse] = useState("Calc 1");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [kind, setKind] = useState("homework");
  const [showDone, setShowDone] = useState(false);
  const list = [...state.assignments].filter((a) => showDone || !a.done).sort((a, b) => (a.done === b.done ? (a.due ?? "9999") < (b.due ?? "9999") ? -1 : 1 : a.done ? 1 : -1));
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const a: Assignment = { id: uid(), course, title: title.trim(), due: due || null, done: false, kind };
    saveAssignment(a);
    setTitle("");
    setDue("");
  }
  return (
    <Panel title="Assignments" icon="chest" right={<span className="chunky">{state.assignments.filter((a) => !a.done).length} OPEN</span>}>
      <form onSubmit={add} className="grid-4" style={{ alignItems: "end" }}>
        <label className="field"><span>Course</span><select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>{COURSES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field" style={{ gridColumn: "span 2" }}><span>What is it?</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="WebWork 7: chain rule" maxLength={200} /></label>
        <label className="field"><span>Due</span><input className="input" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        <label className="field"><span>Type</span><select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        <Btn type="submit" kind="primary">+ Add</Btn>
      </form>
      <div style={{ marginTop: 14 }}>
        {list.length ? (
          list.map((a) => {
            const n = a.due ? daysUntil(a.due, today) : null;
            return (
              <div key={a.id} className="row" style={{ padding: "8px 0", borderTop: "2px solid var(--slot)", gap: 10 }}>
                <input type="checkbox" checked={a.done} onChange={(e) => saveAssignment({ ...a, done: e.target.checked })} aria-label={`Done: ${a.title}`} />
                <span style={{ fontSize: 20 }}>{KIND_EMO[a.kind] ?? "📦"}</span>
                <span className="grow" style={{ textDecoration: a.done ? "line-through" : undefined }}>
                  <strong>{a.title}</strong> <span className="muted small">· {a.course}</span>
                  {a.due && <span className="muted tiny" style={{ display: "block" }}>{new Date(a.due).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: a.due.includes("T") ? "numeric" : undefined, minute: a.due.includes("T") ? "2-digit" : undefined })}</span>}
                </span>
                {n !== null && !a.done && <span className={`chip ${n < 0 ? "bad" : n <= 1 ? "gold" : ""}`}>{n < 0 ? `${-n}d late` : n === 0 ? "today" : `${n}d`}</span>}
                <button className="btn sm ghost" onClick={() => deleteAssignment(a.id)} aria-label={`Delete ${a.title}`}>🗑</button>
              </div>
            );
          })
        ) : (
          <Empty>Nothing on the list. Add homework, quizzes and projects above. Brightspace import is coming.</Empty>
        )}
      </div>
      <label className="row small" style={{ marginTop: 8 }}><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show finished</label>
    </Panel>
  );
}

function Exams() {
  const { state, updateSettings, today } = useStore();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [course, setCourse] = useState("Calc 1");
  const exams = [...state.settings.exams].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Panel title="Exams (boss dates)" icon="dragon">
      <form className="grid-4" style={{ alignItems: "end" }} onSubmit={(e) => { e.preventDefault(); if (!name || !date) return; updateSettings({ exams: [...state.settings.exams, { id: uid(), course, name, date }] }); setName(""); setDate(""); }}>
        <label className="field"><span>Course</span><select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>{COURSES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Exam</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Midterm 2" maxLength={80} /></label>
        <label className="field"><span>Date</span><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <Btn type="submit" kind="primary">+ Add exam</Btn>
      </form>
      <div style={{ marginTop: 10 }}>
        {exams.map((e) => {
          const n = daysUntil(e.date, today);
          return (
            <div key={e.id} className="row" style={{ padding: "6px 0", gap: 10 }}>
              <span>🐉</span>
              <span className="grow"><strong>{e.name}</strong> <span className="muted small">· {e.course} · {e.date}</span></span>
              <span className={`chip ${n < 0 ? "" : n <= 3 ? "bad" : n <= 7 ? "gold" : ""}`}>{n < 0 ? "done" : n === 0 ? "TODAY" : `in ${n}d`}</span>
              <button className="btn sm ghost" onClick={() => updateSettings({ exams: state.settings.exams.filter((x) => x.id !== e.id) })} aria-label={`Delete ${e.name}`}>🗑</button>
            </div>
          );
        })}
        {!exams.length && <p className="small muted">Add your midterm dates for countdowns, reminders and a calendar entry.</p>}
      </div>
    </Panel>
  );
}

export default function Tracker() {
  const { state, today, streak, bestStreak } = useStore();
  const days = Object.values(state.days);
  const minutes = days.reduce((s, d) => s + d.minutes, 0);
  const answered = days.reduce((s, d) => s + d.answered, 0);
  const correct = days.reduce((s, d) => s + d.correct, 0);
  const recent = Array.from({ length: 14 }, (_, i) => addDays(today, -i)).filter((d) => state.days[d]);
  const MOOD = ["", "😫", "😕", "😐", "🙂", "🤩"];
  return (
    <div className="wrap page stack-lg">
      <div className="on-sky">
        <h1 className="shadow-text" style={{ marginBottom: 4 }}>📅 Tracker</h1>
        <p style={{ margin: 0, fontWeight: 500 }}>Every day you show up turns into a block. Fill the map.</p>
      </div>
      <div className="grid-4">
        {[["🔥", "Current streak", `${streak} days`], ["🏆", "Best streak", `${bestStreak} days`], ["⏱", "Focus time", `${Math.floor(minutes / 60)}h ${minutes % 60}m`], ["🎯", "Accuracy", answered ? `${Math.round((correct / answered) * 100)}% of ${answered}` : "–"]].map(([e, t, v]) => (
          <div key={t} className="panel tight center"><div style={{ fontSize: 28 }}>{e}</div><div className="small muted">{t}</div><div className="px" style={{ fontSize: "1.4rem" }}>{v}</div></div>
        ))}
      </div>
      <Panel title="Activity (last 26 weeks)" icon="map"><Heatmap weeks={26} /></Panel>
      <div className="grid-2">
        <Exams />
        <CalendarPanel />
      </div>
      <Assignments />
      <Panel title="Daily log" icon="book">
        {recent.length ? (
          recent.map((d) => {
            const log = state.days[d]!;
            return (
              <div key={d} style={{ padding: "8px 0", borderTop: "2px solid var(--slot)" }}>
                <div className="row small" style={{ gap: 8 }}>
                  <strong>{d === today ? "Today" : new Date(`${d}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</strong>
                  {log.mood && <span>{MOOD[log.mood]}</span>}
                  {log.energy && <span>{"⚡".repeat(log.energy)}</span>}
                  <span className="chip">{log.xp} XP</span><span className="chip">{log.minutes} min</span><span className="chip">{log.correct}/{log.answered} right</span>{log.lessons > 0 && <span className="chip good">{log.lessons} lesson{log.lessons > 1 ? "s" : ""}</span>}
                </div>
                {log.note && <p className="small" style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{log.note}</p>}
              </div>
            );
          })
        ) : (
          <Empty>Your log fills in as you study and check in on Base Camp.</Empty>
        )}
      </Panel>
    </div>
  );
}
