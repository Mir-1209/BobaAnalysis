// A small, forgiving math-expression parser built for students typing answers.
// It understands things like: 3x^2 - 2x + 1, 2sin x cos x, e^(2x), ln|x|, sqrt(x+1), x√x, (x+1)(x-1), log_2 8, sin^2 x
// and turns them into an AST we can evaluate (for answer checking and graphing) or print as LaTeX.

export type Node =
  | { k: "num"; v: number }
  | { k: "var"; name: string }
  | { k: "const"; name: "pi" | "e" }
  | { k: "neg"; a: Node }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Node; b: Node }
  | { k: "fn"; name: string; a: Node; base?: Node; pow?: Node };

export class ParseError extends Error {}

const FUNCS: Record<string, string> = {
  sin: "sin", cos: "cos", tan: "tan", sec: "sec", csc: "csc", cot: "cot",
  arcsin: "asin", asin: "asin", arccos: "acos", acos: "acos", arctan: "atan", atan: "atan",
  sinh: "sinh", cosh: "cosh", tanh: "tanh",
  ln: "ln", log: "log", exp: "exp", sqrt: "sqrt", cbrt: "cbrt", abs: "abs",
};
const FUNC_NAMES = Object.keys(FUNCS).sort((a, b) => b.length - a.length);

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "fn"; v: string }
  | { t: "op"; v: string }
  | { t: "("; v: "(" }
  | { t: ")"; v: ")" }
  | { t: "|"; v: "|" }
  | { t: "_"; v: "_" }
  | { t: "sqrt"; v: "√" };

/** Normalise the many ways people type math: unicode minus, ×, ·, ÷, π, ², ³, etc. */
export function normalize(input: string): string {
  return input
    .replace(/[−–—]/g, "-")
    .replace(/[×·∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/\*\*/g, "^")
    .replace(/\[|\{/g, "(")
    .replace(/\]|\}/g, ")")
    .trim();
}

function tokenize(src: string): Tok[] {
  const s = normalize(src).toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) ?? []).length > 1 || raw === ".") throw new ParseError(`"${raw}" isn't a number`);
      out.push({ t: "num", v: Number(raw) });
      i = j;
      continue;
    }
    if (/[a-z]/.test(c)) {
      const rest = s.slice(i);
      const fn = FUNC_NAMES.find((f) => rest.startsWith(f));
      if (fn) { out.push({ t: "fn", v: FUNCS[fn]! }); i += fn.length; continue; }
      if (rest.startsWith("pi")) { out.push({ t: "id", v: "pi" }); i += 2; continue; }
      out.push({ t: "id", v: c });
      i++;
      continue;
    }
    if ("+-*/^".includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
    if (c === "(") { out.push({ t: "(", v: "(" }); i++; continue; }
    if (c === ")") { out.push({ t: ")", v: ")" }); i++; continue; }
    if (c === "|") { out.push({ t: "|", v: "|" }); i++; continue; }
    if (c === "_") { out.push({ t: "_", v: "_" }); i++; continue; }
    if (c === "√") { out.push({ t: "sqrt", v: "√" }); i++; continue; }
    if (c === "'" || c === "′") throw new ParseError("Type the derivative itself, not f'(x)");
    throw new ParseError(`I don't know the symbol "${c}"`);
  }
  return out;
}

class Parser {
  i = 0;
  absDepth = 0;
  constructor(private toks: Tok[]) {}

  peek(): Tok | undefined { return this.toks[this.i]; }
  next(): Tok | undefined { return this.toks[this.i++]; }
  isOp(v: string) { const t = this.peek(); return t?.t === "op" && t.v === v; }

  parse(): Node {
    if (this.toks.length === 0) throw new ParseError("Type an answer first");
    const n = this.expr();
    if (this.i < this.toks.length) {
      const t = this.peek()!;
      throw new ParseError(t.t === ")" ? "There's an extra )" : `Unexpected "${t.v}"`);
    }
    return n;
  }

