import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/content/types";
import { checkExpr, checkIntervals, checkList, checkNumber, type Verdict } from "@/lib/math/check";
import { previewTex } from "@/lib/math/expr";
import { useStore } from "@/lib/store";
import { sfx } from "@/lib/sound";
import { Rich, Tex } from "./Rich";
import { Btn, LevelChip } from "./ui";

const CHEERS = ["Nice!", "Let's go!", "Big brain.", "Clean.", "That's a diamond.", "Crushed it.", "Yes!", "Easy XP."];
const ENCOURAGE = ["Not yet. Wrong answers are how brains learn.", "Close-ish. Try a hint?", "That's okay! Peek at a hint.", "Oof. Shake it off, try again."];

export function check(q: Question, input: string, choice: number | null): Verdict {
  switch (q.type) {
    case "mc":
      return { ok: choice === q.answer };
    case "num":
      return checkNumber(input, q.answer, q.tol);
    case "expr":
      return checkExpr(input, q.answer, { variable: q.variable, domain: q.domain, upToConstant: q.upToConstant });
    case "interval":
      return checkIntervals(input, q.answer, q.strict);
    case "list":
      return checkList(input, q.answer, q.ordered);
  }
}

function placeholder(q: Question): string {
  switch (q.type) {
    case "num": return "a number, fraction, DNE, inf or -inf";
    case "expr": return q.upToConstant ? `a formula in ${q.variable ?? "x"} (leave off + C)` : `a formula in ${q.variable ?? "x"}, like 3x^2 - 1`;
    case "interval": return "like (-inf, 2) U (5, inf), or none";
    case "list": return "numbers separated by commas, or none";
    default: return "";
  }
}

const KEYS: Record<string, string[]> = {
  num: ["/", "^", "sqrt(", "pi", "e", "ln(", "DNE", "inf", "-inf"],
  expr: ["^", "/", "sqrt(", "e^(", "ln(", "sin(", "cos(", "pi", "(", ")"],
  interval: ["(", ")", "[", "]", ",", " U ", "-inf", "inf"],
  list: [",", "-", "/", "sqrt(", "none"],
};

