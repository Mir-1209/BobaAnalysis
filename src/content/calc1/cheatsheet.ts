// The one-page exam survival sheet, built from the Exam 2 master guide.
const r = String.raw;

export interface CheatSection { id: string; emoji: string; title: string; items: string[] }

export const QUESTION_MAP: Array<[string, string, string]> = [
  ["Compute a limit", "limits", "u8"],
  ["Limit at infinity / asymptotes", "infinity", "u9"],
  ["Find a derivative / slope", "rules", "u11"],
  ["Use the limit definition", "limitdef", "u10"],
  ["Increasing, decreasing, concavity", "shape", "u13"],
  ["Graph of f or f′", "graphs", "u13"],
  ["Piecewise continuous / differentiable", "piecewise", "u14"],
  ["Tangent, velocity, approximation", "tangent", "u14"],
  ["Sketch a graph from conditions", "sketch", "u16"],
];

export const CHEATSHEET: CheatSection[] = [
  {
    id: "limits", emoji: "🔍", title: "Limit decision tree",
    items: [
      r`**1. Substitute.** Ordinary number → done.`,
      r`**2. $\frac00$?** Factor & cancel, common denominator, or conjugate. Substitute again.`,
      r`**3. $\frac{\text{nonzero}}{0}$?** Check signs left & right. Same ∞ → infinite limit; opposite → DNE.`,
      r`**4. Graph?** Approach from both sides; ignore the filled dot.`,
      r`Two-sided limit exists ⇔ LHL = RHL.`,
      r`Conjugate: $(\sqrt A - B)(\sqrt A + B) = A - B^2$.`,
    ],
  },
  {
    id: "infinity", emoji: "♾️", title: "Infinity & asymptotes",
    items: [
      r`Rational as $x\to\pm\infty$: compare top/bottom degree. Smaller top → 0; equal → ratio of leading coefficients; bigger top → ±∞ (find the sign).`,
      r`Growth: $\ln x \ll \sqrt x \ll x^n \ll b^x$; bigger base wins.`,
      r`$b > 1$: $b^x \to \infty$ as $x\to\infty$, $\to 0$ as $x\to-\infty$.`,
      r`VA $x = a$: bottom still 0 after canceling. Canceled factor → **hole**, not VA.`,
      r`HA $y = L$: $f(x) \to L$ as $x\to\infty$ or $-\infty$.`,
    ],
  },
  {
    id: "rules", emoji: "⚡", title: "Derivative toolbox",
    items: [
      r`$(x^n)' = nx^{n-1}$, $\ (c)' = 0$, $\ (cf)' = cf'$, $\ (f\pm g)' = f' \pm g'$`,
      r`$(e^x)' = e^x$, $\ (a^x)' = a^x\ln a$, $\ (\ln x)' = \frac1x$`,
      r`Product: $(uv)' = u'v + uv'$`,
      r`Quotient: $\left(\frac uv\right)' = \frac{u'v - uv'}{v^2}$`,
      r`Chain: $[f(g(x))]' = f'(g(x))\,g'(x)$`,
      r`$(\sin x)' = \cos x$, $(\cos x)' = -\sin x$, $(\tan x)' = \sec^2 x$`,
      r`Rewrite first: $\sqrt x = x^{1/2}$, $\frac{1}{x^4} = x^{-4}$.`,
    ],
  },
  {
    id: "limitdef", emoji: "🧪", title: "Limit definition of f′(a)",
    items: [
      r`$$f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}$$`,
      r`1. Compute $f(a)$ and $f(a+h)$ separately. 2. Plug into the quotient. 3. Expand/rationalize, **cancel $h$**, then $h\to0$. 4. Units.`,
      r`Ex: $x^2+2$ at 4 → $8 + h \to 8$. $\sqrt{x^2+16}$ at 3 → $\frac{6+h}{\sqrt{(3+h)^2+16}+5} \to \frac35$.`,
      r`"Use the limit definition" means shortcuts alone get no credit.`,
    ],
  },
  {
    id: "shape", emoji: "🎢", title: "Inc / dec / concavity",
    items: [
      r`$f' > 0$ ↗, $f' < 0$ ↘. $f'' > 0$ ∪ (concave up), $f'' < 0$ ∩.`,
      r`Sign chart: find $f'$ (or $f''$) → zeros & undefined points → number line → test each interval → interval notation.`,
      r`$f' = 0$ doesn't automatically mean max/min. Inflection needs a **sign change** of $f''$.`,
      r`Odd multiplicity flips the sign; even doesn't.`,
      r`Feb 2026: $f = x^4 - 6x^3 + 8x - 4$, $f'' = 12x(x-3)$: ∪ on $(-\infty,0)\cup(3,\infty)$, ∩ on $(0,3)$, inflections at 0 and 3.`,
    ],
  },
  {
    id: "graphs", emoji: "👀", title: "Reading f and f′ graphs",
    items: [
      r`Graph of $f$: height = $f(a)$; approaching height = limit; slope = $f'(a)$. Open circle = excluded, filled dot = value.`,
      r`Corners, cusps, jumps, holes, vertical tangents → no derivative.`,
      r`Graph of $f'$: above axis → $f$ ↗; below → $f$ ↘; $f'$ rising → $f$ ∪; $f'$ falling → $f$ ∩; turning points of $f'$ → inflection of $f$.`,
      r`Continuity at $a$: LHL = RHL = $f(a)$. Differentiable ⇒ continuous (not the reverse).`,
    ],
  },
  {
    id: "piecewise", emoji: "🧩", title: "Piecewise: find A and B",
    items: [
      r`At the boundary $c$: **same value** (continuity) AND **same slope** (differentiability). Two equations.`,
      r`Ex: $Ax^2 + B$ ($x<2$), $3x+1$ ($x\ge2$): $4A + B = 7$, $4A = 3$ → $A = \frac34$, $B = 4$.`,
    ],
  },
  {
    id: "tangent", emoji: "🎯", title: "Tangent, rates, approximation",
    items: [
      r`Tangent: $y - f(a) = f'(a)(x - a)$.`,
      r`$\Delta f \approx f'(a)\,\Delta x$ (keep the sign and units; it's an estimate).`,
      r`Average velocity $\frac{s(b)-s(a)}{b-a}$; instantaneous $s'(t)$. Tables: use points on both sides.`,
      r`Units of $f'$ = output units per input unit.`,
      r`Template: "At input $a$, the output is increasing/decreasing at about $f'(a)$ units per unit."`,
    ],
  },
  {
    id: "sketch", emoji: "✏️", title: "Sketch from conditions",
    items: [
      r`Asymptotes first → open circles for excluded points → filled dots for given values → flat tangents where $g' = 0$ → rise where $g' > 0$, fall where $g' < 0$ → check every condition.`,
    ],
  },
  {
    id: "algebra", emoji: "🧮", title: "Algebra you must know",
    items: [
      r`$x^2 + bx + c = (x + r)(x + s)$ with $r + s = b$, $rs = c$. Cancel whole factors only.`,
      r`$(a+h)^2 = a^2 + 2ah + h^2$; $\ a^2 - b^2 = (a-b)(a+b)$; $\ a^3 - b^3 = (a-b)(a^2+ab+b^2)$`,
      r`$\ln(AB) = \ln A + \ln B$, $\ln\frac AB = \ln A - \ln B$, $\ln A^p = p\ln A$.`,
      r`$(a, b)$ excludes ends; $[a, b]$ includes; $\cup$ = union.`,
    ],
  },
];

export const TACTICS: string[] = [
  r`$\frac00$ → simplify. Never write 0 or DNE immediately.`,
  r`Two-sided limit → always compare left and right.`,
  r`Increasing/decreasing → signs of $f'$, not $f$.`,
  r`Concavity → $f''$, or whether the $f'$ graph rises/falls.`,
  r`Piecewise differentiability → TWO equations.`,
  r`Estimating a change → derivative × input change, keep sign & units.`,
  r`Show intermediate algebra for partial credit; label final answers.`,
  r`Filled dot = $f(a)$, not necessarily the limit.`,
  r`Vertical asymptotes → say $+\infty$ or $-\infty$ on each side.`,
  r`75 minutes: scan everything, grab fast points first, return to long algebra, save 5 min to check signs/intervals/units.`,
];
