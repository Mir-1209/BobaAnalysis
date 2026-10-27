import { useMemo, useState, type ReactNode } from "react";
import { Graph, COLORS, deriv, deriv2, signChart, simpson, type Layer, type View } from "./Graph";
import { FnInput, Slider, useFn, n4, fmtInterval } from "./kit";
import { Tex, Rich } from "@/components/Rich";
import { Btn } from "@/components/ui";
import { compile } from "@/lib/math/expr";
import type { ToolId } from "@/content/types";

function Try({ children }: { children: ReactNode }) {
  return <div className="feedback hint small" style={{ marginTop: 10 }}>🎮 <strong>Try this:</strong> {children}</div>;
}

const v = (xmin: number, xmax: number, ymin: number, ymax: number): View => ({ xmin, xmax, ymin, ymax });

// ── 1. Grapher ───────────────────────────────────────────────────────────
export function GrapherTool({ fns = ["x^2 - 2x - 3", "", "", ""], view = v(-6, 6, -6, 8), showDerivative = false }: { fns?: string[]; view?: View; showDerivative?: boolean }) {
  const [srcs, setSrcs] = useState<string[]>([...fns, "", "", ""].slice(0, 4));
  const [dOn, setDOn] = useState(showDerivative);
  const compiled = srcs.map((s) => (s.trim() ? compile(s) : null));
  const layers: Layer[] = [];
  compiled.forEach((f, i) => f && layers.push({ type: "fn", f, color: COLORS[i]! }));
  if (dOn && compiled[0]) {
    const f = compiled[0];
    layers.push({ type: "fn", f: (x) => deriv(f, x), color: "#8e24aa", dash: [8, 6], width: 2.5 });
  }
  return (
    <div className="stack">
      <Graph layers={layers} view={view} ariaLabel="Function grapher" />
      <div className="grid-2">
        {srcs.map((s, i) => (
          <FnInput key={i} label={`f${i + 1}(x) =`} value={s} color={COLORS[i]} onChange={(t) => setSrcs((a) => a.map((x, j) => (j === i ? t : x)))} />
        ))}
      </div>
      <label className="row small"><input type="checkbox" checked={dOn} onChange={(e) => setDOn(e.target.checked)} /> Also draw the derivative of f1 (purple dashes)</label>
      <Try>Graph <code>x^2</code>, <code>x^2 + 3</code> and <code>(x-2)^2</code> together. What did each change do? Drag to pan, use + and − to zoom, hover to read values.</Try>
    </div>
  );
}

// ── 2. Limit Lab ─────────────────────────────────────────────────────────
export function LimitTool({ f: f0 = "(x^2 - 9)/(x - 3)", a: a0 = 3, view }: { f?: string; a?: number; view?: View }) {
  const [src, setSrc] = useState(f0);
  const [a, setA] = useState(a0);
  const [k, setK] = useState(1); // distance exponent: h = 10^-k
  const f = useFn(src);
  const h = Math.pow(10, -k);
  const steps = [1, 0.1, 0.01, 0.001, 0.0001];
  const left = f ? steps.map((d) => ({ x: a - d, y: f(a - d) })) : [];
  const right = f ? steps.map((d) => ({ x: a + d, y: f(a + d) })) : [];
  const L = left.at(-1)?.y ?? NaN;
  const R = right.at(-1)?.y ?? NaN;
  const est = (y: number) => (Math.abs(y) > 1e5 ? (y > 0 ? Infinity : -Infinity) : Number(y.toFixed(3)));
  const Le = est(L), Re = est(R);
  const agree = Number.isFinite(Le) && Number.isFinite(Re) ? Math.abs(Le - Re) < 1e-2 : Le === Re;
  const fa = f ? f(a) : NaN;
  const center = Number.isFinite(Le) ? Le : 0;
  const layers: Layer[] = [];
  if (f) {
    layers.push({ type: "fn", f, color: COLORS[1]! });
    layers.push({ type: "vline", x: a, color: "#999" });
    const yl = f(a - h), yr = f(a + h);
    if (Number.isFinite(yl)) layers.push({ type: "point", x: a - h, y: yl, color: COLORS[0]!, label: "left" });
    if (Number.isFinite(yr)) layers.push({ type: "point", x: a + h, y: yr, color: COLORS[2]!, label: "right" });
    if (Number.isFinite(Le) && agree) layers.push({ type: "point", x: a, y: Le, color: COLORS[1]!, open: !Number.isFinite(fa) || Math.abs(fa - Le) > 1e-6 });
  }
  return (
    <div className="stack">
      <Graph layers={layers} view={view ?? v(a - 4, a + 4, center - 6, center + 6)} ariaLabel="Limit explorer" />
      <div className="grid-2">
        <FnInput label="f(x) =" value={src} onChange={setSrc} />
        <div className="stack">
          <label className="field"><span>x approaches a =</span><input className="input mathy" type="number" step="any" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
          <Slider label="Get closer" value={k} min={0} max={4} step={0.05} onChange={setK} fmt={(x) => `h=${Math.pow(10, -x).toPrecision(2)}`} />
        </div>
      </div>
      {f && (
        <div className="grid-2">
          <table className="mc value-table"><thead><tr><th>x → a⁻</th><th>f(x)</th></tr></thead><tbody>{left.map((r) => <tr key={r.x}><td>{n4(r.x)}</td><td>{n4(r.y)}</td></tr>)}</tbody></table>
          <table className="mc value-table"><thead><tr><th>x → a⁺</th><th>f(x)</th></tr></thead><tbody>{right.map((r) => <tr key={r.x}><td>{n4(r.x)}</td><td>{n4(r.y)}</td></tr>)}</tbody></table>
        </div>
      )}
      {f && (
        <div className={`feedback ${agree ? "ok" : "no"}`}>
          Left side heads to <strong>{n4(Le)}</strong>, right side heads to <strong>{n4(Re)}</strong>.{" "}
          {agree ? <>They agree, so the limit is <strong>{n4(Le)}</strong>.</> : <>They disagree, so the two-sided limit <strong>does not exist</strong>.</>}{" "}
          The actual value is f({n4(a)}) = <strong>{Number.isFinite(fa) ? n4(fa) : "undefined"}</strong>
          {agree && Number.isFinite(Le) && (!Number.isFinite(fa) || Math.abs(fa - Le) > 1e-6) ? ". Different from the limit! The limit only cares about NEAR a, never AT a." : "."}
        </div>
      )}
      <Try>Slide "Get closer" all the way right and watch the red and green dots squeeze toward the hole. Then try <code>1/(x-2)</code> with a = 2, or <code>|x|/x</code> with a = 0.</Try>
    </div>
  );
}