  expr(): Node {
    let n = this.term();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.next() as { v: "+" | "-" }).v;
      n = { k: "bin", op, a: n, b: this.term() };
    }
    return n;
  }

  /** Does the next token start a new factor (so "2x" or "x(x+1)" means multiply)? */
  startsFactor(): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.t === "|") return this.absDepth === 0; // inside |…| a bar closes, it doesn't open
    return t.t === "num" || t.t === "id" || t.t === "fn" || t.t === "(" || t.t === "sqrt";
  }

  term(): Node {
    let n = this.unary();
    for (;;) {
      if (this.isOp("*") || this.isOp("/")) {
        const op = (this.next() as { v: "*" | "/" }).v;
        n = { k: "bin", op, a: n, b: this.unary() };
      } else if (this.startsFactor()) {
        n = { k: "bin", op: "*", a: n, b: this.power() };
      } else break;
    }
    return n;
  }

  unary(): Node {
    if (this.isOp("-")) { this.next(); return { k: "neg", a: this.unary() }; }
    if (this.isOp("+")) { this.next(); return this.unary(); }
    return this.power();
  }

  power(): Node {
    const base = this.primary();
    if (this.isOp("^")) {
      this.next();
      return { k: "bin", op: "^", a: base, b: this.unary() };
    }
    return base;
  }

  /** Argument of a function written without parentheses: "sin 2x" = sin(2x), "sin x cos x" = sin(x)·cos(x). */
  bareArg(): Node {
    let n = this.unary();
    while (this.startsFactor() && this.peek()?.t !== "fn") n = { k: "bin", op: "*", a: n, b: this.power() };
    return n;
  }

  primary(): Node {
    const t = this.next();
    if (!t) throw new ParseError("Your answer ends too early");
    switch (t.t) {
      case "num":
        return { k: "num", v: t.v };
      case "id":
        if (t.v === "pi") return { k: "const", name: "pi" };
        if (t.v === "e") return { k: "const", name: "e" };
        return { k: "var", name: t.v };
      case "(": {
        const n = this.expr();
        if (this.next()?.t !== ")") throw new ParseError("A ( is missing its )");
        return n;
      }
      case "|": {
        this.absDepth++;
        const n = this.expr();
        this.absDepth--;
        if (this.next()?.t !== "|") throw new ParseError("An absolute value | is missing its partner");
        return { k: "fn", name: "abs", a: n };
      }
      case "sqrt":
        return { k: "fn", name: "sqrt", a: this.power() };
      case "fn": {
        let base: Node | undefined;
        let pow: Node | undefined;
        if (t.v === "log" && this.peek()?.t === "_") {
          this.next();
          base = this.primary();
        }
        if (this.isOp("^")) {
          // sin^2 x means (sin x)^2
          this.next();
          pow = this.primary();
        }
        let a: Node;
        if (this.peek()?.t === "(") {
          this.next();
          a = this.expr();
          if (this.next()?.t !== ")") throw new ParseError("A ( is missing its )");
        } else if (this.peek()?.t === "|") {
          a = this.primary();
        } else {
          a = this.bareArg();
        }
        return { k: "fn", name: t.v, a, base, pow };
      }
      case ")":
        throw new ParseError("There's a ) without a (");
      case "op":
        throw new ParseError(`"${t.v}" needs something before it`);
      default:
        throw new ParseError(`Unexpected "${t.v}"`);
    }
  }
}

export function parse(src: string): Node {
  return new Parser(tokenize(src)).parse();
}

const sec = (x: number) => 1 / Math.cos(x);
const FN_IMPL: Record<string, (x: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, sec, csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
  asin: Math.asin, acos: Math.acos, atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  ln: Math.log, log: Math.log10, exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
};

/** Real-valued power: (-8)^(1/3) = -2, like a calculator would say. */
export function rpow(a: number, b: number): number {
  if (a >= 0 || Number.isInteger(b)) return Math.pow(a, b);
  // odd-denominator rational exponents of negatives
  for (const d of [3, 5, 7, 9]) {
    const n = b * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const r = Math.pow(-a, b);
      return Math.round(n) % 2 === 0 ? r : -r;
    }
  }
  return NaN;
}

export type Scope = Record<string, number>;

function binop(op: "+" | "-" | "*" | "/" | "^", a: number, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return a / b;
    case "^": return rpow(a, b);
  }
}

export function evaluate(n: Node, scope: Scope): number {
  switch (n.k) {
    case "num": return n.v;
    case "const": return n.name === "pi" ? Math.PI : Math.E;
    case "var": {
      const v = scope[n.name];
      if (v === undefined) throw new ParseError(`What is "${n.name}"? This answer only uses ${Object.keys(scope).join(", ") || "numbers"}.`);
      return v;
    }
    case "neg": return -evaluate(n.a, scope);
    case "bin":
      return binop(n.op, evaluate(n.a, scope), evaluate(n.b, scope));
    case "fn": {
      const x = evaluate(n.a, scope);
      let y: number;
      if (n.name === "log" && n.base) y = Math.log(x) / Math.log(evaluate(n.base, scope));
      else y = FN_IMPL[n.name]!(x);
      return n.pow ? rpow(y, evaluate(n.pow, scope)) : y;
    }
  }
}

