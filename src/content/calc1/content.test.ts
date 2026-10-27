// Guards the course content: every formula renders, every answer key parses, and
// every question that carries `verify` data is re-derived numerically.
import { test } from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { UNITS, ALL_QUESTIONS } from "./index";
import { compile, evaluate, parse } from "../../lib/math/expr";
import { checkExpr, checkIntervals, checkList, checkNumber, parseIntervals, type NumAnswer } from "../../lib/math/check";
import type { Block, Question } from "../types";
import { GENERATORS } from "./generators";

function mathIn(text: string): string[] {
  const out: string[] = [];
  const s = text.replace(/\\\$/g, "");
  for (const m of s.matchAll(/\$\$([^$]+)\$\$/g)) out.push(m[1]!);
  const rest = s.replace(/\$\$[^$]+\$\$/g, "");
  for (const m of rest.matchAll(/\$([^$]+)\$/g)) out.push(m[1]!);
  const dollars = (rest.match(/\$/g) ?? []).length;
  if (dollars % 2) out.push("\\unbalancedDollarSign{" + text.slice(0, 60) + "}");
  return out;
}

function texts(b: Block): string[] {
  switch (b.k) {
    case "eli5": case "trap": case "tip": return [b.body];
    case "idea": return [b.title, b.body];
    case "formula": return [b.title, `$${b.tex}$`, b.note ?? ""];
    case "steps": return [b.title, ...b.steps];
    case "example": return [b.title, b.problem, ...b.steps, b.answer];
    case "table": return [b.title, ...b.head, ...b.rows.flat()];
    case "check": return qTexts(b.q);
    case "tool": return [b.caption ?? ""];
  }
}
function qTexts(q: Question): string[] {
  return [q.prompt, ...(q.hints ?? []), ...q.solution, ...(q.type === "mc" ? q.choices : [])];
}

const render = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: "ignore" });

test("ids are unique", () => {
  const seen = new Set<string>();
  for (const u of UNITS) {
    for (const id of [u.id, ...u.lessons.map((l) => l.id)]) {
      assert.ok(!seen.has(id), `duplicate id ${id}`);
      seen.add(id);
    }
  }
  for (const { q } of ALL_QUESTIONS) {
    assert.ok(!seen.has(q.id), `duplicate question id ${q.id}`);
    seen.add(q.id);
  }
});

test("no literal backslash-n in prose (String.raw keeps it)", () => {
  for (const u of UNITS) for (const l of u.lessons) {
    const all = [l.tldr, ...l.blocks.flatMap(texts), ...l.questions.flatMap(qTexts)];
    for (const t of all) assert.ok(!/\\n(?![a-z])/.test(t), `${l.id}: literal \\n in "${t.slice(0, 60)}"`);
  }
});

test("all math renders with KaTeX", () => {
  for (const u of UNITS) for (const l of u.lessons) {
    const all = [l.title, l.tldr, ...l.blocks.flatMap(texts), ...l.questions.flatMap(qTexts)];
    for (const t of all) for (const m of mathIn(t)) {
      assert.doesNotThrow(() => render(m), `KaTeX failed in ${l.id}: ${m}`);
    }
  }
});

test("answer keys parse and accept themselves", () => {
  for (const { q, lesson } of ALL_QUESTIONS) {
    const where = `${lesson.id}/${q.id}`;
    assert.ok(q.solution.length > 0, `${where} has no solution`);
    switch (q.type) {
      case "mc":
        assert.ok(q.answer >= 0 && q.answer < q.choices.length, `${where} mc answer out of range`);
        break;
      case "num":
        if (typeof q.answer === "number") assert.ok(Number.isFinite(q.answer), `${where} answer not finite`);
        assert.ok(checkNumber(typeof q.answer === "number" ? String(q.answer) : q.answer, q.answer, q.tol).ok, `${where} key rejects itself`);
        break;
      case "expr":
        assert.doesNotThrow(() => parse(q.answer), `${where} expr key doesn't parse`);
        assert.ok(checkExpr(q.answer, q.answer, { variable: q.variable, domain: q.domain, upToConstant: q.upToConstant }).ok, `${where} key rejects itself`);
        break;
      case "interval":
        assert.ok(!("error" in parseIntervals(q.answer)), `${where} interval key doesn't parse`);
        assert.ok(checkIntervals(q.answer, q.answer, q.strict).ok, `${where} key rejects itself`);
        break;
      case "list":
        assert.ok(checkList(q.answer.join(", "), q.answer, q.ordered).ok, `${where} key rejects itself`);
        break;
    }
  }
});

