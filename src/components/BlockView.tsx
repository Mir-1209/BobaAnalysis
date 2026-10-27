import { useState } from "react";
import type { Block } from "@/content/types";
import { Rich, Tex } from "./Rich";
import { Btn } from "./ui";
import { QuestionCard } from "./QuestionCard";
import { TOOLS } from "@/tools/tools";

const LABEL: Record<Block["k"], string> = {
  eli5: "🧸 Explain like I'm 5",
  idea: "💡 Big idea",
  formula: "🧪 Crafting recipe",
  steps: "🪜 Step by step",
  example: "🛠️ Worked example",
  trap: "💥 Creeper alert (common mistake)",
  tip: "✨ Pro tip",
  tool: "🎮 Try it yourself",
  check: "⚡ Quick check",
  table: "📋 Cheat table",
};

function Example({ b }: { b: Extract<Block, { k: "example" }> }) {
  const [n, setN] = useState(0);
  return (
    <div className="stack">
      <div className="slot"><Rich text={b.problem} /></div>
      {n > 0 && (
        <ol className="steps-list">
          {b.steps.slice(0, n).map((s, i) => (
            <li key={i} className="reveal-step"><Rich text={s} /></li>
          ))}
        </ol>
      )}
      {n <= b.steps.length - 1 ? (
        <div className="row">
          <Btn size="sm" kind="primary" onClick={() => setN((x) => x + 1)}>{n === 0 ? "Show step 1 ▶" : `Next step (${n + 1}/${b.steps.length}) ▶`}</Btn>
          {n === 0 && <span className="muted small">Try it on paper first! Then reveal one step at a time.</span>}
          {n > 0 && <Btn size="sm" kind="ghost" onClick={() => setN(b.steps.length + 1)}>Show all</Btn>}
        </div>
      ) : (
        <div className="feedback ok reveal-step">🎯 <Rich text={b.answer} as="span" /></div>
      )}
      {n === b.steps.length && (
        <Btn size="sm" kind="gold" onClick={() => setN(b.steps.length + 1)}>Show the answer 🎯</Btn>
      )}
    </div>
  );
}

export function BlockView({ b }: { b: Block }) {
  return (
    <section className={`panel block b-${b.k}`}>
      <div className="block-label">{LABEL[b.k]}</div>
      {"title" in b && b.title && <h3>{b.title}</h3>}
      {b.k === "eli5" && <Rich text={b.body} className="readable" />}
      {b.k === "idea" && <Rich text={b.body} className="readable" />}
      {(b.k === "trap" || b.k === "tip") && <Rich text={b.body} className="readable" />}
      {b.k === "formula" && (
        <>
          <div className="formula-card slot"><Tex src={b.tex} display /></div>
          {b.note && <Rich text={b.note} className="small readable" />}
        </>
      )}
      {b.k === "steps" && (
        <ol className="steps-list">
          {b.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}
        </ol>
      )}
      {b.k === "example" && <Example b={b} />}
      {b.k === "table" && (
        <div className="table-scroll">
          <table className="mc">
            <thead><tr>{b.head.map((h, i) => <th key={i}><Rich text={h} as="span" /></th>)}</tr></thead>
            <tbody>{b.rows.map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j}><Rich text={c} as="span" /></td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {b.k === "tool" && (
        <>
          {b.caption && <p className="small muted">{b.caption}</p>}
          {TOOLS[b.tool].render(b.props ?? {})}
        </>
      )}
      {b.k === "check" && <QuestionCard q={b.q} />}
    </section>
  );
}
