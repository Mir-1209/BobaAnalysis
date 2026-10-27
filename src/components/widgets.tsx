import { useState } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useTimer, fmtClock } from "@/lib/timer";
import { addDays, activeDay, type DayLog } from "../../shared/rules";
import { dailyQuests } from "@/content/calc1/extras";
import { Btn, Meter, Panel } from "./ui";

export function FocusFurnace({ compact = false }: { compact?: boolean }) {
  const { timer, left, running, start, pause, resume, stop, addMinutes } = useTimer();
  const [task, setTask] = useState("");
  const total = (timer?.minutes ?? 1) * 60_000;
  const pct = timer ? 1 - left / total : 0;
  return (
    <Panel title="Focus Furnace" icon="flame" right={timer && <span className="chunky">{running ? "SMELTING" : "PAUSED"}</span>}>
      {timer ? (
        <div className="stack">
          <div className="furnace">
            <div className="flame-meter" aria-hidden><i style={{ height: `${pct * 100}%` }} /></div>
            <div>
              <div className="time-big" aria-live="off">{fmtClock(left)}</div>
              <div className="muted small">{timer.task ? `On: ${timer.task}` : "Focus block"} · {timer.minutes} min</div>
            </div>
          </div>
          <Meter value={pct} kind="gold" label="Focus progress" />
          <div className="row" style={{ gap: 4 }}>
            {running ? <Btn size="sm" onClick={pause}>⏸ Pause</Btn> : <Btn size="sm" kind="primary" onClick={resume}>▶ Resume</Btn>}
            <Btn size="sm" onClick={() => addMinutes(5)}>+5 min</Btn>
            <Btn size="sm" kind="ghost" onClick={stop}>⏹ Stop & bank</Btn>
            <Link href="/study" className="btn sm gold">🌌 Go to the End City</Link>
          </div>
        </div>
      ) : (
        <div className="stack">
          {!compact && <p className="muted small" style={{ margin: 0 }}>Pick a tiny block. 10 minutes counts! You earn 2 XP per focused minute, and stopping early still banks what you did.</p>}
          <input className="input" placeholder="What are you working on? (optional)" value={task} onChange={(e) => setTask(e.target.value)} maxLength={80} />
          <div className="row" style={{ gap: 4 }}>
            {[5, 10, 15, 25, 45].map((m) => (
              <Btn key={m} size="sm" kind={m === 25 ? "primary" : ""} onClick={() => start(m, task)}>🔥 {m}m</Btn>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

export function Quests() {
  const { state, today } = useStore();
  const quests = dailyQuests(state, today);
  const done = quests.filter((q) => q.progress >= q.goal).length;
  return (
    <Panel title="Daily Quests" icon="map" right={<span className="chunky">{done}/3</span>}>
      <div className="stack" style={{ gap: 0 }}>
        {quests.map((q) => {
          const ok = q.progress >= q.goal;
          return (
            <div key={q.id} className={`quest ${ok ? "done" : ""}`}>
              <div className="emo">{ok ? "✅" : q.emoji}</div>
              <div>
                <div className="qt" style={{ fontWeight: 600 }}>{q.title}</div>
                <Meter value={q.progress / q.goal} kind={ok ? "" : "gold"} />
              </div>
              <span className="chunky nowrap">{Math.min(q.progress, q.goal)}/{q.goal}</span>
            </div>
          );
        })}
      </div>
      {done === 3 && <div className="feedback ok">🏆 All quests done today. Legend. Anything more is bonus.</div>}
    </Panel>
  );
}

const MOODS = ["😫", "😕", "😐", "🙂", "🤩"];
const CHECKLIST = [
  { id: "lecture", label: "Went to / watched lecture" },
  { id: "homework", label: "Worked on homework" },
  { id: "practice", label: "Did practice problems" },
  { id: "review", label: "Reviewed notes or cheat sheet" },
  { id: "rest", label: "Took a real break (water, walk, food)" },
];

export function CheckIn({ day }: { day: string }) {
  const { state, patchDay } = useStore();
  const log = state.days[day];
  const [note, setNote] = useState(log?.note ?? "");
  const [saved, setSaved] = useState(false);
  const done = log?.done ?? [];
  return (
    <Panel title="Daily check-in" icon="book">
      <div className="stack">
        <div>
          <div className="small" style={{ fontWeight: 700 }}>How's your brain today?</div>
          <div className="row" style={{ gap: 4 }}>
            {MOODS.map((m, i) => (
              <button key={m} className={`btn sm ${log?.mood === i + 1 ? "primary" : "ghost"}`} style={{ fontSize: 22 }} onClick={() => patchDay(day, { mood: i + 1 })} aria-label={`Mood ${i + 1}`}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="small" style={{ fontWeight: 700 }}>Energy</div>
          <div className="row" style={{ gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`btn sm ${log?.energy === n ? "gold" : "ghost"}`} onClick={() => patchDay(day, { energy: n })} aria-label={`Energy ${n}`}>{"⚡".repeat(n)}</button>
            ))}
          </div>
        </div>
        <div>
          {CHECKLIST.map((c) => (
            <label key={c.id} className="row small" style={{ gap: 8, padding: "4px 0" }}>
              <input type="checkbox" checked={done.includes(c.id)} onChange={(e) => patchDay(day, { done: e.target.checked ? [...done, c.id] : done.filter((x) => x !== c.id) })} />
              {c.label}
            </label>
          ))}
        </div>
        <label className="field">
          <span>Brain dump / what I did / what confused me</span>
          <textarea className="textarea" value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }} maxLength={4000} placeholder="Dump it here so your brain doesn't have to hold it." />
        </label>
        <div className="row">
          <Btn size="sm" kind="primary" onClick={() => { patchDay(day, { note }); setSaved(true); }}>💾 Save note</Btn>
          {saved && <span className="good small">Saved ✓</span>}
        </div>
      </div>
    </Panel>
  );
}

export function heatLevel(d: DayLog | undefined): number {
  if (!activeDay(d)) return 0;
  const xp = d!.xp;
  return xp >= 300 ? 4 : xp >= 150 ? 3 : xp >= 50 ? 2 : 1;
}

export function Heatmap({ weeks = 20 }: { weeks?: number }) {
  const { state, today } = useStore();
  const [y, m, d] = today.split("-").map(Number);
  const dow = new Date(y!, m! - 1, d!).getDay();
  const start = addDays(today, -(weeks * 7 - 1) - (6 - dow));
  const cells: Array<{ day: string; lvl: number }> = [];
  for (let i = 0; i < weeks * 7; i++) {
    const day = addDays(start, i);
    if (day > today) cells.push({ day, lvl: -1 });
    else cells.push({ day, lvl: heatLevel(state.days[day]) });
  }
  return (
    <div className="heat" role="img" aria-label="Study activity over the last weeks">
      {cells.map((c) => (
        <i key={c.day} className={`${c.lvl > 0 ? `l${c.lvl}` : ""} ${c.day === today ? "today" : ""}`} style={c.lvl < 0 ? { opacity: 0.15 } : undefined} title={`${c.day}: ${state.days[c.day]?.xp ?? 0} XP, ${state.days[c.day]?.minutes ?? 0} min`} />
      ))}
    </div>
  );
}

export function daysUntil(date: string, today: string): number {
  const a = new Date(`${today}T00:00:00`);
  const b = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
