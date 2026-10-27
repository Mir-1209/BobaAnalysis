import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { BtnLink, Icon, Meter, Panel } from "@/components/ui";
import { CheckIn, FocusFurnace, Heatmap, Quests, daysUntil } from "@/components/widgets";
import { courseMastery, dueReview, lessonMastery, nextUp, unitMastery } from "@/content/calc1/extras";
import { UNITS } from "@/content/calc1";

function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? "Night owl mode" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { state, today, todayLog, streak, level, user } = useStore();
  const next = nextUp(state);
  const review = dueReview(state);
  const exams = [...state.settings.exams].filter((e) => daysUntil(e.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const due = state.assignments.filter((a) => !a.done && a.due).sort((a, b) => (a.due! < b.due! ? -1 : 1)).slice(0, 5);
  const name = state.settings.displayName || user?.name?.split(" ")[0] || "Crafter";
  const weakest = [...UNITS].filter((u) => unitMastery(state, u.id) > 0).sort((a, b) => unitMastery(state, a.id) - unitMastery(state, b.id))[0];

  return (
    <div className="wrap page stack-lg">
      <section className="row-between on-sky">
        <div>
          <h1 className="shadow-text" style={{ marginBottom: 4 }}>{greeting()}, {name}!</h1>
          <p style={{ margin: 0, fontWeight: 500 }}>
            {streak > 0 ? `🔥 ${streak}-day streak. Keep it alive today.` : "Start a streak today. One tiny win is enough."} Level {level.level} · {todayLog.xp} XP today
          </p>
        </div>
        {!user && <BtnLink href="/auth" kind="gold">💾 Save progress to an account</BtnLink>}
      </section>

      {/* The one obvious next action */}
      <Panel title="Your next move" icon="sword">
        <div className="row-between">
          <div className="grow">
            <div className="muted small">Unit {next.unit.n}: {next.unit.title}</div>
            <h2 style={{ margin: "2px 0 6px" }}>{next.lesson.emoji} {next.lesson.title}</h2>
            <p className="small" style={{ margin: 0 }}>⏱ about {next.lesson.minutes} min · {next.lesson.tldr}</p>
            <div style={{ maxWidth: 360, marginTop: 8 }}><Meter value={lessonMastery(state, next.lesson.id)} /></div>
          </div>
          <BtnLink href={`/calc/l/${next.lesson.id}`} kind="primary" size="lg" className="bounce">▶ Start</BtnLink>
        </div>
      </Panel>

      <div className="grid-2">
        <FocusFurnace />
        <Quests />
      </div>

      <Link href="/study" className="unit-card" style={{ display: "block" }}>
        <div className="panel" style={{ background: "linear-gradient(135deg, #1a0f2b, #3a1d5c 60%, #0d0716)", color: "#f6f0ff" }}>
          <div className="row-between">
            <div>
              <div className="chunky" style={{ color: "#eef59b" }}>NEW · 3D STUDY SESSION</div>
              <h2 style={{ color: "#fff", margin: "6px 0" }}>🌌 Study in the End City</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>Spawn on the End ship, walk the deck, click the bookshelf to open your dashboard book and set a timer. The countdown floats in the violet sky.</p>
            </div>
            <span className="btn gold lg">Enter ▶</span>
          </div>
        </div>
      </Link>

      <div className="grid-3">
        <Panel title="Redstone Review" icon="redstone">
          <p className="small" style={{ marginTop: 0 }}>Spaced review: questions you missed come back right before you'd forget them.</p>
          <div className="time-big">{review.length}</div>
          <div className="muted small" style={{ marginBottom: 8 }}>due now</div>
          <BtnLink href="/calc/practice" size="sm" kind={review.length ? "primary" : ""}>{review.length ? "Review now ▶" : "Practice anyway"}</BtnLink>
        </Panel>
        <Panel title="Boss fights" icon="dragon">
          {exams.length ? (
            exams.slice(0, 3).map((e) => {
              const n = daysUntil(e.date, today);
              return (
                <div key={e.id} className="row-between small" style={{ padding: "4px 0" }}>
                  <span>🐉 {e.course} · {e.name}</span>
                  <span className={`chip ${n <= 3 ? "bad" : n <= 7 ? "gold" : ""}`}>{n === 0 ? "TODAY" : `${n}d`}</span>
                </div>
              );
            })
          ) : (
            <p className="small muted" style={{ marginTop: 0 }}>Add your exam dates in the Tracker to get a countdown (and calendar reminders).</p>
          )}
          <div className="row" style={{ marginTop: 8 }}>
            <BtnLink href="/calc/boss/exam2" size="sm" kind="primary">💀 Exam 2 mock</BtnLink>
            <BtnLink href="/tracker" size="sm">+ dates</BtnLink>
          </div>
        </Panel>
        <Panel title="Calc 1 progress" icon="diamond">
          <div className="time-big">{Math.round(courseMastery(state) * 100)}%</div>
          <div className="muted small">course mastery</div>
          <div style={{ margin: "10px 0" }}><Meter value={courseMastery(state)} kind="xp" /></div>
          {weakest && <p className="small" style={{ margin: "0 0 8px" }}>Weakest started unit: <strong>{weakest.emoji} {weakest.title}</strong></p>}
          <BtnLink href="/calc" size="sm">Open the map 🗺️</BtnLink>
        </Panel>
      </div>

      <div className="grid-2">
        <CheckIn day={today} />
        <div className="stack">
          <Panel title="Your streak, in blocks" icon="flame">
            <Heatmap weeks={18} />
            <div className="row small muted" style={{ marginTop: 6 }}>
              <span>Less</span><span className="heat" style={{ gridTemplateRows: "14px", display: "inline-grid" }}><i /><i className="l1" /><i className="l2" /><i className="l3" /><i className="l4" /></span><span>More</span>
            </div>
          </Panel>
          <Panel title="Due soon" icon="chest" right={<Link href="/tracker" className="chunky" style={{ color: "inherit" }}>ALL ▶</Link>}>
            {due.length ? (
              due.map((a) => {
                const n = daysUntil(a.due!, today);
                return (
                  <div key={a.id} className="row-between small" style={{ padding: "4px 0" }}>
                    <span>📜 {a.course} · {a.title}</span>
                    <span className={`chip ${n < 0 ? "bad" : n <= 1 ? "gold" : ""}`}>{n < 0 ? "late" : n === 0 ? "today" : `${n}d`}</span>
                  </div>
                );
              })
            ) : (
              <p className="small muted" style={{ margin: 0 }}>Nothing due. Add assignments in the Tracker (Brightspace sync comes later).</p>
            )}
          </Panel>
          <div className="row small on-sky" style={{ justifyContent: "center" }}><Icon name="star" /> Tip: press keys 1–9 to jump around the hotbar.</div>
        </div>
      </div>
    </div>
  );
}
