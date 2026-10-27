import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, evaluate, toTex, compile } from "./expr";
import { checkExpr, checkNumber, checkIntervals, checkList, readNumber, stripLhs } from "./check";

const ev = (s: string, x = 0) => evaluate(parse(s), { x });

test("parses the ways students actually type", () => {
  assert.equal(ev("3x^2 - 2x + 1", 2), 9);
  assert.equal(ev("2(x+1)", 3), 8);
  assert.equal(ev("(x+1)(x-1)", 3), 8);
  assert.equal(ev("x(x+1)", 3), 12);
  assert.equal(ev("-x^2", 3), -9);
  assert.equal(ev("2^-1"), 0.5);
  assert.equal(ev("2^3^2"), 512);
  assert.ok(Math.abs(ev("2sin x cos x", 0.7) - Math.sin(1.4)) < 1e-12);
  assert.ok(Math.abs(ev("sin^2 x + cos^2 x", 1.3) - 1) < 1e-12);
  assert.ok(Math.abs(ev("e^(2x)", 1) - Math.E ** 2) < 1e-12);
  assert.ok(Math.abs(ev("xe^x", 1) - Math.E) < 1e-12);
  assert.equal(ev("ln|x|", -Math.E), 1);
  assert.equal(ev("|x-3|", 1), 2);
  assert.equal(ev("|x|*|x-1|", -2), 6);
  assert.equal(ev("sqrt(x+1)", 8), 3);
  assert.equal(ev("√x", 9), 3);
  assert.equal(ev("x√x", 4), 8);
  assert.equal(ev("log_2 8"), 3);
  assert.equal(ev("log_2(x)", 32), 5);
  assert.equal(ev("log(1000)"), 3);
  assert.equal(ev("x^(1/3)", -8), -2);
  assert.equal(ev("3·x − 1", 2), 5);
  assert.equal(ev("x²", 5), 25);
  assert.equal(ev("2pi") , 2 * Math.PI);
  assert.equal(ev("1/2x", 4), 2); // Desmos-style: (1/2)·x
});

test("reports friendly errors", () => {
  assert.throws(() => parse("(x+1"), /missing its \)/);
  assert.throws(() => parse("x+1)"), /extra \)/);
  assert.throws(() => parse("3 $ 4"), /symbol/);
  assert.throws(() => parse(""), /Type an answer/);
});

test("prints LaTeX", () => {
  assert.equal(toTex(parse("x^2/(x+1)")), "\\frac{x^{2}}{x+1}");
  assert.equal(toTex(parse("2x")), "2x");
  assert.equal(toTex(parse("sqrt(x)")), "\\sqrt{x}");
  assert.equal(toTex(parse("x - (x - 1)")), "x-\\left(x-1\\right)");
});

test("compile returns a safe function", () => {
  const f = compile("1/x")!;
  assert.equal(f(2), 0.5);
  assert.equal(compile("y+1"), null);
});

test("numbers: fractions, roots, DNE and infinity", () => {
  assert.equal(readNumber("3/5"), 0.6);
  assert.equal(readNumber("x = -2"), -2);
  assert.equal(readNumber("DNE"), "DNE");
  assert.equal(readNumber("does not exist"), "DNE");
  assert.equal(readNumber("-∞"), "-inf");
  assert.equal(readNumber("infinity"), "inf");
  assert.ok(checkNumber("6/5", 1.2).ok);
  assert.ok(checkNumber("1.2", 6 / 5).ok);
  assert.ok(checkNumber("0.333", 1 / 3).ok);
  assert.ok(!checkNumber("0.3", 1 / 3).ok);
  assert.ok(checkNumber("ln(2)/ln(1.02)", Math.log(2) / Math.log(1.02)).ok);
  assert.equal(checkNumber("-5", 5).nudge !== undefined, true);
  assert.ok(checkNumber("inf", "inf").ok);
  assert.ok(!checkNumber("inf", "DNE").ok);
  assert.ok(checkNumber("x", 1).error);
});

test("expressions are compared by value, not by look", () => {
  assert.ok(checkExpr("2x+2", "2(x+1)").ok);
  assert.ok(checkExpr("f'(x) = 3x^2", "3x^2").ok);
  assert.ok(checkExpr("y = 3x - 2", "3x-2").ok);
  assert.ok(!checkExpr("3x^2+1", "3x^2").ok);
  assert.ok(checkExpr("-2x", "2x").nudge);
  assert.ok(checkExpr("1/(2sqrt(x))", "0.5x^(-1/2)", { domain: [0.1, 5] }).ok);
  assert.ok(checkExpr("x^3/3 + 7", "x^3/3", { upToConstant: true }).ok);
  assert.ok(!checkExpr("x^3", "x^3/3", { upToConstant: true }).ok);
  assert.ok(checkExpr("3t^2", "3t^2", { variable: "t" }).ok);
  assert.ok(checkExpr("3x^2", "3t^2", { variable: "t" }).error);
});

test("intervals", () => {
  assert.ok(checkIntervals("(-inf,0) U (3,inf)", "(-inf,0)U(3,inf)").ok);
  assert.ok(checkIntervals("(3, ∞) ∪ (−∞, 0)", "(-inf,0)U(3,inf)").ok);
  assert.ok(checkIntervals("[0,3]", "(0,3)").ok);
  assert.ok(!checkIntervals("[0,3]", "(0,3)", true).ok);
  assert.ok(!checkIntervals("(0,3)", "(-inf,0)U(3,inf)").ok);
  assert.ok(checkIntervals("none", "none").ok);
  assert.ok(checkIntervals("(-1/2, sqrt(2))", "(-0.5,1.41421356)").ok);
});

test("lists", () => {
  assert.ok(checkList("x = 0, x = 3", [3, 0]).ok);
  assert.ok(checkList("0, 3", [3, 0]).ok);
  assert.ok(checkList("3 and 0", [0, 3]).ok);
  assert.ok(!checkList("0", [0, 3]).ok);
  assert.ok(checkList("none", []).ok);
});

test("stripLhs", () => {
  assert.equal(stripLhs("f'(x) = 2x"), "2x");
  assert.equal(stripLhs("y=4"), "4");
  assert.equal(stripLhs("x = -1"), "-1");
});
