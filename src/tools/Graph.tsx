import { useCallback, useEffect, useRef, useState } from "react";

export interface View { xmin: number; xmax: number; ymin: number; ymax: number }

export type Layer =
  | { type: "fn"; f: (x: number) => number; color: string; width?: number; dash?: number[]; domain?: [number, number]; colorAt?: (x: number) => string | null }
  | { type: "point"; x: number; y: number; color: string; open?: boolean; r?: number; label?: string }
  | { type: "seg"; x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dash?: number[] }
  | { type: "vline"; x: number; color: string; dash?: number[]; width?: number }
  | { type: "hline"; y: number; color: string; dash?: number[]; width?: number }
  | { type: "line"; x0: number; y0: number; m: number; color: string; width?: number; dash?: number[] }
  | { type: "rect"; x: number; w: number; h: number; fill: string; stroke?: string }
  | { type: "poly"; pts: Array<[number, number]>; fill: string; stroke?: string }
  | { type: "area"; f: (x: number) => number; a: number; b: number; fill: string }
  | { type: "text"; x: number; y: number; text: string; color: string };

export const COLORS = ["#e53935", "#1e88e5", "#2e9e44", "#fb8c00", "#8e24aa", "#00897b"];

function niceStep(range: number, target = 8): number {
  const raw = range / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

function fmt(v: number): string {
  if (Math.abs(v) < 1e-10) return "0";
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-3) return v.toExponential(1);
  return String(Number(v.toPrecision(4)));
}

