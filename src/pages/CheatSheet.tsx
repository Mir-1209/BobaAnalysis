import { Link } from "wouter";
import { CHEATSHEET, QUESTION_MAP, TACTICS } from "@/content/calc1/cheatsheet";
import { Rich } from "@/components/Rich";
import { Btn, Panel } from "@/components/ui";
import { UNITS } from "@/content/calc1";

export default function CheatSheet() {
  return (
    <div className="wrap page stack-lg">
      <div className="row-between on-sky">
        <div>
          <h1 className="shadow-text" style={{ marginBottom: 4 }}>📜 Exam cheat sheet</h1>
          <p style={{ margin: 0, fontWeight: 500 }}>Find the wording of your question, follow the recipe. Copy the parts you need by hand onto your allowed exam sheet: writing it IS studying.</p>
        </div>
        <Btn onClick={() => window.print()} className="no-print">🖨️ Print</Btn>
      </div>
      <Panel title="Question → where to look" icon="map">
        <div className="grid-3">
          {QUESTION_MAP.map(([q, sec, unit]) => {
            const u = UNITS.find((x) => x.id === unit)!;
            return (
              <a key={q} href={`#${sec}`} className="slot" style={{ textDecoration: "none", display: "block" }}>
                <strong>{q}</strong>
                <div className="tiny muted">→ recipe below · Unit {u.n} {u.emoji}</div>
              </a>
            );
          })}
        </div>
      </Panel>
      <div className="grid-2">
        {CHEATSHEET.map((s) => (
          <section key={s.id} id={s.id} className="panel">
            <div className="title-bar"><span>{s.emoji}</span>{s.title}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {s.items.map((it, i) => <li key={i} style={{ margin: "6px 0" }}><Rich text={it} as={it.startsWith("$$") ? "div" : "span"} /></li>)}
            </ul>
          </section>
        ))}
      </div>
      <Panel title="Last-minute tactics" icon="star">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {TACTICS.map((t, i) => <li key={i} style={{ margin: "6px 0" }}><Rich text={t} as="span" /></li>)}
        </ol>
      </Panel>
      <div className="center no-print"><Link href="/calc/boss/exam2" className="btn primary lg">💀 Test yourself: Exam 2 mock</Link></div>
    </div>
  );
}
