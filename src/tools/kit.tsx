import { useMemo } from "react";
import { compile, previewTex } from "@/lib/math/expr";
import { Tex } from "@/components/Rich";

export function useFn(src: string, v = "x") {
  return useMemo(() => compile(src, v), [src, v]);
}

export function FnInput({ label, value, onChange, color, v = "x" }: { label: string; value: string; onChange: (s: string) => void; color?: string; v?: string }) {
  const p = useMemo(() => previewTex(value), [value]);
  const bad = value.trim() !== "" && !compile(value, v);
  return (
    <label className="field" style={{ display: "block" }}>
      <span>
        {color && <i style={{ display: "inline-block", width: 12, height: 12, background: color, marginRight: 6, boxShadow: "0 0 0 2px #000" }} />}
        {label}
      </span>
      <input className="input mathy" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} autoCapitalize="off" autoComplete="off" />
      <div className="preview small" style={{ minHeight: 34 }}>
        {p.tex && !bad ? <Tex src={p.tex} /> : <span className={bad ? "bad" : "muted"}>{bad ? p.error ?? `Use ${v} as the variable.` : "Type a function, e.g. x^2 - 3x"}</span>}
      </div>
    </label>
  );
}

export function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; fmt?: (n: number) => string }) {
  return (
    <label className="slider-row">
      <span className="small" style={{ fontWeight: 700 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <output>{fmt ? fmt(value) : Number(value.toFixed(3))}</output>
    </label>
  );
}

export function n4(v: number): string {
  if (!Number.isFinite(v)) return v > 0 ? "∞" : v < 0 ? "−∞" : "undefined";
  if (Math.abs(v) < 1e-9) return "0";
  if (Math.abs(v) >= 1e6) return v.toExponential(3);
  return String(Number(v.toPrecision(6)));
}

export function fmtInterval(lo: number, hi: number): string {
  const e = (v: number) => (v === -Infinity ? "-\\infty" : v === Infinity ? "\\infty" : n4(v));
  return `(${e(lo)}, ${e(hi)})`;
}