/** Collects every variable name used. */
export function variables(n: Node, out = new Set<string>()): Set<string> {
  switch (n.k) {
    case "var": out.add(n.name); break;
    case "neg": variables(n.a, out); break;
    case "bin": variables(n.a, out); variables(n.b, out); break;
    case "fn": variables(n.a, out); if (n.base) variables(n.base, out); if (n.pow) variables(n.pow, out); break;
  }
  return out;
}

/** Compile once, call many times (graphing). Returns NaN instead of throwing. */
export function compile(src: string, varName = "x"): ((x: number) => number) | null {
  try {
    const n = parse(src);
    const vars = variables(n);
    for (const v of vars) if (v !== varName) return null;
    return (x: number) => {
      try { return evaluate(n, { [varName]: x }); } catch { return NaN; }
    };
  } catch {
    return null;
  }
}

// ── LaTeX printing, so students see what they typed as real math ───────────
const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, neg: 3, "^": 4 };
const TEX_FN: Record<string, string> = {
  sin: "\\sin", cos: "\\cos", tan: "\\tan", sec: "\\sec", csc: "\\csc", cot: "\\cot",
  asin: "\\arcsin", acos: "\\arccos", atan: "\\arctan", sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh",
  ln: "\\ln", log: "\\log", exp: "\\exp", cbrt: "\\sqrt[3]",
};

function prec(n: Node): number {
  if (n.k === "bin") return PREC[n.op]!;
  if (n.k === "neg") return PREC.neg!;
  return 5;
}

function fmtNum(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(10)));
}

export function toTex(n: Node): string {
  switch (n.k) {
    case "num": return fmtNum(n.v);
    case "var": return n.name;
    case "const": return n.name === "pi" ? "\\pi" : "e";
    case "neg": {
      const inner = toTex(n.a);
      return prec(n.a) <= 2 ? `-\\left(${inner}\\right)` : `-${inner}`;
    }
    case "bin": {
      const { op, a, b } = n;
      if (op === "/") return `\\frac{${toTex(a)}}{${toTex(b)}}`;
      if (op === "^") {
        const base = prec(a) < 5 || (a.k === "fn" && !["abs", "sqrt", "cbrt"].includes(a.name)) ? `\\left(${toTex(a)}\\right)` : toTex(a);
        return `${base}^{${toTex(b)}}`;
      }
      const p = PREC[op]!;
      const wrap = (x: Node, right: boolean) => {
        const s = toTex(x);
        const q = prec(x);
        return q < p || (right && q === p && op === "-") ? `\\left(${s}\\right)` : s;
      };
      if (op === "*") {
        const left = wrap(a, false);
        const right = wrap(b, true);
        // 2x, 3\sin x, x(x+1) look nicer without a dot; number·number needs one
        const needDot = b.k === "num" || (b.k === "neg") || (b.k === "bin" && b.op === "^" && b.a.k === "num");
        return needDot ? `${left}\\cdot ${right}` : `${left}${right}`;
      }
      if (op === "+" && b.k === "neg") return `${wrap(a, false)}-${toTex(b.a)}`;
      return `${wrap(a, false)}${op}${wrap(b, true)}`;
    }
    case "fn": {
      if (n.name === "abs") return `\\left|${toTex(n.a)}\\right|`;
      if (n.name === "sqrt") return `\\sqrt{${toTex(n.a)}}`;
      if (n.name === "cbrt") return `\\sqrt[3]{${toTex(n.a)}}`;
      if (n.name === "exp") return `e^{${toTex(n.a)}}`;
      const head = n.name === "log" && n.base ? `\\log_{${toTex(n.base)}}` : TEX_FN[n.name] ?? n.name;
      const pow = n.pow ? `^{${toTex(n.pow)}}` : "";
      return `${head}${pow}\\left(${toTex(n.a)}\\right)`;
    }
  }
}

/** Safe LaTeX preview of whatever the student has typed so far. */
export function previewTex(src: string): { tex: string | null; error: string | null } {
  if (!src.trim()) return { tex: null, error: null };
  try {
    return { tex: toTex(parse(src)), error: null };
  } catch (e) {
    return { tex: null, error: e instanceof Error ? e.message : "Can't read that yet" };
  }
}