function numericLimit(src: string, a: number | "inf" | "-inf", side?: "left" | "right"): NumAnswer {
  const f = compile(src)!;
  assert.ok(f, `bad verify function ${src}`);
  if (a === "inf" || a === "-inf") {
    const s = a === "inf" ? 1 : -1;
    // overflow-safe: keep the largest x values that still give finite numbers
    const ys = [30, 300, 1e3, 1e5, 1e7].map((x) => f(s * x)).filter(Number.isFinite);
    const y1 = ys.at(-2)!, y2 = ys.at(-1)!;
    if (Math.abs(y2) > 1e6 && Math.abs(y2) > Math.abs(y1)) return y2 > 0 ? "inf" : "-inf";
    return y2;
  }
  const side1 = (dir: 1 | -1) => {
    const ys = [1e-3, 1e-5, 1e-7].map((h) => f(a + dir * h));
    const last = ys[2]!;
    if (Math.abs(last) > 1e5 && Math.abs(last) > Math.abs(ys[0]!)) return last > 0 ? Infinity : -Infinity;
    return last;
  };
  const L = side1(-1), R = side1(1);
  if (side === "left") return L === Infinity ? "inf" : L === -Infinity ? "-inf" : L;
  if (side === "right") return R === Infinity ? "inf" : R === -Infinity ? "-inf" : R;
  if (!Number.isFinite(L) || !Number.isFinite(R)) {
    if (L === R) return L > 0 ? "inf" : "-inf";
    return "DNE";
  }
  return Math.abs(L - R) < 1e-3 * Math.max(1, Math.abs(L)) ? (L + R) / 2 : "DNE";
}

function sameNum(a: NumAnswer, b: NumAnswer, tol = 1e-3): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

test("verified answers are mathematically right", () => {
  let checked = 0;
  for (const { q } of ALL_QUESTIONS) {
    const v = q.verify;
    if (!v) continue;
    checked++;
    const id = q.id;
    switch (v.kind) {
      case "value": {
        const val = evaluate(parse(v.expr), {});
        if (q.type === "num") assert.ok(sameNum(q.answer, val), `${id}: key ${q.answer} but ${v.expr} = ${val}`);
        else if (q.type === "list") assert.ok(q.answer.some((x) => sameNum(x, val)), `${id}: ${val} not in list`);
        else assert.fail(`${id}: value verify on ${q.type}`);
        break;
      }
      case "same": {
        assert.equal(q.type, "expr", `${id}: same-verify needs expr`);
        if (q.type === "expr") assert.ok(checkExpr(v.expr, q.answer, { variable: q.variable, domain: v.domain ?? q.domain }).ok, `${id}: key ≠ ${v.expr}`);
        break;
      }
      case "derivative": {
        const f = compile(v.f, q.type === "expr" ? q.variable ?? "x" : "x")!;
        assert.ok(f, `${id}: bad f`);
        const d = (x: number) => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;
        if (v.at !== undefined) {
          assert.equal(q.type, "num");
          if (q.type === "num") assert.ok(sameNum(q.answer, d(v.at), 1e-4), `${id}: f'(${v.at}) = ${d(v.at)}, key ${q.answer}`);
        } else {
          assert.equal(q.type, "expr");
          if (q.type === "expr") {
            const g = compile(q.answer, q.variable ?? "x")!;
            const [lo, hi] = v.domain ?? q.domain ?? [-3, 3];
            for (let i = 0; i < 9; i++) {
              const x = lo + ((hi - lo) * (i + 0.37)) / 9.4;
              const want = d(x), got = g(x);
              if (!Number.isFinite(want)) continue;
              assert.ok(Math.abs(want - got) <= 1e-4 * Math.max(1, Math.abs(want)), `${id}: at x=${x} f'=${want} but key gives ${got}`);
            }
          }
        }
        break;
      }
      case "antiderivative": {
        assert.equal(q.type, "expr");
        if (q.type !== "expr") break;
        const F = compile(q.answer, q.variable ?? "x")!;
        const f = compile(v.f, q.variable ?? "x")!;
        const [lo, hi] = v.domain ?? q.domain ?? [-3, 3];
        for (let i = 0; i < 9; i++) {
          const x = lo + ((hi - lo) * (i + 0.37)) / 9.4;
          const dF = (F(x + 1e-5) - F(x - 1e-5)) / 2e-5;
          if (!Number.isFinite(f(x))) continue;
          assert.ok(Math.abs(dF - f(x)) <= 1e-4 * Math.max(1, Math.abs(f(x))), `${id}: F'(${x}) = ${dF} but f = ${f(x)}`);
        }
        break;
      }
      case "limit": {
        assert.equal(q.type, "num", `${id}: limit verify needs num`);
        if (q.type === "num") {
          const got = numericLimit(v.f, v.a, v.side);
          assert.ok(sameNum(q.answer, got), `${id}: numeric limit ${got}, key ${q.answer}`);
        }
        break;
      }
      case "integral": {
        const f = compile(v.f)!;
        let n = 20000, s = f(v.a) + f(v.b);
        const h = (v.b - v.a) / n;
        for (let i = 1; i < n; i++) s += f(v.a + i * h) * (i % 2 ? 4 : 2);
        const val = (s * h) / 3;
        if (q.type === "num") assert.ok(sameNum(q.answer, val), `${id}: integral ${val}, key ${q.answer}`);
        n = 0;
        break;
      }
    }
  }
  assert.ok(checked > 0);
});