export function Graph({ layers, view: initial, height = 360, onView, interactive = true, readout = true, ariaLabel = "Graph" }: {
  layers: Layer[];
  view: View;
  height?: number;
  onView?: (v: View) => void;
  interactive?: boolean;
  readout?: boolean;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(initial);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ px: number; py: number; v: View } | null>(null);
  const dark = typeof document !== "undefined" && document.documentElement.dataset.dark === "true";

  // follow the parent when it changes the window (e.g. a "reset" button or a new function)
  const initialKey = `${initial.xmin},${initial.xmax},${initial.ymin},${initial.ymax}`;
  useEffect(() => {
    setView(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const updateView = useCallback((v: View) => {
    setView(v);
    onView?.(v);
  }, [onView]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(Math.max(240, Math.floor(entries[0]!.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = width * dpr;
    c.height = height * dpr;
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { xmin, xmax, ymin, ymax } = view;
    const X = (x: number) => ((x - xmin) / (xmax - xmin)) * width;
    const Y = (y: number) => height - ((y - ymin) / (ymax - ymin)) * height;
    const bg = dark ? "#0c0c10" : "#ffffff";
    const grid = dark ? "#23232c" : "#ececec";
    const axis = dark ? "#9a9aa8" : "#444";
    const label = dark ? "#a8a8b8" : "#666";
    g.fillStyle = bg;
    g.fillRect(0, 0, width, height);

    // grid
    const sx = niceStep(xmax - xmin, width / 70);
    const sy = niceStep(ymax - ymin, height / 50);
    g.lineWidth = 1;
    g.strokeStyle = grid;
    g.beginPath();
    for (let x = Math.ceil(xmin / sx) * sx; x <= xmax; x += sx) { g.moveTo(Math.round(X(x)) + 0.5, 0); g.lineTo(Math.round(X(x)) + 0.5, height); }
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) { g.moveTo(0, Math.round(Y(y)) + 0.5); g.lineTo(width, Math.round(Y(y)) + 0.5); }
    g.stroke();

    // axes
    g.strokeStyle = axis;
    g.lineWidth = 2;
    g.beginPath();
    if (ymin <= 0 && ymax >= 0) { g.moveTo(0, Y(0)); g.lineTo(width, Y(0)); }
    if (xmin <= 0 && xmax >= 0) { g.moveTo(X(0), 0); g.lineTo(X(0), height); }
    g.stroke();

    // tick labels
    g.fillStyle = label;
    g.font = "11px ui-monospace, Menlo, monospace";
    const y0 = Math.min(height - 4, Math.max(12, Y(0) + 13));
    for (let x = Math.ceil(xmin / sx) * sx; x <= xmax; x += sx) {
      if (Math.abs(x) < sx / 2) continue;
      g.fillText(fmt(x), X(x) + 3, y0);
    }
    const x0 = Math.min(width - 34, Math.max(3, X(0) + 4));
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) {
      if (Math.abs(y) < sy / 2) continue;
      g.fillText(fmt(y), x0, Y(y) - 3);
    }

    const H = ymax - ymin;
    for (const L of layers) {
      g.setLineDash([]);
      switch (L.type) {
        case "area": {
          g.fillStyle = L.fill;
          g.beginPath();
          const n = 300;
          const a = Math.max(L.a, xmin - 1), b = Math.min(L.b, xmax + 1);
          g.moveTo(X(a), Y(0));
          for (let i = 0; i <= n; i++) {
            const x = a + ((b - a) * i) / n;
            const y = L.f(x);
            g.lineTo(X(x), Y(Number.isFinite(y) ? Math.max(ymin - H, Math.min(ymax + H, y)) : 0));
          }
          g.lineTo(X(b), Y(0));
          g.closePath();
          g.fill();
          break;
        }
        case "rect": {
          g.fillStyle = L.fill;
          const top = Math.max(L.h, 0), bot = Math.min(L.h, 0);
          g.fillRect(X(L.x), Y(top), X(L.x + L.w) - X(L.x), Y(bot) - Y(top));
          if (L.stroke) { g.strokeStyle = L.stroke; g.lineWidth = 1.5; g.strokeRect(X(L.x), Y(top), X(L.x + L.w) - X(L.x), Y(bot) - Y(top)); }
          break;
        }
        case "poly": {
          g.fillStyle = L.fill;
          g.beginPath();
          L.pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
          g.closePath();
          g.fill();
          if (L.stroke) { g.strokeStyle = L.stroke; g.lineWidth = 1.5; g.stroke(); }
          break;
        }
        case "vline":
          g.strokeStyle = L.color; g.lineWidth = L.width ?? 2; g.setLineDash(L.dash ?? [6, 5]);
          g.beginPath(); g.moveTo(X(L.x), 0); g.lineTo(X(L.x), height); g.stroke();
          break;
        case "hline":
          g.strokeStyle = L.color; g.lineWidth = L.width ?? 2; g.setLineDash(L.dash ?? [6, 5]);
          g.beginPath(); g.moveTo(0, Y(L.y)); g.lineTo(width, Y(L.y)); g.stroke();
          break;
        case "line":
          g.strokeStyle = L.color; g.lineWidth = L.width ?? 2; g.setLineDash(L.dash ?? []);
          g.beginPath(); g.moveTo(X(xmin), Y(L.y0 + L.m * (xmin - L.x0))); g.lineTo(X(xmax), Y(L.y0 + L.m * (xmax - L.x0))); g.stroke();
          break;
        case "seg":
          g.strokeStyle = L.color; g.lineWidth = L.width ?? 2.5; g.setLineDash(L.dash ?? []);
          g.beginPath(); g.moveTo(X(L.x1), Y(L.y1)); g.lineTo(X(L.x2), Y(L.y2)); g.stroke();
          break;
        case "fn": {
          const n = Math.max(400, Math.floor(width * 1.5));
          const [da, db] = L.domain ?? [xmin, xmax];
          const a = Math.max(da, xmin), b = Math.min(db, xmax);
          if (a >= b) break;
          g.lineWidth = L.width ?? 3;
          g.setLineDash(L.dash ?? []);
          g.lineJoin = "round";
          let prev: { x: number; y: number } | null = null;
          let color = L.color;
          g.strokeStyle = color;
          g.beginPath();
          for (let i = 0; i <= n; i++) {
            const x = a + ((b - a) * i) / n;
            const y = L.f(x);
            if (!Number.isFinite(y)) { prev = null; continue; }
            const c = L.colorAt ? L.colorAt(x) ?? L.color : L.color;
            const cy = Math.max(ymin - 2 * H, Math.min(ymax + 2 * H, y));
            // break the path at jumps and vertical asymptotes
            const jump = prev && Math.abs(cy - prev.y) > H * 1.5 && (Math.sign(cy - (ymin + ymax) / 2) !== Math.sign(prev.y - (ymin + ymax) / 2) || Math.abs(cy - prev.y) > H * 3);
            if (c !== color) {
              g.stroke();
              g.beginPath();
              color = c;
              g.strokeStyle = color;
              if (prev && !jump) g.moveTo(X(prev.x), Y(prev.y));
            }
            if (!prev || jump) g.moveTo(X(x), Y(cy));
            else g.lineTo(X(x), Y(cy));
            prev = { x, y: cy };
          }
          g.stroke();
          break;
        }
        case "point": {
          const r = L.r ?? 5.5;
          g.beginPath();
          g.arc(X(L.x), Y(L.y), r, 0, Math.PI * 2);
          if (L.open) { g.fillStyle = bg; g.fill(); g.lineWidth = 2.5; g.strokeStyle = L.color; g.stroke(); }
          else { g.fillStyle = L.color; g.fill(); g.lineWidth = 2; g.strokeStyle = dark ? "#000" : "#fff"; g.stroke(); }
          if (L.label) { g.fillStyle = L.color; g.font = "bold 12px ui-monospace, monospace"; g.fillText(L.label, X(L.x) + 8, Y(L.y) - 8); }
          break;
        }
        case "text":
          g.fillStyle = L.color; g.font = "bold 13px ui-sans-serif, system-ui"; g.fillText(L.text, X(L.x), Y(L.y));
          break;
      }
    }

    if (hover) {
      g.setLineDash([3, 4]);
      g.strokeStyle = dark ? "#ffffff55" : "#00000044";
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(X(hover.x), 0); g.lineTo(X(hover.x), height); g.stroke();
      const fnLayer = layers.find((l) => l.type === "fn") as Extract<Layer, { type: "fn" }> | undefined;
      if (fnLayer) {
        const y = fnLayer.f(hover.x);
        if (Number.isFinite(y)) {
          g.setLineDash([]);
          g.beginPath(); g.arc(X(hover.x), Y(y), 5, 0, Math.PI * 2); g.fillStyle = fnLayer.color; g.fill();
        }
      }
    }
  }, [layers, view, width, height, hover, dark]);

  const toWorld = (clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const x = view.xmin + ((clientX - r.left) / r.width) * (view.xmax - view.xmin);
    const y = view.ymax - ((clientY - r.top) / r.height) * (view.ymax - view.ymin);
    return { x, y };
  };

  const zoom = (factor: number, cx?: number, cy?: number) => {
    const mx = cx ?? (view.xmin + view.xmax) / 2;
    const my = cy ?? (view.ymin + view.ymax) / 2;
    updateView({ xmin: mx - (mx - view.xmin) * factor, xmax: mx + (view.xmax - mx) * factor, ymin: my - (my - view.ymin) * factor, ymax: my + (view.ymax - my) * factor });
  };

  const hoverFn = layers.find((l) => l.type === "fn") as Extract<Layer, { type: "fn" }> | undefined;
  const hy = hover && hoverFn ? hoverFn.f(hover.x) : null;

  return (
    <div className="plot-wrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          // touch scrolls the page; mouse and pen pan the graph
          if (!interactive || e.pointerType === "touch") return setHover(toWorld(e.clientX, e.clientY));
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          drag.current = { px: e.clientX, py: e.clientY, v: view };
        }}
        onPointerMove={(e) => {
          const w = toWorld(e.clientX, e.clientY);
          setHover(w);
          if (!drag.current) return;
          const r = canvasRef.current!.getBoundingClientRect();
          const d = drag.current;
          const dx = ((e.clientX - d.px) / r.width) * (d.v.xmax - d.v.xmin);
          const dy = ((e.clientY - d.py) / r.height) * (d.v.ymax - d.v.ymin);
          updateView({ xmin: d.v.xmin - dx, xmax: d.v.xmax - dx, ymin: d.v.ymin + dy, ymax: d.v.ymax + dy });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => {
          drag.current = null;
          setHover(null);
        }}
      />
      {readout && hover && (
        <div className="plot-readout">
          x = {fmt(hover.x)}
          {hy !== null && Number.isFinite(hy) ? `   f(x) = ${fmt(hy)}` : ""}
        </div>
      )}
      {interactive && (
        <div className="plot-zoom">
          <button type="button" aria-label="Zoom in" onClick={() => zoom(1 / 1.4)}>+</button>
          <button type="button" aria-label="Zoom out" onClick={() => zoom(1.4)}>−</button>
          <button type="button" aria-label="Reset view" onClick={() => updateView(initial)} style={{ fontSize: 14 }}>⟲</button>
        </div>
      )}
    </div>
  );
}

/** Numerical helpers shared by the tools. */
export function deriv(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}
export function deriv2(f: (x: number) => number, x: number, h = 1e-3): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}
export function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Sign chart: where g changes sign or is undefined, scanning [a, b]. */
export function signChart(g: (x: number) => number, a: number, b: number, n = 4000): { points: Array<{ x: number; kind: "zero" | "undef" }>; intervals: Array<{ lo: number; hi: number; sign: 1 | -1 }> } {
  const pts: Array<{ x: number; kind: "zero" | "undef" }> = [];
  const step = (b - a) / n;
  let prevX = a;
  let prev = g(a);
  for (let i = 1; i <= n; i++) {
    const x = a + i * step;
    const y = g(x);
    const pf = Number.isFinite(prev), yf = Number.isFinite(y);
    if (pf && yf && Math.sign(prev) !== Math.sign(y) && prev !== 0) {
      // bisect for a clean crossing
      let lo = prevX, hi = x, glo = prev;
      for (let k = 0; k < 50; k++) {
        const mid = (lo + hi) / 2;
        const gm = g(mid);
        if (!Number.isFinite(gm)) break;
        if (Math.sign(gm) === Math.sign(glo)) { lo = mid; glo = gm; } else hi = mid;
      }
      const root = (lo + hi) / 2;
      // a huge value right next to the crossing means an asymptote, not a zero
      const big = Math.abs(g(root + step / 50)) + Math.abs(g(root - step / 50));
      const r = Math.abs(root) < 1e-7 ? 0 : Number(root.toFixed(4));
      pts.push({ x: r, kind: big > 1e4 ? "undef" : "zero" });
    } else if (pf !== yf) {
      if (!yf) pts.push({ x: Number(x.toFixed(4)), kind: "undef" });
    }
    prevX = x;
    prev = y;
  }
  // merge near-duplicates
  const merged: typeof pts = [];
  for (const p of pts) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(last.x - p.x) < step * 3) continue;
    merged.push(p);
  }
  const cuts = [a, ...merged.map((p) => p.x), b];
  const intervals: Array<{ lo: number; hi: number; sign: 1 | -1 }> = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const lo = cuts[i]!, hi = cuts[i + 1]!;
    let s = 0;
    for (const t of [0.5, 0.3, 0.7, 0.1, 0.9]) {
      const v = g(lo + (hi - lo) * t);
      if (Number.isFinite(v) && v !== 0) { s = Math.sign(v); break; }
    }
    if (s) intervals.push({ lo, hi, sign: s as 1 | -1 });
  }
  return { points: merged, intervals };
}
