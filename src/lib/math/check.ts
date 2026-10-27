// Answer checking. Expressions are compared numerically at many sample points, so
// "2x+2", "2(x+1)" and "x+x+2" are all accepted as the same answer.
import { evaluate, parse, variables, ParseError, type Node } from "./expr";

export type NumAnswer = number | "DNE" | "inf" | "-inf";

export interface Verdict {
  ok: boolean;
  /** Friendly note when the input couldn't be read (not a wrong answer, just unreadable). */
  error?: string;
  /** A gentle nudge for an answer that's close but not quite, e.g. a sign error. */
  nudge?: string;
}

const DNE_WORDS = /^(dne|does\s*not\s*exist|doesn'?t\s*exist|undefined|no\s*limit)$/i;
const INF_WORDS = /^\+?(inf|infinity|∞|oo)$/i;
const NEG_INF_WORDS = /^-(inf|infinity|∞|oo)$/i;

/** Drops a leading "y =", "f(x) =", "f'(x)=", "x =", "L =" etc. */
export function stripLhs(s: string): string {
  return s.trim().replace(/^[a-zA-Z]{1,3}[′'"]*\s*(\(\s*[a-z]\s*\))?\s*=\s*/, "");
}

export function readNumber(raw: string): NumAnswer | { error: string } {
  const s = stripLhs(raw).trim();
  if (!s) return { error: "Type an answer first" };
  if (DNE_WORDS.test(s)) return "DNE";
  if (INF_WORDS.test(s)) return "inf";
  if (NEG_INF_WORDS.test(s)) return "-inf";
  try {
    const n = parse(s);
    const vars = [...variables(n)];
    if (vars.length) return { error: `Your answer should be a number, but it has "${vars[0]}" in it.` };
    const v = evaluate(n, {});
    if (!Number.isFinite(v)) return { error: "That works out to something undefined. If the answer doesn't exist, type DNE." };
    return v;
  } catch (e) {
    return { error: e instanceof ParseError ? e.message : "I can't read that yet" };
  }
}

export function closeEnough(a: number, b: number, tol?: number): boolean {
  const t = tol ?? Math.max(1e-6, 1e-4 * Math.abs(b));
  return Math.abs(a - b) <= t;
}

export function checkNumber(raw: string, answer: NumAnswer, tol?: number): Verdict {
  const got = readNumber(raw);
  if (typeof got === "object") return { ok: false, error: got.error };
  if (typeof answer === "string" || typeof got === "string") {
    if (got === answer) return { ok: true };
    if (answer === "inf" && got === "-inf") return { ok: false, nudge: "Right size, wrong sign. Check the sign again." };
    if (answer === "-inf" && got === "inf") return { ok: false, nudge: "Right size, wrong sign. Check the sign again." };
    if (answer === "DNE" && (got === "inf" || got === "-inf")) return { ok: false, nudge: "Check BOTH sides. Do they really go the same way?" };
    return { ok: false };
  }
  if (closeEnough(got, answer, tol ?? Math.max(5e-3, 1e-3 * Math.abs(answer)))) return { ok: true };
  if (answer !== 0 && closeEnough(got, -answer, Math.max(5e-3, 1e-3 * Math.abs(answer)))) return { ok: false, nudge: "So close! The size is right, but check the sign." };
  return { ok: false };
}

export interface ExprOpts {
  variable?: string;
  /** sample window, default [-3, 3] */
  domain?: [number, number];
  /** antiderivatives: accept any answer that differs by a constant */
  upToConstant?: boolean;
}

function samplePoints(domain: [number, number], count = 24): number[] {
  const [a, b] = domain;
  const pts: number[] = [];
  // fixed pseudo-random points: irrational-ish offsets avoid landing on special values like 0 or 1
  for (let i = 0; i < count; i++) pts.push(a + (b - a) * ((i * 0.6180339887 + 0.137) % 1));
  return pts;
}

export function parseExpr(raw: string, variable = "x"): Node | { error: string } {
  const s = stripLhs(raw);
  try {
    const n = parse(s);
    for (const v of variables(n)) {
      if (v !== variable) return { error: `Use ${variable} as the variable (I saw "${v}").` };
    }
    return n;
  } catch (e) {
    return { error: e instanceof ParseError ? e.message : "I can't read that yet" };
  }
}

export function checkExpr(raw: string, answer: string, opts: ExprOpts = {}): Verdict {
  const v = opts.variable ?? "x";
  const got = parseExpr(raw, v);
  if ("error" in got) return { ok: false, error: got.error };
  const want = parseExpr(answer, v);
  if ("error" in want) throw new Error(`Bad answer key "${answer}": ${want.error}`);
  const pts = samplePoints(opts.domain ?? [-3, 3]);
  const f = (n: Node, x: number) => {
    try { return evaluate(n, { [v]: x }); } catch { return NaN; }
  };
  let compared = 0;
  let mismatches = 0;
  let negMatches = 0;
  let base: { g: number; w: number } | null = null;
  for (const x of pts) {
    const w = f(want, x);
    let g = f(got, x);
    if (!Number.isFinite(w)) continue;
    if (!Number.isFinite(g)) { mismatches++; compared++; continue; }
    if (opts.upToConstant) {
      if (!base) { base = { g, w }; continue; }
      g = g - base.g;
      const w2 = w - base.w;
      compared++;
      if (!closeEnough(g, w2, 1e-6 + 1e-6 * Math.abs(w2))) mismatches++;
      continue;
    }
    compared++;
    if (!closeEnough(g, w, 1e-6 + 1e-6 * Math.abs(w))) {
      mismatches++;
      if (closeEnough(g, -w, 1e-6 + 1e-6 * Math.abs(w))) negMatches++;
    }
  }
  if (compared < 4) throw new Error(`Answer key "${answer}" is undefined on most of the sample window`);
  if (mismatches === 0) return { ok: true };
  if (negMatches === mismatches && mismatches === compared) return { ok: false, nudge: "Everything is right except the sign. Flip it!" };
  return { ok: false };
}

// ── Intervals like (-inf, 0) U (3, inf) ─────────────────────────────────────
export interface Interval { lo: number; hi: number; loClosed: boolean; hiClosed: boolean }

export function parseIntervals(raw: string): Interval[] | { error: string } {
  const s = raw.trim().replace(/∪|\bu\b|\bU\b|\bor\b/g, "U").replace(/∞/g, "inf").replace(/\s+/g, "");
  if (/^(none|empty|∅|\{\}|never|nowhere)$/i.test(s)) return [];
  const parts = s.split("U").filter(Boolean);
  const out: Interval[] = [];
  for (const p of parts) {
    const m = /^([([])(.+),(.+)([)\]])$/.exec(p);
    if (!m) return { error: `Write intervals like (a, b) or [a, b). I couldn't read "${p}".` };
    const end = (t: string): number | null => {
      if (/^[-−]inf(inity)?$/i.test(t)) return -Infinity;
      if (/^\+?inf(inity)?$/i.test(t)) return Infinity;
      const r = readNumber(t);
      return typeof r === "number" ? r : null;
    };
    const lo = end(m[2]!);
    const hi = end(m[3]!);
    if (lo === null || hi === null) return { error: `I couldn't read an endpoint in "${p}".` };
    if (lo > hi) return { error: `In "${p}" the left end is bigger than the right end.` };
    out.push({ lo, hi, loClosed: m[1] === "[" && Number.isFinite(lo), hiClosed: m[4] === "]" && Number.isFinite(hi) });
  }
  return out.sort((a, b) => a.lo - b.lo);
}

export function checkIntervals(raw: string, answer: string, strictBrackets = false): Verdict {
  const got = parseIntervals(raw);
  if ("error" in got) return { ok: false, error: got.error };
  const want = parseIntervals(answer);
  if ("error" in want) throw new Error(`Bad interval key "${answer}"`);
  if (got.length !== want.length) return { ok: false, nudge: want.length > got.length ? "You're missing a piece. Is there another interval?" : undefined };
  const same = (a: number, b: number) => (a === b) || (Number.isFinite(a) && Number.isFinite(b) && closeEnough(a, b, 1e-3));
  for (let i = 0; i < got.length; i++) {
    const g = got[i]!;
    const w = want[i]!;
    if (!same(g.lo, w.lo) || !same(g.hi, w.hi)) return { ok: false };
    if (strictBrackets && (g.loClosed !== w.loClosed || g.hiClosed !== w.hiClosed)) {
      return { ok: false, nudge: "The numbers are right! Check your brackets: [ ] includes the endpoint, ( ) doesn't." };
    }
  }
  return { ok: true };
}

// ── Lists: "x = -1, 2" or "0, 3" (order doesn't matter unless `ordered`) ────
export function checkList(raw: string, answer: number[], ordered = false): Verdict {
  const s = raw.trim().replace(/^\(|\)$/g, "");
  if (/^(none|no\s*solution|∅)$/i.test(s)) return { ok: answer.length === 0 };
  const parts = s.split(/[,;]|\band\b|\bor\b/).map((p) => stripLhs(p)).filter(Boolean);
  const vals: number[] = [];
  for (const p of parts) {
    const r = readNumber(p);
    if (typeof r !== "number") return { ok: false, error: typeof r === "object" ? r.error : "Use numbers separated by commas" };
    vals.push(r);
  }
  if (vals.length !== answer.length) {
    return { ok: false, nudge: vals.length < answer.length ? `There are ${answer.length} answers. You have ${vals.length}.` : `There are only ${answer.length}.` };
  }
  const a = ordered ? vals : [...vals].sort((x, y) => x - y);
  const b = ordered ? answer : [...answer].sort((x, y) => x - y);
  return { ok: a.every((v, i) => closeEnough(v, b[i]!, 5e-3)) };
}