test("every lesson has a TL;DR, an ELI5 and practice", () => {
  for (const u of UNITS) for (const l of u.lessons) {
    assert.ok(l.tldr.length > 10, `${l.id} tldr`);
    assert.ok(l.blocks.some((b) => b.k === "eli5"), `${l.id} needs an eli5 block`);
    assert.ok(l.questions.length >= 4, `${l.id} needs at least 4 questions`);
    for (const g of l.gens ?? []) assert.ok(GENERATORS[g], `${l.id} references unknown generator ${g}`);
  }
});

test("generators produce questions whose keys check out", () => {
  for (const [id, gen] of Object.entries(GENERATORS)) {
    for (let seed = 1; seed <= 40; seed++) {
      const q = gen.make(seed);
      for (const t of qTexts(q)) for (const m of mathIn(t)) assert.doesNotThrow(() => render(m), `${id}#${seed} KaTeX: ${m}`);
      switch (q.type) {
        case "num": assert.ok(checkNumber(String(q.answer), q.answer, q.tol).ok, `${id}#${seed} self-check`); break;
        case "expr": assert.ok(checkExpr(q.answer, q.answer, { variable: q.variable, domain: q.domain, upToConstant: q.upToConstant }).ok, `${id}#${seed} self-check`); break;
        case "interval": assert.ok(checkIntervals(q.answer, q.answer, q.strict).ok, `${id}#${seed} self-check`); break;
        case "list": assert.ok(checkList(q.answer.join(","), q.answer).ok, `${id}#${seed} self-check`); break;
        case "mc": assert.ok(q.answer >= 0 && q.answer < q.choices.length); break;
      }
      if (q.verify) {
        // reuse the same numeric verification as authored questions
        const v = q.verify;
        if (v.kind === "derivative" && q.type === "expr" && v.at === undefined) {
          const f = compile(v.f, q.variable ?? "x")!, g = compile(q.answer, q.variable ?? "x")!;
          const [lo, hi] = v.domain ?? q.domain ?? [-3, 3];
          for (let i = 0; i < 7; i++) {
            const x = lo + ((hi - lo) * (i + 0.41)) / 7.3;
            const d = (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;
            if (Number.isFinite(d)) assert.ok(Math.abs(d - g(x)) <= 2e-4 * Math.max(1, Math.abs(d)), `${id}#${seed} derivative wrong at ${x}: ${d} vs ${g(x)}`);
          }
        }
        if (v.kind === "derivative" && q.type === "num" && v.at !== undefined) {
          const f = compile(v.f)!;
          const d = (f(v.at + 1e-5) - f(v.at - 1e-5)) / 2e-5;
          assert.ok(sameNum(q.answer, d, 1e-4), `${id}#${seed} f'(a) = ${d} vs ${q.answer}`);
        }
        if (v.kind === "antiderivative" && q.type === "expr") {
          const F = compile(q.answer)!, f = compile(v.f)!;
          for (const x of [-1.3, 0.4, 1.7]) {
            const dF = (F(x + 1e-5) - F(x - 1e-5)) / 2e-5;
            if (Number.isFinite(f(x))) assert.ok(Math.abs(dF - f(x)) <= 2e-4 * Math.max(1, Math.abs(f(x))), `${id}#${seed} antiderivative`);
          }
        }
        if (v.kind === "limit" && q.type === "num") assert.ok(sameNum(q.answer, numericLimit(v.f, v.a, v.side)), `${id}#${seed} limit ${numericLimit(v.f, v.a, v.side)} vs ${q.answer}`);
        if (v.kind === "value" && q.type === "num") assert.ok(sameNum(q.answer, evaluate(parse(v.expr), {})), `${id}#${seed} value`);
        if (v.kind === "integral" && q.type === "num") {
          const f = compile(v.f)!;
          const n = 4000, h = (v.b - v.a) / n;
          let s = f(v.a) + f(v.b);
          for (let i = 1; i < n; i++) s += f(v.a + i * h) * (i % 2 ? 4 : 2);
          assert.ok(sameNum(q.answer, (s * h) / 3), `${id}#${seed} integral`);
        }
      }
    }
  }
});

test("every question stands on its own (they get shuffled in boss fights)", () => {
  for (const { q } of ALL_QUESTIONS) {
    assert.ok(!/^(Same|\.\.\.|…|and )|problem above|from the example\b/i.test(q.prompt), `${q.id} depends on another question: "${q.prompt.slice(0, 50)}"`);
  }
});
