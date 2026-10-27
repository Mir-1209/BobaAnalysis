import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { BOSSES, bossQuestions, type Boss as BossT } from "@/content/calc1/extras";
import { QuestionCard } from "@/components/QuestionCard";
import { Btn, BtnLink, Icon, Panel } from "@/components/ui";
import { fmtClock } from "@/lib/timer";
import { sfx } from "@/lib/sound";
import { useStore } from "@/lib/store";

function grade(pct: number): { letter: string; msg: string } {
  if (pct >= 0.97) return { letter: "A+", msg: "Dragon slain. You're exam-ready." };
  if (pct >= 0.9) return { letter: "A", msg: "Huge. Review the misses and you're golden." };
  if (pct >= 0.8) return { letter: "B", msg: "Solid! Grind your weak units, then rematch." };
  if (pct >= 0.7) return { letter: "C", msg: "Getting there. Redstone Review is your friend." };
  return { letter: "Keep going", msg: "Every boss is beaten after a few tries. Do the lessons for the topics you missed, then come back." };
}

function Fight({ boss }: { boss: BossT }) {
  const { toast } = useStore();
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const qs = useMemo(() => bossQuestions(boss, seed), [boss, seed]);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const hearts = boss.hearts - results.filter((r) => !r).length;
  const hits = results.filter(Boolean).length;
  const timeLeft = startedAt ? boss.minutes * 60_000 - (now - startedAt) : boss.minutes * 60_000;
  const over = startedAt !== null && (i >= qs.length || timeLeft <= 0);

  useEffect(() => {
    if (!startedAt || over) return;
    const iv = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(iv);
  }, [startedAt, over]);

  useEffect(() => {
    if (over) {
      sfx.done();
      const pct = hits / qs.length;
      if (pct >= 0.9) toast({ title: "Boss defeated!", body: `${boss.mob} is down. ${hits}/${qs.length} on the first try.`, icon: "dragon" });
    }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!startedAt) {
    return (
      <Panel title={`${boss.emoji} ${boss.mob}`} icon="dragon">
        <h2>{boss.name}</h2>
        <p>{boss.blurb}</p>
        <ul className="small">
          <li>{qs.length} questions, {boss.minutes}-minute timer (it's a guide, not a punishment).</li>
          <li>Only your <strong>first try</strong> counts toward the score. You can still retry and read solutions.</li>
          <li>Each first-try miss costs a ❤️. Run out and you can keep going, just for practice.</li>
          <li>Paper and pencil out, like the real exam. Show your work to yourself!</li>
        </ul>
        <Btn kind="primary" size="lg" onClick={() => { setStartedAt(Date.now()); setNow(Date.now()); sfx.hit(); }}>⚔️ Start the fight</Btn>
      </Panel>
    );
  }

  if (over) {
    const pct = hits / qs.length;
    const g = grade(pct);
    return (
      <Panel title="Fight results" icon="star">
        <div className="center stack">
          <div style={{ fontSize: 64 }}>{pct >= 0.9 ? "🏆" : pct >= 0.7 ? "⚔️" : "🛡️"}</div>
          <h1 style={{ margin: 0 }}>{g.letter}</h1>
          <p>{hits} of {qs.length} first try ({Math.round(pct * 100)}%). {timeLeft <= 0 ? "Time ran out." : `Finished with ${fmtClock(timeLeft)} to spare.`}</p>
          <p className="muted">{g.msg}</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Btn kind="primary" onClick={() => { setSeed((s) => s + 1); setI(0); setResults([]); setStartedAt(null); }}>↺ Rematch (new questions)</Btn>
            <BtnLink href="/calc/practice">🔁 Review my misses</BtnLink>
          </div>
        </div>
      </Panel>
    );
  }

  const q = qs[i]!;
  return (
    <div className="stack">
      <div className="panel" style={{ background: "#120018", color: "#fff" }}>
        <div className="boss-name">{boss.emoji} {boss.mob}</div>
        <div className="boss-bar" style={{ margin: "8px 0" }}><i style={{ width: `calc(${(1 - hits / qs.length) * 100}% - 6px)` }} /></div>
        <div className="row-between small">
          <span className="hearts">{Array.from({ length: boss.hearts }, (_, k) => <Icon key={k} name="heart" className={k < hearts ? "" : "dead"} title={k < hearts ? "heart" : "lost heart"} />)}</span>
          <span>Q {i + 1}/{qs.length}</span>
          <span className={timeLeft < 5 * 60_000 ? "pulse" : ""}>⏳ {fmtClock(timeLeft)}</span>
        </div>
      </div>
      <Panel>
        <QuestionCard key={q.id} q={q} onDone={(ok) => { setResults((r) => (r.length > i ? r : [...r, ok])); if (ok) sfx.hit(); }} />
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <Btn kind="primary" onClick={() => { if (results.length <= i) setResults((r) => [...r, false]); setI((x) => x + 1); }}>{results.length > i ? "Next ▶" : "Skip (counts as a miss) ▶"}</Btn>
        </div>
      </Panel>
    </div>
  );
}

export default function Boss({ id }: { id?: string }) {
  const boss = BOSSES.find((b) => b.id === id);
  if (boss) {
    return (
      <div className="wrap page stack" style={{ maxWidth: 900 }}>
        <Link href="/calc/boss" className="on-sky" style={{ fontWeight: 700 }}>◀ All bosses</Link>
        <Fight boss={boss} />
      </div>
    );
  }
  return (
    <div className="wrap page stack-lg">
      <div className="on-sky">
        <h1 className="shadow-text" style={{ marginBottom: 4 }}>🐉 Boss fights</h1>
        <p style={{ margin: 0, fontWeight: 500 }}>Timed mock exams with fresh questions every time. Beat a boss at 90%+ and you're ready for the real thing.</p>
      </div>
      <div className="grid-2">
        {BOSSES.map((b) => (
          <Link key={b.id} href={`/calc/boss/${b.id}`} className="unit-card">
            <div className="panel" style={{ background: "linear-gradient(135deg, #1b0b24, #3b1250)", color: "#fff" }}>
              <div style={{ fontSize: 46 }}>{b.emoji}</div>
              <div className="chunky" style={{ color: "#ff9bff" }}>{b.mob}</div>
              <h3 style={{ color: "#fff" }}>{b.name}</h3>
              <p className="small" style={{ opacity: 0.85 }}>{b.blurb}</p>
              <div className="row small"><span className="chip">{b.questions} questions</span><span className="chip">{b.minutes} min</span><span className="chip">{"❤️".repeat(b.hearts)}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
