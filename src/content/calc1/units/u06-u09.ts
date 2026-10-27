import type { Unit } from "../../types";

const r = String.raw;

export const u06: Unit = {
  id: "u6",
  n: 6,
  title: "Limits",
  emoji: "🔍",
  biome: "mountain",
  when: "Week 3",
  exam: 2,
  summary: "The single idea calculus is built on: what is f(x) heading toward as x sneaks up on a number?",
  lessons: [
    {
      id: "u6l1",
      title: "The idea of a limit",
      emoji: "🐾",
      minutes: 10,
      tldr: "A limit is where the OUTPUT is heading as x gets close to a, which may be totally different from f(a) itself.",
      blocks: [
        {
          k: "eli5",
          body: r`You're walking toward a door 🚪. Every step you take is half the remaining distance. You get closer, closer, closer… The **limit** is the door: **where you're heading**, even if you never actually step through.

In math: as $x$ gets close to $a$, where are the outputs $f(x)$ heading? Whatever happens **exactly at** $a$ doesn't matter. There could even be a hole there!`,
        },
        { k: "formula", title: "Notation", tex: r`\lim_{x \to a} f(x) = L`, note: r`"The limit of $f(x)$ as $x$ approaches $a$ is $L$." $L$ is unique if it exists, and it may or may not equal $f(a)$.` },
        {
          k: "idea",
          title: "The official definition (Week 3 slides)",
          body: r`$\lim_{x\to a} f(x) = L$ means: the output values of $f$ get **arbitrarily close** to $L$ when the input values $x$ are **close enough** to $a$ (on either side of $a$) **but not equal to** $a$.

History bite: Archimedes first played with the idea; Newton and Leibniz turned it into calculus in the 1600s.`,
        },
        { k: "tool", tool: "limit", props: { f: "(x^2 - 9)/(x - 3)", a: 3 }, caption: "f(3) is undefined (0/0), but the outputs clearly head to 6." },
        {
          k: "example",
          title: "Using a table",
          problem: r`Estimate $\displaystyle\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$.`,
          steps: [
            r`Plugging in 3 gives $\frac00$: undefined. That doesn't mean the limit doesn't exist!`,
            r`From the left: $f(2.9) = 5.9$, $f(2.99) = 5.99$, $f(2.999) = 5.999$.`,
            r`From the right: $f(3.1) = 6.1$, $f(3.01) = 6.01$, $f(3.001) = 6.001$.`,
            r`Both sides are heading to 6.`,
          ],
          answer: r`The limit is 6, even though $f(3)$ doesn't exist. (The graph is the line $y = x + 3$ with a hole at $(3, 6)$.)`,
        },
        { k: "trap", body: r`"$f(a)$ is undefined" does **not** mean "the limit doesn't exist." And "$f(a) = 5$" does **not** mean "the limit is 5." The limit only looks **near** $a$, never **at** $a$.` },
      ],
      questions: [
        { id: "u6l1q1", type: "num", level: 1, prompt: r`Use the table idea: $\displaystyle\lim_{x \to 3} \frac{x^2 - 9}{x - 3} = ?$`, answer: 6, verify: { kind: "limit", f: "(x^2-9)/(x-3)", a: 3 }, solution: [r`Outputs near 3 head to 6 from both sides.`] },
        { id: "u6l1q2", type: "mc", level: 1, prompt: r`$f(2) = 10$ but $f(x)$ approaches 4 as $x \to 2$ from both sides. What is $\lim_{x\to2} f(x)$?`, choices: ["10", "4", "Does not exist", "14"], answer: 1, solution: [r`The limit ignores what happens AT 2. It's 4.`] },
        { id: "u6l1q3", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x \to 2} (3x + 1) = ?$`, answer: 7, verify: { kind: "limit", f: "3x+1", a: 2 }, solution: [r`No funny business, just plug in: $3(2) + 1 = 7$.`] },
        { id: "u6l1q4", type: "num", level: 2, prompt: r`Estimate $\displaystyle\lim_{x \to 0} \frac{e^x - 1}{x}$ using values like $x = 0.001$ (round to a whole number).`, answer: 1, verify: { kind: "limit", f: "(e^x-1)/x", a: 0 }, solution: [r`$f(0.001) \approx 1.0005$, $f(-0.001) \approx 0.9995$.`, r`Heading to 1. (You'll prove it with L'Hôpital in Unit 16.)`] },
        { id: "u6l1q5", type: "mc", level: 2, prompt: r`Which statement is TRUE?`, choices: ["If f(a) is undefined, the limit at a doesn't exist", "The limit at a always equals f(a)", "A limit can exist even if f(a) is undefined", "A limit can have two different values"], answer: 2, solution: [r`Holes are the classic example: undefined at $a$, but the limit exists.`, r`And a limit is unique when it exists.`] },
        { id: "u6l1q6", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x \to -1} \frac{x^2 - 1}{x + 1} = ?$`, answer: -2, verify: { kind: "limit", f: "(x^2-1)/(x+1)", a: -1 }, solution: [r`$\frac{(x-1)(x+1)}{x+1} = x - 1$ for $x \ne -1$.`, r`Heading to $-1 - 1 = -2$.`] },
      ],
    },
    {
      id: "u6l2",
      title: "One-sided limits & reading graphs",
      emoji: "👈👉",
      minutes: 12,
      tldr: "Approach from the left (x→a⁻) and from the right (x→a⁺). The two-sided limit exists only if both sides agree.",
      blocks: [
        { k: "eli5", body: r`Two friends walk toward the same door, one from the **left** 👈, one from the **right** 👉. If they meet at the **same** spot, the limit exists. If they end up at **different heights** (one upstairs, one downstairs), there's no single limit: **DNE** (does not exist).` },
        { k: "formula", title: "One-sided limits", tex: r`\lim_{x \to a^-} f(x) \quad\text{(from the left)} \qquad \lim_{x \to a^+} f(x) \quad\text{(from the right)}`, note: r`The two-sided limit exists **exactly when** $\lim_{x\to a^-} f(x) = \lim_{x\to a^+} f(x) = L$. If LHL ≠ RHL, the limit does not exist.` },
        {
          k: "steps",
          title: "Reading a limit off a graph",
          steps: [
            r`Put your finger on the curve to the **left** of $x = a$ and slide toward $a$. Note the height you approach: that's the LHL.`,
            r`Do the same from the **right**: that's the RHL.`,
            r`**Ignore the dot** at $x = a$ (filled or open). Dots tell you $f(a)$, not the limit!`,
            r`Same height from both sides → that's the limit. Different → DNE.`,
          ],
        },
        {
          k: "table",
          title: "eˣ and ln x limits (slides)",
          head: ["Limit", "Value", "Why"],
          rows: [
            ["$\\lim_{x\\to-\\infty} e^x$", "$0$", "hugs the x-axis on the left"],
            ["$\\lim_{x\\to 0} e^x$", "$1$", "$e^0 = 1$, no breaks"],
            ["$\\lim_{x\\to\\infty} e^x$", "$\\infty$", "explodes"],
            ["$\\lim_{x\\to-\\infty} \\ln x$", "undefined", "ln only exists for $x>0$"],
            ["$\\lim_{x\\to 0^+} \\ln x$", "$-\\infty$", "dives down the y-axis"],
            ["$\\lim_{x\\to\\infty} \\ln x$", "$\\infty$", "slowly, but forever"],
          ],
        },
        { k: "tool", tool: "limit", props: { f: "abs(x)/x", a: 0 }, caption: "|x|/x: −1 on the left, +1 on the right. The two-sided limit at 0 does not exist." },
        { k: "trap", body: r`On the exam: "**A filled dot gives $f(a)$, not necessarily the limit.**" That line is literally on the cheat sheet.` },
      ],
      questions: [
        { id: "u6l2q1", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to 0^+} \frac{|x|}{x} = ?$`, answer: 1, verify: { kind: "limit", f: "abs(x)/x", a: 0, side: "right" }, solution: [r`For $x > 0$, $|x| = x$, so $\frac{|x|}{x} = 1$.`] },
        { id: "u6l2q2", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to 0^-} \frac{|x|}{x} = ?$`, answer: -1, verify: { kind: "limit", f: "abs(x)/x", a: 0, side: "left" }, solution: [r`For $x < 0$, $|x| = -x$, so $\frac{|x|}{x} = -1$.`] },
        { id: "u6l2q3", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to 0} \frac{|x|}{x} = ?$ (type DNE if it doesn't exist)`, answer: "DNE", verify: { kind: "limit", f: "abs(x)/x", a: 0 }, solution: [r`Left side −1, right side 1. They disagree → DNE.`] },
        { id: "u6l2q4", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to-\infty} e^x = ?$`, answer: 0, verify: { kind: "limit", f: "e^x", a: "-inf" }, solution: [r`$e^{-1000}$ is a tiny positive number. Heads to 0.`] },
        { id: "u6l2q5", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to0^+} \ln x = ?$ (inf / -inf / number)`, answer: "-inf", solution: [r`$\ln(0.001) \approx -6.9$, $\ln(10^{-9}) \approx -20.7$. Diving to $-\infty$.`] },
        { id: "u6l2q6", type: "mc", level: 2, exam: true, prompt: r`On a graph, as $x \to 2$ from the left the curve approaches height 3, from the right it approaches height 3, and there's a filled dot at $(2, 5)$. Which is right?`, choices: [r`$\lim_{x\to2} f(x) = 5$ and $f(2) = 3$`, r`$\lim_{x\to2} f(x) = 3$ and $f(2) = 5$`, r`The limit does not exist`, r`$\lim_{x\to2} f(x) = 3$ and $f(2) = 3$`], answer: 1, solution: [r`Both sides head to 3 → limit is 3.`, r`The filled dot is the actual value: $f(2) = 5$.`] },
        { id: "u6l2q7", type: "num", level: 2, prompt: r`$f(x) = x + 1$ for $x < 1$ and $f(x) = 3x$ for $x \ge 1$. Find $\lim_{x\to 1^-} f(x)$.`, answer: 2, verify: { kind: "limit", f: "x+1", a: 1, side: "left" }, solution: [r`From the left, use $x + 1$: heading to $2$.`] },
        { id: "u6l2q8", type: "num", level: 2, prompt: r`$f(x) = x + 1$ for $x < 1$ and $f(x) = 3x$ for $x \ge 1$. Find $\lim_{x\to 1} f(x)$ (or DNE).`, answer: "DNE", solution: [r`Left: 2. Right: $3(1) = 3$.`, r`$2 \ne 3$ → DNE.`] },
      ],
    },
    {
      id: "u6l3",
      title: "Limit laws",
      emoji: "⚖️",
      minutes: 9,
      tldr: "Limits play nicely with +, −, ×, ÷ (bottom ≠ 0) and powers: you can split them up and do each piece separately.",
      blocks: [
        { k: "eli5", body: r`If you know where $f$ is heading and where $g$ is heading, you know where $f + g$ is heading: just add the destinations. Same for subtracting, multiplying, dividing (as long as you're not dividing by 0). 🧮` },
        {
          k: "table",
          title: "The laws (if lim f and lim g exist)",
          head: ["Law", "Formula"],
          rows: [
            ["Sum / difference", "$\\lim[f \\pm g] = \\lim f \\pm \\lim g$"],
            ["Constant multiple", "$\\lim[c\\,f] = c\\lim f$"],
            ["Product", "$\\lim[fg] = \\lim f \\cdot \\lim g$"],
            ["Quotient", "$\\lim \\frac fg = \\frac{\\lim f}{\\lim g}$ if $\\lim g \\ne 0$"],
            ["Power", "$\\lim[f]^n = [\\lim f]^n$"],
          ],
        },
        {
          k: "example",
          title: "Slides: given limits",
          problem: r`Assume $\lim_{x\to3} f(x) = 4$ and $\lim_{x\to3} g(x) = 5$. Find (a) $\lim[2f - g]$ (b) $\lim \frac{f^2}{f + 3g}$ (c) $\lim\frac{\sqrt{f}}{7g+3}$.`,
          steps: [r`(a) $2(4) - 5 = 3$.`, r`(b) $\dfrac{4^2}{4 + 3(5)} = \dfrac{16}{19}$.`, r`(c) $\dfrac{\sqrt4}{7(5) + 3} = \dfrac{2}{38} = \dfrac{1}{19}$.`],
          answer: r`$3,\ \tfrac{16}{19},\ \tfrac{1}{19}$`,
        },
        { k: "tip", body: r`**Direct substitution:** if there's no hole or jump at $x = a$ (polynomials, and rational functions where the bottom isn't 0), the limit is just $f(a)$. Always try plugging in FIRST.` },
      ],
      questions: [
        { id: "u6l3q1", type: "num", level: 1, prompt: r`$\lim_{x\to3} f = 4$, $\lim_{x\to3} g = 5$. Find $\lim_{x\to3}[2f(x) - g(x)]$.`, answer: 3, solution: [r`$2(4) - 5 = 3$`] },
        { id: "u6l3q2", type: "num", level: 2, prompt: r`$\lim_{x\to3} f = 4$ and $\lim_{x\to3} g = 5$. Find $\lim_{x\to3}\dfrac{(f(x))^2}{f(x) + 3g(x)}$.`, answer: 16 / 19, solution: [r`$\frac{16}{4 + 15} = \frac{16}{19}$`] },
        { id: "u6l3q3", type: "num", level: 2, prompt: r`$\lim_{x\to3} f = 4$ and $\lim_{x\to3} g = 5$. Find $\lim_{x\to3}\dfrac{\sqrt{f(x)}}{7g(x) + 3}$.`, answer: 1 / 19, solution: [r`$\frac{2}{38} = \frac{1}{19}$`] },
        { id: "u6l3q4", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to 2}(x^3 - 4x + 1) = ?$`, answer: 1, verify: { kind: "limit", f: "x^3-4x+1", a: 2 }, solution: [r`Polynomial: plug in. $8 - 8 + 1 = 1$.`] },
        { id: "u6l3q5", type: "num", level: 2, prompt: r`$\lim_{x\to1} f = -2$, $\lim_{x\to1} g = 3$. Find $\lim_{x\to1} \left[(2x^2 + 3)f(x)\right]$.`, answer: -10, solution: [r`$\lim(2x^2 + 3) = 5$.`, r`Product law: $5 \cdot (-2) = -10$.`] },
        { id: "u6l3q6", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to 0}\frac{x + 4}{x^2 + 2} = ?$`, answer: 2, verify: { kind: "limit", f: "(x+4)/(x^2+2)", a: 0 }, solution: [r`Bottom isn't 0 at $x = 0$: plug in. $\frac{4}{2} = 2$.`] },
      ],
    },
  ],
};