// ── 3. Secant → Tangent ──────────────────────────────────────────────────
export function TangentTool({ f: f0 = "x^2", a: a0 = 1, view }: { f?: string; a?: number; view?: View }) {
  const [src, setSrc] = useState(f0);
  const [a, setA] = useState(a0);
  const [h, setH] = useState(2);
  const f = useFn(src);
  const layers: Layer[] = [];
  let secant = NaN, tangent = NaN, fa = NaN;
  if (f) {
    fa = f(a);
    const fb = f(a + h);
    secant = (fb - fa) / h;
    tangent = deriv(f, a);
    layers.push({ type: "fn", f, color: COLORS[1]! });
    if (Number.isFinite(secant)) layers.push({ type: "line", x0: a, y0: fa, m: secant, color: "#8e24aa", width: 2.5 });
    if (Number.isFinite(tangent)) layers.push({ type: "line", x0: a, y0: fa, m: tangent, color: COLORS[3]!, dash: [7, 6], width: 2 });
    layers.push({ type: "point", x: a, y: fa, color: COLORS[0]!, label: "P" });
    if (Number.isFinite(fb)) layers.push({ type: "point", x: a + h, y: fb, color: "#8e24aa", label: "Q" });
  }
  return (
    <div className="stack">
      <Graph layers={layers} view={view ?? v(a - 4, a + 4, (Number.isFinite(fa) ? fa : 0) - 5, (Number.isFinite(fa) ? fa : 0) + 6)} ariaLabel="Secant and tangent lines" />
      <div className="grid-2">
        <FnInput label="f(x) =" value={src} onChange={setSrc} />
        <div className="stack">
          <Slider label="a" value={a} min={-4} max={4} step={0.1} onChange={setA} />
          <Slider label="h" value={h} min={-3} max={3} step={0.01} onChange={(x) => setH(Math.abs(x) < 0.01 ? 0.01 : x)} />
        </div>
      </div>
      <div className="slot">
        <Rich text={String.raw`**Secant slope** (purple, through P and Q): $\dfrac{f(a+h)-f(a)}{h} = $ **${n4(secant)}**

**Tangent slope** (orange dashes, what the secant becomes as $h \to 0$): $f'(a) \approx$ **${n4(tangent)}**`} />
      </div>
      <Try>Drag h toward 0. The purple secant swings onto the orange tangent, and the two slope numbers become equal. That's the whole idea of a derivative.</Try>
    </div>
  );
}

