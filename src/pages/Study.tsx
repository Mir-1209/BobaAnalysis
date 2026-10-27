import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useTimer, fmtClock } from "@/lib/timer";
import { dailyQuests, nextUp, dueReview, courseMastery } from "@/content/calc1/extras";
import { daysUntil } from "@/components/widgets";
import { Icon } from "@/components/ui";
import { sfx } from "@/lib/sound";
import type { EndCity } from "@/study/EndCity";
import "@/styles/study.css";

const PRESETS = [10, 15, 25, 45, 60];

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite" style={{ top: 12 }}>
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Icon name={(t.icon as "star") ?? "star"} size="lg" />
          <div><div className="t1">{t.title}</div><div className="t2">{t.body}</div></div>
        </div>
      ))}
    </div>
  );
}

/** The book: page 1 sets the timer, page 2 is the dashboard. Styled after the in-game book & quill. */
function Book({ onClose, onStarted }: { onClose: () => void; onStarted: () => void }) {
  const { state, today, streak, level, todayLog } = useStore();
  const { timer, left, running, start, pause, resume, stop, addMinutes } = useTimer();
  const [page, setPage] = useState(0); // on phones we show one page at a time
  const [minutes, setMinutes] = useState(25);
  const [task, setTask] = useState("");
  const quests = dailyQuests(state, today);
  const next = nextUp(state);
  const review = dueReview(state).length;
  const exams = state.settings.exams.filter((e) => daysUntil(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  const due = state.assignments.filter((a) => !a.done && a.due).sort((a, b) => (a.due! < b.due! ? -1 : 1)).slice(0, 3);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPage(1);
      if (e.key === "ArrowLeft") setPage(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sign = () => {
    start(minutes, task);
    onStarted();
  };

  return (
    <div className="book-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="book-wrap" role="dialog" aria-modal="true" aria-label="Study book">
        <div className={`book page-${page}`}>
          <button className="book-x" onClick={onClose} aria-label="Close book">×</button>
          <div className="book-page left">
            <div className="book-head">Page 1 of 2</div>
            {timer ? (
              <div className="book-body">
                <h3>⏳ Focus in progress</h3>
                <div className="book-clock">{fmtClock(left)}</div>
                <p className="book-small">{timer.task ? `Working on: ${timer.task}` : "Focus block"} · {timer.minutes} min · look up, it's in the sky ✨</p>
                <div className="book-row">
                  {running ? <button className="book-btn" onClick={pause}>⏸ Pause</button> : <button className="book-btn" onClick={resume}>▶ Resume</button>}
                  <button className="book-btn" onClick={() => addMinutes(5)}>+5 min</button>
                  <button className="book-btn" onClick={stop}>⏹ Stop & bank</button>
                </div>
                <p className="book-small">Stopping early still banks every full minute you did. 2 XP per minute.</p>
              </div>
            ) : (
              <div className="book-body">
                <h3>Set the timer</h3>
                <p className="book-small">How long can your brain lock in right now? Smaller is fine. Honest beats ambitious.</p>
                <div className="book-row">
                  {PRESETS.map((m) => (
                    <button key={m} className={`book-btn ${minutes === m ? "on" : ""}`} onClick={() => { setMinutes(m); sfx.click(); }}>{m}m</button>
                  ))}
                </div>
                <label className="book-label">
                  Custom: <strong>{minutes} min</strong>
                  <input type="range" min={1} max={120} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
                </label>
                <label className="book-label">
                  What I'm working on
                  <input className="book-input" value={task} onChange={(e) => setTask(e.target.value)} maxLength={80} placeholder={next.lesson.title} />
                </label>
                <p className="book-small">When you sign, the countdown appears in the sky above the ship.</p>
              </div>
            )}
            <button className="book-turn" onClick={() => setPage(1)} aria-label="Next page">›</button>
            <div className="book-quill" aria-hidden>✎</div>
          </div>
          <div className="book-page right">
            <div className="book-head">Page 2 of 2</div>
            <div className="book-body">
              <h3>Dashboard</h3>
              <div className="book-stats">
                <span>⭐ Lv {level.level}</span>
                <span>🔥 {streak}d streak</span>
                <span>💎 {todayLog.xp} XP today</span>
                <span>📈 {Math.round(courseMastery(state) * 100)}% Calc 1</span>
              </div>
              <div className="book-sub">Daily quests</div>
              {quests.map((q) => (
                <div key={q.id} className="book-quest">
                  <span>{q.progress >= q.goal ? "✅" : q.emoji} {q.title}</span>
                  <span>{Math.min(q.progress, q.goal)}/{q.goal}</span>
                </div>
              ))}
              <div className="book-sub">Up next</div>
              <Link href={`/calc/l/${next.lesson.id}`} className="book-link">📖 {next.lesson.title} ({next.lesson.minutes} min) ▶</Link>
              {review > 0 && <Link href="/calc/practice" className="book-link">🔁 {review} questions due for review ▶</Link>}
              {exams.map((e) => <div key={e.id} className="book-quest"><span>🐉 {e.name}</span><span>{daysUntil(e.date, today)}d</span></div>)}
              {due.map((a) => <div key={a.id} className="book-quest"><span>📜 {a.title}</span><span>{daysUntil(a.due!, today)}d</span></div>)}
              {!exams.length && !due.length && <p className="book-small">No deadlines saved. Add them in the Tracker.</p>}
            </div>
            <button className="book-turn" onClick={() => setPage(0)} aria-label="Previous page">‹</button>
            <div className="book-quill" aria-hidden>✎</div>
          </div>
        </div>
        {!timer ? (
          <button className="book-sign" onClick={sign}>Sign & start ✍️</button>
        ) : (
          <button className="book-sign" onClick={onClose}>Done</button>
        )}
      </div>
    </div>
  );
}

function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const update = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    setKnob({ x, y });
    onMove(x, -y);
  };
  return (
    <div
      ref={ref}
      className="joy"
      onPointerDown={(e) => { id.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={(e) => id.current === e.pointerId && update(e)}
      onPointerUp={() => { id.current = null; setKnob({ x: 0, y: 0 }); onMove(0, 0); }}
      onPointerCancel={() => { id.current = null; setKnob({ x: 0, y: 0 }); onMove(0, 0); }}
    >
      <i style={{ transform: `translate(${knob.x * 36}px, ${knob.y * 36}px)` }} />
    </div>
  );
}

export default function Study() {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<EndCity | null>(null);
  const { timer, left, running } = useTimer();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [near, setNear] = useState(false);
  const [started, setStarted] = useState(false);
  const [help, setHelp] = useState(true);
  const touch = typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const lookTouch = useRef<{ id: number; x: number; y: number } | null>(null);
  const prevTimer = useRef<boolean>(Boolean(timer));

  const openBook = useCallback(() => {
    sfx.click();
    setBookOpen(true);
  }, []);

  useEffect(() => {
    let alive = true;
    let instance: EndCity | null = null;
    (async () => {
      try {
        const c = document.createElement("canvas");
        if (!c.getContext("webgl2") && !c.getContext("webgl")) throw new Error("no webgl");
        const { EndCity } = await import("@/study/EndCity");
        if (!alive || !host.current) return;
        instance = new EndCity(host.current, {
          onProgress: (l, t) => setProgress(Math.min(1, l / t)),
          onReady: () => setReady(true),
          onError: setError,
          onOpenBook: openBook,
          onLockChange: setLocked,
          onHover: (h, d) => { setHover(h === "bookshelf"); setNear(d < 6); },
          onBarrier: () => undefined,
        });
        world.current = instance;
      } catch {
        setError("Your browser can't show 3D here (WebGL is off). Everything else in StudyCraft still works.");
      }
    })();
    return () => {
      alive = false;
      instance?.dispose();
      world.current = null;
    };
  }, [openBook]);

  useEffect(() => {
    world.current?.setPaused(bookOpen);
  }, [bookOpen]);

  // Feed the shared focus timer into the sky clock.
  useEffect(() => {
    const w = world.current;
    if (!w) return;
    if (timer) {
      w.setClock({ time: fmtClock(left), label: running ? (timer.task || "Focus mode: you've got this") : "Paused", progress: 1 - left / (timer.minutes * 60_000), running });
    } else {
      w.setClock({ time: "", label: "Click the bookshelf to start a focus timer", progress: 0, running: false });
    }
    // timer just finished (it existed, now it's gone, and it wasn't stopped by hand near the start)
    if (prevTimer.current && !timer) w.celebrate();
    prevTimer.current = Boolean(timer);
  }, [timer, left, running, ready]);

  const enter = () => {
    setStarted(true);
    setHelp(false);
    if (!touch) world.current?.lock();
  };

  return (
    <div className="study">
      <div ref={host} className="study-canvas"
        onTouchStart={(e) => { const t = e.changedTouches[0]!; if (t.clientX > window.innerWidth * 0.4) lookTouch.current = { id: t.identifier, x: t.clientX, y: t.clientY }; }}
        onTouchMove={(e) => { for (const t of Array.from(e.changedTouches)) if (lookTouch.current && t.identifier === lookTouch.current.id) { world.current?.look(t.clientX - lookTouch.current.x, t.clientY - lookTouch.current.y, 0.005); lookTouch.current = { id: t.identifier, x: t.clientX, y: t.clientY }; } }}
        onTouchEnd={(e) => { for (const t of Array.from(e.changedTouches)) if (lookTouch.current?.id === t.identifier) lookTouch.current = null; }}
      />

      {/* HUD */}
      {ready && started && !bookOpen && (
        <>
          <div className={`crosshair ${hover ? "on" : ""}`} aria-hidden>+</div>
          {hover && <div className="hud-hint">{touch ? "Tap" : "Click / E"} to open the Study Book 📖</div>}
          {!hover && near && <div className="hud-hint dim">Look at the bookshelf 📚</div>}
          {timer && <div className="hud-timer">{running ? "🔥" : "⏸"} {fmtClock(left)}</div>}
        </>
      )}
      <div className="study-top">
        <Link href="/home" className="btn sm">◀ Base Camp</Link>
        {ready && <button className="btn sm" onClick={openBook}>📖 Book</button>}
        {ready && !touch && started && !locked && !bookOpen && <button className="btn sm primary" onClick={() => world.current?.lock()}>🖱 Resume looking</button>}
      </div>

      {touch && ready && started && !bookOpen && (
        <>
          <Joystick onMove={(x, y) => { if (world.current) { world.current.stick.x = x; world.current.stick.y = y; } }} />
          <button className="jump-btn" onClick={() => world.current?.jump()} aria-label="Jump">⤒</button>
        </>
      )}

      {/* Loading screen, Minecraft style */}
      {!ready && !error && (
        <div className="study-loading">
          <div className="px" style={{ fontSize: "1.6rem" }}>Generating the End City…</div>
          <div className="study-bar"><i style={{ width: `${progress * 100}%` }} /></div>
          <div className="small">{Math.round(progress * 100)}% · {(19.5 * progress).toFixed(1)} / 19.5 MB</div>
          <div className="tiny" style={{ opacity: 0.7, marginTop: 18 }}>Tip: the countdown you set appears in the sky above the ship.</div>
        </div>
      )}
      {error && (
        <div className="study-loading">
          <div style={{ fontSize: 48 }}>🌑</div>
          <div className="px" style={{ fontSize: "1.3rem", maxWidth: 520, textAlign: "center" }}>{error}</div>
          <Link href="/home" className="btn primary">Back to Base Camp</Link>
        </div>
      )}

      {/* Start / pause screen */}
      {ready && (!started || (help && !bookOpen)) && (
        <div className="study-loading" style={{ background: "rgba(8,3,16,0.72)" }}>
          <div className="px" style={{ fontSize: "2rem", color: "#eef59b", textShadow: "3px 3px 0 #000" }}>🌌 End City Study Session</div>
          <div className="study-help">
            {touch ? (
              <>
                <div><b>Left thumb</b> walk · <b>right side</b> drag to look</div>
                <div><b>Tap the bookshelf</b> (or 📖) to open your Study Book</div>
              </>
            ) : (
              <>
                <div><span className="kbd">W A S D</span> walk · <span className="kbd">MOUSE</span> look · <span className="kbd">SPACE</span> jump</div>
                <div><span className="kbd">CTRL</span> sprint · <span className="kbd">SHIFT</span> sneak · <span className="kbd">ESC</span> free the mouse</div>
                <div><b>Click the glowing bookshelf</b> (or press <span className="kbd">E</span>) to open your Study Book</div>
              </>
            )}
            <div style={{ opacity: 0.8 }}>Invisible barriers keep you on the ship. You can't fall off. 🛡️</div>
          </div>
          <button className="btn primary lg" onClick={enter}>▶ {started ? "Back to the ship" : "Spawn on the ship"}</button>
        </div>
      )}

      {bookOpen && (
        <Book
          onClose={() => { setBookOpen(false); if (!touch) window.setTimeout(() => world.current?.lock(), 50); }}
          onStarted={() => { setBookOpen(false); if (!touch) window.setTimeout(() => world.current?.lock(), 50); }}
        />
      )}
      <Toasts />
      <div className="study-credit">"END CITY MINECRAFT" by DURVESH123 (Sketchfab), CC BY 4.0</div>
    </div>
  );
}
