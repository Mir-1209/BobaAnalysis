import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { useTimer, fmtClock } from "@/lib/timer";
import { findLesson, nextLesson } from "@/content/calc1";
import { GENERATORS } from "@/content/calc1/generators";
import { BlockView } from "@/components/BlockView";
import { QuestionCard } from "@/components/QuestionCard";
import { Btn, BtnLink, Meter, Panel } from "@/components/ui";
import { sfx } from "@/lib/sound";
import NotFound from "./NotFound";

const MODE_KEY = "sc:lesson-mode";

export default function LessonPage({ id }: { id: string }) {
  const ref = findLesson(id);
  const { state, record, toast } = useStore();
  const { timer, left } = useTimer();
  const [mode, setMode] = useState<"quest" | "scroll">(() => {
    try {
      return (localStorage.getItem(MODE_KEY) as "quest" | "scroll") || "quest";
    } catch {
      return "quest";
    }
  });
  const [step, setStep] = useState(0);
  const [qi, setQi] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    setStep(0);
    setQi(0);
    setResults({});
  }, [id]);

  useEffect(() => {
    document.body.classList.toggle("focus-mode", focus);
    return () => document.body.classList.remove("focus-mode");
  }, [focus]);

  if (!ref) return <NotFound />;
  const { unit, lesson } = ref;
  const blocks = lesson.blocks;
  const total = blocks.length;
  const readAll = mode === "scroll" || step >= total;
  const done = Boolean(state.lessons[lesson.id]);
  const nx = nextLesson(lesson.id);
  const q = lesson.questions[qi];

  function setModeSaved(m: "quest" | "scroll") {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  }

  function finish() {
    const gained = record({ t: "lesson", id: lesson.id });
    sfx.done();
    if (gained) toast({ title: "Lesson complete!", body: `+${gained} XP for "${lesson.title}". Your brain grew a new block.`, icon: "book" });
  }

  return (
    <div className="wrap page stack-lg" style={{ maxWidth: 900 }}>
      {focus && (
        <div className="focus-exit row">
          {timer && <span className="stat-pill">🔥 {fmtClock(left)}</span>}
          <Btn size="sm" onClick={() => setFocus(false)}>Exit focus ✕</Btn>
        </div>
      )}
      <div className="on-sky">
        <div className="row small" style={{ gap: 6 }}>
          <Link href="/calc" style={{ fontWeight: 700 }}>🗺️ Map</Link> <span>›</span>
          <span>Unit {unit.n}: {unit.title}</span>
        </div>
        <h1 className="shadow-text" style={{ margin: "6px 0" }}>{lesson.emoji} {lesson.title}</h1>
        <div className="row small">
          <span className="chip">⏱ {lesson.minutes} min</span>
          <span className="chip">{lesson.questions.length} questions</span>
          {done && <span className="chip good">✓ Completed</span>}
          <div className="grow" />
          <div className="tabs">
            <button className={mode === "quest" ? "on" : ""} onClick={() => setModeSaved("quest")} title="One block at a time">🎯 One at a time</button>
            <button className={mode === "scroll" ? "on" : ""} onClick={() => setModeSaved("scroll")} title="Everything on one page">📜 Scroll all</button>
          </div>
          {!focus && <Btn size="sm" kind="ghost" onClick={() => setFocus(true)}>🙈 Focus mode</Btn>}
        </div>
      </div>

      <div className="panel tldr">⚡ TL;DR: {lesson.tldr}</div>

      {mode === "quest" ? (
        <>
          <div className="dots" aria-label={`Block ${Math.min(step + 1, total)} of ${total}`}>
            {blocks.map((_, i) => <i key={i} className={i < step ? "on" : i === step ? "cur" : ""} />)}
          </div>
          {blocks.slice(0, Math.min(step + 1, total)).map((b, i) => (
            <div key={i} className={i === step ? "reveal-step" : ""} style={i < step ? { opacity: 0.85 } : undefined}>
              <BlockView b={b} />
            </div>
          ))}
          {step < total && (
            <div className="row" style={{ justifyContent: "center" }}>
              {step > 0 && <Btn onClick={() => setStep((s) => s - 1)}>◀ Back</Btn>}
              <Btn kind="primary" size="lg" onClick={() => { sfx.click(); setStep((s) => s + 1); window.setTimeout(() => window.scrollBy({ top: 240, behavior: "smooth" }), 50); }}>
                {step === total - 1 ? "Got it! On to practice ⚔️" : "Got it ▶"}
              </Btn>
            </div>
          )}
        </>
      ) : (
        blocks.map((b, i) => <BlockView key={i} b={b} />)
      )}

      {readAll && (
        <Panel title={`Practice: question ${Math.min(qi + 1, lesson.questions.length)} of ${lesson.questions.length}`} icon="sword">
          <Meter value={Object.keys(results).length / lesson.questions.length} kind="xp" />
          <div style={{ marginTop: 14 }}>
            {q ? (
              <>
                <QuestionCard key={q.id} q={q} onDone={(ok) => setResults((r) => ({ ...r, [q.id]: r[q.id] ?? ok }))} />
                <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                  <Btn size="sm" kind="ghost" disabled={qi === 0} onClick={() => setQi((i) => i - 1)}>◀ Prev</Btn>
                  <Btn kind="primary" onClick={() => setQi((i) => i + 1)}>{qi === lesson.questions.length - 1 ? "Finish ▶" : "Next question ▶"}</Btn>
                </div>
              </>
            ) : (
              <div className="center stack">
                <div style={{ fontSize: 54 }}>🏆</div>
                <h2>Practice complete!</h2>
                <p>First-try correct: <strong>{Object.values(results).filter(Boolean).length}</strong> of {lesson.questions.length}. Wrong ones will come back in Redstone Review.</p>
                <div className="row" style={{ justifyContent: "center" }}>
                  <Btn size="sm" onClick={() => setQi(0)}>↺ Go through again</Btn>
                  {lesson.gens?.map((g) => <BtnLink key={g} size="sm" href={`/calc/practice?gen=${g}`}>♾️ Infinite: {GENERATORS[g]!.name}</BtnLink>)}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      {readAll && (
        <div className="panel center">
          {done ? (
            <p style={{ margin: "0 0 10px" }}>✅ You've finished this lesson. Come back anytime. Re-doing questions is how they stick.</p>
          ) : (
            <Btn kind="primary" size="lg" onClick={finish}>✓ Mark lesson complete (+50 XP)</Btn>
          )}
          {nx && (
            <div style={{ marginTop: 12 }}>
              <BtnLink href={`/calc/l/${nx.lesson.id}`} kind={done ? "primary" : ""}>Next: {nx.lesson.emoji} {nx.lesson.title} ▶</BtnLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