export const u07: Unit = {
  id: "u7",
  n: 7,
  title: "Continuity",
  emoji: "🌊",
  biome: "river",
  when: "Week 3",
  exam: 2,
  summary: "No holes, no jumps, no walls. The 3-step continuity test and solving for constants in piecewise functions.",
  lessons: [
    {
      id: "u7l1",
      title: "What continuous means",
      emoji: "✍️",
      minutes: 8,
      tldr: "Continuous at a = the limit exists, f(a) exists, and they're EQUAL. You could draw it without lifting your pencil.",
      blocks: [
        { k: "eli5", body: r`Can you trace the graph **without lifting your pencil** ✏️? Then it's continuous. Any hole, jump, or wall forces you to lift: discontinuous.` },
        {
          k: "steps",
          title: "The 3-condition test (memorize!)",
          steps: [r`$\lim_{x\to a} f(x)$ **exists** (left = right).`, r`$f(a)$ **exists** (there's a dot).`, r`They're **equal**: $\lim_{x\to a} f(x) = f(a)$.`],
        },
        {
          k: "idea",
          title: "Free continuity",
          body: r`These are continuous **everywhere in their domain** (slide fact): polynomials, rational functions, power functions, exponentials, logarithms (and sin, cos).

So discontinuities only happen at domain problems (like a zero denominator) or at the **boundaries of piecewise functions**.

**One-sided:** $f$ is continuous from the right at $a$ if $\lim_{x\to a^+} f(x) = f(a)$, from the left if $\lim_{x\to a^-} f(x) = f(a)$.`,
        },
        {
          k: "example",
          title: "Slides",
          problem: r`Is $f(x) = x^3 + 1$ continuous at $a = 2$?`,
          steps: [r`$\lim_{x\to2}(x^3 + 1) = 9$ (polynomial, plug in).`, r`$f(2) = 9$.`, r`Equal ✓`],
          answer: r`Yes. (Every polynomial is continuous everywhere.)`,
        },
      ],
      questions: [
        { id: "u7l1q1", type: "mc", level: 1, prompt: r`Which is NOT one of the three conditions for continuity at $a$?`, choices: [r`$\lim_{x\to a} f(x)$ exists`, r`$f(a)$ exists`, r`$f'(a)$ exists`, r`$\lim_{x\to a} f(x) = f(a)$`], answer: 2, solution: [r`Continuity doesn't need a derivative. (Corners are continuous but not differentiable.)`] },
        { id: "u7l1q2", type: "mc", level: 1, prompt: r`Where is $f(x) = e^x + x^4$ continuous?`, choices: ["Everywhere", "x > 0 only", "x ≠ 0", "Nowhere"], answer: 0, solution: [r`Sum of an exponential and a polynomial: continuous on $(-\infty, \infty)$.`] },
        { id: "u7l1q3", type: "interval", strict: true, level: 2, exam: true, prompt: r`Where is $f(x) = \dfrac{x+4}{x^2 + 2x - 8}$ continuous? (slides)`, answer: "(-inf,-4)U(-4,2)U(2,inf)", hints: [r`Rational functions are continuous on their domain. Factor the bottom.`], solution: [r`$x^2 + 2x - 8 = (x + 4)(x - 2)$.`, r`Undefined at $-4$ and $2$ (the hole at $-4$ still counts as a discontinuity!).`, r`$(-\infty, -4) \cup (-4, 2) \cup (2, \infty)$`] },
        { id: "u7l1q4", type: "mc", level: 2, prompt: r`$\lim_{x\to1} f(x) = 3$ and $f(1) = 3$. Is $f$ continuous at 1?`, choices: ["Yes", "No", "Need more info"], answer: 0, solution: [r`All three conditions hold.`] },
        { id: "u7l1q5", type: "mc", level: 2, prompt: r`$\lim_{x\to1^-} f(x) = 2$, $\lim_{x\to1^+} f(x) = 2$, $f(1) = 5$. Continuous at 1?`, choices: ["Yes", "No: the limit doesn't exist", "No: the limit exists but ≠ f(1)", "No: f(1) doesn't exist"], answer: 2, solution: [r`Limit is 2, value is 5. Condition 3 fails. (That's a removable discontinuity.)`] },
      ],
    },
    {
      id: "u7l2",
      title: "Types of discontinuity",
      emoji: "🕳️",
      minutes: 8,
      tldr: "Hole (removable), jump, or infinite (vertical asymptote). Each one fails the test in a different way.",
      blocks: [
        { k: "eli5", body: r`Three ways to break a road 🛣️:

- 🕳️ a **pothole**: one missing spot (hole)
- 🪜 a **cliff step**: the road jumps to a new height (jump)
- 🌋 a **volcano**: the road shoots up to the sky (infinite)` },
        {
          k: "table",
          title: "The 3 types (slides)",
          head: ["Type", "What you see", "Limits"],
          rows: [
            ["Removable", "hole", "$\\lim_{x\\to a} f$ exists, but $\\ne f(a)$ or $f(a)$ undefined"],
            ["Jump", "jump", "both one-sided limits exist but aren't equal"],
            ["Infinite", "vertical asymptote", "a one-sided limit is $\\pm\\infty$"],
          ],
        },
        { k: "tool", tool: "grapher", props: { fns: ["(x^2-1)/(x-1)", "1/(x+2)", "", ""] }, caption: "Red: a hole at x = 1 (hover there). Blue: an infinite discontinuity at x = −2." },
      ],
      questions: [
        { id: "u7l2q1", type: "mc", level: 1, prompt: r`$f(x) = \dfrac{x^2-1}{x-1}$ has what kind of discontinuity at $x = 1$?`, choices: ["Removable (hole)", "Jump", "Infinite", "None"], answer: 0, solution: [r`$\frac{(x-1)(x+1)}{x-1} = x + 1$ except at 1: a hole at $(1, 2)$.`] },
        { id: "u7l2q2", type: "mc", level: 1, prompt: r`$f(x) = \dfrac{1}{x+2}$ at $x = -2$?`, choices: ["Removable", "Jump", "Infinite", "None"], answer: 2, solution: [r`Bottom → 0, top stays 1: vertical asymptote.`] },
        { id: "u7l2q3", type: "mc", level: 1, prompt: r`$f(x) = \dfrac{|x|}{x}$ at $x = 0$?`, choices: ["Removable", "Jump", "Infinite", "None"], answer: 1, solution: [r`$-1$ on the left, $1$ on the right: jump.`] },
        { id: "u7l2q4", type: "mc", level: 2, prompt: r`Which discontinuity can be "fixed" by redefining just one point?`, choices: ["Removable", "Jump", "Infinite", "None of them"], answer: 0, solution: [r`Fill the hole with the limit value and it's continuous. That's why it's called removable.`] },
        { id: "u7l2q5", type: "mc", level: 2, prompt: r`$\lim_{x\to4^-} f = 7$, $\lim_{x\to4^+} f = 1$. What type at $x = 4$?`, choices: ["Removable", "Jump", "Infinite", "Continuous"], answer: 1, solution: [r`Both finite, but different → jump.`] },
      ],
    },
    {
      id: "u7l3",
      title: "Making piecewise functions continuous",
      emoji: "🔩",
      minutes: 12,
      tldr: "At each boundary, plug the boundary x into BOTH pieces and set the heights equal. Solve for the unknown.",
      gens: ["continuityk"],
      blocks: [
        { k: "eli5", body: r`Two bridge pieces 🌉 meet at $x = c$. For cars to drive across, they must be at **the same height** where they meet. Set left height = right height. That's it.` },
        {
          k: "steps",
          title: "Recipe",
          steps: [r`Find the boundary $x = c$ where the formula changes.`, r`Plug $c$ into the **left** formula. Plug $c$ into the **right** formula.`, r`Set them equal and solve for the constant.`, r`(For a single point defined separately: set it equal to the limit.)`],
        },
        {
          k: "example",
          title: "Slides: check continuity everywhere",
          problem: r`$g(x) = \begin{cases} 1 + x^2 & x \le -1 \\ e^{x+1} - x & -1 < x \le 1 \\ 3 - x^2 & 1 < x \end{cases}$. Where is $g$ continuous?`,
          steps: [
            r`Each piece is continuous on its own. Only check the boundaries $-1$ and $1$.`,
            r`At $x = -1$: left $1 + 1 = 2$; right $e^0 - (-1) = 2$; $g(-1) = 2$. ✓ Continuous.`,
            r`At $x = 1$: left $e^2 - 1 \approx 6.39$; right $3 - 1 = 2$. ✗ Jump!`,
          ],
          answer: r`Continuous on $(-\infty, 1) \cup (1, \infty)$.`,
        },
        {
          k: "example",
          title: "Slides: solve for the constant",
          problem: r`(a) $f(x) = 3(x+2)^2 + \cos x$ for $x \ne 0$, $f(0) = t$. (b) $f(x) = \ln(x-1) + a$ for $x \ge 2$, $e^x$ for $x < 2$. (c) $g(x) = t^2x$ for $x \le 1$, $3tx - 2$ for $x > 1$.`,
          steps: [
            r`(a) $\lim_{x\to0} = 3(4) + \cos 0 = 13$, so $t = 13$.`,
            r`(b) At 2: right $\ln 1 + a = a$; left $e^2$. So $a = e^2$.`,
            r`(c) At 1: $t^2 = 3t - 2 \Rightarrow t^2 - 3t + 2 = 0 \Rightarrow (t-1)(t-2) = 0$, so $t = 1$ or $t = 2$.`,
          ],
          answer: r`(a) $t = 13$ (b) $a = e^2$ (c) $t = 1$ or $2$`,
        },
        { k: "tool", tool: "piecewise", caption: "Get the 'Continuous?' box green first. (The other box is for Unit 14.)" },
      ],
      questions: [
        { id: "u7l3q1", type: "num", level: 2, exam: true, prompt: r`$f(x) = 3(x+2)^2 + \cos x$ for $x \ne 0$ and $f(0) = t$. What $t$ makes $f$ continuous?`, answer: 13, verify: { kind: "limit", f: "3(x+2)^2+cos(x)", a: 0 }, solution: [r`$\lim_{x\to0} = 3(2)^2 + \cos0 = 12 + 1 = 13$.`, r`Set $t = 13$.`] },
        { id: "u7l3q2", type: "num", level: 2, exam: true, prompt: r`$f(x) = \ln(x-1) + a$ for $x \ge 2$, $f(x) = e^x$ for $x < 2$. Find $a$. (decimal ok)`, answer: Math.E ** 2, tol: 2e-3, solution: [r`Right at 2: $\ln 1 + a = a$. Left at 2: $e^2$.`, r`$a = e^2 \approx 7.389$`] },
        { id: "u7l3q3", type: "list", level: 3, exam: true, prompt: r`$g(x) = t^2x$ for $x \le 1$ and $g(x) = 3tx - 2$ for $x > 1$. Find ALL $t$ that make $g$ continuous.`, answer: [1, 2], solution: [r`At $x = 1$: $t^2 = 3t - 2$.`, r`$t^2 - 3t + 2 = (t-1)(t-2) = 0$.`] },
        { id: "u7l3q4", type: "num", level: 2, exam: true, prompt: r`For $g(x) = 1 + x^2$ ($x \le -1$), $e^{x+1} - x$ ($-1 < x \le 1$), $3 - x^2$ ($x > 1$): at which x-value is $g$ discontinuous?`, answer: 1, solution: [r`At $-1$ both sides give 2 ✓. At $1$: $e^2 - 1 \ne 2$. Discontinuous at $x = 1$.`] },
        { id: "u7l3q5", type: "num", level: 1, prompt: r`Find $k$ so that $f(x) = kx + 1$ for $x < 2$ and $x^2 - 1$ for $x \ge 2$ is continuous.`, answer: 1, solution: [r`$2k + 1 = 4 - 1 = 3$`, r`$k = 1$`] },
        { id: "u7l3q6", type: "num", level: 2, prompt: r`$f(x) = \dfrac{x^2 - 16}{x - 4}$ for $x \ne 4$, and $f(4) = c$. What $c$ removes the discontinuity?`, answer: 8, verify: { kind: "limit", f: "(x^2-16)/(x-4)", a: 4 }, solution: [r`$\frac{(x-4)(x+4)}{x-4} = x + 4 \to 8$.`, r`$c = 8$.`] },
      ],
    },
  ],
};

