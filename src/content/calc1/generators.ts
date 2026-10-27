// Infinite practice ("Mob Grinder"): every generator makes a fresh question from a seed,
// with a full worked solution. The test suite checks 40 seeds of every generator numerically.
import type { Question } from "../types";
import { rng } from "../../lib/pixel";

type R = () => number;
const ri = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const nz = (r: R, lo: number, hi: number) => { let v = 0; while (v === 0) v = ri(r, lo, hi); return v; };
const pick = <T,>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;

/** "+ 3", "- 3": for gluing terms */
const sgn = (n: number) => (n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`);
/** Coefficient in front of a variable: 1 → "", -1 → "-" */
const co = (n: number) => (n === 1 ? "" : n === -1 ? "-" : String(n));

/** polynomial from {power: coeff} → TeX and plain strings, highest power first */
function poly(terms: Array<[number, number]>, v = "x"): { tex: string; str: string } {
  const ts = terms.filter(([c]) => c !== 0).sort((a, b) => b[1] - a[1]);
  if (!ts.length) return { tex: "0", str: "0" };
  let tex = "", str = "";
  ts.forEach(([c, p], i) => {
    const abs = Math.abs(c);
    const body = p === 0 ? String(abs) : `${abs === 1 ? "" : abs}${v}${p === 1 ? "" : `^{${p}}`}`;
    const bodyS = p === 0 ? String(abs) : `${abs === 1 ? "" : abs}${v}${p === 1 ? "" : `^(${p})`}`;
    if (i === 0) { tex += (c < 0 ? "-" : "") + body; str += (c < 0 ? "-" : "") + bodyS; }
    else { tex += (c < 0 ? " - " : " + ") + body; str += (c < 0 ? "-" : "+") + bodyS; }
  });
  return { tex, str };
}

function frac(n: number, d: number): string {
  const g = gcd(Math.abs(n), Math.abs(d));
  let a = n / g, b = d / g;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? String(a) : `${a < 0 ? "-" : ""}\\frac{${Math.abs(a)}}{${b}}`;
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a || 1; }

export interface Generator {
  name: string;
  emoji: string;
  unit: string; // unit id it drills
  make: (seed: number) => Question;
}

function base(id: string, seed: number, level: 1 | 2 | 3 = 2) {
  return { id: `gen:${id}:${seed}`, level };
}

export const GENERATORS: Record<string, Generator> = {
  slope: {
    name: "Slope between points", emoji: "📏", unit: "u1",
    make(seed) {
      const r = rng(seed * 7 + 1);
      const x1 = ri(r, -6, 6), y1 = ri(r, -9, 9);
      let x2 = ri(r, -6, 6);
      while (x2 === x1) x2 = ri(r, -6, 6);
      const y2 = ri(r, -9, 9);
      const m = (y2 - y1) / (x2 - x1);
      return {
        ...base("slope", seed, 1), type: "num", answer: m,
        prompt: `Find the slope of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
        hints: ["Rise over run: $\\dfrac{y_2 - y_1}{x_2 - x_1}$."],
        solution: [`$m = \\dfrac{${y2} - (${y1})}{${x2} - (${x1})} = \\dfrac{${y2 - y1}}{${x2 - x1}}$`, `$m = ${frac(y2 - y1, x2 - x1)}$`],
      };
    },
  },
  line: {
    name: "Equation of a line", emoji: "✏️", unit: "u1",
    make(seed) {
      const r = rng(seed * 11 + 3);
      const m = nz(r, -5, 5), x1 = ri(r, -5, 5), y1 = ri(r, -8, 8);
      const b = y1 - m * x1;
      return {
        ...base("line", seed, 1), type: "expr", answer: `${m}x ${sgn(b)}`,
        prompt: `Find the line with slope $${m}$ through $(${x1}, ${y1})$. Type $y = \\dots$`,
        hints: ["Point-slope: $y - y_1 = m(x - x_1)$."],
        solution: [`$y - (${y1}) = ${m}(x - (${x1}))$`, `$y = ${m}x ${sgn(-m * x1)} ${sgn(y1)}$`, `$y = ${co(m)}x ${b === 0 ? "" : sgn(b)}$`],
      };
    },
  },
  expgrowth: {
    name: "Exponential growth & decay", emoji: "🦠", unit: "u2",
    make(seed) {
      const r = rng(seed * 13 + 5);
      const P = pick(r, [500, 800, 1000, 1200, 2000, 5000]);
      const pct = pick(r, [2, 3, 4, 5, 8, 10, 12, 15, 20]);
      const grow = r() < 0.5;
      const t = ri(r, 2, 10);
      const b = grow ? 1 + pct / 100 : 1 - pct / 100;
      const val = P * b ** t;
      return {
        ...base("expgrowth", seed, 1), type: "num", answer: Number(val.toFixed(2)), tol: 0.6,
        prompt: `A quantity starts at ${P} and ${grow ? "grows" : "shrinks"} by ${pct}% per year. What is it after ${t} years? (Round to 2 decimals.)`,
        hints: [`The multiplier is $b = 1 ${grow ? "+" : "-"} ${pct / 100} = ${b}$.`],
        solution: [`$A(t) = ${P}\\cdot(${b})^t$`, `$A(${t}) = ${P}\\cdot(${b})^{${t}} \\approx ${val.toFixed(2)}$`],
        verify: { kind: "value", expr: `${P}*${b}^${t}` },
      };
    },
  },
  compose: {
    name: "Composition f(g(x))", emoji: "🪆", unit: "u3",
    make(seed) {
      const r = rng(seed * 17 + 7);
      const a = nz(r, -4, 4), b = ri(r, -6, 6), c = ri(r, -5, 5), k = ri(r, -3, 3);
      const g = k * k + c, val = a * g + b;
      const flip = r() < 0.5;
      const gf = (a * k + b) ** 2 + c;
      return {
        ...base("compose", seed, 1), type: "num", answer: flip ? gf : val,
        prompt: `Let $f(x) = ${co(a)}x ${sgn(b)}$ and $g(x) = x^2 ${sgn(c)}$. Find $${flip ? "(g\\circ f)" : "(f \\circ g)"}(${k})$.`,
        hints: [flip ? `Inside first: $f(${k})$. Then feed it to $g$.` : `Inside first: $g(${k})$. Then feed it to $f$.`],
        solution: flip
          ? [`$f(${k}) = ${a}(${k}) ${sgn(b)} = ${a * k + b}$`, `$g(${a * k + b}) = (${a * k + b})^2 ${sgn(c)} = ${gf}$`]
          : [`$g(${k}) = (${k})^2 ${sgn(c)} = ${g}$`, `$f(${g}) = ${a}(${g}) ${sgn(b)} = ${val}$`],
      };
    },
  },
  inverse: {
    name: "Inverse functions", emoji: "🔄", unit: "u3",
    make(seed) {
      const r = rng(seed * 19 + 11);
      const a = nz(r, -5, 5), b = ri(r, -9, 9);
      const x = ri(r, -5, 5);
      const k = a * x + b;
      return {
        ...base("inverse", seed, 1), type: "num", answer: x,
        prompt: `Let $f(x) = ${co(a)}x ${sgn(b)}$. Find $f^{-1}(${k})$.`,
        hints: [`$f^{-1}(${k})$ asks: which input makes $f$ output ${k}?`],
        solution: [`Solve $${co(a)}x ${sgn(b)} = ${k}$.`, `$${co(a)}x = ${k - b}$, so $x = ${x}$.`],
      };
    },
  },
  logeval: {
    name: "Evaluate logs", emoji: "🪵", unit: "u4",
    make(seed) {
      const r = rng(seed * 23 + 13);
      const b = pick(r, [2, 3, 4, 5, 10]);
      const k = ri(r, -3, 4);
      const style = r();
      const arg = k >= 0 ? `${b ** k}` : `\\frac{1}{${b ** -k}}`;
      if (style < 0.2) {
        const e = pick(r, [1, 2, 3, -1]);
        const half = pick(r, [2, 3]);
        return {
          ...base("logeval", seed, 1), type: "num", answer: e / half,
          prompt: `Evaluate $\\ln\\left(\\sqrt[${half}]{e^{${e}}}\\right)$ without a calculator.`,
          hints: ["Roots are fractional powers: $\\sqrt[n]{e^m} = e^{m/n}$."],
          solution: [`$\\sqrt[${half}]{e^{${e}}} = e^{${e}/${half}}$`, `$\\ln(e^{${e}/${half}}) = ${frac(e, half)}$`],
        };
      }
      return {
        ...base("logeval", seed, 1), type: "num", answer: k,
        prompt: `Evaluate $\\log_{${b}}\\left(${arg}\\right)$ without a calculator.`,
        hints: [`Ask: $${b}$ to WHAT power gives $${arg}$?`],
        solution: [`$${arg} = ${b}^{${k}}$`, `So $\\log_{${b}}(${arg}) = ${k}$.`],
      };
    },
  },
  expsolve: {
    name: "Solve exponential equations", emoji: "🧮", unit: "u4",
    make(seed) {
      const r = rng(seed * 29 + 17);
      const a = pick(r, [2, 3, 4, 5]), k = pick(r, [1, 2, 3, -1, 0.5]), c = pick(r, [10, 20, 30, 50, 100]);
      const x = Math.log(c / a) / k;
      return {
        ...base("expsolve", seed, 2), type: "num", answer: Number(x.toFixed(4)), tol: 2e-3,
        prompt: `Solve $${a}e^{${k === 1 ? "" : k === -1 ? "-" : k}x} = ${c}$. (4 decimals)`,
        hints: [`Divide by ${a} first, then take $\\ln$ of both sides.`],
        solution: [`$e^{${k}x} = ${frac(c, a)}$`, `$${k}x = \\ln\\left(${frac(c, a)}\\right)$`, `$x = \\dfrac{\\ln(${c}/${a})}{${k}} \\approx ${x.toFixed(4)}$`],
        verify: { kind: "value", expr: `ln(${c}/${a})/(${k})` },
      };
    },
  },
  halflife: {
    name: "Doubling time & half-life", emoji: "⏳", unit: "u4",
    make(seed) {
      const r = rng(seed * 31 + 19);
      const pct = pick(r, [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]);
      const grow = r() < 0.5;
      const target = grow ? pick(r, [2, 3]) : 0.5;
      const b = grow ? 1 + pct / 100 : 1 - pct / 100;
      const t = Math.log(target) / Math.log(b);
      const word = grow ? (target === 2 ? "double" : "triple") : "halve";
      return {
        ...base("halflife", seed, 2), type: "num", answer: Number(t.toFixed(2)), tol: 0.02,
        prompt: `Something ${grow ? "grows" : "decays"} by ${pct}% per year. How many years until it ${word}s? (2 decimals)`,
        hints: [`Solve $(${b})^t = ${target}$ with logs.`],
        solution: [`$(${b})^t = ${target}$`, `$t = \\dfrac{\\ln ${target}}{\\ln ${b}} \\approx ${t.toFixed(2)}$ years`],
        verify: { kind: "value", expr: `ln(${target})/ln(${b})` },
      };
    },
  },
  asymptote: {
    name: "Asymptotes of rational functions", emoji: "🧱", unit: "u5",
    make(seed) {
      const r = rng(seed * 37 + 23);
      const a = nz(r, -6, 6), b = ri(r, -9, 9), c = nz(r, 1, 5), d = nz(r, -9, 9);
      if (a * d === b * c) return GENERATORS.asymptote!.make(seed + 1000);
      const ha = r() < 0.5;
      return ha
        ? {
            ...base("asymptote", seed, 1), type: "num", answer: a / c,
            prompt: `Find the horizontal asymptote $y = ?$ of $f(x) = \\dfrac{${co(a)}x ${sgn(b)}}{${co(c)}x ${sgn(d)}}$.`,
            hints: ["Same degree on top and bottom → ratio of leading coefficients."],
            solution: [`Both have degree 1.`, `$y = ${frac(a, c)}$`],
          }
        : {
            ...base("asymptote", seed, 1), type: "num", answer: -d / c,
            prompt: `Find the vertical asymptote $x = ?$ of $f(x) = \\dfrac{${co(a)}x ${sgn(b)}}{${co(c)}x ${sgn(d)}}$.`,
            hints: ["Set the bottom equal to 0 (and check the top isn't also 0 there)."],
            solution: [`$${co(c)}x ${sgn(d)} = 0 \\Rightarrow x = ${frac(-d, c)}$`, `The top is not 0 there, so it's a real vertical asymptote.`],
          };
    },
  },
  limitfactor: {
    name: "0/0 limits: factor & cancel", emoji: "✂️", unit: "u8",
    make(seed) {
      const r = rng(seed * 41 + 29);
      const a = ri(r, -6, 6);
      let s = ri(r, -6, 6);
      while (s === a) s = ri(r, -6, 6);
      const B = -(a + s), C = a * s;
      const f = `(x^2 ${B < 0 ? "-" : "+"} ${Math.abs(B)}x ${C < 0 ? "-" : "+"} ${Math.abs(C)})/(x ${a < 0 ? "+" : "-"} ${Math.abs(a)})`;
      return {
        ...base("limitfactor", seed, 2), type: "num", answer: a - s,
        prompt: `Find $\\displaystyle\\lim_{x \\to ${a}} \\frac{x^2 ${B === 0 ? "" : `${B < 0 ? "-" : "+"} ${Math.abs(B) === 1 ? "" : Math.abs(B)}x`} ${C === 0 ? "" : sgn(C)}}{x ${sgn(-a)}}$.`,
        hints: ["Plugging in gives $\\frac00$. Factor the top.", `One factor of the top is $(x ${sgn(-a)})$.`],
        solution: [`Plug in: $\\frac{0}{0}$, so simplify.`, `$x^2 ${B === 0 ? "" : `${B < 0 ? "-" : "+"} ${Math.abs(B)}x`} ${C === 0 ? "" : sgn(C)} = (x ${sgn(-a)})(x ${sgn(-s)})$`, `Cancel: the limit becomes $\\lim_{x\\to ${a}} (x ${sgn(-s)}) = ${a - s}$`],
        verify: { kind: "limit", f, a },
      };
    },
  },
  limitinf: {
    name: "Limits at infinity", emoji: "♾️", unit: "u9",
    make(seed) {
      const r = rng(seed * 43 + 31);
      const n = ri(r, 1, 5), m = ri(r, 1, 5);
      const a = nz(r, -7, 7), b = nz(r, -7, 7), c = ri(r, -9, 9), d = ri(r, -9, 9);
      const top = poly([[a, n], [c, Math.max(0, n - 1)]]);
      const bot = poly([[b, m], [d, 0]]);
      const ans = n < m ? 0 : n === m ? a / b : (a / b > 0 ? "inf" : "-inf");
      return {
        ...base("limitinf", seed, 2), type: "num", answer: ans as number | "inf" | "-inf",
        prompt: `Find $\\displaystyle\\lim_{x \\to \\infty} \\frac{${top.tex}}{${bot.tex}}$. (Type inf or -inf if it blows up.)`,
        hints: ["Compare the highest powers on top and bottom."],
        solution: [
          `Top degree ${n}, bottom degree ${m}.`,
          n < m ? "Bottom wins → the fraction shrinks to $0$." : n === m ? `Same degree → ratio of leading coefficients: $${frac(a, b)}$.` : `Top wins → it blows up. Sign of $\\frac{${a}}{${b}}$ for large $x$ is ${a / b > 0 ? "positive: $+\\infty$" : "negative: $-\\infty$"}.`,
        ],
        verify: { kind: "limit", f: `(${top.str})/(${bot.str})`, a: "inf" },
      };
    },
  },
  continuityk: {
    name: "Make it continuous", emoji: "🧩", unit: "u7",
    make(seed) {
      const r = rng(seed * 47 + 37);
      const c = nz(r, -3, 3), k = nz(r, -5, 5), m = ri(r, -6, 6);
      // left: k x + m (x < c), right: x^2 + d (x >= c); continuity needs k c + m = c^2 + d
      const d = k * c + m - c * c;
      return {
        ...base("continuityk", seed, 2), type: "num", answer: k,
        prompt: `Find $k$ so that $f(x) = \\begin{cases} kx ${sgn(m)} & x < ${c} \\\\ x^2 ${sgn(d)} & x \\ge ${c} \\end{cases}$ is continuous.`,
        hints: [`Make both pieces give the same height at $x = ${c}$.`],
        solution: [`Left height: $k(${c}) ${sgn(m)}$. Right height: $(${c})^2 ${sgn(d)} = ${c * c + d}$.`, `$${c}k ${sgn(m)} = ${c * c + d} \\Rightarrow ${c}k = ${c * c + d - m}$`, `$k = ${k}$`],
      };
    },
  },
  power: {
    name: "Power rule derivatives", emoji: "⚡", unit: "u11",
    make(seed) {
      const r = rng(seed * 53 + 41);
      const terms: Array<[number, number]> = [];
      const powers = [...new Set([ri(r, 2, 6), ri(r, 1, 4), ri(r, 0, 2)])];
      for (const p of powers) terms.push([nz(r, -9, 9), p]);
      const style = r();
      let tex: string, str: string, ans: string, sol: string[];
      if (style < 0.35) {
        // a root or a 1/x^n term
        const kind = pick(r, ["sqrt", "inv"]);
        const c = nz(r, 1, 8);
        const p = poly(terms);
        if (kind === "sqrt") {
          tex = `${p.tex} ${sgn(c)}\\sqrt{x}`;
          str = `${p.str}+${c}*sqrt(x)`;
          const dp = poly(terms.map(([a, q]) => [a * q, q - 1] as [number, number]).filter(([, q]) => q >= 0));
          ans = `${dp.str}+${c}/(2*sqrt(x))`;
          sol = [`Rewrite $\\sqrt{x} = x^{1/2}$.`, `Power rule on each term: bring the power down, subtract 1.`, `$f'(x) = ${dp.tex} + \\dfrac{${c}}{2\\sqrt{x}}$`];
        } else {
          const n = ri(r, 1, 4);
          tex = `${p.tex} ${sgn(c)}\\dfrac{1}{x^{${n}}}`;
          str = `${p.str}+${c}/x^${n}`;
          const dp = poly(terms.map(([a, q]) => [a * q, q - 1] as [number, number]).filter(([, q]) => q >= 0));
          ans = `${dp.str}-${c * n}/x^${n + 1}`;
          sol = [`Rewrite $\\dfrac{1}{x^{${n}}} = x^{-${n}}$.`, `Its derivative: $-${n}x^{-${n + 1}}$.`, `$f'(x) = ${dp.tex} - \\dfrac{${c * n}}{x^{${n + 1}}}$`];
        }
      } else {
        const p = poly(terms);
        tex = p.tex; str = p.str;
        const dp = poly(terms.map(([a, q]) => [a * q, q - 1] as [number, number]).filter(([, q]) => q >= 0));
        ans = dp.str;
        sol = [`Power rule: $\\frac{d}{dx}x^n = nx^{n-1}$; constants disappear.`, `$f'(x) = ${dp.tex}$`];
      }
      return {
        ...base("power", seed, 1), type: "expr", answer: ans, domain: [0.2, 4],
        prompt: `Find $f'(x)$ for $f(x) = ${tex}$.`,
        hints: ["Bring the power down in front, then subtract 1 from the power.", "Rewrite roots and fractions as powers first."],
        solution: sol,
        verify: { kind: "derivative", f: str, domain: [0.2, 4] },
      };
    },
  },
  derivat: {
    name: "f′(a): slope at a point", emoji: "📍", unit: "u11",
    make(seed) {
      const r = rng(seed * 59 + 43);
      const a3 = ri(r, -2, 2), a2 = ri(r, -4, 4), a1 = ri(r, -6, 6), a0 = ri(r, -5, 5);
      const at = ri(r, -3, 3);
      const p = poly([[a3, 3], [a2, 2], [a1, 1], [a0, 0]]);
      const d = 3 * a3 * at * at + 2 * a2 * at + a1;
      const dp = poly([[3 * a3, 2], [2 * a2, 1], [a1, 0]]);
      return {
        ...base("derivat", seed, 1), type: "num", answer: d,
        prompt: `Let $f(x) = ${p.tex}$. Find $f'(${at})$.`,
        hints: ["Differentiate first, THEN plug in."],
        solution: [`$f'(x) = ${dp.tex}$`, `$f'(${at}) = ${d}$`],
        verify: { kind: "derivative", f: p.str, at },
      };
    },
  },
  product: {
    name: "Product rule", emoji: "✖️", unit: "u11",
    make(seed) {
      const r = rng(seed * 61 + 47);
      const n = ri(r, 1, 4), c = nz(r, -5, 5);
      const kind = pick(r, ["exp", "ln", "sin", "poly"]);
      const u = `${co(c)}x^{${n}}`, us = `${c}*x^${n}`, du = `${c * n}x^{${n - 1}}`, dus = `${c * n}*x^(${n - 1})`;
      const map = {
        exp: { v: "e^{x}", vs: "e^x", dv: "e^{x}", dvs: "e^x" },
        ln: { v: "\\ln x", vs: "ln(x)", dv: "\\frac{1}{x}", dvs: "1/x" },
        sin: { v: "\\sin x", vs: "sin(x)", dv: "\\cos x", dvs: "cos(x)" },
        poly: { v: "(x + 3)", vs: "(x+3)", dv: "1", dvs: "1" },
      }[kind]!;
      return {
        ...base("product", seed, 2), type: "expr", answer: `${dus}*${map.vs} + ${us}*${map.dvs}`, domain: [0.3, 3],
        prompt: `Differentiate $f(x) = ${u}${map.v}$.`,
        hints: ["Product rule: $(uv)' = u'v + uv'$.", `$u = ${u}$, $v = ${map.v}$.`],
        solution: [`$u = ${u}$, $u' = ${du}$; $v = ${map.v}$, $v' = ${map.dv}$`, `$f'(x) = ${du}\\cdot ${map.v} + ${u}\\cdot ${map.dv}$`],
        verify: { kind: "derivative", f: `${us}*${map.vs}`, domain: [0.3, 3] },
      };
    },
  },
  quotient: {
    name: "Quotient rule", emoji: "➗", unit: "u11",
    make(seed) {
      const r = rng(seed * 67 + 53);
      const a = nz(r, -5, 5), b = ri(r, -6, 6), c = nz(r, 1, 4), d = nz(r, -6, 6);
      if (a * d - b * c === 0) return GENERATORS.quotient!.make(seed + 500);
      const top = `${co(a)}x ${sgn(b)}`, bot = `${co(c)}x ${sgn(d)}`;
      const num = a * d - b * c;
      return {
        ...base("quotient", seed, 2), type: "expr", answer: `${num}/(${c}x+${d})^2`.replace("+-", "-"),
        prompt: `Differentiate $f(x) = \\dfrac{${top}}{${bot}}$. Simplify the top.`,
        hints: ["Low d-high minus high d-low, over low squared.", `$\\dfrac{(${bot})(${a}) - (${top})(${c})}{(${bot})^2}$`],
        solution: [`$f'(x) = \\dfrac{(${bot})\\cdot ${a} - (${top})\\cdot ${c}}{(${bot})^2}$`, `Top: $${a * c}x ${sgn(a * d)} - ${a * c}x ${sgn(-b * c)} = ${num}$`, `$f'(x) = \\dfrac{${num}}{(${bot})^2}$`],
        verify: { kind: "derivative", f: `(${a}x+${b})/(${c}x+${d})`.replace(/\+-/g, "-") },
      };
    },
  },
  chain: {
    name: "Chain rule", emoji: "⛓️", unit: "u12",
    make(seed) {
      const r = rng(seed * 71 + 59);
      const kind = pick(r, ["pow", "exp", "ln", "sin", "sqrt"]);
      const a = nz(r, -5, 5), b = ri(r, 1, 6), n = ri(r, 2, 6);
      switch (kind) {
        case "pow":
          return {
            ...base("chain", seed, 2), type: "expr", answer: `${n * a}*(${a}x+${b})^${n - 1}`, domain: [-1, 1],
            prompt: `Differentiate $f(x) = (${co(a)}x + ${b})^{${n}}$.`,
            hints: ["Outside: $u^n$. Inside: $" + `${co(a)}x + ${b}` + "$.", "Derivative of the outside (inside left alone) × derivative of the inside."],
            solution: [`Outer: $u^{${n}} \\to ${n}u^{${n - 1}}$. Inner: $u = ${co(a)}x + ${b}$, $u' = ${a}$.`, `$f'(x) = ${n}(${co(a)}x + ${b})^{${n - 1}}\\cdot ${a} = ${n * a}(${co(a)}x + ${b})^{${n - 1}}$`],
            verify: { kind: "derivative", f: `(${a}x+${b})^${n}`, domain: [-1, 1] },
          };
        case "exp":
          return {
            ...base("chain", seed, 2), type: "expr", answer: `${2 * a}x*e^(${a}x^2)`, domain: [-1, 1],
            prompt: `Differentiate $f(x) = e^{${co(a)}x^2}$.`,
            hints: ["$\\frac{d}{dx}e^{u} = e^{u}\\cdot u'$."],
            solution: [`Inner $u = ${co(a)}x^2$, $u' = ${2 * a}x$.`, `$f'(x) = ${2 * a}x\\,e^{${co(a)}x^2}$`],
            verify: { kind: "derivative", f: `e^(${a}x^2)`, domain: [-1, 1] },
          };
        case "ln": {
          const A = Math.abs(a);
          return {
            ...base("chain", seed, 2), type: "expr", answer: `${2 * A}x/(${A}x^2+${b})`,
            prompt: `Differentiate $f(x) = \\ln(${co(A)}x^2 + ${b})$.`,
            hints: ["$\\frac{d}{dx}\\ln u = \\dfrac{u'}{u}$."],
            solution: [`Inner $u = ${co(A)}x^2 + ${b}$, $u' = ${2 * A}x$.`, `$f'(x) = \\dfrac{${2 * A}x}{${co(A)}x^2 + ${b}}$`],
            verify: { kind: "derivative", f: `ln(${A}x^2+${b})` },
          };
        }
        case "sin":
          return {
            ...base("chain", seed, 2), type: "expr", answer: `${a}*cos(${a}x)`,
            prompt: `Differentiate $f(x) = \\sin(${co(a)}x)$.`,
            hints: ["$\\frac{d}{dx}\\sin u = \\cos u \\cdot u'$."],
            solution: [`Inner $u = ${co(a)}x$, $u' = ${a}$.`, `$f'(x) = ${a}\\cos(${co(a)}x)$`],
            verify: { kind: "derivative", f: `sin(${a}x)` },
          };
        default:
          return {
            ...base("chain", seed, 2), type: "expr", answer: `x/sqrt(x^2+${b * b})`,
            prompt: `Differentiate $f(x) = \\sqrt{x^2 + ${b * b}}$.`,
            hints: ["$\\sqrt{u} = u^{1/2}$, so its derivative is $\\frac{1}{2}u^{-1/2}\\cdot u'$."],
            solution: [`$f'(x) = \\dfrac{1}{2\\sqrt{x^2 + ${b * b}}}\\cdot 2x$`, `$= \\dfrac{x}{\\sqrt{x^2 + ${b * b}}}$`],
            verify: { kind: "derivative", f: `sqrt(x^2+${b * b})` },
          };
      }
    },
  },
  tangent: {
    name: "Tangent line equation", emoji: "📐", unit: "u14",
    make(seed) {
      const r = rng(seed * 73 + 61);
      const a2 = nz(r, -3, 3), a1 = ri(r, -5, 5), a0 = ri(r, -6, 6), at = ri(r, -3, 3);
      const p = poly([[a2, 2], [a1, 1], [a0, 0]]);
      const y0 = a2 * at * at + a1 * at + a0, m = 2 * a2 * at + a1, b = y0 - m * at;
      return {
        ...base("tangent", seed, 2), type: "expr", answer: `${m}x + ${b}`.replace("+ -", "- "),
        prompt: `Find the tangent line to $f(x) = ${p.tex}$ at $x = ${at}$. Type $y = \\dots$`,
        hints: ["You need a point $(a, f(a))$ and the slope $f'(a)$.", "Then $y - f(a) = f'(a)(x - a)$."],
        solution: [`Point: $f(${at}) = ${y0}$, so $(${at}, ${y0})$.`, `Slope: $f'(x) = ${co(2 * a2)}x ${a1 === 0 ? "" : sgn(a1)}$, so $f'(${at}) = ${m}$.`, `$y - ${y0} = ${m}(x - ${at})$`, `$y = ${m === 0 ? "" : `${co(m)}x`} ${m === 0 ? b : b === 0 ? "" : sgn(b)}$`],
      };
    },
  },
  increasing: {
    name: "Where is f increasing?", emoji: "↗️", unit: "u13",
    make(seed) {
      const r = rng(seed * 79 + 67);
      const p = ri(r, -4, 1);
      const q = p + ri(r, 1, 4);
      // f' = 3(x - p)(x - q) → f = x^3 - 1.5(p+q)x^2 + 3pq x
      const B = -1.5 * (p + q), C = 3 * p * q;
      const fx = poly([[1, 3], [B, 2], [C, 1]]);
      const dec = r() < 0.4;
      return {
        ...base("increasing", seed, 2), type: "interval", answer: dec ? `(${p},${q})` : `(-inf,${p})U(${q},inf)`,
        prompt: `Let $f(x) = ${fx.tex}$. On what interval(s) is $f$ **${dec ? "decreasing" : "increasing"}**?`,
        hints: ["Find $f'(x)$ and factor it.", "Make a sign chart: test a number in each interval."],
        solution: [`$f'(x) = 3x^2 ${sgn(2 * B)}x ${sgn(C)} = 3(x ${sgn(-p)})(x ${sgn(-q)})$`, `Critical numbers: $x = ${p}$ and $x = ${q}$.`, `Sign chart: $+$ on $(-\\infty, ${p})$, $-$ on $(${p}, ${q})$, $+$ on $(${q}, \\infty)$.`, dec ? `Decreasing on $(${p}, ${q})$.` : `Increasing on $(-\\infty, ${p}) \\cup (${q}, \\infty)$.`],
      };
    },
  },
  inflection: {
    name: "Inflection points", emoji: "〰️", unit: "u13",
    make(seed) {
      const r = rng(seed * 83 + 71);
      const a = nz(r, -3, 3), x0 = ri(r, -4, 4);
      const b = -3 * a * x0, c = ri(r, -9, 9), d = ri(r, -9, 9);
      const fx = poly([[a, 3], [b, 2], [c, 1], [d, 0]]);
      return {
        ...base("inflection", seed, 2), type: "num", answer: x0,
        prompt: `Find the x-coordinate of the inflection point of $f(x) = ${fx.tex}$.`,
        hints: ["Set $f''(x) = 0$ and check the sign changes."],
        solution: [`$f'(x) = ${3 * a}x^2 ${sgn(2 * b)}x ${sgn(c)}$`, `$f''(x) = ${6 * a}x ${sgn(2 * b)}$`, `$f''(x) = 0 \\Rightarrow x = ${x0}$, and $f''$ changes sign there (it's a line).`],
      };
    },
  },
  linapprox: {
    name: "Linear approximation", emoji: "🎯", unit: "u14",
    make(seed) {
      const r = rng(seed * 89 + 73);
      const s = ri(r, 3, 12), d = pick(r, [-0.4, -0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.5]);
      const a = s * s, x = a + d;
      const est = s + d / (2 * s);
      return {
        ...base("linapprox", seed, 2), type: "num", answer: Number(est.toFixed(5)), tol: 1e-4,
        prompt: `Use a linear approximation of $\\sqrt{x}$ at $x = ${a}$ to estimate $\\sqrt{${Number(x.toFixed(2))}}$. (5 decimals)`,
        hints: ["$L(x) = f(a) + f'(a)(x - a)$", `$f'(x) = \\dfrac{1}{2\\sqrt{x}}$, so $f'(${a}) = \\dfrac{1}{${2 * s}}$.`],
        solution: [`$f(${a}) = ${s}$, $f'(${a}) = \\frac{1}{${2 * s}}$`, `$L(${Number(x.toFixed(2))}) = ${s} + \\frac{1}{${2 * s}}(${d})$`, `$\\approx ${est.toFixed(5)}$ (true value $${Math.sqrt(x).toFixed(5)}$)`],
        verify: { kind: "value", expr: `${s}+(${d})/(${2 * s})` },
      };
    },
  },
  avgvel: {
    name: "Average velocity", emoji: "🏃", unit: "u14",
    make(seed) {
      const r = rng(seed * 97 + 79);
      const a = nz(r, -5, 6), b = ri(r, -10, 20), t1 = ri(r, 0, 4), t2 = t1 + ri(r, 1, 4);
      const s = (t: number) => a * t * t + b * t;
      const v = (s(t2) - s(t1)) / (t2 - t1);
      const p = poly([[a, 2], [b, 1]], "t");
      return {
        ...base("avgvel", seed, 1), type: "num", answer: v, unit: "m/s",
        prompt: `Position is $s(t) = ${p.tex}$ meters. Find the average velocity from $t = ${t1}$ to $t = ${t2}$ seconds.`,
        hints: ["Average velocity $= \\dfrac{s(b) - s(a)}{b - a}$."],
        solution: [`$s(${t2}) = ${s(t2)}$, $s(${t1}) = ${s(t1)}$`, `$\\dfrac{${s(t2)} - (${s(t1)})}{${t2} - ${t1}} = ${v}$ m/s`],
      };
    },
  },
  antideriv: {
    name: "Antiderivatives", emoji: "🔙", unit: "u17",
    make(seed) {
      const r = rng(seed * 101 + 83);
      const terms: Array<[number, number]> = [];
      for (const p of [...new Set([ri(r, 1, 4), ri(r, 0, 2)])]) terms.push([nz(r, -6, 6) * (p + 1), p]);
      const f = poly(terms);
      const F = poly(terms.map(([c, p]) => [c / (p + 1), p + 1] as [number, number]));
      const extra = r() < 0.4 ? nz(r, 1, 6) : 0;
      return {
        ...base("antideriv", seed, 1), type: "expr", answer: extra ? `${F.str}+${extra}*e^x` : F.str, upToConstant: true,
        prompt: `Find an antiderivative: $\\displaystyle\\int \\left(${f.tex}${extra ? ` + ${extra}e^{x}` : ""}\\right)dx$. (Leave off $+C$.)`,
        hints: ["Reverse power rule: add 1 to the power, divide by the new power.", "$\\int e^x dx = e^x$."],
        solution: [`$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1}$`, `$= ${F.tex}${extra ? ` + ${extra}e^{x}` : ""} + C$`],
        verify: { kind: "antiderivative", f: extra ? `${f.str}+${extra}*e^x` : f.str },
      };
    },
  },
  definite: {
    name: "Definite integrals (FTC)", emoji: "📦", unit: "u17",
    make(seed) {
      const r = rng(seed * 103 + 89);
      const a2 = ri(r, -3, 3) * 3, a1 = ri(r, -4, 4) * 2, a0 = ri(r, -5, 5);
      const lo = ri(r, -2, 1), hi = lo + ri(r, 1, 3);
      const F = (x: number) => (a2 / 3) * x ** 3 + (a1 / 2) * x * x + a0 * x;
      const f = poly([[a2, 2], [a1, 1], [a0, 0]]);
      const Fp = poly([[a2 / 3, 3], [a1 / 2, 2], [a0, 1]]);
      return {
        ...base("definite", seed, 2), type: "num", answer: F(hi) - F(lo),
        prompt: `Evaluate $\\displaystyle\\int_{${lo}}^{${hi}} \\left(${f.tex}\\right)dx$.`,
        hints: ["Find an antiderivative $F$, then compute $F(b) - F(a)$."],
        solution: [`$F(x) = ${Fp.tex}$`, `$F(${hi}) - F(${lo}) = ${F(hi)} - (${F(lo)}) = ${F(hi) - F(lo)}$`],
        verify: { kind: "integral", f: f.str === "0" ? "0*x" : f.str, a: lo, b: hi },
      };
    },
  },
  riemann: {
    name: "Riemann sums", emoji: "🧱", unit: "u17",
    make(seed) {
      const r = rng(seed * 107 + 97);
      const n = pick(r, [2, 3, 4]), lo = ri(r, 0, 2), w = pick(r, [1, 2]), hi = lo + n * w;
      const rule = pick(r, ["left", "right", "midpoint"] as const);
      const c = ri(r, 0, 3);
      const f = (x: number) => x * x + c;
      const xs = Array.from({ length: n }, (_, i) => lo + i * w + (rule === "left" ? 0 : rule === "right" ? w : w / 2));
      const sum = xs.reduce((s, x) => s + f(x) * w, 0);
      return {
        ...base("riemann", seed, 2), type: "num", answer: sum,
        prompt: `Estimate $\\displaystyle\\int_{${lo}}^{${hi}} (x^2 ${c ? sgn(c) : ""})\\,dx$ with a **${rule}** Riemann sum using $n = ${n}$ rectangles.`,
        hints: [`$\\Delta x = \\dfrac{${hi} - ${lo}}{${n}} = ${w}$.`, `Sample points: ${xs.join(", ")}.`],
        solution: [`$\\Delta x = ${w}$; ${rule} sample points: $${xs.join(", ")}$.`, `Heights: $${xs.map((x) => f(x)).join(", ")}$.`, `Sum $= ${w}\\cdot(${xs.map((x) => f(x)).join(" + ")}) = ${sum}$`],
      };
    },
  },
  lhopital: {
    name: "L'Hôpital's rule", emoji: "🏥", unit: "u16",
    make(seed) {
      const r = rng(seed * 109 + 101);
      const k = nz(r, -5, 5), m = nz(r, 1, 6);
      const kind = pick(r, ["exp", "sin", "ln"]);
      if (kind === "exp") return {
        ...base("lhopital", seed, 2), type: "num", answer: k / m,
        prompt: `Find $\\displaystyle\\lim_{x\\to 0} \\frac{e^{${co(k)}x} - 1}{${co(m)}x}$.`,
        hints: ["It's $\\frac00$. Differentiate top and bottom separately."],
        solution: [`$\\frac00$ form → L'Hôpital.`, `$\\lim_{x\\to0}\\dfrac{${k}e^{${co(k)}x}}{${m}} = \\dfrac{${k}}{${m}} = ${frac(k, m)}$`],
        verify: { kind: "limit", f: `(e^(${k}x)-1)/(${m}x)`, a: 0 },
      };
      if (kind === "sin") return {
        ...base("lhopital", seed, 2), type: "num", answer: k / m,
        prompt: `Find $\\displaystyle\\lim_{x\\to 0} \\frac{\\sin(${co(k)}x)}{${co(m)}x}$.`,
        hints: ["$\\frac00$: differentiate top and bottom."],
        solution: [`L'Hôpital: $\\lim_{x\\to0}\\dfrac{${k}\\cos(${co(k)}x)}{${m}} = ${frac(k, m)}$`],
        verify: { kind: "limit", f: `sin(${k}x)/(${m}x)`, a: 0 },
      };
      const a = Math.abs(k) + 1;
      return {
        ...base("lhopital", seed, 2), type: "num", answer: 1 / (a * m),
        prompt: `Find $\\displaystyle\\lim_{x\\to ${a}} \\frac{\\ln(x/${a})}{${co(m)}(x - ${a})}$.`,
        hints: ["Top: $\\ln 1 = 0$. Bottom: 0. Differentiate both."],
        solution: [`$\\frac{d}{dx}\\ln(x/${a}) = \\frac1x$; $\\frac{d}{dx}${m}(x - ${a}) = ${m}$.`, `$\\lim_{x\\to${a}} \\dfrac{1/x}{${m}} = \\dfrac{1}{${a * m}}$`],
        verify: { kind: "limit", f: `ln(x/${a})/(${m}(x-${a}))`, a },
      };
    },
  },
  relrates: {
    name: "Related rates", emoji: "🎈", unit: "u15",
    make(seed) {
      const r = rng(seed * 113 + 103);
      const kind = pick(r, ["circle", "sphere", "ladder"]);
      if (kind === "circle") {
        const rad = ri(r, 2, 15), dr = pick(r, [0.5, 1, 2, 3]);
        const ans = 2 * Math.PI * rad * dr;
        return {
          ...base("relrates", seed, 2), type: "num", answer: Number(ans.toFixed(3)), tol: 0.01,
          prompt: `A ripple's radius grows at ${dr} cm/s. How fast is the area growing when the radius is ${rad} cm? (cm²/s, 3 decimals)`,
          hints: ["$A = \\pi r^2$. Differentiate with respect to $t$."],
          solution: [`$\\dfrac{dA}{dt} = 2\\pi r\\dfrac{dr}{dt}$`, `$= 2\\pi(${rad})(${dr}) \\approx ${ans.toFixed(3)}$ cm²/s`],
          verify: { kind: "value", expr: `2*pi*${rad}*${dr}` },
        };
      }
      if (kind === "sphere") {
        const rad = ri(r, 2, 10), dV = pick(r, [10, 20, 50, 100]);
        const ans = dV / (4 * Math.PI * rad * rad);
        return {
          ...base("relrates", seed, 3), type: "num", answer: Number(ans.toFixed(4)), tol: 2e-4,
          prompt: `Air is pumped into a balloon at ${dV} cm³/s. How fast is the radius growing when $r = ${rad}$ cm? (cm/s, 4 decimals)`,
          hints: ["$V = \\tfrac43\\pi r^3$, so $\\dfrac{dV}{dt} = 4\\pi r^2 \\dfrac{dr}{dt}$."],
          solution: [`$${dV} = 4\\pi(${rad})^2\\dfrac{dr}{dt}$`, `$\\dfrac{dr}{dt} = \\dfrac{${dV}}{${4 * rad * rad}\\pi} \\approx ${ans.toFixed(4)}$ cm/s`],
          verify: { kind: "value", expr: `${dV}/(4*pi*${rad}^2)` },
        };
      }
      const [x, y, L] = pick(r, [[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]] as const);
      const dx = pick(r, [1, 2, 3]);
      return {
        ...base("relrates", seed, 3), type: "num", answer: (-x * dx) / y, unit: "ft/s",
        prompt: `A ${L} ft ladder slides away from a wall: the bottom moves out at ${dx} ft/s. How fast is the top moving when the bottom is ${x} ft from the wall? (negative = sliding down)`,
        hints: ["$x^2 + y^2 = " + L * L + "$. Differentiate: $2x x' + 2y y' = 0$.", `When $x = ${x}$, $y = ${y}$.`],
        solution: [`$x\\dfrac{dx}{dt} + y\\dfrac{dy}{dt} = 0$`, `$${x}(${dx}) + ${y}\\dfrac{dy}{dt} = 0$`, `$\\dfrac{dy}{dt} = -\\dfrac{${x * dx}}{${y}} = ${frac(-x * dx, y)}$ ft/s`],
      };
    },
  },
  optimize: {
    name: "Optimization", emoji: "🏆", unit: "u15",
    make(seed) {
      const r = rng(seed * 127 + 107);
      const P = pick(r, [40, 60, 80, 100, 120, 200, 240]);
      const river = r() < 0.5;
      const ans = river ? (P * P) / 8 : (P * P) / 16;
      return {
        ...base("optimize", seed, 2), type: "num", answer: ans,
        prompt: river
          ? `You have ${P} m of fence to enclose a rectangle along a straight river (no fence needed on the river side). What is the largest possible area (m²)?`
          : `You have ${P} m of fence for a rectangular pen. What is the largest possible area (m²)?`,
        hints: river ? ["Let $x$ = the two sides perpendicular to the river. Then the long side is $" + P + " - 2x$.", "Maximize $A = x(" + P + " - 2x)$."] : ["Perimeter: $2x + 2y = " + P + "$, so $y = " + P / 2 + " - x$.", "Maximize $A = x(" + P / 2 + " - x)$."],
        solution: river
          ? [`$A(x) = x(${P} - 2x) = ${P}x - 2x^2$`, `$A'(x) = ${P} - 4x = 0 \\Rightarrow x = ${P / 4}$`, `$A = ${P / 4}\\cdot ${P / 2} = ${ans}$ m²`]
          : [`$A(x) = x(${P / 2} - x)$`, `$A'(x) = ${P / 2} - 2x = 0 \\Rightarrow x = ${P / 4}$ (a square!)`, `$A = (${P / 4})^2 = ${ans}$ m²`],
      };
    },
  },
  implicit: {
    name: "Implicit differentiation", emoji: "🕸️", unit: "u12",
    make(seed) {
      const r = rng(seed * 131 + 109);
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25]] as const);
      const sx = r() < 0.5 ? -1 : 1, sy = r() < 0.5 ? -1 : 1;
      const x0 = sx * a, y0 = sy * b;
      return {
        ...base("implicit", seed, 2), type: "num", answer: -x0 / y0,
        prompt: `Find $\\dfrac{dy}{dx}$ for the circle $x^2 + y^2 = ${c * c}$ at the point $(${x0}, ${y0})$.`,
        hints: ["Differentiate both sides; remember $\\frac{d}{dx}y^2 = 2y\\frac{dy}{dx}$."],
        solution: [`$2x + 2y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{x}{y}$`, `At $(${x0}, ${y0})$: $-\\dfrac{${x0}}{${y0}} = ${frac(-x0, y0)}$`],
      };
    },
  },
};

export const GEN_LIST = Object.entries(GENERATORS).map(([id, g]) => ({ id, ...g }));
