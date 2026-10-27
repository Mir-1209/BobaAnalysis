import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { useStore } from "@/lib/store";
import { QuestionCard } from "@/components/QuestionCard";
import { Btn, Empty, Panel } from "@/components/ui";
import { dueReview } from "@/content/calc1/extras";
import { ALL_QUESTIONS, UNITS } from "@/content/calc1";
import { GEN_LIST, GENERATORS } from "@/content/calc1/generators";
import type { Question } from "@/content/types";

type Tab = "review" | "grinder" | "unit" | "weak";

function Runner({ queue, title, onEmpty }: { queue: Question[]; title: string; onEmpty?: string }) {
  const [i, setI] = useState(0);
  const [streak, setStreak] = useState(0);
  if (!queue.length) return <Empty>{onEmpty ?? "Nothing here yet."}</Empty>;
  const q = queue[i % queue.length]!;
  return (
    <div className="stack">
      <div className="row-between small"><strong>{title}</strong><span>#{i + 1} of {queue.length} · 🔥 combo {streak}</span></div>
      <QuestionCard key={`${q.id}-${i}`} q={q} autoFocus onDone={(ok) => setStreak((s) => (ok ? s + 1 : 0))} />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Btn kind="primary" onClick={() => setI((x) => x + 1)}>{i + 1 >= queue.length ? "Loop again ↺" : "Next ▶"}</Btn>
      </div>
    </div>
  );
}

function Grinder({ genId }: { genId: string }) {
  const gen = GENERATORS[genId]!;
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const [count, setCount] = useState(0);
  const [right, setRight] = useState(0);
  const q = useMemo(() => gen.make(seed), [gen, seed]);
  return (
    <div className="stack">
      <div className="row-between small"><strong>{gen.emoji} {gen.name}</strong><span>{right}/{count} first-try · infinite supply</span></div>
      <QuestionCard key={q.id} q={q} recordAs={`gen:${genId}`} autoFocus onDone={(ok) => { setCount((c) => c + 1); if (ok) setRight((r) => r + 1); }} />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Btn kind="primary" onClick={() => setSeed((s) => s + 1)}>New one ▶</Btn>
      </div>
    </div>
  );
}

export default function Practice() {
  const { state } = useStore();
  const search = useSearch();
  const initialGen = new URLSearchParams(search).get("gen");
  const review = useMemo(() => dueReview(state), [state.questions]); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState<Tab>(initialGen ? "grinder" : review.length ? "review" : "grinder");
  const [gen, setGen] = useState<string | null>(initialGen && GENERATORS[initialGen] ? initialGen : null);
  const [unit, setUnit] = useState<string>(UNITS[0]!.id);
  const [frozenReview] = useState(review);
  const unitQs = useMemo(() => ALL_QUESTIONS.filter((x) => x.unit.id === unit).map((x) => x.q).sort(() => Math.random() - 0.5), [unit]);
  const weak = useMemo(
    () => ALL_QUESTIONS.filter(({ q }) => { const s = state.questions[q.id]; return s && s.a > s.c; }).sort((a, b) => (state.questions[a.q.id]!.c / state.questions[a.q.id]!.a) - (state.questions[b.q.id]!.c / state.questions[b.q.id]!.a)).map((x) => x.q),
    // only recompute when switching tabs, so the list doesn't jump while you answer
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab],
  );

  return (
    <div className="wrap page stack-lg" style={{ maxWidth: 940 }}>
      <div className="on-sky">
        <h1 className="shadow-text" style={{ marginBottom: 4 }}>⚔️ Practice arena</h1>
        <p style={{ margin: 0, fontWeight: 500 }}>Every answer earns XP. Wrong answers too: trying is the whole game.</p>
      </div>
      <div className="tabs">
        <button className={tab === "review" ? "on" : ""} onClick={() => setTab("review")}>🔁 Redstone Review ({review.length})</button>
        <button className={tab === "grinder" ? "on" : ""} onClick={() => setTab("grinder")}>♾️ Mob Grinder</button>
        <button className={tab === "unit" ? "on" : ""} onClick={() => setTab("unit")}>🗺️ By unit</button>
        <button className={tab === "weak" ? "on" : ""} onClick={() => setTab("weak")}>🎯 Weak spots</button>
      </div>

      {tab === "review" && (
        <Panel title="Redstone Review: spaced repetition" icon="redstone">
          <p className="small muted" style={{ marginTop: 0 }}>Questions come back on a schedule: missed → 10 minutes, then 1, 2, 4, 8, 16 days as you keep getting them right. This is the science-backed way to remember for the exam.</p>
          <Runner queue={frozenReview} title="Due for review" onEmpty="🎉 Nothing due right now. Do a lesson or grind some mobs, and anything you miss will show up here." />
        </Panel>
      )}

      {tab === "grinder" && (
        <Panel title="Mob Grinder: infinite generated questions" icon="sword">
          {gen ? (
            <>
              <Btn size="sm" kind="ghost" onClick={() => setGen(null)}>◀ Pick another skill</Btn>
              <div style={{ marginTop: 12 }}><Grinder genId={gen} /></div>
            </>
          ) : (
            <div className="grid-4">
              {GEN_LIST.map((g) => {
                const u = UNITS.find((x) => x.id === g.unit);
                const s = state.questions[`gen:${g.id}`];
                return (
                  <button key={g.id} className="choice" style={{ flexDirection: "column", alignItems: "flex-start", margin: 0 }} onClick={() => setGen(g.id)}>
                    <span style={{ fontSize: 26 }}>{g.emoji}</span>
                    <strong>{g.name}</strong>
                    <span className="tiny muted">Unit {u?.n} · {s ? `${s.c}/${s.a} right` : "fresh"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {tab === "unit" && (
        <Panel title="Practice a whole unit" icon="map">
          <select className="select" value={unit} onChange={(e) => setUnit(e.target.value)} style={{ maxWidth: 480 }}>
            {UNITS.map((u) => <option key={u.id} value={u.id}>Unit {u.n}: {u.emoji} {u.title}</option>)}
          </select>
          <div style={{ marginTop: 14 }}><Runner key={unit} queue={unitQs} title={UNITS.find((u) => u.id === unit)!.title} /></div>
        </Panel>
      )}

      {tab === "weak" && (
        <Panel title="Your weak spots" icon="skull">
          <Runner queue={weak} title="Questions you've missed before" onEmpty="No weak spots yet. Answer some questions first!" />
        </Panel>
      )}
    </div>
  );
}