// ── 4. Derivative Lab / Sign chart ───────────────────────────────────────
export function DerivativeTool({ f: f0 = "x^4 - 6x^3 + 8x - 4", view = v(-2.5, 5.5, -40, 25), mode = "first" }: { f?: string; view?: View; mode?: "first" | "second" }) {
  const [src, setSrc] = useState(f0);
  const [m, setM] = useState<"first" | "second">(mode);
  const f = useFn(src);
  const [win, setWin] = useState(view);
  const data = useMemo(() => {
    if (!f) return null;
    const d1 = (x: number) => deriv(f, x);
    const d2 = (x: number) => deriv2(f, x);
    const g = m === "first" ? d1 : d2;
    const chart = signChart(g, win.xmin, win.xmax);
    return { d1, d2, chart };
  }, [f, m, win.xmin, win.xmax]);
  const layers: Layer[] = [];
  if (f && data) {
    const good = "#2e9e44", bad = "#e53935";
    layers.push({
      type: "fn", f, color: COLORS[1]!, width: 4,
      colorAt: (x) => {
        const s = m === "first" ? data.d1(x) : data.d2(x);
        return Math.abs(s) < 1e-9 ? null : s > 0 ? good : bad;
      },
    });
    layers.push({ type: "fn", f: m === "first" ? data.d1 : data.d2, color: "#8e24aa", dash: [6, 6], width: 2 });
    for (const p of data.chart.points) {
      const y = f(p.x);
      if (Number.isFinite(y)) layers.push({ type: "point", x: p.x, y, color: "#111", label: n4(p.x) });
    }
  }
  const pos = data?.chart.intervals.filter((i) => i.sign > 0) ?? [];
  const neg = data?.chart.intervals.filter((i) => i.sign < 0) ?? [];
  const join = (xs: typeof pos) => (xs.length ? xs.map((i) => fmtInterval(i.lo === win.xmin ? -Infinity : i.lo, i.hi === win.xmax ? Infinity : i.hi)).join(" \\cup ") : "\\text{none in view}");
  return (
    <div className="stack">
      <div className="tabs" role="tablist">
        <button className={m === "first" ? "on" : ""} onClick={() => setM("first")}>f′: up or down?</button>
        <button className={m === "second" ? "on" : ""} onClick={() => setM("second")}>f″: smile or frown?</button>
      </div>
      <Graph layers={layers} view={view} onView={setWin} ariaLabel="Function colored by its derivative sign" />
      <FnInput label="f(x) =" value={src} onChange={setSrc} />
      {data && (
        <>
          <div className="sign-chart" aria-label="Sign chart">
            {data.chart.intervals.map((iv, i) => (
              <FragmentPair key={i} pt={i > 0 ? data.chart.points[i - 1] : undefined}>
                <div className={iv.sign > 0 ? "pos" : "neg"}>
                  {iv.sign > 0 ? "+" : "−"} {m === "first" ? (iv.sign > 0 ? "↗" : "↘") : iv.sign > 0 ? "∪" : "∩"}
                </div>
              </FragmentPair>
            ))}
          </div>
          <div className="slot small">
            {m === "first" ? (
              <Rich text={String.raw`**Green = increasing** ($f'>0$) on $${join(pos)}$

**Red = decreasing** ($f'<0$) on $${join(neg)}$

Purple dashes = the graph of $f'$. Where it crosses zero and **changes sign**, $f$ has a max or min.`} />
            ) : (
              <Rich text={String.raw`**Green = concave up** ($f''>0$, holds water ∪) on $${join(pos)}$

**Red = concave down** ($f''<0$, spills water ∩) on $${join(neg)}$

Inflection points are where the color flips. Purple dashes = the graph of $f''$.`} />
            )}
          </div>
        </>
      )}
      <Try>This is the actual February 2026 exam function. Switch between the f′ and f″ tabs. Then type <code>x^3 - 3x</code> and predict the colors before you look.</Try>
    </div>
  );
}

function FragmentPair({ pt, children }: { pt?: { x: number; kind: string }; children: ReactNode }) {
  return (
    <>
      {pt && <div className="pt">{pt.kind === "undef" ? "✕ " : ""}{n4(pt.x)}</div>}
      {children}
    </>
  );
}

// ── 5. Transformations ───────────────────────────────────────────────────
const BASES: Record<string, { tex: string; f: (x: number) => number }> = {
  "x^2": { tex: "x^2", f: (x) => x * x },
  "x^3": { tex: "x^3", f: (x) => x * x * x },
  "sqrt(x)": { tex: "\\sqrt{x}", f: Math.sqrt },
  "|x|": { tex: "|x|", f: Math.abs },
  "1/x": { tex: "\\tfrac{1}{x}", f: (x) => 1 / x },
  "2^x": { tex: "2^x", f: (x) => 2 ** x },
  "e^x": { tex: "e^x", f: Math.exp },
  "ln(x)": { tex: "\\ln x", f: Math.log },
  "sin(x)": { tex: "\\sin x", f: Math.sin },
};

