import type { Unit } from "../../types";

const r = String.raw;

export const u01: Unit = {
  id: "u1",
  n: 1,
  title: "Functions & Lines",
  emoji: "🌱",
  biome: "plains",
  when: "Week 1",
  exam: 1,
  summary: "What a function is, domain and range, slope, and every way to write a line. The ground floor everything else is built on.",
  lessons: [
    {
      id: "u1l1",
      title: "What is a function?",
      emoji: "🥤",
      minutes: 8,
      tldr: "A function is a machine: one input in, exactly ONE output out, every single time.",
      blocks: [
        {
          k: "eli5",
          body: r`Picture a **vending machine** 🥤. You press button B3 (that's the **input**). Out drops a bag of chips (that's the **output**).

Press B3 again tomorrow: same chips. That's what makes it a *function*: **same input → same output, always.**

If B3 sometimes gave chips and sometimes gave soda, the machine is broken. That would **not** be a function.`,
        },
        {
          k: "idea",
          title: "The official definition",
          body: r`A **function** $f$ is a rule that assigns each input **exactly one** output.

We write $f(x)$, read "**f of x**". It means *the output of $f$ when the input is $x$*. It does **not** mean $f$ times $x$.

Functions model real life whenever one thing depends on another: the price you set → the money you make, the Carbon-14 left in a fossil → its age.`,
        },
        {
          k: "table",
          title: "4 ways to show the same function",
          head: ["Way", "Example", "Good for"],
          rows: [
            ["1. Words", "Your pay is \\$15 per hour", "Real-world setups"],
            ["2. Table", "x: 1, 2, 3 → f(x): 15, 30, 45", "Data, spotting patterns"],
            ["3. Graph", "A straight line through (1, 15)", "Seeing shape fast"],
            ["4. Formula", "$f(x) = 15x$", "Exact calculations"],
          ],
        },
        {
          k: "formula",
          title: "Evaluating = replacing",
          tex: r`f(\square) \;\Rightarrow\; \text{put } \square \text{ everywhere you see } x`,
          note: r`If $f(x) = x^2 - 3x$, then $f(3) = 3^2 - 3(3) = 0$ and $f(-2) = (-2)^2 - 3(-2) = 4 + 6 = 10$.`,
        },
        {
          k: "example",
          title: "Plug in a whole expression",
          problem: r`Let $f(x) = 2x^2 + 1$. Find $f(a+h)$.`,
          steps: [
            r`Replace every $x$ with $(a+h)$, **in parentheses**: $f(a+h) = 2(a+h)^2 + 1$.`,
            r`Expand the square: $(a+h)^2 = a^2 + 2ah + h^2$.`,
            r`Multiply by 2: $2a^2 + 4ah + 2h^2$, then add 1.`,
          ],
          answer: r`$f(a+h) = 2a^2 + 4ah + 2h^2 + 1$. You'll need this exact move for derivatives later!`,
        },
        {
          k: "tip",
          title: "Vertical Line Test",
          body: r`On a graph: sweep a vertical line across. If it **ever** hits the graph twice, it's **not** a function (one input would have two outputs). A circle fails. A parabola passes.`,
        },
        {
          k: "trap",
          body: r`**Creeper alert!** 💥 $f(a+h)$ is **not** $f(a) + h$. And $(-2)^2 = 4$ but $-2^2 = -4$. Always put substituted values in parentheses.`,
        },
        {
          k: "check",
          q: {
            id: "u1l1c1",
            type: "mc",
            level: 1,
            prompt: r`Which table is **NOT** a function of $x$?`,
            choices: [r`$x$: 1, 2, 3 → $y$: 5, 5, 5`, r`$x$: 1, 1, 2 → $y$: 4, 7, 9`, r`$x$: 0, 1, 2 → $y$: 0, 1, 4`, r`$x$: −1, 0, 1 → $y$: 3, 2, 3`],
            answer: 1,
            hints: [r`Look for an input that shows up twice with different outputs.`],
            solution: [r`In the second table the input $x = 1$ gives **two** outputs, 4 and 7. One button, two snacks: broken machine.`, r`Repeating **outputs** is fine (the first and last tables). Only repeating **inputs** with different outputs breaks the rule.`],
          },
        },
      ],
      questions: [
        { id: "u1l1q1", type: "num", level: 1, prompt: r`If $f(x) = x^2 - 3x + 2$, find $f(4)$.`, answer: 6, verify: { kind: "value", expr: "4^2-3*4+2" }, hints: [r`Replace every $x$ with 4.`], solution: [r`$f(4) = 4^2 - 3(4) + 2$`, r`$= 16 - 12 + 2 = 6$`] },
        { id: "u1l1q2", type: "num", level: 1, prompt: r`If $g(t) = \dfrac{t+1}{t-2}$, find $g(-1)$.`, answer: 0, verify: { kind: "value", expr: "(-1+1)/(-1-2)" }, hints: [r`Top: $-1 + 1$.`], solution: [r`$g(-1) = \dfrac{-1+1}{-1-2} = \dfrac{0}{-3}$`, r`$= 0$. Zero on top is totally fine. Zero on the **bottom** would be the problem.`] },
        { id: "u1l1q3", type: "num", level: 1, prompt: r`If $f(x) = -x^2$, find $f(-3)$.`, answer: -9, verify: { kind: "value", expr: "-((-3)^2)" }, hints: [r`$f(-3) = -(-3)^2$. Square first, then apply the minus.`], solution: [r`$f(-3) = -(-3)^2$`, r`$(-3)^2 = 9$, so $f(-3) = -9$.`, r`Classic trap: the answer is NOT $+9$. The minus sits outside the square.`] },
        { id: "u1l1q4", type: "expr", level: 2, prompt: r`Let $f(x) = x^2 + 5$. Find $f(x+1)$ and simplify. (Type it in terms of $x$.)`, answer: "x^2+2x+6", verify: { kind: "same", expr: "(x+1)^2+5" }, hints: [r`Replace $x$ with $(x+1)$: $(x+1)^2 + 5$.`, r`$(x+1)^2 = x^2 + 2x + 1$.`], solution: [r`$f(x+1) = (x+1)^2 + 5$`, r`$= x^2 + 2x + 1 + 5$`, r`$= x^2 + 2x + 6$`] },
        { id: "u1l1q5", type: "expr", level: 2, prompt: r`Let $f(x) = 3x - 4$. Simplify $\dfrac{f(x+h) - f(x)}{h}$ for $h \ne 0$. (Your answer might not even have $x$ in it!)`, answer: "3", verify: { kind: "same", expr: "3" }, hints: [r`$f(x+h) = 3(x+h) - 4 = 3x + 3h - 4$.`, r`Subtract $f(x) = 3x - 4$. Almost everything cancels.`], solution: [r`$f(x+h) - f(x) = (3x + 3h - 4) - (3x - 4) = 3h$`, r`Divide by $h$: $\dfrac{3h}{h} = 3$.`, r`This is the slope of the line $3x - 4$. Foreshadowing: this "difference quotient" becomes the derivative!`] },
        { id: "u1l1q6", type: "mc", level: 1, prompt: r`Which of these graphs is **not** a function of $x$?`, choices: ["A parabola opening up", "A circle", "A horizontal line", "A straight line with slope 3"], answer: 1, hints: [r`Use the vertical line test.`], solution: [r`A vertical line through the middle of a circle hits it **twice** (top and bottom).`, r`So one $x$ gives two $y$'s: not a function.`] },
        { id: "u1l1q7", type: "num", level: 2, exam: true, prompt: r`A phone plan costs $C(m) = 20 + 0.05m$ dollars for $m$ minutes. What is $C(300)$, in dollars?`, answer: 35, unit: "dollars", verify: { kind: "value", expr: "20+0.05*300" }, hints: [r`$0.05 \times 300 = 15$.`], solution: [r`$C(300) = 20 + 0.05(300) = 20 + 15 = 35$`, r`So 300 minutes costs **\$35**.`] },
        { id: "u1l1q8", type: "expr", level: 3, prompt: r`Let $f(x) = x^2$. Simplify $\dfrac{f(x+h)-f(x)}{h}$, then imagine $h$ shrinking to $0$. What expression in $x$ is left?`, answer: "2x", verify: { kind: "derivative", f: "x^2" }, hints: [r`$(x+h)^2 = x^2 + 2xh + h^2$.`, r`After subtracting $x^2$ you get $2xh + h^2$. Factor out $h$ and cancel.`], solution: [r`$f(x+h) - f(x) = x^2 + 2xh + h^2 - x^2 = 2xh + h^2$`, r`$\dfrac{2xh + h^2}{h} = \dfrac{h(2x + h)}{h} = 2x + h$`, r`As $h \to 0$ this becomes $2x$. Congrats, you just computed your first **derivative** (Unit 10 says hi 👋).`] },
      ],
    },
    {
      id: "u1l2",
      title: "Domain & Range",
      emoji: "🚪",
      minutes: 9,
      tldr: "Domain = every input that's allowed. Range = every output that can actually come out.",
      blocks: [
        {
          k: "eli5",
          body: r`Back to the vending machine. The **domain** is every button that actually works. The **range** is every snack that can possibly drop out.

If button Z9 is taped over, Z9 is **not** in the domain.`,
        },
        {
          k: "idea",
          title: "The 3 danger zones (memorize these!)",
          body: r`Unless a problem says otherwise, the domain is **all real numbers** minus anything that breaks math:

- 🚫 **Dividing by zero.** Bottom of a fraction can't be 0.
- 🚫 **Even roots of negatives.** Inside $\sqrt{\;\;}$ must be $\ge 0$.
- 🚫 **Logs of zero or negatives.** Inside $\ln(\;\;)$ must be $> 0$.

That's it. If none of these show up, the domain is $(-\infty, \infty)$.`,
        },
        {
          k: "table",
          title: "Interval notation cheat sheet",
          head: ["Symbol", "Means", "Endpoint included?"],
          rows: [
            ["$(a, b)$", "$a < x < b$", "No (open)"],
            ["$[a, b]$", "$a \\le x \\le b$", "Yes (closed)"],
            ["$[a, \\infty)$", "$x \\ge a$", "$a$ yes; $\\infty$ never"],
            ["$A \\cup B$", "in $A$ **or** in $B$", "union = glue together"],
          ],
        },
        {
          k: "steps",
          title: "Recipe: find the domain",
          steps: [
            r`Scan for the 3 danger zones: fractions, even roots, logs.`,
            r`For each one, write the rule: bottom $\ne 0$, inside root $\ge 0$, inside log $> 0$.`,
            r`Solve each rule for $x$.`,
            r`Keep only the $x$ values that pass **every** rule. Write it in interval notation.`,
          ],
        },
        {
          k: "example",
          title: "Professor's examples",
          problem: r`Find the domain and range of (a) $f(x) = 2$, (b) $f(x) = x + 3$, (c) $f(t) = t^2 - 3$.`,
          steps: [
            r`(a) No danger zones, so domain $(-\infty, \infty)$. The only output is 2, so range $= \{2\}$.`,
            r`(b) No danger zones: domain $(-\infty, \infty)$. A slanted line hits every height: range $(-\infty, \infty)$.`,
            r`(c) Domain $(-\infty, \infty)$. But $t^2 \ge 0$ always, so $t^2 - 3 \ge -3$. Range $[-3, \infty)$.`,
          ],
          answer: r`Domain is about **inputs** (look for danger). Range is about **outputs** (think about the smallest and biggest values it can make).`,
        },
        {
          k: "example",
          title: "Root and fraction together",
          problem: r`Find the domain of $h(x) = \dfrac{\sqrt{x+4}}{x - 1}$.`,
          steps: [r`Root rule: $x + 4 \ge 0 \Rightarrow x \ge -4$.`, r`Fraction rule: $x - 1 \ne 0 \Rightarrow x \ne 1$.`, r`Both at once: start at $-4$ (included), skip over 1.`],
          answer: r`$[-4, 1) \cup (1, \infty)$`,
        },
        {
          k: "trap",
          body: r`Square bracket vs round: $[$ means the endpoint is **in**, $($ means it's **out**. Infinity **always** gets a round bracket. You can never "reach" it.`,
        },
      ],
      questions: [
        { id: "u1l2q1", type: "interval", strict: true, level: 1, prompt: r`Find the domain of $f(x) = \sqrt{x - 5}$.`, answer: "[5,inf)", hints: [r`Inside the root must be $\ge 0$.`], solution: [r`Need $x - 5 \ge 0$, so $x \ge 5$.`, r`Domain: $[5, \infty)$, square bracket because 5 itself works ($\sqrt0 = 0$).`] },
        { id: "u1l2q2", type: "interval", strict: true, level: 1, prompt: r`Find the domain of $g(x) = \dfrac{1}{x + 2}$.`, answer: "(-inf,-2)U(-2,inf)", hints: [r`The bottom can't be 0.`], solution: [r`$x + 2 \ne 0 \Rightarrow x \ne -2$.`, r`Everything except $-2$: $(-\infty, -2) \cup (-2, \infty)$.`] },
        { id: "u1l2q3", type: "interval", strict: true, level: 2, prompt: r`Find the domain of $f(x) = \dfrac{1}{x^2 - x}$. (Week 2 slide example.)`, answer: "(-inf,0)U(0,1)U(1,inf)", hints: [r`Factor the bottom: $x^2 - x = x(x-1)$.`], solution: [r`$x(x - 1) = 0$ when $x = 0$ or $x = 1$.`, r`Remove both: $(-\infty, 0) \cup (0, 1) \cup (1, \infty)$.`] },
        { id: "u1l2q4", type: "interval", strict: true, level: 2, prompt: r`Find the domain of $f(x) = \ln(3 - x)$.`, answer: "(-inf,3)", hints: [r`Inside a log must be **strictly** positive.`], solution: [r`$3 - x > 0 \Rightarrow 3 > x$.`, r`Domain $(-\infty, 3)$, round bracket since $\ln 0$ is undefined.`] },
        { id: "u1l2q5", type: "interval", strict: true, level: 2, prompt: r`Find the **range** of $f(t) = t^2 - 3$.`, answer: "[-3,inf)", hints: [r`What's the smallest $t^2$ can be?`], solution: [r`$t^2 \ge 0$, with $t^2 = 0$ at $t = 0$.`, r`So $t^2 - 3 \ge -3$, and it can get as large as you want.`, r`Range: $[-3, \infty)$.`] },
        { id: "u1l2q6", type: "interval", strict: true, level: 3, prompt: r`Find the domain of $h(x) = \dfrac{\sqrt{x+4}}{x - 1}$.`, answer: "[-4,1)U(1,inf)", hints: [r`Two rules: inside root $\ge 0$ AND bottom $\ne 0$.`], solution: [r`$x + 4 \ge 0 \Rightarrow x \ge -4$`, r`$x \ne 1$`, r`$[-4, 1) \cup (1, \infty)$`] },
        { id: "u1l2q7", type: "interval", strict: true, level: 3, prompt: r`Find the domain of $g(x) = \dfrac{x + 1}{x^2 - 4}$.`, answer: "(-inf,-2)U(-2,2)U(2,inf)", hints: [r`$x^2 - 4 = (x-2)(x+2)$.`], solution: [r`Bottom is zero at $x = 2$ and $x = -2$.`, r`$(-\infty, -2) \cup (-2, 2) \cup (2, \infty)$`] },
        { id: "u1l2q8", type: "mc", level: 1, prompt: r`What is the range of the constant function $f(x) = 2$?`, choices: [r`$(-\infty, \infty)$`, r`$\{2\}$ (just the number 2)`, r`$[2, \infty)$`, r`$(0, 2]$`], answer: 1, solution: [r`No matter the input, the output is always 2.`, r`So the only output is 2: range $= \{2\}$.`] },
      ],
    },
    {
      id: "u1l3",
      title: "Lines, Slope & Linear Models",
      emoji: "📏",
      minutes: 12,
      tldr: "Slope = rise ÷ run. Two points give the slope; slope + one point gives the line.",
      gens: ["slope", "line"],
      blocks: [
        {
          k: "eli5",
          body: r`**Slope** is how steep a hill is. Take one step to the right: how many steps did you go up?

- Uphill → positive slope ⛰️
- Downhill → negative slope 🎿
- Flat → slope 0 🏖️
- A wall → undefined slope 🧱 (you can't walk forward at all)`,
        },
        { k: "formula", title: "Slope between two points", tex: r`m = \frac{\Delta y}{\Delta x} = \frac{y_2 - y_1}{x_2 - x_1}`, note: "Rise over run. Change in output ÷ change in input." },
        { k: "formula", title: "Point-slope form (your best friend)", tex: r`y - y_1 = m(x - x_1)`, note: r`Need: one point $(x_1, y_1)$ and the slope $m$. Then solve for $y$ to get **slope-intercept form** $y = mx + b$.` },
        {
          k: "example",
          title: "Line through two points (from the slides)",
          problem: r`Find the equation of the line through $(1, -2)$ and $(-2, 4)$.`,
          steps: [
            r`Slope: $m = \dfrac{4 - (-2)}{-2 - 1} = \dfrac{6}{-3} = -2$.`,
            r`Point-slope with $(1, -2)$: $y - (-2) = -2(x - 1)$.`,
            r`Simplify: $y + 2 = -2x + 2$, so $y = -2x$.`,
          ],
          answer: r`$y = -2x$. Check with the other point: $-2(-2) = 4$ ✓`,
        },
        {
          k: "idea",
          title: "Is it linear?",
          body: r`A **linear function** can be written $f(x) = mx + b$, where $m$ and $b$ are constants.

- $y = \tfrac23 x + 17$ ✅ linear
- $3y - 12x = 2$ ✅ linear (solve: $y = 4x + \tfrac23$)
- $y = x^2 + 7$ ❌ (has $x^2$)
- $2y = \tfrac1x + 5$ ❌ (has $\tfrac1x$)

**From a table:** it's linear exactly when the slope between **every** pair of rows is the same.`,
        },
        {
          k: "example",
          title: "Linear demand (slides, Week 1)",
          problem: r`At a unit price of \$520, 120 phones are demanded. If the price rises to \$640, demand drops by 30 units. (a) Find the linear demand equation $p = D(x)$. (b) How many units are demanded at \$200?`,
          steps: [
            r`Points are (quantity, price): $(120, 520)$ and $(90, 640)$.`,
            r`Slope: $m = \dfrac{640 - 520}{90 - 120} = \dfrac{120}{-30} = -4$. Negative, as demand should be: pricier → fewer sold.`,
            r`Point-slope: $p - 520 = -4(x - 120) \Rightarrow p = -4x + 1000$.`,
            r`(b) $200 = -4x + 1000 \Rightarrow 4x = 800 \Rightarrow x = 200$ units.`,
          ],
          answer: r`$D(x) = -4x + 1000$, and 200 phones at \$200.`,
        },
        { k: "tip", title: "Parallel & perpendicular", body: r`Parallel lines have the **same** slope. Perpendicular lines have slopes that are **negative reciprocals**: if one is $m$, the other is $-\tfrac{1}{m}$ (so slope 2 ↔ slope $-\tfrac12$).` },
        { k: "tool", tool: "grapher", props: { fns: ["-2x", "-4x + 1000", "", ""] }, caption: "Play with lines: change the slope and intercept and watch what moves." },
        { k: "trap", body: r`Keep the order consistent: if you do $y_2 - y_1$ on top, do $x_2 - x_1$ on the bottom (same point first in both). Mixing them flips the sign.` },
      ],
      questions: [
        { id: "u1l3q1", type: "num", level: 1, prompt: r`Find the slope of the line through $(2, 3)$ and $(6, 11)$.`, answer: 2, verify: { kind: "value", expr: "(11-3)/(6-2)" }, hints: [r`$\dfrac{11 - 3}{6 - 2}$`], solution: [r`$m = \dfrac{11 - 3}{6 - 2} = \dfrac{8}{4} = 2$`] },
        { id: "u1l3q2", type: "num", level: 1, prompt: r`Find the slope of the line through $(1, -2)$ and $(-2, 4)$.`, answer: -2, verify: { kind: "value", expr: "(4+2)/(-2-1)" }, solution: [r`$m = \dfrac{4 - (-2)}{-2 - 1} = \dfrac{6}{-3} = -2$`] },
        { id: "u1l3q3", type: "expr", level: 2, prompt: r`Find the equation of the line with slope $3$ through $(2, -1)$. Type it as $y = \dots$`, answer: "3x-7", hints: [r`$y - (-1) = 3(x - 2)$`], solution: [r`$y + 1 = 3(x - 2) = 3x - 6$`, r`$y = 3x - 7$`] },
        { id: "u1l3q4", type: "expr", level: 2, prompt: r`Find the line through $(-1, 5)$ and $(3, -3)$. Type it as $y = \dots$`, answer: "-2x+3", hints: [r`Slope first: $\dfrac{-3 - 5}{3 - (-1)}$.`], solution: [r`$m = \dfrac{-8}{4} = -2$`, r`$y - 5 = -2(x + 1) = -2x - 2$`, r`$y = -2x + 3$`] },
        { id: "u1l3q5", type: "mc", level: 2, prompt: r`Is this table linear? $x$: 1, 5, 7 → $f(x)$: 2, −3, −5`, choices: ["Yes, slope −5/4 everywhere", "No, the slopes between rows are different", "Yes, slope −1 everywhere", "Can't tell from a table"], answer: 1, hints: [r`Find the slope from row 1→2, then row 2→3.`], solution: [r`Row 1→2: $\dfrac{-3 - 2}{5 - 1} = -\dfrac54$.`, r`Row 2→3: $\dfrac{-5 - (-3)}{7 - 5} = -1$.`, r`Different slopes → **not linear**.`] },
        { id: "u1l3q6", type: "num", level: 2, exam: true, prompt: r`A demand line passes through (quantity, price) $= (120, 520)$ and $(90, 640)$. How many units are demanded at a price of \$200?`, answer: 200, verify: { kind: "value", expr: "(1000-200)/4" }, hints: [r`Slope is $-4$, so $p = -4x + 1000$.`], solution: [r`$p = -4x + 1000$.`, r`$200 = -4x + 1000 \Rightarrow x = 200$.`] },
        { id: "u1l3q7", type: "num", level: 1, prompt: r`What is the slope of a line perpendicular to $y = 4x - 7$?`, answer: -0.25, hints: [r`Negative reciprocal of 4.`], solution: [r`Flip and negate: $-\tfrac14$.`] },
        { id: "u1l3q8", type: "num", level: 2, prompt: r`Rewrite $3y - 12x = 2$ in the form $y = mx + b$. What is $b$?`, answer: 2 / 3, hints: [r`Add $12x$ to both sides, then divide by 3.`], solution: [r`$3y = 12x + 2$`, r`$y = 4x + \tfrac23$, so $b = \tfrac23$.`] },
        { id: "u1l3q9", type: "num", level: 3, prompt: r`A plumber charges a flat fee plus an hourly rate. 2 hours costs \$170 and 5 hours costs \$350. What is the flat fee in dollars?`, answer: 50, hints: [r`Hourly rate = slope = $\dfrac{350 - 170}{5 - 2}$.`], solution: [r`Slope $= \dfrac{180}{3} = 60$ dollars/hour.`, r`$C = 60t + b$; $170 = 120 + b \Rightarrow b = 50$.`, r`Flat fee: **\$50**.`] },
      ],
    },
  ],
};