export const u08: Unit = {
  id: "u8",
  n: 8,
  title: "Algebraic Limits (0/0)",
  emoji: "✂️",
  biome: "cave",
  when: "Week 3",
  exam: 2,
  summary: "When plugging in gives 0/0: factor, rationalize with a conjugate, or combine fractions. Plus absolute values and piecewise limits.",
  lessons: [
    {
      id: "u8l1",
      title: "Substitute first, then factor",
      emoji: "🔨",
      minutes: 12,
      tldr: "Always plug in first. Number? Done. 0/0? Factor and cancel, then plug in again. Nonzero/0? Check signs: it blows up.",
      gens: ["limitfactor"],
      blocks: [
        { k: "eli5", body: r`$\frac00$ isn't an answer: it's a **riddle** 🧩. It means "something is hiding." Usually a factor on top and bottom is canceling. Find it, cancel it, and the riddle solves itself.` },
        {
          k: "steps",
          title: "The limit decision tree (exam sheet!)",
          steps: [
            r`**Substitute** the target x-value. Ordinary finite number? **Stop**, that's the answer.`,
            r`Got $\frac00$? **Simplify**: factor and cancel, use a common denominator, or multiply by a conjugate. Then substitute again.`,
            r`Got $\frac{\text{nonzero}}{0}$? Check the **signs** from the left and right. Same infinity both sides → infinite limit. Opposite → DNE.`,
            r`For a graph: approach the x-coordinate from both sides, ignoring the filled dot.`,
          ],
        },
        {
          k: "example",
          title: "Slides (a)",
          problem: r`$\displaystyle\lim_{x\to-4}\frac{x^3 - 16x}{x + 4}$`,
          steps: [r`Plug in: $\frac{-64 + 64}{0} = \frac00$. Simplify!`, r`Factor the top: $x(x^2 - 16) = x(x-4)(x+4)$.`, r`Cancel $(x + 4)$: $\lim_{x\to-4} x(x - 4)$.`, r`Plug in: $(-4)(-8) = 32$.`],
          answer: r`$32$`,
        },
        {
          k: "example",
          title: "Slides (d): don't overthink it",
          problem: r`$\displaystyle\lim_{x\to5}\frac{x^2 - 25}{x + 5}$`,
          steps: [r`Plug in: $\frac{25 - 25}{10} = \frac{0}{10} = 0$.`, r`That's a perfectly good number. Done!`],
          answer: r`$0$. (Zero on top only is fine. Only $\frac00$ needs work.)`,
        },
        { k: "tool", tool: "limit", props: { f: "(x^3 - 16x)/(x + 4)", a: -4 }, caption: "Check the 32 numerically." },
        { k: "trap", body: r`**When a limit gives $\frac00$, do NOT write 0 or DNE immediately.** (Exam sheet tip #1.) And cancel **whole factors only**: you can't cancel the $x$'s in $\frac{x + 3}{x}$.` },
      ],
      questions: [
        { id: "u8l1q1", type: "num", level: 2, exam: true, prompt: r`$\displaystyle\lim_{x\to-4}\frac{x^3 - 16x}{x + 4} = ?$`, answer: 32, verify: { kind: "limit", f: "(x^3-16x)/(x+4)", a: -4 }, solution: [r`$\frac{x(x-4)(x+4)}{x+4} = x(x-4)$`, r`$(-4)(-8) = 32$`] },
        { id: "u8l1q2", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to5}\frac{x^2 - 25}{x + 5} = ?$`, answer: 0, verify: { kind: "limit", f: "(x^2-25)/(x+5)", a: 5 }, solution: [r`Plug in: $\frac{0}{10} = 0$.`] },
        { id: "u8l1q3", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to 2}\frac{x^2 + x - 6}{x - 2} = ?$`, answer: 5, verify: { kind: "limit", f: "(x^2+x-6)/(x-2)", a: 2 }, solution: [r`$\frac{(x+3)(x-2)}{x-2} = x + 3 \to 5$`] },
        { id: "u8l1q4", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to 3}\frac{x^2 - 9}{x^2 - 5x + 6} = ?$`, answer: 6, verify: { kind: "limit", f: "(x^2-9)/(x^2-5x+6)", a: 3 }, solution: [r`$\frac{(x-3)(x+3)}{(x-3)(x-2)} = \frac{x+3}{x-2}$`, r`$\frac{6}{1} = 6$`] },
        { id: "u8l1q5", type: "num", level: 2, prompt: r`$\displaystyle\lim_{h\to 0}\frac{(2+h)^2 - 4}{h} = ?$ (slides)`, answer: 4, verify: { kind: "limit", f: "((2+x)^2-4)/x", a: 0 }, solution: [r`Expand: $\frac{4 + 4h + h^2 - 4}{h} = \frac{4h + h^2}{h} = 4 + h$`, r`$\to 4$`] },
        { id: "u8l1q6", type: "num", level: 3, prompt: r`$\displaystyle\lim_{x\to1}\left[x - 1 + \frac{x^3 - 1}{x - 1}\right] = ?$ (slides)`, answer: 3, verify: { kind: "limit", f: "x-1+(x^3-1)/(x-1)", a: 1 }, hints: [r`$x^3 - 1 = (x-1)(x^2 + x + 1)$ (difference of cubes).`], solution: [r`$\frac{x^3-1}{x-1} = x^2 + x + 1 \to 3$`, r`$x - 1 \to 0$`, r`Total: $0 + 3 = 3$`] },
        { id: "u8l1q7", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to2}\frac{1}{x-2}$ (two-sided): number, inf, -inf, or DNE?`, answer: "DNE", verify: { kind: "limit", f: "1/(x-2)", a: 2 }, solution: [r`$\frac{1}{0}$ type: check signs.`, r`Left: tiny negative bottom → $-\infty$. Right: $+\infty$. Opposite → DNE.`] },
        { id: "u8l1q8", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to3}\frac{5}{(x-3)^2}$: number, inf, -inf, or DNE?`, answer: "inf", verify: { kind: "limit", f: "5/(x-3)^2", a: 3 }, solution: [r`Bottom is a tiny **positive** number on both sides (it's squared).`, r`$\frac{5}{\text{tiny}+} \to +\infty$ both sides.`] },
      ],
    },
    {
      id: "u8l2",
      title: "Conjugates & complex fractions",
      emoji: "🪞",
      minutes: 12,
      tldr: "Square roots? Multiply top and bottom by the conjugate (flip the middle sign). Fractions inside fractions? Common denominator.",
      blocks: [
        { k: "eli5", body: r`A square root is a locked box 🔒. The **conjugate** is the key: $(\sqrt{a} - b)(\sqrt{a} + b) = a - b^2$. The root disappears! That usually reveals the hidden factor to cancel.` },
        { k: "formula", title: "The conjugate trick", tex: r`(\sqrt{A} - B)(\sqrt{A} + B) = A - B^2`, note: "Multiply top AND bottom by the conjugate, so you're really multiplying by 1." },
        {
          k: "example",
          title: "Slides (c)",
          problem: r`$\displaystyle\lim_{x\to 9}\frac{3 - \sqrt x}{x - 9}$`,
          steps: [
            r`Plug in: $\frac00$.`,
            r`Multiply by $\frac{3 + \sqrt x}{3 + \sqrt x}$: top becomes $9 - x$.`,
            r`$\dfrac{9 - x}{(x - 9)(3 + \sqrt x)} = \dfrac{-(x-9)}{(x-9)(3+\sqrt x)} = \dfrac{-1}{3 + \sqrt x}$`,
            r`Plug in: $\dfrac{-1}{3 + 3} = -\dfrac16$.`,
          ],
          answer: r`$-\tfrac16$`,
        },
        {
          k: "example",
          title: "Slides (b): complex fraction",
          problem: r`$\displaystyle\lim_{h\to 0}\frac{\frac{1}{2-h} - \frac12}{h}$`,
          steps: [
            r`Common denominator on top: $\frac{1}{2-h} - \frac12 = \frac{2 - (2-h)}{2(2-h)} = \frac{h}{2(2-h)}$.`,
            r`Divide by $h$: $\frac{h}{2(2-h)}\cdot\frac1h = \frac{1}{2(2-h)}$.`,
            r`Plug in $h = 0$: $\frac{1}{4}$.`,
          ],
          answer: r`$\tfrac14$`,
        },
        { k: "trap", body: r`$9 - x$ and $x - 9$ are **negatives** of each other: $9 - x = -(x - 9)$. Losing that minus sign is the #1 conjugate mistake.` },
      ],
      questions: [
        { id: "u8l2q1", type: "num", level: 2, exam: true, prompt: r`$\displaystyle\lim_{x\to9}\frac{3 - \sqrt x}{x - 9} = ?$`, answer: -1 / 6, verify: { kind: "limit", f: "(3-sqrt(x))/(x-9)", a: 9 }, solution: [r`Conjugate → $\frac{-1}{3 + \sqrt x}$`, r`$= -\frac16$`] },
        { id: "u8l2q2", type: "num", level: 2, exam: true, prompt: r`$\displaystyle\lim_{h\to 0}\frac{\frac{1}{2-h} - \frac12}{h} = ?$`, answer: 0.25, verify: { kind: "limit", f: "(1/(2-x)-1/2)/x", a: 0 }, solution: [r`$= \frac{1}{2(2-h)} \to \frac14$`] },
        { id: "u8l2q3", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to 4}\frac{\sqrt x - 2}{x - 4} = ?$`, answer: 0.25, verify: { kind: "limit", f: "(sqrt(x)-2)/(x-4)", a: 4 }, solution: [r`Multiply by $\frac{\sqrt x + 2}{\sqrt x + 2}$: $\frac{x - 4}{(x-4)(\sqrt x + 2)} = \frac{1}{\sqrt x + 2}$`, r`$\to \frac14$`] },
        { id: "u8l2q4", type: "num", level: 3, prompt: r`$\displaystyle\lim_{x\to 0}\frac{\sqrt5 - \sqrt{5 - x}}{x} = ?$ (decimal ok)`, answer: 1 / (2 * Math.sqrt(5)), tol: 1e-3, verify: { kind: "limit", f: "(sqrt(5)-sqrt(5-x))/x", a: 0 }, solution: [r`Conjugate: top becomes $5 - (5 - x) = x$.`, r`$\frac{x}{x(\sqrt5 + \sqrt{5-x})} = \frac{1}{\sqrt5 + \sqrt{5-x}}$`, r`$\to \frac{1}{2\sqrt5} \approx 0.2236$`] },
        { id: "u8l2q5", type: "num", level: 3, prompt: r`$\displaystyle\lim_{x\to 3}\frac{\frac1x - \frac13}{x - 3} = ?$`, answer: -1 / 9, verify: { kind: "limit", f: "(1/x-1/3)/(x-3)", a: 3 }, solution: [r`$\frac1x - \frac13 = \frac{3 - x}{3x}$`, r`Divide by $(x - 3)$: $\frac{-(x-3)}{3x(x-3)} = -\frac{1}{3x}$`, r`$\to -\frac19$`] },
        { id: "u8l2q6", type: "num", level: 3, exam: true, prompt: r`$\displaystyle\lim_{h\to 0}\frac{\sqrt{(3+h)^2 + 16} - 5}{h} = ?$ (This is $f'(3)$ for $f(x) = \sqrt{x^2+16}$ from the Feb 2026 exam!)`, answer: 0.6, verify: { kind: "limit", f: "(sqrt((3+x)^2+16)-5)/x", a: 0 }, hints: [r`Multiply by the conjugate $\sqrt{(3+h)^2+16} + 5$.`, r`Top becomes $(3+h)^2 + 16 - 25 = 6h + h^2$.`], solution: [r`$\frac{6h + h^2}{h(\sqrt{(3+h)^2+16} + 5)} = \frac{6 + h}{\sqrt{(3+h)^2+16} + 5}$`, r`$\to \frac{6}{5 + 5} = \frac35$`] },
      ],
    },
    {
      id: "u8l3",
      title: "Absolute values & piecewise limits",
      emoji: "🧮",
      minutes: 9,
      tldr: "Absolute value or piecewise? Split into left and right, use the correct formula on each side, then compare.",
      blocks: [
        { k: "eli5", body: r`$|x + 2|$ secretly has **two personalities** 🎭: it's $x + 2$ when that's positive, and $-(x + 2)$ when that's negative. At the switch point, ask each personality separately.` },
        {
          k: "example",
          title: "Slides: |x + 2| / (x + 2)",
          problem: r`$f(x) = \dfrac{|x+2|}{x+2}$. Find (a) $\lim_{x\to0} f(x)$ (b) $\lim_{x\to-2} f(x)$.`,
          steps: [r`(a) Near 0, $x + 2 > 0$, so $f = 1$. Limit $= 1$.`, r`(b) Right of $-2$: $f = 1$. Left of $-2$: $|x+2| = -(x+2)$, so $f = -1$.`, r`$1 \ne -1$ → DNE.`],
          answer: r`(a) $1$ (b) DNE`,
        },
        {
          k: "example",
          title: "Slides: piecewise limits",
          problem: r`$f(x) = x^2 + 2x$ ($x \le 0$), $e^x$ ($0 < x \le 4$), $\ln(x-3) + 9x$ ($x > 4$). Find the limits at $0$, $2$, $4$.`,
          steps: [
            r`At 0: left $0 + 0 = 0$, right $e^0 = 1$. DNE.`,
            r`At 2: inside one piece, $e^2 \approx 7.389$.`,
            r`At 4: left $e^4 \approx 54.6$, right $\ln 1 + 36 = 36$. DNE.`,
          ],
          answer: r`DNE, $e^2$, DNE`,
        },
      ],
      questions: [
        { id: "u8l3q1", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to0}\frac{|x+2|}{x+2} = ?$`, answer: 1, verify: { kind: "limit", f: "abs(x+2)/(x+2)", a: 0 }, solution: [r`Near 0, $x + 2 > 0$ → value 1.`] },
        { id: "u8l3q2", type: "num", level: 2, exam: true, prompt: r`$\displaystyle\lim_{x\to-2}\frac{|x+2|}{x+2} = ?$`, answer: "DNE", verify: { kind: "limit", f: "abs(x+2)/(x+2)", a: -2 }, solution: [r`Left: $-1$. Right: $1$. DNE.`] },
        { id: "u8l3q3", type: "num", level: 2, prompt: r`$f(x) = x^2 + 2x$ ($x \le 0$), $e^x$ ($0 < x \le 4$), $\ln(x-3) + 9x$ ($x > 4$). Find $\lim_{x\to2} f(x)$ (decimal ok).`, answer: Math.E ** 2, tol: 2e-3, solution: [r`$x = 2$ is inside the $e^x$ piece: $e^2 \approx 7.389$.`] },
        { id: "u8l3q4", type: "num", level: 2, exam: true, prompt: r`$f(x) = x^2 + 2x$ ($x \le 0$), $e^x$ ($0 < x \le 4$), $\ln(x-3) + 9x$ ($x > 4$). Find $\lim_{x\to4^+} f(x)$.`, answer: 36, verify: { kind: "limit", f: "ln(x-3)+9x", a: 4, side: "right" }, solution: [r`$\ln(4 - 3) + 9(4) = 0 + 36 = 36$`] },
        { id: "u8l3q5", type: "num", level: 2, prompt: r`$f(x) = x^2 + 2x$ ($x \le 0$), $e^x$ ($0 < x \le 4$), $\ln(x-3) + 9x$ ($x > 4$). Find $\lim_{x\to0} f(x)$ (or DNE).`, answer: "DNE", solution: [r`Left 0, right 1 → DNE.`] },
        { id: "u8l3q6", type: "num", level: 3, prompt: r`$\displaystyle\lim_{x\to3^-}\frac{x^2 - 9}{|x - 3|} = ?$`, answer: -6, verify: { kind: "limit", f: "(x^2-9)/abs(x-3)", a: 3, side: "left" }, solution: [r`Left of 3, $|x - 3| = -(x - 3)$.`, r`$\frac{(x-3)(x+3)}{-(x-3)} = -(x + 3) \to -6$`] },
      ],
    },
  ],
};

export const u09: Unit = {
  id: "u9",
  n: 9,
  title: "Limits & Infinity",
  emoji: "♾️",
  biome: "ocean",
  when: "Week 4",
  exam: 2,
  summary: "Infinite limits and vertical asymptotes, limits at ±∞, who-dominates-who, and designing asymptotes.",
  lessons: [
    {
      id: "u9l1",
      title: "Infinite limits & vertical asymptotes",
      emoji: "🌋",
      minutes: 12,
      tldr: "Nonzero ÷ (tiny) = HUGE. Figure out the sign from each side to know if it's +∞ or −∞.",
      blocks: [
        { k: "eli5", body: r`Share 1 pizza 🍕 among 0.001 people: each "person" gets 1000 pizzas. Among 0.000001 people: a million pizzas. **Dividing by something tiny makes something huge.** That's an infinite limit.` },
        { k: "formula", title: "Vertical asymptote", tex: r`x = a \text{ is a VA if } \lim_{x\to a^\pm} f(x) = \pm\infty`, note: r`Shortcut (slides): $f$ has a VA at $x = a$ if the denominator is **still 0 after all simplifications**.` },
        {
          k: "steps",
          title: "Sign analysis near a VA",
          steps: [r`Simplify (cancel common factors → those are holes, not VAs).`, r`For each remaining zero of the bottom, look just to the left (like $a - 0.001$).`, r`Find the sign of every factor there. Multiply/divide the signs.`, r`Positive → $+\infty$, negative → $-\infty$. Repeat on the right.`],
        },
        {
          k: "example",
          title: "Slides",
          problem: r`Find all vertical asymptotes of $f(x) = \dfrac{(2x-1)(x+1)}{(5x-40)(x^2+3x+2)}$ and the left-hand limits there.`,
          steps: [
            r`Factor the bottom: $5(x - 8)(x + 1)(x + 2)$.`,
            r`$(x + 1)$ cancels → **hole** at $x = -1$, not a VA.`,
            r`Left: $\dfrac{2x - 1}{5(x-8)(x+2)}$. VAs at $x = 8$ and $x = -2$.`,
            r`$x \to 8^-$: top $15 > 0$; $(x - 8) < 0$; $(x+2) > 0$. Sign: $\frac{+}{-\cdot+} = -$. So $-\infty$.`,
            r`$x \to -2^-$: top $-5 < 0$; $(x-8) < 0$; $(x + 2) < 0$. Sign: $\frac{-}{(-)(-)} = \frac{-}{+} = -$. So $-\infty$.`,
          ],
          answer: r`VAs $x = 8$ and $x = -2$; both left-hand limits are $-\infty$. (Right-hand limits are both $+\infty$.)`,
        },
        { k: "tool", tool: "grapher", props: { fns: ["(2x-1)(x+1)/((5x-40)(x^2+3x+2))", "", "", ""], view: { xmin: -5, xmax: 12, ymin: -3, ymax: 3 } }, caption: "Zoom near x = 8 and x = −2 to see the walls." },
        { k: "trap", body: r`**For vertical asymptotes, distinguish $+\infty$ and $-\infty$ on each side.** (Exam sheet.) Writing just "∞" can cost points.` },
      ],
      questions: [
        { id: "u9l1q1", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to0^+}\frac1x = ?$`, answer: "inf", verify: { kind: "limit", f: "1/x", a: 0, side: "right" }, solution: [r`$\frac{1}{\text{tiny }+} = +\infty$`] },
        { id: "u9l1q2", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to0^-}\frac1x = ?$`, answer: "-inf", verify: { kind: "limit", f: "1/x", a: 0, side: "left" }, solution: [r`$\frac{1}{\text{tiny }-} = -\infty$`] },
        { id: "u9l1q3", type: "list", level: 2, exam: true, prompt: r`List the vertical asymptotes of $f(x) = \dfrac{(2x-1)(x+1)}{(5x-40)(x^2+3x+2)}$.`, answer: [-2, 8], solution: [r`Bottom $= 5(x-8)(x+1)(x+2)$; $(x + 1)$ cancels.`, r`VAs: $x = -2, 8$.`] },
        { id: "u9l1q4", type: "num", level: 3, exam: true, prompt: r`$f(x) = \dfrac{(2x-1)(x+1)}{(5x-40)(x^2+3x+2)}$. Find $\displaystyle\lim_{x\to8^-} f(x)$.`, answer: "-inf", verify: { kind: "limit", f: "(2x-1)(x+1)/((5x-40)(x^2+3x+2))", a: 8, side: "left" }, solution: [r`Signs: top $+$, $(x-8)$ $-$, $(x+2)$ $+$ → negative → $-\infty$.`] },
        { id: "u9l1q5", type: "num", level: 3, exam: true, prompt: r`$f(x) = \dfrac{(2x-1)(x+1)}{(5x-40)(x^2+3x+2)}$. Find $\displaystyle\lim_{x\to-2^+} f(x)$.`, answer: "inf", verify: { kind: "limit", f: "(2x-1)(x+1)/((5x-40)(x^2+3x+2))", a: -2, side: "right" }, solution: [r`Right of $-2$: top $-$, $(x-8)$ $-$, $(x+2)$ $+$.`, r`$\frac{-}{(-)(+)} = +$ → $+\infty$.`] },
        { id: "u9l1q6", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to1^+}\frac{x+2}{x-1} = ?$`, answer: "inf", verify: { kind: "limit", f: "(x+2)/(x-1)", a: 1, side: "right" }, solution: [r`Top → 3 (positive), bottom → tiny positive.`] },
        { id: "u9l1q7", type: "mc", level: 2, prompt: r`$f(x) = \dfrac{x^2 - 4}{x - 2}$. Does it have a vertical asymptote at $x = 2$?`, choices: ["Yes", "No, it has a hole there", "No, it's continuous there", "Only from the left"], answer: 1, solution: [r`$(x - 2)$ cancels: hole at $(2, 4)$.`] },
      ],
    },
    {
      id: "u9l2",
      title: "Limits at infinity & dominance",
      emoji: "🏁",
      minutes: 12,
      tldr: "As x → ∞, only the FASTEST-growing term matters. Exponentials beat powers; higher powers beat lower ones.",
      gens: ["limitinf"],
      blocks: [
        { k: "eli5", body: r`It's a race 🏎️. When $x$ is a billion, $x^7$ is SO much bigger than $x^5$ that the $x^5$ basically doesn't exist. **Only the leader matters.** And exponentials are rocket cars: $1.1^x$ eventually passes even $x^{1{,}000{,}000}$.` },
        {
          k: "table",
          title: "Growth ranking (slowest → fastest)",
          head: ["", "Example"],
          rows: [["logs", "$\\ln x$"], ["roots", "$\\sqrt x$"], ["powers", "$x, x^2, x^{100}$"], ["exponentials", "$1.1^x, 2^x, e^x, 5^x$"]],
        },
        {
          k: "steps",
          title: "Rational functions as x → ±∞ (exam sheet)",
          steps: [r`Compare the **highest powers** of $x$ on top and bottom.`, r`Top smaller → limit **0**.`, r`Equal → ratio of **leading coefficients**.`, r`Top larger → **±∞**: figure out the sign from the leading terms (careful with $x \to -\infty$ and odd powers!).`],
        },
        {
          k: "example",
          title: "Slides: the big list",
          problem: r`(a) $\lim_{x\to\infty}(x^7 + x^5 + 3x^2 - 1)$ (b) $\lim_{x\to-\infty}\frac{11x^{12}+5x^2+1}{-5x^{15}+x^9+x^4+7}$ (c) $\lim_{x\to\infty}\frac{x^9+x^2+1}{x^8+x^7+x^6+x^5}$ (d) $\lim_{x\to\infty}\frac{3x^8+5x^7+x}{-2x^8-1}$ (e) $\lim_{x\to\infty}\frac{x^{121}+x^5+2x}{3x}$ (f) $\lim_{x\to\infty}\frac{x^{121}-5x+2^x}{2\cdot5^x+x^{2026}}$`,
          steps: [
            r`(a) Leading $x^7 \to \infty$.`,
            r`(b) Degree 12 < 15 → $0$.`,
            r`(c) Degree 9 > 8, both positive → $\infty$.`,
            r`(d) Equal degrees: $\frac{3}{-2} = -\frac32$.`,
            r`(e) 121 > 1 → $\infty$.`,
            r`(f) Exponentials dominate everything: $\approx \frac{2^x}{2\cdot 5^x} = \frac12\left(\frac25\right)^x \to 0$.`,
          ],
          answer: r`$\infty,\ 0,\ \infty,\ -\tfrac32,\ \infty,\ 0$`,
        },
        { k: "tip", body: r`Exponential rules (exam sheet): for $b > 1$, $b^x \to \infty$ as $x \to \infty$ and $b^x \to 0$ as $x \to -\infty$. For $0 < b < 1$ it's the reverse. Larger bases dominate smaller bases.` },
      ],
      questions: [
        { id: "u9l2q1", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to\infty}(x^7 + x^5 + 3x^2 - 1) = ?$`, answer: "inf", verify: { kind: "limit", f: "x^7+x^5+3x^2-1", a: "inf" }, solution: [r`Leading term $x^7 \to \infty$.`] },
        { id: "u9l2q2", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to-\infty}\frac{11x^{12}+5x^2+1}{-5x^{15}+x^9+x^4+7} = ?$`, answer: 0, solution: [r`Bottom degree is larger → 0.`] },
        { id: "u9l2q3", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to\infty}\frac{3x^8+5x^7+x}{-2x^8-1} = ?$`, answer: -1.5, verify: { kind: "limit", f: "(3x^8+5x^7+x)/(-2x^8-1)", a: "inf" }, solution: [r`Same degree: $\frac{3}{-2}$.`] },
        { id: "u9l2q4", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to\infty}\frac{x^9+x^2+1}{x^8+x^7+x^6+x^5} = ?$`, answer: "inf", solution: [r`Top degree 9 > 8, leading coefficients both positive → $\infty$.`] },
        { id: "u9l2q5", type: "num", level: 3, prompt: r`$\displaystyle\lim_{x\to\infty}\frac{x^{121}-5x+2^x}{2\cdot5^x+x^{2026}} = ?$`, answer: 0, hints: [r`Who's the fastest on top? On the bottom?`], solution: [r`Top leader: $2^x$. Bottom leader: $2\cdot5^x$.`, r`$\frac{2^x}{2\cdot5^x} = \frac12(0.4)^x \to 0$.`] },
        { id: "u9l2q6", type: "mc", level: 1, prompt: r`Which wins as $x\to\infty$: $x^{1{,}000{,}000}$ or $(1.1)^x$?`, choices: [r`$x^{1{,}000{,}000}$`, r`$(1.1)^x$`, "They tie", "Neither goes to infinity"], answer: 1, solution: [r`Exponentials with base > 1 eventually beat ANY power. (It takes a while… but it happens.)`] },
        { id: "u9l2q7", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to-\infty} x^3 = ?$`, answer: "-inf", verify: { kind: "limit", f: "x^3", a: "-inf" }, solution: [r`Odd power of a huge negative number is hugely negative.`] },
        { id: "u9l2q8", type: "num", level: 2, prompt: r`$\displaystyle\lim_{x\to\infty}\left(\tfrac13\right)^x = ?$`, answer: 0, verify: { kind: "limit", f: "(1/3)^x", a: "inf" }, solution: [r`Base between 0 and 1: decays to 0.`] },
      ],
    },
    {
      id: "u9l3",
      title: "Horizontal asymptotes & designing functions",
      emoji: "🛠️",
      minutes: 12,
      tldr: "A horizontal asymptote y = b means f(x) → b as x → ∞ or −∞. You can reverse-engineer constants to place asymptotes where you want.",
      blocks: [
        { k: "eli5", body: r`A horizontal asymptote is the **horizon** 🌅 the graph walks toward forever. It might even cross it in the middle, but far away it settles down onto that line.` },
        { k: "formula", title: "Definition (slides)", tex: r`y = b \text{ is a HA if } \lim_{x\to\infty} f(x) = b \text{ or } \lim_{x\to-\infty} f(x) = b` },
        {
          k: "idea",
          title: "Slides: xⁿ and bˣ",
          body: r`- $f(x) = x^n$ ($n > 0$): no horizontal asymptote; it goes to $\pm\infty$.
- $g(x) = b^x$: HA $y = 0$. For $b > 1$ it's approached on the left ($x\to-\infty$); for $0 < b < 1$ on the right.`,
        },
        {
          k: "example",
          title: "Slides: design problem (exam favorite)",
          problem: r`Find $A, B, C, D$ so that $f(x) = \dfrac{Ax^B + x + D}{(3x - 6)(2x - C)}$ has a horizontal asymptote $y = 4$ and **only one** vertical asymptote, at $x = 5$.`,
          steps: [
            r`Bottom expands to $6x^2 + \dots$, degree 2. For a HA at a nonzero height, the top must be degree 2 too: $B = 2$.`,
            r`HA = ratio of leading coefficients: $\frac{A}{6} = 4 \Rightarrow A = 24$.`,
            r`Bottom zeros: $x = 2$ and $x = \frac{C}{2}$. We need a VA at 5: $\frac C2 = 5 \Rightarrow C = 10$.`,
            r`Only ONE VA, so $x = 2$ must be a hole: the top must be 0 at $x = 2$: $24(4) + 2 + D = 0 \Rightarrow D = -98$.`,
            r`Check: the top at $x = 5$ is $600 + 5 - 98 = 507 \ne 0$, so $x = 5$ really is a VA ✓.`,
          ],
          answer: r`$A = 24,\ B = 2,\ C = 10,\ D = -98$`,
        },
      ],
      questions: [
        { id: "u9l3q1", type: "num", level: 1, prompt: r`HA of $f(x) = \dfrac{8x^3 - x}{2x^3 + 5}$: $y = ?$`, answer: 4, verify: { kind: "limit", f: "(8x^3-x)/(2x^3+5)", a: "inf" }, solution: [r`$\frac82 = 4$`] },
        { id: "u9l3q2", type: "num", level: 3, exam: true, prompt: r`Design $f(x) = \frac{Ax^B + x + D}{(3x-6)(2x-C)}$ with HA $y = 4$ and only one VA, at $x = 5$. Find $A$.`, answer: 24, solution: [r`$B = 2$ and $\frac A6 = 4$.`] },
        { id: "u9l3q3", type: "num", level: 3, exam: true, prompt: r`Design $f(x) = \frac{Ax^B + x + D}{(3x-6)(2x-C)}$ with HA $y = 4$ and only one VA, at $x = 5$. Find $C$.`, answer: 10, solution: [r`$\frac C2 = 5$.`] },
        { id: "u9l3q4", type: "num", level: 3, exam: true, prompt: r`Design $f(x) = \frac{Ax^B + x + D}{(3x-6)(2x-C)}$ with HA $y = 4$ and only one VA, at $x = 5$. Find $D$.`, answer: -98, hints: [r`$x = 2$ must become a hole, so the numerator is 0 at $x = 2$.`], solution: [r`$24(2)^2 + 2 + D = 0$`, r`$D = -98$`] },
        { id: "u9l3q5", type: "mc", level: 2, prompt: r`Which has NO horizontal asymptote?`, choices: [r`$\frac{1}{x}$`, r`$e^x$`, r`$x^2$`, r`$\frac{3x}{x+1}$`], answer: 2, solution: [r`$x^2 \to \infty$ in both directions.`] },
        { id: "u9l3q6", type: "num", level: 2, prompt: r`HA of $f(x) = \dfrac{5e^x}{e^x + 2}$ as $x\to\infty$: $y = ?$`, answer: 5, verify: { kind: "limit", f: "5e^x/(e^x+2)", a: "inf" }, hints: [r`Divide top and bottom by $e^x$.`], solution: [r`$\frac{5}{1 + 2e^{-x}} \to \frac{5}{1} = 5$`] },
      ],
    },
  ],
};