export function TransformTool({ base: b0 = "x^2" }: { base?: string }) {
  const [base, setBase] = useState(b0 in BASES ? b0 : "x^2");
  const [A, setA] = useState(1);
  const [B, setB] = useState(1);
  const [Hs, setH] = useState(0);
  const [K, setK] = useState(0);
  const g = BASES[base]!;
  const f = (x: number) => A * g.f(B * (x - Hs)) + K;
  const sign = (n: number) => (n < 0 ? `+ ${n4(-n)}` : `- ${n4(n)}`);
  const inner = B === 1 ? (Hs === 0 ? "x" : `x ${sign(Hs)}`) : Hs === 0 ? `${n4(B)}x` : `${n4(B)}(x ${sign(Hs)})`;
  const formula = `${A === 1 ? "" : A === -1 ? "-" : n4(A)}${g.tex.replace(/x/g, `(${inner})`).replace("\\sqrt{(", "\\sqrt{(")}${K === 0 ? "" : K > 0 ? ` + ${n4(K)}` : ` - ${n4(-K)}`}`;
  const notes: string[] = [];
  if (K) notes.push(`$k = ${n4(K)}$: slide **${K > 0 ? "up" : "down"} ${n4(Math.abs(K))}**`);
  if (Hs) notes.push(`$h = ${n4(Hs)}$: slide **${Hs > 0 ? "right" : "left"} ${n4(Math.abs(Hs))}** (inside the function = opposite of what it looks like!)`);
  if (A !== 1) notes.push(`$a = ${n4(A)}$: ${A < 0 ? "**flip upside down** (over the x-axis)" : ""}${Math.abs(A) !== 1 ? `${A < 0 ? " and " : ""}**stretch tall by ${n4(Math.abs(A))}**${Math.abs(A) < 1 ? " (that's a squish)" : ""}` : ""}`);
  if (B !== 1) notes.push(`$b = ${n4(B)}$: ${B < 0 ? "**mirror left↔right** (over the y-axis)" : ""}${Math.abs(B) !== 1 ? `${B < 0 ? " and " : ""}**squeeze sideways by ${n4(Math.abs(B))}**${Math.abs(B) < 1 ? " (that's a stretch)" : ""}` : ""}`);
  return (
    <div className="stack">
      <Graph layers={[{ type: "fn", f: g.f, color: "#9e9e9e", width: 2, dash: [5, 5] }, { type: "fn", f, color: COLORS[0]! }]} view={v(-8, 8, -8, 8)} ariaLabel="Transformed function" />
      <div className="row">
        {Object.keys(BASES).map((k) => (
          <button key={k} className={`btn sm ${k === base ? "primary" : ""}`} onClick={() => setBase(k)}><Tex src={BASES[k]!.tex} /></button>
        ))}
      </div>
      <div className="formula-card slot"><Tex src={`y = ${formula}`} display /></div>
      <div className="grid-2">
        <div className="stack">
          <Slider label="a (outside ×)" value={A} min={-3} max={3} step={0.25} onChange={setA} />
          <Slider label="k (outside +)" value={K} min={-5} max={5} step={0.5} onChange={setK} />
        </div>
        <div className="stack">
          <Slider label="b (inside ×)" value={B} min={-3} max={3} step={0.25} onChange={(x) => setB(x === 0 ? 0.25 : x)} />
          <Slider label="h (inside −)" value={Hs} min={-5} max={5} step={0.5} onChange={setH} />
        </div>
      </div>
      <div className="slot small">{notes.length ? notes.map((n, i) => <Rich key={i} text={n} />) : <Rich text="Grey dashes = the original. Move a slider and watch the **red** copy move." />}</div>
      <Btn size="sm" onClick={() => { setA(1); setB(1); setH(0); setK(0); }}>Reset ⟲</Btn>
      <Try>Rule of thumb: <strong>outside changes do what you expect</strong> (up is up). <strong>Inside changes do the opposite</strong> (x − 3 moves RIGHT). Prove it to yourself with the h slider.</Try>
    </div>
  );
}