export const u02: Unit = {
  id: "u2",
  n: 2,
  title: "Exponentials & Piecewise",
  emoji: "🚀",
  biome: "desert",
  when: "Week 1",
  exam: 1,
  summary: "Functions that multiply instead of add, building them from points and tables, and functions made of pieces.",
  lessons: [
    {
      id: "u2l1",
      title: "Exponential functions",
      emoji: "🦠",
      minutes: 10,
      tldr: "Linear adds the same amount each step. Exponential MULTIPLIES by the same amount each step: f(x) = a·bˣ.",
      gens: ["expgrowth"],
      blocks: [
        {
          k: "eli5",
          body: r`One bacterium splits into 2. Then 4. Then 8, 16, 32… Each minute you **multiply by 2**. That's exponential.

A line goes **+3, +3, +3** (adding). An exponential goes **×2, ×2, ×2** (multiplying). Multiplying wins, every time, eventually.`,
        },
        {
          k: "formula",
          title: "The exponential function",
          tex: r`f(x) = a\cdot b^x \qquad a \ne 0,\;\; b > 0,\;\; b \ne 1`,
          note: r`$a$ = starting value (the y-intercept). $b$ = the multiplier per step.`,
        },
        {
          k: "idea",
          title: "Growth or decay?",
          body: r`- $b > 1$: **growth** 📈 (like $2^x$)
- $0 < b < 1$: **decay** 📉 (like $(\tfrac13)^x$)

**Percent change:** growing $r$% per step means $b = 1 + r$. Shrinking $r$% means $b = 1 - r$.
So "+2% per year" → $b = 1.02$, and "−10% per year" → $b = 0.90$.`,
        },
        {
          k: "idea",
          title: "Intercepts (slide question)",
          body: r`- **y-intercept:** $f(0) = a \cdot b^0 = a$. So the point is $(0, a)$.
- **x-intercept:** NONE. $b^x$ is never 0, so $a \cdot b^x$ is never 0.
- The x-axis $y = 0$ is a **horizontal asymptote**: the curve hugs it forever without touching.`,
        },
        { k: "tool", tool: "exponential", props: { a: 1, b: 2 }, caption: "Compare 2ˣ with (1/3)ˣ by sliding b below 1." },
        { k: "trap", body: r`$2^x$ and $x^2$ are **totally different**. In $2^x$ the variable is **up in the exponent**. In $x^2$ it's down in the base (that's a polynomial).` },
      ],
      questions: [
        { id: "u2l1q1", type: "num", level: 1, prompt: r`For $f(x) = 5 \cdot 3^x$, what is the y-intercept's y-value?`, answer: 5, solution: [r`$f(0) = 5 \cdot 3^0 = 5 \cdot 1 = 5$`] },
        { id: "u2l1q2", type: "mc", level: 1, prompt: r`Which function shows **decay**?`, choices: [r`$f(x) = 0.5 \cdot 3^x$`, r`$f(x) = 4 \cdot (0.8)^x$`, r`$f(x) = (1.1)^x$`, r`$f(x) = 2^x$`], answer: 1, solution: [r`Decay means the base $b$ is between 0 and 1.`, r`Only $0.8$ qualifies. The $0.5$ in choice A is the starting value $a$, not the base!`] },
        { id: "u2l1q3", type: "num", level: 1, prompt: r`A town of 10,000 grows 3% per year. What is the growth factor $b$?`, answer: 1.03, solution: [r`$b = 1 + 0.03 = 1.03$`] },
        { id: "u2l1q4", type: "num", level: 2, prompt: r`A car worth \$24,000 loses 15% of its value each year. What is it worth after 2 years (in dollars)?`, answer: 17340, verify: { kind: "value", expr: "24000*0.85^2" }, hints: [r`$b = 1 - 0.15 = 0.85$.`], solution: [r`$V(t) = 24000(0.85)^t$`, r`$V(2) = 24000 \cdot 0.7225 = 17{,}340$`] },
        { id: "u2l1q5", type: "mc", level: 1, prompt: r`How many x-intercepts does $f(x) = 7 \cdot 2^x$ have?`, choices: ["0", "1", "2", "Infinitely many"], answer: 0, solution: [r`$2^x > 0$ always, so $7 \cdot 2^x > 0$ always. It never touches the x-axis.`] },
        { id: "u2l1q6", type: "num", level: 2, prompt: r`Evaluate $f(-2)$ for $f(x) = 3 \cdot 2^x$.`, answer: 0.75, verify: { kind: "value", expr: "3*2^(-2)" }, hints: [r`$2^{-2} = \dfrac{1}{2^2}$.`], solution: [r`$2^{-2} = \tfrac14$`, r`$3 \cdot \tfrac14 = \tfrac34 = 0.75$`] },
        { id: "u2l1q7", type: "num", level: 2, prompt: r`As $x \to \infty$, what does $f(x) = 6\left(\tfrac13\right)^x$ approach?`, answer: 0, solution: [r`Multiplying by $\tfrac13$ over and over shrinks toward 0.`, r`So $f(x) \to 0$: the horizontal asymptote is $y = 0$.`] },
      ],
    },
    {
      id: "u2l2",
      title: "Building exponentials from data",
      emoji: "🔧",
      minutes: 10,
      tldr: "Two points pin down exactly one exponential. In a table, constant RATIOS mean exponential; constant DIFFERENCES mean linear.",
      blocks: [
        {
          k: "eli5",
          body: r`For a line, check if you **add** the same thing each time. For an exponential, check if you **multiply** by the same thing each time.

$6 \to 18 \to 54$: each time ×3. Exponential! 🎯`,
        },
        {
          k: "steps",
          title: "Recipe: exponential through two points",
          steps: [
            r`Write both points as equations: $y_1 = a b^{x_1}$ and $y_2 = a b^{x_2}$.`,
            r`**Divide** the equations. $a$ cancels: $\dfrac{y_2}{y_1} = b^{x_2 - x_1}$.`,
            r`Solve for $b$ by taking a root: $b = \left(\dfrac{y_2}{y_1}\right)^{1/(x_2 - x_1)}$.`,
            r`Plug $b$ back into either equation to get $a$.`,
          ],
        },
        {
          k: "example",
          title: "Slide example: through (2, 4) and (5, 7)",
          problem: r`Find the exponential function through $(2, 4)$ and $(5, 7)$.`,
          steps: [
            r`$4 = ab^2$ and $7 = ab^5$.`,
            r`Divide: $\dfrac{7}{4} = \dfrac{ab^5}{ab^2} = b^3$.`,
            r`$b = \left(\tfrac74\right)^{1/3} \approx 1.2051$.`,
            r`$a = \dfrac{4}{b^2} \approx \dfrac{4}{1.4522} \approx 2.7544$.`,
          ],
          answer: r`$f(x) \approx 2.7544 \cdot (1.2051)^x$`,
        },
        {
          k: "example",
          title: "Slide example: is the table exponential?",
          problem: r`$x$: 1, 2, 3 → $f(x)$: 6, 18, 54. Exponential?`,
          steps: [r`Ratios: $18 / 6 = 3$, $54 / 18 = 3$. Constant ratio! ✅`, r`So $b = 3$. Then $6 = a \cdot 3^1 \Rightarrow a = 2$.`],
          answer: r`$f(x) = 2 \cdot 3^x$`,
        },
        { k: "trap", body: r`Only test ratios when the $x$ values go up by the **same** step. If $x$ jumps 1, then 2, compare per unit step (or use the two-point recipe).` },
      ],
      questions: [
        { id: "u2l2q1", type: "num", level: 1, prompt: r`The table $x$: 0, 1, 2 → $y$: 5, 10, 20 is exponential. What is $b$?`, answer: 2, solution: [r`$10/5 = 2$ and $20/10 = 2$.`, r`$b = 2$.`] },
        { id: "u2l2q2", type: "expr", level: 2, prompt: r`Find the exponential function for the table $x$: 1, 2, 3 → $y$: 6, 18, 54. Type $f(x) = \dots$`, answer: "2*3^x", hints: [r`Ratio = 3. Then $6 = a \cdot 3^1$.`], solution: [r`$b = 3$ (constant ratio).`, r`$6 = a \cdot 3 \Rightarrow a = 2$.`, r`$f(x) = 2 \cdot 3^x$`] },
        { id: "u2l2q3", type: "num", level: 2, prompt: r`An exponential passes through $(2, 4)$ and $(5, 7)$. Find $b$ (to 4 decimals).`, answer: Math.cbrt(7 / 4), tol: 5e-4, verify: { kind: "value", expr: "(7/4)^(1/3)" }, hints: [r`$b^3 = 7/4$.`], solution: [r`Divide: $b^{5-2} = \tfrac74$.`, r`$b = (1.75)^{1/3} \approx 1.2051$`] },
        { id: "u2l2q4", type: "num", level: 2, prompt: r`An exponential passes through $(0, 3)$ and $(2, 12)$. Find $f(3)$.`, answer: 24, hints: [r`$a = 3$ (the y-intercept). Then $12 = 3b^2$.`], solution: [r`$a = 3$; $b^2 = 4 \Rightarrow b = 2$.`, r`$f(3) = 3 \cdot 2^3 = 24$`] },
        { id: "u2l2q5", type: "mc", level: 1, prompt: r`Table: $x$: 0, 1, 2, 3 → $y$: 2, 5, 8, 11. Which is it?`, choices: ["Linear", "Exponential", "Neither", "Both"], answer: 0, solution: [r`Differences: $+3, +3, +3$. Constant differences → **linear**.`, r`Ratios $5/2 \ne 8/5$, so not exponential.`] },
        { id: "u2l2q6", type: "num", level: 3, prompt: r`An exponential passes through $(1, 10)$ and $(3, 2.5)$. Find $a$ (the value at $x = 0$).`, answer: 20, hints: [r`$b^2 = 2.5 / 10 = 0.25$, so $b = 0.5$.`], solution: [r`$b^2 = 0.25 \Rightarrow b = 0.5$ (base must be positive).`, r`$10 = a(0.5) \Rightarrow a = 20$.`] },
      ],
    },
    {
      id: "u2l3",
      title: "Piecewise functions",
      emoji: "🧩",
      minutes: 9,
      tldr: "Different formulas for different inputs. First find WHICH piece your x lives in, then use only that formula.",
      blocks: [
        {
          k: "eli5",
          body: r`Think of a phone plan: the first 100 texts cost 5¢ each, but after that they're free. Different rules for different situations. That's a piecewise function.

The **conditions** on the right side tell you which rule applies.`,
        },
        {
          k: "steps",
          title: "Recipe: evaluate a piecewise function",
          steps: [r`Look at your $x$.`, r`Check each condition on the right until one is **true** for your $x$.`, r`Use **only** that row's formula. Ignore the others completely.`],
        },
        {
          k: "example",
          title: "Slide example",
          problem: r`$$f(x) = \begin{cases} x^2 + 2x & x \le -1 \\ x + 6 & -1 < x \le 0 \\ 3 \cdot 5^x & 0 < x \end{cases}$$ Find $f(-2)$, $f(0)$, $f(3)$.`,
          steps: [
            r`$x = -2$: is $-2 \le -1$? Yes → top row: $(-2)^2 + 2(-2) = 4 - 4 = 0$.`,
            r`$x = 0$: is $-1 < 0 \le 0$? Yes → middle row: $0 + 6 = 6$.`,
            r`$x = 3$: is $0 < 3$? Yes → bottom row: $3 \cdot 5^3 = 375$.`,
          ],
          answer: r`$f(-2) = 0,\; f(0) = 6,\; f(3) = 375$`,
        },
        {
          k: "example",
          title: "Slide example: stadium capacity",
          problem: r`A stadium's capacity grows by a constant 100 seats per year from 1990 to 2010, then by 1% per year after 2010. It has 68,000 seats at the start of 2000. Find $P(t)$, the capacity $t$ years after 1990.`,
          steps: [
            r`1990–2010 is $0 \le t \le 20$, linear with slope 100. At $t = 10$ (year 2000), $P = 68{,}000$.`,
            r`$P = 68000 + 100(t - 10) = 100t + 67000$ for $0 \le t \le 20$.`,
            r`At $t = 20$: $P = 69{,}000$. After that it multiplies by 1.01 per year: $P = 69000(1.01)^{t - 20}$ for $t > 20$.`,
          ],
          answer: r`$P(t) = \begin{cases} 100t + 67000 & 0 \le t \le 20 \\ 69000(1.01)^{t-20} & t > 20\end{cases}$`,
        },
        { k: "trap", body: r`Watch $\le$ vs $<$ at the boundaries. At $x = 0$ above, the middle row says $\le 0$ (included) and the last row says $0 < x$ (excluded). So $x = 0$ goes to the middle row.` },
      ],
      questions: [
        { id: "u2l3q1", type: "num", level: 1, prompt: r`Using $f(x) = x^2 + 2x$ for $x \le -1$, $x + 6$ for $-1 < x \le 0$, $3 \cdot 5^x$ for $x > 0$: find $f(-2)$.`, answer: 0, solution: [r`$-2 \le -1$ → top row: $4 - 4 = 0$.`] },
        { id: "u2l3q2", type: "num", level: 1, prompt: r`$f(x) = x^2 + 2x$ for $x \le -1$, $x + 6$ for $-1 < x \le 0$, $3 \cdot 5^x$ for $x > 0$. Find $f(0)$.`, answer: 6, solution: [r`$0$ satisfies $-1 < 0 \le 0$ → middle row: $0 + 6 = 6$.`] },
        { id: "u2l3q3", type: "num", level: 1, prompt: r`$f(x) = x^2 + 2x$ for $x \le -1$, $x + 6$ for $-1 < x \le 0$, $3 \cdot 5^x$ for $x > 0$. Find $f(3)$.`, answer: 375, solution: [r`$3 > 0$ → bottom row: $3 \cdot 5^3 = 3 \cdot 125 = 375$.`] },
        { id: "u2l3q4", type: "num", level: 2, prompt: r`$f(x) = x^2 + 2x$ for $x \le -1$, $x + 6$ for $-1 < x \le 0$, $3 \cdot 5^x$ for $x > 0$. Find $f(-1)$.`, answer: -1, hints: [r`Which condition does $-1$ satisfy? Careful with $<$ vs $\le$.`], solution: [r`$-1 \le -1$ is true → top row.`, r`$(-1)^2 + 2(-1) = 1 - 2 = -1$`] },
        { id: "u2l3q5", type: "num", level: 2, prompt: r`Stadium model: $P(t) = 100t + 67000$ for $0 \le t \le 20$, $69000(1.01)^{t-20}$ for $t > 20$. Find $P(30)$ (round to the nearest seat).`, answer: Math.round(69000 * 1.01 ** 10), tol: 1, verify: { kind: "value", expr: "69000*1.01^10" }, solution: [r`$t = 30 > 20$: $P(30) = 69000(1.01)^{10}$`, r`$(1.01)^{10} \approx 1.10462$, so $P \approx 76{,}219$ seats.`] },
        { id: "u2l3q6", type: "num", level: 2, prompt: r`$g(x) = |x|$ is secretly piecewise: $-x$ for $x < 0$ and $x$ for $x \ge 0$. Find $g(-7)$ using the piece.`, answer: 7, solution: [r`$-7 < 0$ → use $-x$: $-(-7) = 7$.`, r`That's why absolute value is "distance from 0".`] },
      ],
    },
  ],
};
