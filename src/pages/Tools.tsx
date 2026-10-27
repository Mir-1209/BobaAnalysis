import { Link } from "wouter";
import { TOOLS } from "@/tools/tools";
import { TOOLS_META } from "@/tools/meta";
import type { ToolId } from "@/content/types";
import { Panel } from "@/components/ui";

export default function Tools({ id }: { id?: string }) {
  const tool = id && id in TOOLS ? (id as ToolId) : null;
  if (tool) {
    const m = TOOLS_META[tool];
    return (
      <div className="wrap page stack" style={{ maxWidth: 1000 }}>
        <Link href="/tools" className="on-sky" style={{ fontWeight: 700 }}>◀ All tools</Link>
        <Panel title={`${m.emoji} ${m.name}`}>
          <p className="muted small" style={{ marginTop: 0 }}>{m.blurb}</p>
          {TOOLS[tool].render({})}
        </Panel>
      </div>
    );
  }
  return (
    <div className="wrap page stack-lg">
      <div className="on-sky">
        <h1 className="shadow-text" style={{ marginBottom: 4 }}>🧪 Toolbox</h1>
        <p style={{ margin: 0, fontWeight: 500 }}>Play first, formulas second. Every tool takes any function you type.</p>
      </div>
      <div className="grid-3">
        {(Object.keys(TOOLS_META) as ToolId[]).filter((t) => t !== "signchart").map((t) => (
          <Link key={t} href={`/tools/${t}`} className="unit-card">
            <div className="panel">
              <div style={{ fontSize: 40 }}>{TOOLS_META[t].emoji}</div>
              <h3>{TOOLS_META[t].name}</h3>
              <p className="small muted" style={{ margin: 0 }}>{TOOLS_META[t].blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