// ── 6. Exponential + log mirror ─────────────────────────────────────────
export function ExponentialTool({ a: a0 = 1, b: b0 = 2 }: { a?: number; b?: number }) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const [mirror, setMirror] = useState(false);
  const f = (x: number) => a * Math.pow(b, x);
  const layers: Layer[] = [{ type: "fn", f, color: COLORS[0]! }, { type: "point", x: 0, y: a, color: COLORS[0]!, label: `(0, ${n4(a)})` }];
  if (mirror && a > 0) {
    layers.push({ type: "fn", f: (x) => x, color: "#9e9e9e", dash: [4, 4], width: 1.5 });
    layers.push({ type: "fn", f: (x) => Math.log(x / a) / Math.log(b), color: COLORS[1]! });
  }
  const r = b - 1;
  const t = Math.log(2) / Math.log(b);
  return (
    <div className="stack">
      <Graph layers={layers} view={v(-6, 6, -4, 10)} ariaLabel="Exponential function" />
      <div className="formula-card slot"><Tex src={`f(x) = ${n4(a)}\\cdot ${n4(b)}^{x}`} display /></div>
      <Slider label="a (start)" value={a} min={-4} max={6} step={0.5} onChange={(x) => setA(x === 0 ? 0.5 : x)} />
      <Slider label="b (multiplier)" value={b} min={0.1} max={4} step={0.05} onChange={(x) => setB(Math.abs(x - 1) < 0.02 ? 1.05 : x)} />
      <label className="row small"><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Show the inverse (the logarithm), mirrored across y = x</label>
      <div className="slot small">
        <Rich text={String.raw`Each step right **multiplies** by $b = ${n4(b)}$, which is ${r > 0 ? `**${n4(r * 100)}% growth**` : `**${n4(-r * 100)}% decay**`} per step.

${r > 0 ? `Doubling time: $\\ln 2 / \\ln b \\approx$ **${n4(t)}** steps.` : `Half-life: $\\ln(1/2)/\\ln b \\approx$ **${n4(-t)}** steps.`} The y-intercept is $a$; there is **no** x-intercept, and the x-axis is a horizontal asymptote.`} />
      </div>
      <Try>Set b below 1 (decay). Then flip on the mirror: the blue curve is a logarithm. Exponentials and logs are the same curve, reflected.</Try>
    </div>
  );
}