export function QuestionCard({ q, recordAs, onDone, autoFocus = false, showLevel = true }: {
  q: Question;
  /** stats id to record under (generated questions share one id per skill) */
  recordAs?: string;
  onDone?: (firstTryOk: boolean) => void;
  autoFocus?: boolean;
  showLevel?: boolean;
}) {
  const { record } = useStore();
  const [input, setInput] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [tries, setTries] = useState(0);
  const [firstOk, setFirstOk] = useState<boolean | null>(null);
  const [hints, setHints] = useState(0);
  const [steps, setSteps] = useState(0);
  const [pop, setPop] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const solved = verdict?.ok === true;
  const gaveUp = steps > 0 && !solved;

  useEffect(() => {
    setInput(""); setChoice(null); setVerdict(null); setTries(0); setFirstOk(null); setHints(0); setSteps(0); setPop(null); setMessage("");
  }, [q.id]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus, q.id]);

  const preview = useMemo(() => (q.type === "expr" || q.type === "num" ? previewTex(input.replace(/^[a-zA-Z]{1,3}[′'"]*\s*(\(\s*[a-z]\s*\))?\s*=\s*/, "")) : null), [input, q.type]);

  function submit(pick?: number) {
    if (solved) return;
    const c = pick ?? choice;
    if (q.type === "mc" && c === null) return;
    const v = check(q, input, c);
    if (v.error) {
      setVerdict(v);
      return;
    }
    setVerdict(v);
    const n = tries + 1;
    setTries(n);
    if (n === 1) {
      setFirstOk(v.ok);
      const gained = record({ t: "answer", q: recordAs ?? q.id, ok: v.ok });
      setPop(gained);
      if (v.ok) onDone?.(true);
    } else if (v.ok) {
      onDone?.(false);
    }
    if (v.ok) {
      sfx.correct();
      setMessage(n === 1 ? CHEERS[Math.floor(Math.random() * CHEERS.length)]! : "Nice recovery! That's how it sticks.");
    } else {
      sfx.wrong();
      setMessage(v.nudge ?? ENCOURAGE[Math.min(n - 1, ENCOURAGE.length - 1)]!);
    }
  }

  function insert(t: string) {
    const el = inputRef.current;
    if (!el) return setInput((s) => s + t);
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + t + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + t.length, start + t.length);
    });
  }

  function giveUp() {
    if (tries === 0) {
      setTries(1);
      setFirstOk(false);
      setPop(record({ t: "answer", q: recordAs ?? q.id, ok: false }));
      onDone?.(false);
    }
    setSteps(1);
  }

  return (
    <div className="q-card">
      {pop !== null && pop > 0 && <span key={tries} className="xp-pop">+{pop} XP</span>}
      <div className="q-head">
        {showLevel && <LevelChip level={q.level} />}
        {q.exam && <span className="chip gold">📝 Exam-style</span>}
        {tries > 0 && firstOk !== null && <span className={`chip ${firstOk ? "good" : ""}`}>{firstOk ? "✓ First try" : `Try ${tries}`}</span>}
      </div>
      <Rich text={q.prompt} className="readable" />

      {q.type === "mc" ? (
        <div role="radiogroup" style={{ marginTop: 10 }}>
          {q.choices.map((c, i) => {
            const state = solved && i === q.answer ? "right" : verdict && !verdict.ok && i === choice ? "wrong" : "";
            return (
              <button
                key={i}
                type="button"
                className={`choice ${state}`}
                role="radio"
                aria-checked={choice === i}
                onClick={() => {
                  setChoice(i);
                  submit(i);
                }}
                disabled={solved}
              >
                <span className="key">{String.fromCharCode(65 + i)}</span>
                <Rich text={c} as="span" />
              </button>
            );
          })}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ marginTop: 12 }}
        >
          <div className="row" style={{ alignItems: "stretch", gap: 6 }}>
            <input
              ref={inputRef}
              className="input mathy grow"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (verdict?.error) setVerdict(null);
              }}
              placeholder={placeholder(q)}
              aria-label="Your answer"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={solved}
              style={{ flex: "1 1 220px" }}
            />
            <Btn type="submit" kind="primary" disabled={solved || !input.trim()}>
              Check ✔
            </Btn>
          </div>
          {!solved && (
            <div className="row" style={{ gap: 4, marginTop: 6 }}>
              {(KEYS[q.type] ?? []).map((k) => (
                <button key={k} type="button" className="btn sm ghost" style={{ minHeight: 34, padding: "2px 10px", fontFamily: "ui-monospace, monospace" }} onClick={() => insert(k)}>
                  {k.trim()}
                </button>
              ))}
            </div>
          )}
          {preview && (preview.tex || preview.error) && !solved && (
            <div className="preview small" aria-live="polite">
              <span className="muted tiny">You typed:</span>
              {preview.tex ? <Tex src={preview.tex} /> : <span className="muted">{preview.error}</span>}
            </div>
          )}
          {q.type === "num" && q.unit && <div className="muted small">Units: {q.unit}</div>}
        </form>
      )}

      {verdict?.error && <div className="feedback hint">🤔 {verdict.error}</div>}
      {verdict && !verdict.error && (
        <div className={`feedback ${verdict.ok ? "ok" : "no"}`}>
          {verdict.ok ? "✅ " : "❌ "}
          {message}
        </div>
      )}

      {hints > 0 && q.hints && (
        <div className="stack" style={{ marginTop: 12 }}>
          {q.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="feedback hint reveal-step">
              <strong>💡 Hint {i + 1}:</strong> <Rich text={h} as="span" />
            </div>
          ))}
        </div>
      )}

      {steps > 0 && (
        <div className="slot" style={{ marginTop: 14 }}>
          <div className="px" style={{ marginBottom: 6 }}>📖 Solution, one step at a time</div>
          <ol className="steps-list">
            {q.solution.slice(0, steps).map((s, i) => (
              <li key={i} className="reveal-step">
                <Rich text={s} />
              </li>
            ))}
          </ol>
          {steps < q.solution.length && (
            <Btn size="sm" onClick={() => setSteps((n) => n + 1)}>
              Next step ▶
            </Btn>
          )}
        </div>
      )}

      <div className="row" style={{ marginTop: 12, gap: 6 }}>
        {!solved && q.hints && hints < q.hints.length && (
          <Btn size="sm" kind="gold" onClick={() => setHints((h) => h + 1)}>
            💡 {hints === 0 ? "Hint" : "Another hint"}
          </Btn>
        )}
        {(solved || tries > 0 || hints > 0) && steps === 0 && (
          <Btn size="sm" onClick={() => setSteps(1)}>
            📖 {solved ? "See full solution" : "Show me how"}
          </Btn>
        )}
        {!solved && tries === 0 && hints === 0 && (
          <Btn size="sm" kind="ghost" onClick={giveUp}>
            🏳️ I'm stuck, teach me
          </Btn>
        )}
        {gaveUp && <span className="muted small">No shame. Read it, then try a similar one. That's how it sticks.</span>}
      </div>
    </div>
  );
}