// ── 7. Rational function builder ─────────────────────────────────────────
export function RationalTool({ top: t0 = [-9, 5], bottom: b0 = [5, -5], lead: l0 = 1 }: { top?: number[]; bottom?: number[]; lead?: number }) {
  const [top, setTop] = useState<number[]>(t0);
  const [bot, setBot] = useState<number[]>(b0);
  const [lead, setLead] = useState(l0);
  const f = (x: number) => (lead * top.reduce((p, r) => p * (x - r), 1)) / bot.reduce((p, r) => p * (x - r), 1);
  // cancel common factors
  const t = [...top], b = [...bot];
  const holes: number[] = [];
  for (let i = t.length - 1; i >= 0; i--) {
    const j = b.indexOf(t[i]!);
    if (j >= 0) { holes.push(t[i]!); t.splice(i, 1); b.splice(j, 1); }
  }
  const simplified = (x: number) => (lead * t.reduce((p, r) => p * (x - r), 1)) / b.reduce((p, r) => p * (x - r), 1);
  const va = [...new Set(b)];
  const ha = top.length < bot.length ? 0 : top.length === bot.length ? lead : null;
  const factor = (rs: number[]) => (rs.length ? rs.map((r) => (r === 0 ? "x" : `(x ${r > 0 ? "-" : "+"} ${Math.abs(r)})`)).join("") : "1");
  const layers: Layer[] = [{ type: "fn", f, color: COLORS[1]! }];
  va.forEach((x) => layers.push({ type: "vline", x, color: COLORS[0]! }));
  if (ha !== null) layers.push({ type: "hline", y: ha, color: COLORS[2]! });
  holes.forEach((x) => Number.isFinite(simplified(x)) && layers.push({ type: "point", x, y: simplified(x), color: COLORS[1]!, open: true }));
  const editor = (label: string, roots: number[], set: (r: number[]) => void) => (
    <div className="slot">
      <div className="small" style={{ fontWeight: 700 }}>{label} roots (click to remove)</div>
      <div className="row" style={{ gap: 4, marginTop: 6 }}>
        {roots.map((r, i) => <button key={i} className="btn sm" onClick={() => set(roots.filter((_, j) => j !== i))}>{r} ✕</button>)}
        {roots.length < 4 && (
          <select className="select" style={{ width: 120, minHeight: 38 }} value="" onChange={(e) => e.target.value && set([...roots, Number(e.target.value)].sort((x, y) => x - y))}>
            <option value="">+ add root</option>
            {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>
    </div>
  );
  return (
    <div className="stack">
      <Graph layers={layers} view={v(-10, 10, -8, 8)} ariaLabel="Rational function" />
      <div className="formula-card slot"><Tex src={`f(x) = \\dfrac{${lead === 1 ? "" : n4(lead)}${factor(top)}}{${factor(bot)}}`} display /></div>
      <div className="grid-2">{editor("Top", top, setTop)}{editor("Bottom", bot, setBot)}</div>
      <Slider label="leading number" value={lead} min={-3} max={3} step={0.5} onChange={(x) => setLead(x === 0 ? 0.5 : x)} />
      <div className="grid-3">
        <div className="card small"><strong>🕳️ Holes</strong><br />{holes.length ? holes.map((h) => `x = ${h}`).join(", ") : "none"}<br /><span className="muted">factor on top AND bottom cancels</span></div>
        <div className="card small"><strong>🧱 Vertical asymptotes</strong><br />{va.length ? va.map((h) => `x = ${h}`).join(", ") : "none"}<br /><span className="muted">bottom is still 0 after canceling</span></div>
        <div className="card small"><strong>➖ Horizontal asymptote</strong><br />{ha === null ? "none (top degree is bigger)" : `y = ${n4(ha)}`}<br /><span className="muted">compare degrees: {top.length} on top, {bot.length} on bottom</span></div>
      </div>
      <Try>The default is the Week 2 example <Tex src="\frac{x^2+4x-45}{x^2-25}" />. Add a matching root to both top and bottom and watch a hole appear.</Try>
    </div>
  );
}

// ── 8. Piecewise: continuity + differentiability ─────────────────────────
export function PiecewiseTool() {
  const [A, setA] = useState(1);
  const [B, setB] = useState(1);
  const c = 2;
  const left = (x: number) => A * x * x + B;
  const right = (x: number) => 3 * x + 1;
  const cont = Math.abs(left(c) - right(c)) < 1e-9;
  const diff = Math.abs(2 * A * c - 3) < 1e-9;
  return (
    <div className="stack">
      <Graph
        layers={[
          { type: "fn", f: left, color: COLORS[0]!, domain: [-10, c] },
          { type: "fn", f: right, color: COLORS[1]!, domain: [c, 10] },
          { type: "point", x: c, y: left(c), color: COLORS[0]!, open: true },
          { type: "point", x: c, y: right(c), color: COLORS[1]! },
          { type: "line", x0: c, y0: left(c), m: 2 * A * c, color: COLORS[0]!, dash: [4, 6], width: 1.5 },
          { type: "line", x0: c, y0: right(c), m: 3, color: COLORS[1]!, dash: [4, 6], width: 1.5 },
        ]}
        view={v(-2, 6, -4, 16)}
        ariaLabel="Piecewise function"
      />
      <div className="formula-card slot">
        <Tex src={`f(x)=\\begin{cases} ${n4(A)}x^2 + ${n4(B)} & x<2 \\\\ 3x+1 & x\\ge 2 \\end{cases}`} display />
      </div>
      <Slider label="A" value={A} min={-2} max={3} step={0.05} onChange={setA} />
      <Slider label="B" value={B} min={-4} max={10} step={0.25} onChange={setB} />
      <div className="grid-2">
        <div className={`feedback ${cont ? "ok" : "no"}`}>
          <strong>Continuous?</strong> Heights at x = 2: left {n4(left(c))}, right {n4(right(c))}. {cont ? "They match: no jump! ✅" : "They don't match: there's a jump."}
        </div>
        <div className={`feedback ${diff ? "ok" : "no"}`}>
          <strong>Differentiable?</strong> Slopes at x = 2: left {n4(2 * A * c)}, right 3. {diff ? (cont ? "Match, and it's continuous. Smooth! ✅" : "Slopes match, but it must ALSO be continuous.") : "Slopes don't match: there's a corner (or jump)."}
        </div>
      </div>
      <Try>Find A and B that make BOTH boxes green. (Answer from the exam sheet: A = 3/4, B = 4.) The dashed lines show each piece's slope at x = 2. Smooth means they line up perfectly.</Try>
    </div>
  );
}

// ── 9. Riemann sums ──────────────────────────────────────────────────────
export function RiemannTool({ f: f0 = "x^2", a: a0 = 0, b: b0 = 2 }: { f?: string; a?: number; b?: number }) {
  const [src, setSrc] = useState(f0);
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const [n, setN] = useState(4);
  const [rule, setRule] = useState<"left" | "right" | "mid" | "trap">("left");
  const f = useFn(src);
  const layers: Layer[] = [];
  let sum = NaN, exact = NaN;
  if (f && b > a) {
    const dx = (b - a) / n;
    sum = 0;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx, x1 = x0 + dx;
      if (rule === "trap") {
        const y0 = f(x0), y1 = f(x1);
        sum += ((y0 + y1) / 2) * dx;
        layers.push({ type: "poly", pts: [[x0, 0], [x0, y0], [x1, y1], [x1, 0]], fill: "#1e88e533", stroke: "#1e88e5" });
      } else {
        const xs = rule === "left" ? x0 : rule === "right" ? x1 : (x0 + x1) / 2;
        const y = f(xs);
        sum += y * dx;
        layers.push({ type: "rect", x: x0, w: dx, h: y, fill: y >= 0 ? "#2e9e4433" : "#e5393533", stroke: y >= 0 ? "#2e9e44" : "#e53935" });
      }
    }
    exact = simpson(f, a, b);
    layers.push({ type: "fn", f, color: COLORS[1]! });
  }
  const ys = f ? [f(a), f(b), f((a + b) / 2)].filter(Number.isFinite) : [0];
  const top = Math.max(1, ...ys) * 1.3;
  const bot = Math.min(0, ...ys) * 1.3 - 0.5;
  return (
    <div className="stack">
      <Graph layers={layers} view={v(a - (b - a) * 0.25, b + (b - a) * 0.25, bot, top)} ariaLabel="Riemann sum rectangles" />
      <div className="tabs">
        {(["left", "right", "mid", "trap"] as const).map((r) => <button key={r} className={rule === r ? "on" : ""} onClick={() => setRule(r)}>{r === "mid" ? "Midpoint" : r === "trap" ? "Trapezoid" : r[0]!.toUpperCase() + r.slice(1)}</button>)}
      </div>
      <div className="grid-2">
        <FnInput label="f(x) =" value={src} onChange={setSrc} />
        <div className="stack">
          <Slider label="n boxes" value={n} min={1} max={100} step={1} onChange={setN} />
          <div className="row">
            <label className="field grow"><span>a</span><input className="input" type="number" step="any" value={a} onChange={(e) => setA(Number(e.target.value))} /></label>
            <label className="field grow"><span>b</span><input className="input" type="number" step="any" value={b} onChange={(e) => setB(Number(e.target.value))} /></label>
          </div>
        </div>
      </div>
      <div className="slot">
        <Rich text={String.raw`$\Delta x = \dfrac{b-a}{n} = ${n4((b - a) / n)}$. Sum of the ${n} areas: **${n4(sum)}**. The exact area $\int_{${n4(a)}}^{${n4(b)}} f(x)\,dx \approx$ **${n4(exact)}**. Error: ${n4(Math.abs(sum - exact))}.`} />
      </div>
      <Try>Crank n up to 100. The boxes hug the curve and the error shrinks toward 0. That limit IS the definite integral.</Try>
    </div>
  );
}

// ── 10. Optimization: the open box ───────────────────────────────────────
export function BoxTool({ side = 12 }: { side?: number }) {
  const [x, setX] = useState(1);
  const V = (t: number) => t * (side - 2 * t) ** 2;
  const best = side / 6;
  const s = 220 / side;
  return (
    <div className="stack">
      <div className="grid-2">
        <div className="slot" style={{ display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 240 240" width="240" height="240" aria-label="Sheet with corner squares cut out">
            <rect x="10" y="10" width="220" height="220" fill="#e9d9a6" stroke="#000" strokeWidth="3" />
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], k) => (
              <rect key={k} x={10 + (i ? 220 - x * s : 0)} y={10 + (j ? 220 - x * s : 0)} width={x * s} height={x * s} fill="#e53935" opacity="0.85" />
            ))}
            <rect x={10 + x * s} y={10 + x * s} width={220 - 2 * x * s} height={220 - 2 * x * s} fill="none" stroke="#1e88e5" strokeWidth="2" strokeDasharray="6 4" />
            <text x="120" y="126" textAnchor="middle" fontSize="13" fontWeight="700">base {n4(side - 2 * x)} × {n4(side - 2 * x)}</text>
          </svg>
        </div>
        <Graph layers={[{ type: "fn", f: V, color: COLORS[1]!, domain: [0, side / 2] }, { type: "point", x, y: V(x), color: COLORS[0]!, label: `V=${n4(V(x))}` }]} view={v(-0.5, side / 2 + 0.5, -20, V(best) * 1.25)} height={260} ariaLabel="Volume as a function of cut size" />
      </div>
      <Slider label="cut size x" value={x} min={0} max={side / 2} step={0.05} onChange={setX} />
      <div className="slot">
        <Rich text={String.raw`Cut an $x \times x$ square from each corner of a ${side}×${side} sheet and fold up the sides. Volume: $V(x) = x(${side}-2x)^2$. Right now $V = $ **${n4(V(x))}**. Calculus says set $V'(x) = (${side}-2x)(${side}-6x) = 0$, so the best cut is $x = ${n4(best)}$ with $V = ${n4(V(best))}$.`} />
      </div>
      <Try>Find the biggest volume by dragging, THEN check it against the calculus answer. Too small a cut = flat box; too big = skinny tower.</Try>
    </div>
  );
}

// ── 11. Unit circle ──────────────────────────────────────────────────────
export function UnitCircleTool() {
  const [deg, setDeg] = useState(30);
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t), s = Math.sin(t);
  const SPECIAL: Record<number, [string, string]> = { 0: ["1", "0"], 30: ["\\frac{\\sqrt3}{2}", "\\frac12"], 45: ["\\frac{\\sqrt2}{2}", "\\frac{\\sqrt2}{2}"], 60: ["\\frac12", "\\frac{\\sqrt3}{2}"], 90: ["0", "1"], 180: ["-1", "0"], 270: ["0", "-1"], 360: ["1", "0"] };
  const sp = SPECIAL[deg];
  return (
    <div className="stack">
      <div className="grid-2">
        <Graph
          layers={[
            { type: "fn", f: (x) => Math.sqrt(1 - x * x), color: "#9e9e9e", width: 2 },
            { type: "fn", f: (x) => -Math.sqrt(1 - x * x), color: "#9e9e9e", width: 2 },
            { type: "seg", x1: 0, y1: 0, x2: c, y2: s, color: "#111" },
            { type: "seg", x1: c, y1: 0, x2: c, y2: s, color: COLORS[0]!, width: 4 },
            { type: "seg", x1: 0, y1: 0, x2: c, y2: 0, color: COLORS[1]!, width: 4 },
            { type: "point", x: c, y: s, color: "#111", label: `(${n4(c)}, ${n4(s)})` },
          ]}
          view={v(-1.6, 1.6, -1.6, 1.6)}
          height={300}
          interactive={false}
          ariaLabel="Unit circle"
        />
        <Graph
          layers={[
            { type: "fn", f: Math.sin, color: COLORS[0]! },
            { type: "fn", f: Math.cos, color: COLORS[1]! },
            { type: "point", x: t, y: s, color: COLORS[0]! },
            { type: "point", x: t, y: c, color: COLORS[1]! },
          ]}
          view={v(-0.5, 7, -1.6, 1.6)}
          height={300}
          interactive={false}
          ariaLabel="Sine and cosine waves"
        />
      </div>
      <Slider label="angle" value={deg} min={0} max={360} step={15} onChange={setDeg} fmt={(d) => `${d}°`} />
      <div className="slot">
        <Rich text={String.raw`$\theta = ${deg}^\circ = ${n4(t)}$ radians. **cos** is the x-coordinate (blue) $= ${sp ? sp[0] : n4(c)}$, **sin** is the y-coordinate (red) $= ${sp ? sp[1] : n4(s)}$. Calculus uses **radians**: $180^\circ = \pi$.`} />
      </div>
    </div>
  );
}

export const TOOLS: Record<ToolId, { name: string; emoji: string; blurb: string; render: (props: Record<string, unknown>) => ReactNode }> = {
  grapher: { name: "Grapher", emoji: "📈", blurb: "Graph up to 4 functions. Pan, zoom, read values.", render: (p) => <GrapherTool {...(p as object)} /> },
  limit: { name: "Limit Lab", emoji: "🔍", blurb: "Sneak up on x = a from both sides with tables + graph.", render: (p) => <LimitTool {...(p as object)} /> },
  tangent: { name: "Secant → Tangent", emoji: "📐", blurb: "Shrink h and watch a secant turn into the tangent line.", render: (p) => <TangentTool {...(p as object)} /> },
  derivative: { name: "Derivative Lab", emoji: "🎢", blurb: "Auto sign charts. Increasing/decreasing, concavity, inflection.", render: (p) => <DerivativeTool {...(p as object)} /> },
  signchart: { name: "Sign Chart Builder", emoji: "➕➖", blurb: "Where is it positive or negative? Auto sign chart.", render: (p) => <DerivativeTool {...(p as object)} /> },
  transform: { name: "Transformations", emoji: "🎛️", blurb: "Shift, stretch and flip any parent function with sliders.", render: (p) => <TransformTool {...(p as object)} /> },
  exponential: { name: "Exponential & Log", emoji: "🚀", blurb: "a·bˣ growth/decay, doubling time, and the log mirror.", render: (p) => <ExponentialTool {...(p as object)} /> },
  rational: { name: "Rational Builder", emoji: "🕳️", blurb: "Build p(x)/q(x) and see holes and asymptotes appear.", render: (p) => <RationalTool {...(p as object)} /> },
  piecewise: { name: "Piecewise Fixer", emoji: "🧩", blurb: "Tune A and B until the pieces join smoothly.", render: () => <PiecewiseTool /> },
  riemann: { name: "Riemann Boxes", emoji: "📦", blurb: "Approximate area with rectangles; watch the error vanish.", render: (p) => <RiemannTool {...(p as object)} /> },
  box: { name: "Box Optimizer", emoji: "🎁", blurb: "The classic open-box problem, as a toy.", render: (p) => <BoxTool {...(p as object)} /> },
  unitcircle: { name: "Unit Circle", emoji: "⭕", blurb: "Angles, sin and cos, radians.", render: () => <UnitCircleTool /> },
};
