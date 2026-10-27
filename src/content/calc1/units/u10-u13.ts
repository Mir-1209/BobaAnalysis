import type { Unit } from "../../types";

const r = String.raw;

export const u10: Unit = {
  id: "u10",
  n: 10,
  title: "The Derivative",
  emoji: "📐",
  biome: "nether",
  when: "Weeks 5–6",
  exam: 2,
  summary: "Average vs instantaneous rate, the tangent line, the limit definition of f′(a), units, and when a derivative fails to exist.",
  lessons: [
    {
      id: "u10l1",
      title: "Secants, tangents & rates of change",
      emoji: "🏎️",
      minutes: 12,
      tldr: "The derivative f′(a) is the slope of the curve AT one point: the limit of secant slopes as the second point slides in.",
      blocks: [
        {
          k: "eli5",
          body: r`Your car's **trip average**: 120 miles in 2 hours = 60 mph. That's an **average rate** (a secant slope). 🚗

Your **speedometer** right now says 72 mph. That's an **instantaneous rate** (a tangent slope). The derivative is the speedometer.

How do you get it? Take the average over a shorter and shorter time window. 1 hour… 1 minute… 1 second… The averages settle on one number: that number is the derivative.`,
        },
        { k: "formula", title: "Average rate of change = secant slope", tex: r`\frac{\Delta f}{\Delta x} = \frac{f(b) - f(a)}{b - a}` },
        { k: "formula", title: "Instantaneous rate = derivative = tangent slope", tex: r`f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}` },
        { k: "tool", tool: "tangent", props: { f: "x^2", a: 1 }, caption: "Drag h to 0 and watch the secant become the tangent. For x² at a = 1 the slope settles on 2." },
        {
          k: "idea",
          title: "Many names, one idea",
          body: r`All of these mean $f'(a)$:

- the **slope of the tangent line** at $x = a$
- the **instantaneous rate of change** of $f$ at $a$
- **velocity** at time $a$, if $f$ is position
- $\dfrac{df}{dx}\Big|_{x=a}$ (Leibniz notation)

$f'(a)$ is a **number**. $f'(x)$ is a **function** (the slope everywhere).`,
        },
        {
          k: "example",
          title: "Average vs instantaneous",
          problem: r`$s(t) = t^2$ meters. Find the average velocity on $[1, 3]$, then guess the velocity at exactly $t = 1$.`,
          steps: [r`Average on $[1, 3]$: $\frac{9 - 1}{3 - 1} = 4$ m/s.`, r`Shrink: $[1, 1.1]$: $\frac{1.21 - 1}{0.1} = 2.1$. $[1, 1.01]$: $2.01$. $[1, 1.001]$: $2.001$.`, r`Heading to 2.`],
          answer: r`Average 4 m/s; instantaneous $s'(1) = 2$ m/s.`,
        },
        { k: "trap", body: r`A **secant** connects two points (average). A **tangent** touches at one point (instantaneous). The exam will ask for one specifically, so read carefully.` },
      ],
      questions: [
        { id: "u10l1q1", type: "num", level: 1, prompt: r`$s(t) = t^2$ meters. Average velocity on $[1, 3]$ (m/s)?`, answer: 4, unit: "m/s", solution: [r`$\frac{s(3) - s(1)}{3 - 1} = \frac{9 - 1}{2} = 4$`] },
        { id: "u10l1q2", type: "num", level: 1, prompt: r`Average rate of change of $f(x) = x^3$ from $x = 0$ to $x = 2$?`, answer: 4, solution: [r`$\frac{8 - 0}{2 - 0} = 4$`] },
        { id: "u10l1q3", type: "num", level: 2, prompt: r`Use the tangent tool idea: what is the slope of the tangent to $f(x) = x^2$ at $x = 3$?`, answer: 6, verify: { kind: "derivative", f: "x^2", at: 3 }, solution: [r`Secant slopes from $x = 3$: $\frac{(3+h)^2 - 9}{h} = 6 + h \to 6$.`] },
        { id: "u10l1q4", type: "mc", level: 1, prompt: r`$f'(5) = -2$ means…`, choices: ["f(5) = −2", "At x = 5 the graph is falling with slope −2", "The graph crosses the x-axis at 5", "f is negative near 5"], answer: 1, solution: [r`$f'$ is a slope, not a height. Negative slope = falling.`] },
        { id: "u10l1q5", type: "num", level: 2, exam: true, prompt: r`A table gives $f(1.9) = 7.6$, $f(2) = 8$, $f(2.1) = 8.5$. Estimate $f'(2)$ using the two nearest points on BOTH sides.`, answer: 4.5, solution: [r`Use the symmetric (centered) secant: $\frac{f(2.1) - f(1.9)}{2.1 - 1.9} = \frac{0.9}{0.2} = 4.5$.`, r`The exam sheet says: "estimate instantaneous rate with nearby points on both sides when possible."`] },
        { id: "u10l1q6", type: "mc", level: 2, prompt: r`Which is a **number**?`, choices: [r`$f'(x)$`, r`$f'(3)$`, r`$\frac{d}{dx}$`, r`$f$`], answer: 1, solution: [r`$f'(3)$ is the slope at one specific point: a number. $f'(x)$ is a formula/function.`] },
      ],
    },
    {
      id: "u10l2",
      title: "The limit definition of the derivative",
      emoji: "🧪",
      minutes: 15,
      tldr: "f′(a) = lim (f(a+h) − f(a))/h. Compute f(a+h), subtract f(a), simplify until you can cancel h, THEN let h → 0.",
      blocks: [
        { k: "eli5", body: r`This is the derivative **"by hand,"** with no shortcuts. It's like building a Minecraft house block by block ⛏️ before you learn about structure blocks. Slow, but the professor WILL ask you to do it ("use the limit definition"), and shortcuts won't count.` },
        { k: "formula", title: "Limit definition (two versions)", tex: r`f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h} \qquad f'(x) = \lim_{h\to0}\frac{f(x+h) - f(x)}{h}` },
        {
          k: "steps",
          title: "Exam recipe: \"use the limit definition\"",
          steps: [
            r`Compute $f(a)$ and $f(a + h)$ **separately** (careful with parentheses!).`,
            r`Put them in $\dfrac{f(a+h) - f(a)}{h}$.`,
            r`Expand or rationalize; **cancel $h$**; only then let $h \to 0$.`,
            r`Write the resulting derivative number, with units if applicable.`,
          ],
        },
        {
          k: "example",
          title: "Exam sheet: f(x) = x² + 2 at x = 4",
          problem: r`Use the limit definition to find $f'(4)$ for $f(x) = x^2 + 2$.`,
          steps: [
            r`$f(4) = 18$. $f(4 + h) = (4+h)^2 + 2 = 16 + 8h + h^2 + 2 = 18 + 8h + h^2$.`,
            r`$\dfrac{f(4+h) - f(4)}{h} = \dfrac{8h + h^2}{h}$.`,
            r`Cancel $h$: $8 + h$.`,
            r`Let $h \to 0$: $8$.`,
          ],
          answer: r`$f'(4) = 8$`,
        },
        {
          k: "example",
          title: "Exam (Feb 2026): f(x) = √(x² + 16) at x = 3",
          problem: r`Use the limit definition to find $f'(3)$ for $f(x) = \sqrt{x^2 + 16}$.`,
          steps: [
            r`$f(3) = \sqrt{25} = 5$; $f(3 + h) = \sqrt{(3+h)^2 + 16}$.`,
            r`$\dfrac{\sqrt{(3+h)^2+16} - 5}{h}$. It's $\frac00$ at $h=0$, so multiply by the conjugate $\dfrac{\sqrt{(3+h)^2+16} + 5}{\sqrt{(3+h)^2+16} + 5}$.`,
            r`Top: $(3+h)^2 + 16 - 25 = 9 + 6h + h^2 - 9 = 6h + h^2$.`,
            r`$\dfrac{h(6 + h)}{h\left(\sqrt{(3+h)^2+16} + 5\right)} = \dfrac{6 + h}{\sqrt{(3+h)^2+16}+5}$.`,
            r`$h \to 0$: $\dfrac{6}{5 + 5} = \dfrac35$.`,
          ],
          answer: r`$f'(3) = \frac35$`,
        },
        {
          k: "example",
          title: "A whole derivative function: f(x) = 1/x",
          problem: r`Use the definition to find $f'(x)$ for $f(x) = \dfrac1x$.`,
          steps: [
            r`$\dfrac{\frac{1}{x+h} - \frac1x}{h}$. Common denominator on top: $\dfrac{x - (x + h)}{x(x+h)} = \dfrac{-h}{x(x+h)}$.`,
            r`Divide by $h$: $\dfrac{-1}{x(x+h)}$.`,
            r`$h \to 0$: $-\dfrac{1}{x^2}$.`,
          ],
          answer: r`$f'(x) = -\dfrac{1}{x^2}$`,
        },
        { k: "trap", body: r`**Read "use the limit definition" literally: derivative shortcuts alone will not satisfy it.** (Exam sheet.) Also: never let $h \to 0$ before $h$ is canceled. You'll get $\frac00$ and lose the problem.` },
      ],
      questions: [
        { id: "u10l2q1", type: "num", level: 2, exam: true, prompt: r`Use the limit definition: $f(x) = x^2 + 2$. Find $f'(4)$.`, answer: 8, verify: { kind: "derivative", f: "x^2+2", at: 4 }, solution: [r`$\frac{(4+h)^2 + 2 - 18}{h} = \frac{8h + h^2}{h} = 8 + h \to 8$`] },
        { id: "u10l2q2", type: "num", level: 3, exam: true, prompt: r`Use the limit definition: $f(x) = \sqrt{x^2+16}$. Find $f'(3)$.`, answer: 0.6, verify: { kind: "derivative", f: "sqrt(x^2+16)", at: 3 }, hints: [r`Conjugate!`], solution: [r`$\frac{6 + h}{\sqrt{(3+h)^2+16} + 5} \to \frac{6}{10}$`] },
        { id: "u10l2q3", type: "expr", level: 2, prompt: r`Use the limit definition to find $f'(x)$ for $f(x) = 3x^2 - x$.`, answer: "6x-1", verify: { kind: "derivative", f: "3x^2-x" }, hints: [r`$f(x+h) = 3(x+h)^2 - (x + h) = 3x^2 + 6xh + 3h^2 - x - h$.`], solution: [r`$f(x+h) - f(x) = 6xh + 3h^2 - h$`, r`Divide by $h$: $6x + 3h - 1$`, r`$h\to0$: $6x - 1$`] },
        { id: "u10l2q4", type: "expr", level: 3, prompt: r`Use the limit definition: $f(x) = \dfrac1x$. Find $f'(x)$.`, answer: "-1/x^2", verify: { kind: "derivative", f: "1/x" }, domain: [0.5, 3], solution: [r`$\frac{-1}{x(x+h)} \to -\frac{1}{x^2}$`] },
        { id: "u10l2q5", type: "num", level: 2, prompt: r`Limit definition: $f(x) = 5x + 7$. Find $f'(2)$.`, answer: 5, solution: [r`$\frac{5(2+h) + 7 - 17}{h} = \frac{5h}{h} = 5$`, r`Lines have the same slope everywhere.`] },
        { id: "u10l2q6", type: "num", level: 3, prompt: r`Limit definition: $f(x) = \sqrt{x}$. Find $f'(9)$.`, answer: 1 / 6, verify: { kind: "derivative", f: "sqrt(x)", at: 9 }, solution: [r`$\frac{\sqrt{9 + h} - 3}{h}\cdot\frac{\sqrt{9+h}+3}{\sqrt{9+h}+3} = \frac{h}{h(\sqrt{9+h}+3)}$`, r`$\to \frac{1}{6}$`] },
        { id: "u10l2q7", type: "mc", level: 2, prompt: r`$\displaystyle\lim_{h\to0}\frac{(1+h)^5 - 1}{h}$ is the derivative of which function at which point?`, choices: [r`$x^5$ at $x = 1$`, r`$x^5$ at $x = 0$`, r`$(1+x)^5$ at $x = 1$`, r`$5x$ at $x = 1$`], answer: 0, solution: [r`Pattern $\frac{f(a+h)-f(a)}{h}$ with $f(x) = x^5$, $a = 1$ (and $f(1) = 1$).`] },
      ],
    },
    {
      id: "u10l3",
      title: "Units, meaning & differentiability",
      emoji: "📏",
      minutes: 10,
      tldr: "Units of f′ = output units per input unit. Corners, cusps, jumps, holes and vertical tangents have NO derivative.",
      blocks: [
        { k: "eli5", body: r`If $f$ is **dollars** and $x$ is **hours**, then $f'$ is **dollars per hour** 💵⏰. Always "output per input."

And a derivative needs a **smooth** spot. At a sharp corner, which way is the slope? Up or down? No single answer → no derivative.` },
        { k: "formula", title: "Interpretation sentence (exam template)", tex: r`\text{"At input } a\text{, the output is increasing/decreasing at about } f'(a) \tfrac{\text{output units}}{\text{input unit}}\text{."}` },
        {
          k: "idea",
          title: "Where derivatives don't exist",
          body: r`$f'(a)$ fails to exist at:

- **corners** (like $|x|$ at 0): left slope ≠ right slope
- **cusps** (like $x^{2/3}$ at 0): super-sharp point
- **vertical tangents** (like $\sqrt[3]{x}$ at 0): slope would be infinite
- **any discontinuity**: holes, jumps, asymptotes

**Big fact:** differentiable ⇒ continuous. But continuous does **NOT** imply differentiable (corners!).`,
        },
        { k: "tool", tool: "grapher", props: { fns: ["abs(x)", "x^(2/3)", "x^(1/3)", ""], view: { xmin: -3, xmax: 3, ymin: -2, ymax: 3 } }, caption: "Corner, cusp, vertical tangent: all at x = 0, all continuous, none differentiable there." },
      ],
      questions: [
        { id: "u10l3q1", type: "mc", level: 1, prompt: r`$C(t)$ is cups of coffee sold after $t$ hours. Units of $C'(t)$?`, choices: ["cups", "hours", "cups per hour", "hours per cup"], answer: 2, solution: [r`Output per input: cups per hour.`] },
        { id: "u10l3q2", type: "mc", level: 2, exam: true, prompt: r`$T(m)$ is temperature (°F) $m$ minutes after an oven is turned off, and $T'(20) = -3$. Which is best?`, choices: ["At 20 minutes, the temperature is −3°F", "At 20 minutes, the temperature is dropping about 3°F per minute", "It takes 3 minutes to drop 20°F", "The temperature drops 20° in 3 minutes"], answer: 1, solution: [r`Template: at input 20, output decreasing at about 3 °F per minute.`] },
        { id: "u10l3q3", type: "mc", level: 1, prompt: r`Is $f(x) = |x|$ differentiable at $x = 0$?`, choices: ["Yes, f′(0) = 0", "Yes, f′(0) = 1", "No: it's a corner", "No: it's discontinuous"], answer: 2, solution: [r`Left slope $-1$, right slope $1$. Corner → no derivative. (It IS continuous though.)`] },
        { id: "u10l3q4", type: "mc", level: 2, prompt: r`Which statement is ALWAYS true?`, choices: ["Continuous ⇒ differentiable", "Differentiable ⇒ continuous", "Not continuous ⇒ differentiable", "Corners are discontinuous"], answer: 1, solution: [r`If you can find a slope, the curve is unbroken there. The reverse fails at corners.`] },
        { id: "u10l3q5", type: "mc", level: 2, prompt: r`$f(x) = \sqrt[3]{x}$ at $x = 0$ has…`, choices: ["a corner", "a vertical tangent", "a hole", "slope 0"], answer: 1, solution: [r`The curve is vertical there; slope is infinite, so $f'(0)$ doesn't exist.`] },
        { id: "u10l3q6", type: "mc", level: 2, prompt: r`$P(x)$ is profit in dollars from selling $x$ shirts and $P'(100) = 4.5$. Meaning?`, choices: ["You've made \\$4.50 at 100 shirts", "Selling the 100th shirt costs \\$4.50", "Around 100 shirts, each extra shirt adds about \\$4.50 of profit", "Profit is 100 when x = 4.5"], answer: 2, solution: [r`Rate: about \\$4.50 more profit per extra shirt near $x = 100$.`] },
      ],
    },
  ],
};

export const u11: Unit = {
  id: "u11",
  n: 11,
  title: "Derivative Rules",
  emoji: "⚡",
  biome: "mesa",
  when: "Weeks 6–7",
  exam: 2,
  summary: "The slope toolbox: power, constant, sum, exponentials, logs, product and quotient rules. Fast derivatives forever.",
  lessons: [
    {
      id: "u11l1",
      title: "Power, constant & sum rules",
      emoji: "⚡",
      minutes: 12,
      tldr: "Bring the power down, subtract one. Constants disappear. Do each term separately. Rewrite roots and fractions as powers FIRST.",
      gens: ["power", "derivat"],
      blocks: [
        { k: "eli5", body: r`The power rule is a **magic trick** 🎩: the exponent jumps down in front, and then the exponent drops by 1.

$x^5 \to 5x^4$. That's it. That's the trick.` },
        {
          k: "table",
          title: "The slope toolbox (part 1)",
          head: ["Rule", "Formula", "Example"],
          rows: [
            ["Constant", "$\\frac{d}{dx}c = 0$", "$\\frac{d}{dx}7 = 0$"],
            ["Power", "$\\frac{d}{dx}x^n = nx^{n-1}$", "$\\frac{d}{dx}x^5 = 5x^4$"],
            ["Constant multiple", "$\\frac{d}{dx}[cf] = cf'$", "$\\frac{d}{dx}4x^3 = 12x^2$"],
            ["Sum / difference", "$(f\\pm g)' = f' \\pm g'$", "term by term"],
          ],
        },
        {
          k: "steps",
          title: "Rewrite first! (exam sheet)",
          steps: [r`Roots → fractional powers: $\sqrt x = x^{1/2}$, $\sqrt[3]{x^2} = x^{2/3}$.`, r`Fractions → negative powers: $\dfrac{1}{x^4} = x^{-4}$, $\dfrac{3}{x} = 3x^{-1}$.`, r`Split fractions with one term on the bottom: $\dfrac{x^2 + 1}{x} = x + x^{-1}$.`, r`NOW use the power rule on each term.`],
        },
        {
          k: "example",
          title: "Mixed bag",
          problem: r`Differentiate $f(x) = 4x^3 - 5\sqrt{x} + \dfrac{2}{x^4} - 9$.`,
          steps: [r`Rewrite: $4x^3 - 5x^{1/2} + 2x^{-4} - 9$.`, r`Term by term: $12x^2 - \frac52 x^{-1/2} - 8x^{-5} - 0$.`, r`Pretty form: $12x^2 - \dfrac{5}{2\sqrt x} - \dfrac{8}{x^5}$.`],
          answer: r`$f'(x) = 12x^2 - \dfrac{5}{2\sqrt x} - \dfrac{8}{x^5}$`,
        },
        { k: "tip", body: r`**At $x = a$, $f'(a)$ is a NUMBER**, found by substituting $a$ into the derivative formula. Differentiate first, plug in second. Never the other way around (plugging in first gives a constant, whose derivative is 0!).` },
      ],
      questions: [
        { id: "u11l1q1", type: "expr", level: 1, prompt: r`$\frac{d}{dx}\left(x^7\right) = ?$`, answer: "7x^6", verify: { kind: "derivative", f: "x^7" }, solution: [r`$7x^6$`] },
        { id: "u11l1q2", type: "expr", level: 1, prompt: r`Differentiate $f(x) = 3x^4 - 2x^2 + 6x - 1$.`, answer: "12x^3-4x+6", verify: { kind: "derivative", f: "3x^4-2x^2+6x-1" }, solution: [r`$12x^3 - 4x + 6$`] },
        { id: "u11l1q3", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \dfrac{1}{x^4}$.`, answer: "-4/x^5", domain: [0.5, 3], verify: { kind: "derivative", f: "1/x^4", domain: [0.5, 3] }, solution: [r`$x^{-4} \to -4x^{-5} = -\frac{4}{x^5}$`] },
        { id: "u11l1q4", type: "expr", level: 2, prompt: r`Differentiate $f(x) = 6\sqrt{x}$.`, answer: "3/sqrt(x)", domain: [0.5, 4], verify: { kind: "derivative", f: "6sqrt(x)", domain: [0.5, 4] }, solution: [r`$6x^{1/2} \to 3x^{-1/2} = \frac{3}{\sqrt x}$`] },
        { id: "u11l1q5", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \sqrt[3]{x^2}$.`, answer: "(2/3)x^(-1/3)", domain: [0.5, 4], verify: { kind: "derivative", f: "x^(2/3)", domain: [0.5, 4] }, solution: [r`$x^{2/3} \to \frac23x^{-1/3}$`] },
        { id: "u11l1q6", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \dfrac{x^3 + 4x}{x}$ (simplify first!).`, answer: "2x", domain: [0.5, 3], verify: { kind: "derivative", f: "(x^3+4x)/x", domain: [0.5, 3] }, solution: [r`$\frac{x^3 + 4x}{x} = x^2 + 4$`, r`Derivative: $2x$`] },
        { id: "u11l1q7", type: "num", level: 1, prompt: r`$f(x) = x^3 - 6x$. Find $f'(2)$.`, answer: 6, verify: { kind: "derivative", f: "x^3-6x", at: 2 }, solution: [r`$f'(x) = 3x^2 - 6$`, r`$f'(2) = 12 - 6 = 6$`] },
        { id: "u11l1q8", type: "expr", level: 3, prompt: r`Differentiate $f(x) = 4x^3 - 5\sqrt{x} + \dfrac{2}{x^4} - 9$.`, answer: "12x^2-5/(2sqrt(x))-8/x^5", domain: [0.5, 3], verify: { kind: "derivative", f: "4x^3-5sqrt(x)+2/x^4-9", domain: [0.5, 3] }, solution: [r`Rewrite: $4x^3 - 5x^{1/2} + 2x^{-4} - 9$`, r`$12x^2 - \frac52x^{-1/2} - 8x^{-5}$`] },
        { id: "u11l1q9", type: "num", level: 2, prompt: r`$f(x) = \dfrac{8}{\sqrt x}$. Find $f'(4)$.`, answer: -0.5, verify: { kind: "derivative", f: "8/sqrt(x)", at: 4 }, solution: [r`$8x^{-1/2} \to -4x^{-3/2}$`, r`$-4(4)^{-3/2} = -4\cdot\frac18 = -\frac12$`] },
      ],
    },
    {
      id: "u11l2",
      title: "Exponential & log derivatives",
      emoji: "🌀",
      minutes: 9,
      tldr: "eˣ is its own derivative. (aˣ)′ = aˣ·ln a. (ln x)′ = 1/x.",
      blocks: [
        { k: "eli5", body: r`$e^x$ is the **only** function (besides 0) that is its own slope 🪞. Its height and its steepness are always the same number. That's why $e$ is the "natural" base.` },
        {
          k: "table",
          title: "The slope toolbox (part 2)",
          head: ["Function", "Derivative"],
          rows: [["$e^x$", "$e^x$"], ["$a^x$", "$a^x\\ln a$"], ["$\\ln x$", "$\\dfrac1x$"], ["$\\log_a x$", "$\\dfrac{1}{x\\ln a}$"]],
        },
        { k: "example", title: "Quick ones", problem: r`Differentiate (a) $5e^x - x^2$ (b) $2^x$ (c) $3\ln x + \ln 7$.`, steps: [r`(a) $5e^x - 2x$`, r`(b) $2^x \ln 2$`, r`(c) $\frac3x + 0$ (since $\ln 7$ is a constant!)`], answer: r`$5e^x - 2x$, $\ 2^x\ln 2$, $\ \frac{3}{x}$` },
        { k: "trap", body: r`$\frac{d}{dx}x^e = ex^{e-1}$ (power rule: $e$ is a constant exponent). $\frac{d}{dx}e^x = e^x$ (exponential). $\frac{d}{dx}e^5 = 0$ (it's just a number!). Three different things.` },
      ],
      questions: [
        { id: "u11l2q1", type: "expr", level: 1, prompt: r`Differentiate $f(x) = 5e^x - x^2$.`, answer: "5e^x-2x", verify: { kind: "derivative", f: "5e^x-x^2" }, solution: [r`$5e^x - 2x$`] },
        { id: "u11l2q2", type: "expr", level: 1, prompt: r`Differentiate $f(x) = 3\ln x + \ln 7$.`, answer: "3/x", domain: [0.5, 4], verify: { kind: "derivative", f: "3ln(x)+ln(7)", domain: [0.5, 4] }, solution: [r`$\frac3x$; $\ln 7$ is a constant.`] },
        { id: "u11l2q3", type: "expr", level: 2, prompt: r`Differentiate $f(x) = 2^x$.`, answer: "2^x*ln(2)", verify: { kind: "derivative", f: "2^x" }, solution: [r`$2^x\ln 2$`] },
        { id: "u11l2q4", type: "num", level: 2, prompt: r`$f(x) = e^x + \ln x$. Find $f'(1)$. (decimal ok)`, answer: Math.E + 1, tol: 2e-3, verify: { kind: "derivative", f: "e^x+ln(x)", at: 1 }, solution: [r`$f'(x) = e^x + \frac1x$`, r`$f'(1) = e + 1 \approx 3.718$`] },
        { id: "u11l2q5", type: "num", level: 1, prompt: r`$\frac{d}{dx}\left(e^5\right) = ?$`, answer: 0, solution: [r`$e^5$ is a constant (≈ 148.4). Derivative 0.`] },
        { id: "u11l2q6", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \log_{10} x$.`, answer: "1/(x*ln(10))", domain: [0.5, 4], verify: { kind: "derivative", f: "log(x)", domain: [0.5, 4] }, solution: [r`$\frac{1}{x\ln 10}$`] },
      ],
    },
    {
      id: "u11l3",
      title: "Product & quotient rules",
      emoji: "✖️",
      minutes: 14,
      tldr: "(uv)′ = u′v + uv′. (u/v)′ = (u′v − uv′)/v²: 'low d-high minus high d-low, over the square of what's below.'",
      gens: ["product", "quotient"],
      blocks: [
        { k: "eli5", body: r`You can NOT just multiply the derivatives. 🚫 $(x^2 \cdot x^3)' \ne 2x \cdot 3x^2$. Check: $x^5$ has derivative $5x^4$, not $6x^3$.

Instead: **take turns.** Derivative of the first × the second, PLUS the first × derivative of the second.` },
        { k: "formula", title: "Product rule", tex: r`(uv)' = u'v + uv'` },
        { k: "formula", title: "Quotient rule", tex: r`\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^2}`, note: "Rhyme: low d-high minus high d-low, over the square of what's below. The order on top MATTERS (it's a minus)." },
        {
          k: "example",
          title: "Product",
          problem: r`Differentiate $f(x) = x^3 e^x$.`,
          steps: [r`$u = x^3$, $u' = 3x^2$. $v = e^x$, $v' = e^x$.`, r`$f' = 3x^2e^x + x^3e^x$`, r`Factor: $x^2e^x(3 + x)$.`],
          answer: r`$f'(x) = x^2e^x(x + 3)$`,
        },
        {
          k: "example",
          title: "Quotient",
          problem: r`Differentiate $f(x) = \dfrac{2x + 1}{x - 3}$.`,
          steps: [r`$u = 2x + 1$, $u' = 2$. $v = x - 3$, $v' = 1$.`, r`$\dfrac{2(x - 3) - (2x + 1)(1)}{(x-3)^2}$`, r`Top: $2x - 6 - 2x - 1 = -7$.`],
          answer: r`$f'(x) = \dfrac{-7}{(x-3)^2}$`,
        },
        { k: "tip", body: r`Before using the quotient rule, check: is the bottom just a single term like $x^2$ or $\sqrt x$? Then split the fraction and use the power rule instead. Way faster, fewer mistakes.` },
      ],
      questions: [
        { id: "u11l3q1", type: "expr", level: 2, prompt: r`Differentiate $f(x) = x^3e^x$.`, answer: "3x^2e^x+x^3e^x", verify: { kind: "derivative", f: "x^3e^x" }, solution: [r`$3x^2e^x + x^3e^x$`] },
        { id: "u11l3q2", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \dfrac{2x+1}{x-3}$.`, answer: "-7/(x-3)^2", verify: { kind: "derivative", f: "(2x+1)/(x-3)" }, solution: [r`$\frac{2(x-3) - (2x+1)}{(x-3)^2} = \frac{-7}{(x-3)^2}$`] },
        { id: "u11l3q3", type: "expr", level: 2, prompt: r`Differentiate $f(x) = x\ln x$.`, answer: "ln(x)+1", domain: [0.5, 4], verify: { kind: "derivative", f: "x*ln(x)", domain: [0.5, 4] }, solution: [r`$1\cdot\ln x + x\cdot\frac1x = \ln x + 1$`] },
        { id: "u11l3q4", type: "expr", level: 2, prompt: r`Differentiate $f(x) = \dfrac{e^x}{x}$.`, answer: "(x*e^x-e^x)/x^2", domain: [0.5, 3], verify: { kind: "derivative", f: "e^x/x", domain: [0.5, 3] }, solution: [r`$\frac{e^x\cdot x - e^x\cdot 1}{x^2} = \frac{e^x(x-1)}{x^2}$`] },
        { id: "u11l3q5", type: "num", level: 2, prompt: r`$f(x) = (x^2 + 1)(x - 2)$. Find $f'(1)$.`, answer: 0, verify: { kind: "derivative", f: "(x^2+1)(x-2)", at: 1 }, solution: [r`$f' = 2x(x - 2) + (x^2 + 1)$`, r`$f'(1) = 2(-1) + 2 = 0$`] },
        { id: "u11l3q6", type: "num", level: 3, exam: true, prompt: r`$f(2) = 3$, $f'(2) = -1$, $g(2) = 4$, $g'(2) = 5$. Find $(fg)'(2)$.`, answer: 11, solution: [r`$f'g + fg' = (-1)(4) + (3)(5) = -4 + 15 = 11$`] },
        { id: "u11l3q7", type: "num", level: 3, exam: true, prompt: r`$f(2) = 3$, $f'(2) = -1$, $g(2) = 4$, $g'(2) = 5$. Find $\left(\dfrac fg\right)'(2)$.`, answer: -19 / 16, solution: [r`$\frac{f'g - fg'}{g^2} = \frac{(-1)(4) - (3)(5)}{16} = \frac{-19}{16}$`] },
        { id: "u11l3q8", type: "expr", level: 3, prompt: r`Differentiate $f(x) = \dfrac{x^2}{x^2 + 1}$.`, answer: "2x/(x^2+1)^2", verify: { kind: "derivative", f: "x^2/(x^2+1)" }, solution: [r`$\frac{2x(x^2+1) - x^2(2x)}{(x^2+1)^2} = \frac{2x}{(x^2+1)^2}$`] },
      ],
    },
  ],
};

export const u12: Unit = {
  id: "u12",
  n: 12,
  title: "Chain Rule, Trig & Implicit",
  emoji: "⛓️",
  biome: "jungle",
  when: "After Exam 2",
  exam: 3,
  summary: "Derivatives of functions inside functions, sine and cosine, and curves that aren't y = f(x).",
  lessons: [
    {
      id: "u12l1",
      title: "The chain rule",
      emoji: "⛓️",
      minutes: 14,
      tldr: "Derivative of the outside (leave the inside alone) × derivative of the inside.",
      gens: ["chain"],
      blocks: [
        { k: "eli5", body: r`Gears ⚙️⚙️. Gear A turns gear B 3 times per turn; gear B turns gear C 2 times per turn. How fast does C turn per turn of A? $3 \times 2 = 6$. **Rates multiply along a chain.**

For $f(g(x))$: the outside's rate times the inside's rate.` },
        { k: "formula", title: "Chain rule", tex: r`\frac{d}{dx}f\big(g(x)\big) = f'\big(g(x)\big)\cdot g'(x) \qquad \frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}` },
        {
          k: "steps",
          title: "Recipe: outside-inside",
          steps: [r`Spot the **inside** $u$ (what you'd compute first) and the **outside** shape.`, r`Differentiate the outside as if $u$ were just $x$. **Keep $u$ inside unchanged.**`, r`Multiply by $u'$.`, r`Nested more than twice? Keep peeling layers like an onion 🧅.`],
        },
        {
          k: "table",
          title: "Chain-rule versions of the toolbox",
          head: ["Function", "Derivative"],
          rows: [["$u^n$", "$nu^{n-1}\\,u'$"], ["$e^u$", "$e^u\\,u'$"], ["$\\ln u$", "$\\dfrac{u'}{u}$"], ["$\\sqrt u$", "$\\dfrac{u'}{2\\sqrt u}$"], ["$\\sin u$", "$\\cos u\\;u'$"]],
        },
        {
          k: "example",
          title: "Three quick chains",
          problem: r`Differentiate (a) $(3x^2 + 1)^5$ (b) $e^{4x}$ (c) $\ln(x^2 + 9)$.`,
          steps: [r`(a) $5(3x^2+1)^4\cdot 6x = 30x(3x^2+1)^4$`, r`(b) $e^{4x}\cdot 4 = 4e^{4x}$`, r`(c) $\dfrac{2x}{x^2+9}$`],
          answer: r`$30x(3x^2+1)^4,\quad 4e^{4x},\quad \frac{2x}{x^2+9}$`,
        },
        { k: "trap", body: r`Most common mistake in all of Calc 1: **forgetting to multiply by the inside's derivative.** $\frac{d}{dx}e^{4x}$ is NOT $e^{4x}$.` },
      ],
      questions: [
        { id: "u12l1q1", type: "expr", level: 2, prompt: r`Differentiate $(3x^2 + 1)^5$.`, answer: "30x(3x^2+1)^4", domain: [-1, 1], verify: { kind: "derivative", f: "(3x^2+1)^5", domain: [-1, 1] }, solution: [r`$5(3x^2+1)^4\cdot 6x$`] },
        { id: "u12l1q2", type: "expr", level: 1, prompt: r`Differentiate $e^{4x}$.`, answer: "4e^(4x)", domain: [-1, 1], verify: { kind: "derivative", f: "e^(4x)", domain: [-1, 1] }, solution: [r`$4e^{4x}$`] },
        { id: "u12l1q3", type: "expr", level: 2, prompt: r`Differentiate $\ln(x^2 + 9)$.`, answer: "2x/(x^2+9)", verify: { kind: "derivative", f: "ln(x^2+9)" }, solution: [r`$\frac{2x}{x^2+9}$`] },
        { id: "u12l1q4", type: "expr", level: 2, prompt: r`Differentiate $\sqrt{x^2 + 16}$.`, answer: "x/sqrt(x^2+16)", verify: { kind: "derivative", f: "sqrt(x^2+16)" }, solution: [r`$\frac{2x}{2\sqrt{x^2+16}} = \frac{x}{\sqrt{x^2+16}}$`, r`At $x = 3$: $\frac35$. Same as the limit-definition answer! ✓`] },
        { id: "u12l1q5", type: "expr", level: 3, prompt: r`Differentiate $e^{x^2}\cdot x$ (product AND chain).`, answer: "e^(x^2)+2x^2e^(x^2)", domain: [-1, 1], verify: { kind: "derivative", f: "x*e^(x^2)", domain: [-1, 1] }, solution: [r`$u = x$, $v = e^{x^2}$, $v' = 2xe^{x^2}$`, r`$e^{x^2} + 2x^2e^{x^2}$`] },
        { id: "u12l1q6", type: "num", level: 3, exam: true, prompt: r`$f(1) = 2$, $f'(1) = 3$, $g(0) = 1$, $g'(0) = -4$. Find $(f\circ g)'(0)$.`, answer: -12, solution: [r`$(f\circ g)'(0) = f'(g(0))\cdot g'(0) = f'(1)\cdot(-4) = 3(-4) = -12$`] },
        { id: "u12l1q7", type: "expr", level: 3, prompt: r`Differentiate $\left(\ln x\right)^3$.`, answer: "3ln(x)^2/x", domain: [0.5, 4], verify: { kind: "derivative", f: "ln(x)^3", domain: [0.5, 4] }, solution: [r`$3(\ln x)^2\cdot\frac1x$`] },
      ],
    },
    {
      id: "u12l2",
      title: "Trig derivatives",
      emoji: "🌊",
      minutes: 10,
      tldr: "sin′ = cos, cos′ = −sin, tan′ = sec². Always in RADIANS.",
      blocks: [
        { k: "eli5", body: r`Sine is a wave 🌊. Its slope is biggest where the wave crosses the middle, and zero at the peaks. That slope pattern is… another wave: cosine! So $\frac{d}{dx}\sin x = \cos x$.` },
        { k: "tool", tool: "unitcircle", caption: "sin and cos as the y and x of a point spinning around a circle." },
        {
          k: "table",
          title: "Trig toolbox",
          head: ["$f$", "$f'$"],
          rows: [["$\\sin x$", "$\\cos x$"], ["$\\cos x$", "$-\\sin x$"], ["$\\tan x$", "$\\sec^2 x$"], ["$\\sec x$", "$\\sec x\\tan x$"], ["$\\csc x$", "$-\\csc x\\cot x$"], ["$\\cot x$", "$-\\csc^2 x$"]],
        },
        { k: "tip", body: r`Memory hack: every **co**-function (**co**s, **co**t, **co**sec) gets a **minus** sign in its derivative.` },
        { k: "formula", title: "The special limit behind it all", tex: r`\lim_{x\to0}\frac{\sin x}{x} = 1 \qquad \lim_{x\to0}\frac{1 - \cos x}{x} = 0` },
      ],
      questions: [
        { id: "u12l2q1", type: "expr", level: 1, prompt: r`Differentiate $3\sin x - 2\cos x$.`, answer: "3cos(x)+2sin(x)", verify: { kind: "derivative", f: "3sin(x)-2cos(x)" }, solution: [r`$3\cos x + 2\sin x$`] },
        { id: "u12l2q2", type: "expr", level: 2, prompt: r`Differentiate $\sin(5x)$.`, answer: "5cos(5x)", verify: { kind: "derivative", f: "sin(5x)" }, solution: [r`Chain: $\cos(5x)\cdot 5$`] },
        { id: "u12l2q3", type: "expr", level: 2, prompt: r`Differentiate $x^2\cos x$.`, answer: "2x*cos(x)-x^2*sin(x)", verify: { kind: "derivative", f: "x^2cos(x)" }, solution: [r`$2x\cos x - x^2\sin x$`] },
        { id: "u12l2q4", type: "num", level: 1, prompt: r`$\displaystyle\lim_{x\to0}\frac{\sin x}{x} = ?$`, answer: 1, verify: { kind: "limit", f: "sin(x)/x", a: 0 }, solution: [r`The famous limit: 1.`] },
        { id: "u12l2q5", type: "num", level: 2, prompt: r`$f(x) = \tan x$. Find $f'(0)$.`, answer: 1, verify: { kind: "derivative", f: "tan(x)", at: 0 }, solution: [r`$\sec^2 0 = 1$`] },
        { id: "u12l2q6", type: "expr", level: 3, prompt: r`Differentiate $\sin^2 x$.`, answer: "2sin(x)cos(x)", verify: { kind: "derivative", f: "sin(x)^2" }, solution: [r`$\sin^2 x = (\sin x)^2$. Chain: $2\sin x\cos x$ (which also equals $\sin 2x$).`] },
      ],
    },
    {
      id: "u12l3",
      title: "Implicit differentiation",
      emoji: "🕸️",
      minutes: 12,
      tldr: "Differentiate both sides with respect to x. Every time you differentiate something with y, multiply by dy/dx. Then solve for dy/dx.",
      gens: ["implicit"],
      blocks: [
        { k: "eli5", body: r`Some curves are tangled up 🕸️: $x^2 + y^2 = 25$ is a circle, and you can't write it as one $y = f(x)$. No problem: just pretend $y$ is a secret function of $x$, and every time you differentiate a $y$, the chain rule tags on a $\frac{dy}{dx}$.` },
        {
          k: "steps",
          title: "Recipe",
          steps: [r`Differentiate **both sides** with respect to $x$.`, r`$x$ terms: normal. $y$ terms: normal, then **× $\frac{dy}{dx}$**. Mixed terms like $xy$: product rule.`, r`Move every $\frac{dy}{dx}$ term to one side, everything else to the other.`, r`Factor out $\frac{dy}{dx}$ and divide.`],
        },
        {
          k: "example",
          title: "Circle",
          problem: r`Find $\frac{dy}{dx}$ for $x^2 + y^2 = 25$, and the slope at $(3, 4)$.`,
          steps: [r`$2x + 2y\frac{dy}{dx} = 0$`, r`$\frac{dy}{dx} = -\frac{x}{y}$`, r`At $(3, 4)$: $-\frac34$.`],
          answer: r`$\frac{dy}{dx} = -\frac{x}{y}$; slope $-\frac34$ at $(3,4)$.`,
        },
        {
          k: "example",
          title: "With a product",
          problem: r`Find $\frac{dy}{dx}$ for $x^2 + xy + y^3 = 7$.`,
          steps: [r`$2x + \left(y + x\frac{dy}{dx}\right) + 3y^2\frac{dy}{dx} = 0$`, r`$\frac{dy}{dx}(x + 3y^2) = -2x - y$`],
          answer: r`$\dfrac{dy}{dx} = \dfrac{-2x - y}{x + 3y^2}$`,
        },
        { k: "idea", title: "Bonus: inverse functions", body: r`If $g = f^{-1}$, then $g'(b) = \dfrac{1}{f'(a)}$ where $f(a) = b$. E.g. $\frac{d}{dx}\ln x = \frac{1}{x}$ comes from $e^y = x \Rightarrow e^y y' = 1 \Rightarrow y' = \frac{1}{e^y} = \frac1x$.` },
      ],
      questions: [
        { id: "u12l3q1", type: "num", level: 2, prompt: r`Slope of $x^2 + y^2 = 25$ at $(3, 4)$?`, answer: -0.75, solution: [r`$-\frac{x}{y} = -\frac34$`] },
        { id: "u12l3q2", type: "num", level: 2, prompt: r`Slope of $x^2 + y^2 = 169$ at $(5, -12)$?`, answer: 5 / 12, solution: [r`$-\frac{5}{-12} = \frac{5}{12}$`] },
        { id: "u12l3q3", type: "num", level: 3, prompt: r`For $x^2 + xy + y^3 = 7$, find $\frac{dy}{dx}$ at $(2, 1)$. (Check: $4 + 2 + 1 = 7$ ✓)`, answer: -1, solution: [r`$\frac{dy}{dx} = \frac{-2x - y}{x + 3y^2} = \frac{-4 - 1}{2 + 3} = -1$`] },
        { id: "u12l3q4", type: "num", level: 3, prompt: r`For $xy = 12$, find $\frac{dy}{dx}$ at $(3, 4)$.`, answer: -4 / 3, solution: [r`$y + x\frac{dy}{dx} = 0 \Rightarrow \frac{dy}{dx} = -\frac yx = -\frac43$`] },
        { id: "u12l3q5", type: "mc", level: 2, prompt: r`$\frac{d}{dx}\left(y^3\right) = ?$`, choices: [r`$3y^2$`, r`$3y^2\frac{dy}{dx}$`, r`$3x^2$`, r`$y^3\frac{dy}{dx}$`], answer: 1, solution: [r`Chain rule: $3y^2\cdot\frac{dy}{dx}$.`] },
      ],
    },
  ],
};

export const u13: Unit = {
  id: "u13",
  n: 13,
  title: "Shape of a Graph",
  emoji: "🎢",
  biome: "mushroom",
  when: "Week 7",
  exam: 2,
  summary: "Increasing/decreasing with f′, concavity and inflection with f″, sign charts, and reading graphs of f′.",
  lessons: [
    {
      id: "u13l1",
      title: "Increasing, decreasing & sign charts",
      emoji: "↗️",
      minutes: 14,
      tldr: "f′ > 0 → f goes UP. f′ < 0 → f goes DOWN. Find where f′ = 0 or undefined, then sign-chart f′.",
      gens: ["increasing"],
      blocks: [
        { k: "eli5", body: r`Walk along the graph left to right 🚶. Is the ground going uphill or downhill under your feet? That's the sign of $f'$.

**Uphill** ↗️ = $f' > 0$ = increasing. **Downhill** ↘️ = $f' < 0$ = decreasing. **Flat for a moment** = $f' = 0$ = possible peak or valley.` },
        { k: "formula", title: "The test", tex: r`f' > 0 \Rightarrow f \nearrow \qquad f' < 0 \Rightarrow f \searrow` },
        {
          k: "steps",
          title: "Sign-chart recipe (exam sheet)",
          steps: [
            r`Differentiate to find $f'$.`,
            r`Set $f' = 0$; also find where $f'$ is **undefined** (respecting the domain). These are **critical numbers**.`,
            r`Put them in order on a number line.`,
            r`Pick a test $x$ in EACH interval and find whether $f'$ is $+$ or $-$.`,
            r`Report increasing/decreasing in **interval notation**.`,
          ],
        },
        {
          k: "idea",
          title: "First derivative test: max or min?",
          body: r`At a critical number $c$:

- $f'$ goes $+ \to -$: **local max** ⛰️
- $f'$ goes $- \to +$: **local min** 🏞️
- no sign change: **neither** (like $x^3$ at 0)

**Important (exam sheet):** $f' = 0$ does **not** automatically mean a max/min!`,
        },
        {
          k: "example",
          title: "Full example",
          problem: r`Where is $f(x) = x^3 - 3x^2 - 9x + 5$ increasing/decreasing? Classify critical points.`,
          steps: [
            r`$f'(x) = 3x^2 - 6x - 9 = 3(x^2 - 2x - 3) = 3(x - 3)(x + 1)$.`,
            r`Critical numbers: $-1, 3$.`,
            r`Test $x = -2$: $3(-5)(-1) > 0$. Test $x = 0$: $3(-3)(1) < 0$. Test $x = 4$: $3(1)(5) > 0$.`,
            r`$+$ then $-$ then $+$.`,
          ],
          answer: r`Increasing on $(-\infty, -1) \cup (3, \infty)$, decreasing on $(-1, 3)$. Local max at $x = -1$, local min at $x = 3$.`,
        },
        { k: "tool", tool: "derivative", props: { f: "x^3 - 3x^2 - 9x + 5", view: { xmin: -4, xmax: 6, ymin: -30, ymax: 20 } }, caption: "Green = increasing, red = decreasing. Compare with the sign chart." },
        { k: "tip", title: "Factored sign trick (exam sheet)", body: r`**Odd multiplicity flips the sign** when crossing a root; **even multiplicity does not.** A fractional power in a denominator may make $f'$ undefined at zero: inspect both sides.` },
        { k: "trap", body: r`**Test signs of $f'$, not signs of $f$!** (Exam sheet.) Whether the graph is above the x-axis has nothing to do with whether it's going up.` },
      ],
      questions: [
        { id: "u13l1q1", type: "interval", level: 2, exam: true, prompt: r`Where is $f(x) = x^3 - 3x^2 - 9x + 5$ increasing?`, answer: "(-inf,-1)U(3,inf)", solution: [r`$f' = 3(x - 3)(x + 1)$`, r`$+$ on $(-\infty,-1)$ and $(3, \infty)$`] },
        { id: "u13l1q2", type: "interval", level: 2, exam: true, prompt: r`$f(x) = x^3 - 3x^2 - 9x + 5$. Where is $f$ decreasing?`, answer: "(-1,3)", solution: [r`$f' < 0$ between the critical numbers.`] },
        { id: "u13l1q3", type: "num", level: 2, prompt: r`$f(x) = x^3 - 3x^2 - 9x + 5$. At what $x$ does $f$ have a local MAX?`, answer: -1, solution: [r`$f'$ changes $+ \to -$ at $x = -1$.`] },
        { id: "u13l1q4", type: "list", level: 1, prompt: r`Find the critical numbers of $f(x) = x^4 - 8x^2$.`, answer: [-2, 0, 2], solution: [r`$f' = 4x^3 - 16x = 4x(x-2)(x+2)$`, r`$x = -2, 0, 2$`] },
        { id: "u13l1q5", type: "mc", level: 2, prompt: r`$f(x) = x^3$. At $x = 0$, $f'(0) = 0$. What is there?`, choices: ["Local max", "Local min", "Neither", "A corner"], answer: 2, solution: [r`$f' = 3x^2 \ge 0$ on both sides: no sign change. Neither.`] },
        { id: "u13l1q6", type: "interval", level: 3, prompt: r`Where is $f(x) = xe^{-x}$ increasing?`, answer: "(-inf,1)", hints: [r`$f' = e^{-x} - xe^{-x} = e^{-x}(1 - x)$, and $e^{-x} > 0$ always.`], solution: [r`$f'(x) = e^{-x}(1 - x)$`, r`$> 0$ when $x < 1$.`] },
        { id: "u13l1q7", type: "interval", level: 3, exam: true, prompt: r`Where is $f(x) = x^{2/3}(x - 5)$ decreasing? (Careful: $f'$ is undefined at 0.)`, answer: "(0,2)", hints: [r`$f(x) = x^{5/3} - 5x^{2/3}$, so $f' = \frac53x^{2/3} - \frac{10}{3}x^{-1/3} = \frac{5(x - 2)}{3x^{1/3}}$.`], solution: [r`$f'(x) = \frac{5(x-2)}{3\sqrt[3]{x}}$`, r`Critical numbers: $0$ (undefined) and $2$ (zero).`, r`Test $-1$: $\frac{(-)}{(-)} > 0$. Test $1$: $\frac{(-)}{(+)} < 0$. Test $3$: $> 0$.`, r`Decreasing on $(0, 2)$.`] },
      ],
    },
    {
      id: "u13l2",
      title: "Concavity & inflection points",
      emoji: "😊",
      minutes: 14,
      tldr: "f″ > 0 → concave UP (smile, holds water ∪). f″ < 0 → concave DOWN (frown ∩). Inflection = where concavity CHANGES.",
      gens: ["inflection"],
      blocks: [
        { k: "eli5", body: r`Concave **up** looks like a **smile** 😊 or a cup ∪ that holds water. Concave **down** looks like a **frown** ☹️ or a cap ∩ that spills water.

The **inflection point** is where the smile turns into a frown (or back). Like the moment a roller coaster stops curving one way and starts curving the other.` },
        { k: "formula", title: "Second derivative test for concavity", tex: r`f'' > 0 \Rightarrow \cup \text{ (concave up)} \qquad f'' < 0 \Rightarrow \cap \text{ (concave down)}` },
        {
          k: "example",
          title: "Actual February 2026 exam",
          problem: r`$f(x) = x^4 - 6x^3 + 8x - 4$. Find intervals of concavity and the inflection x-values.`,
          steps: [
            r`$f'(x) = 4x^3 - 18x^2 + 8$`,
            r`$f''(x) = 12x^2 - 36x = 12x(x - 3)$`,
            r`$f'' = 0$ at $x = 0$ and $x = 3$.`,
            r`Signs: test $-1$: $12(-1)(-4) > 0$. Test $1$: $12(1)(-2) < 0$. Test $4$: $12(4)(1) > 0$.`,
            r`$+$ on $(-\infty, 0)$, $-$ on $(0, 3)$, $+$ on $(3, \infty)$.`,
          ],
          answer: r`Concave up on $(-\infty, 0) \cup (3, \infty)$, concave down on $(0, 3)$. Inflection x-values: 0 and 3.`,
        },
        { k: "tool", tool: "derivative", props: { f: "x^4 - 6x^3 + 8x - 4", mode: "second" }, caption: "The exam function, colored by concavity." },
        { k: "idea", title: "Second derivative test for max/min", body: r`At a critical number $c$ with $f'(c) = 0$:

- $f''(c) > 0$ → **local min** (smile at the bottom)
- $f''(c) < 0$ → **local max** (frown at the top)
- $f''(c) = 0$ → test fails; use the first derivative test.` },
        { k: "trap", body: r`**An inflection point requires concavity to CHANGE sign.** $f'' = 0$ alone isn't enough: $x^4$ has $f''(0) = 0$ but it's a smile on both sides. And a discontinuity may prevent an inflection point. (Exam sheet.)` },
      ],
      questions: [
        { id: "u13l2q1", type: "interval", level: 2, exam: true, prompt: r`(Feb 2026) $f(x) = x^4 - 6x^3 + 8x - 4$. Where is $f$ concave UP?`, answer: "(-inf,0)U(3,inf)", solution: [r`$f'' = 12x(x - 3) > 0$ outside $[0, 3]$.`] },
        { id: "u13l2q2", type: "interval", level: 2, exam: true, prompt: r`(Feb 2026) $f(x) = x^4 - 6x^3 + 8x - 4$. Where is $f$ concave DOWN?`, answer: "(0,3)", solution: [r`$f'' < 0$ between 0 and 3.`] },
        { id: "u13l2q3", type: "list", level: 2, exam: true, prompt: r`(Feb 2026) $f(x) = x^4 - 6x^3 + 8x - 4$. List the inflection x-values.`, answer: [0, 3], solution: [r`$f''$ changes sign at both 0 and 3.`] },
        { id: "u13l2q4", type: "expr", level: 1, prompt: r`Find $f''(x)$ for $f(x) = x^4 - 6x^3 + 8x - 4$.`, answer: "12x^2-36x", solution: [r`$f' = 4x^3 - 18x^2 + 8$`, r`$f'' = 12x^2 - 36x$`] },
        { id: "u13l2q5", type: "mc", level: 2, prompt: r`$f(x) = x^4$. Is $x = 0$ an inflection point?`, choices: ["Yes, f″(0) = 0", "No: f″ doesn't change sign", "Yes: it's a minimum", "Can't tell"], answer: 1, solution: [r`$f'' = 12x^2 \ge 0$ both sides. Concave up the whole time. Not an inflection point.`] },
        { id: "u13l2q6", type: "mc", level: 2, prompt: r`$f'(2) = 0$ and $f''(2) = -5$. At $x = 2$, $f$ has…`, choices: ["a local min", "a local max", "an inflection point", "no information"], answer: 1, solution: [r`Flat and frowning: local max.`] },
        { id: "u13l2q7", type: "num", level: 2, prompt: r`Find the inflection x-value of $f(x) = x^3 - 6x^2 + 5$.`, answer: 2, solution: [r`$f'' = 6x - 12 = 0 \Rightarrow x = 2$`, r`Sign changes from $-$ to $+$ ✓`] },
        { id: "u13l2q8", type: "interval", level: 3, prompt: r`Where is $f(x) = \ln(x^2 + 1)$ concave up?`, answer: "(-1,1)", hints: [r`$f' = \frac{2x}{x^2+1}$. Quotient rule again for $f''$.`], solution: [r`$f'' = \frac{2(x^2+1) - 2x\cdot2x}{(x^2+1)^2} = \frac{2(1 - x^2)}{(x^2+1)^2}$`, r`$> 0$ when $x^2 < 1$: $(-1, 1)$.`] },
      ],
    },
    {
      id: "u13l3",
      title: "Reading graphs of f and f′",
      emoji: "👀",
      minutes: 12,
      tldr: "On a graph of f′: ABOVE the axis → f increasing. f′ RISING → f concave up. f′'s turning points → f's inflection points.",
      blocks: [
        { k: "eli5", body: r`A graph of $f'$ is a **report card for $f$'s slope** 📋. Don't read it like a normal graph! Height of $f'$ tells you how steep $f$ is, not how high $f$ is.` },
        {
          k: "table",
          title: "Translation table (exam sheet)",
          head: ["If the graph of f′…", "then f is…"],
          rows: [
            ["is above the x-axis", "increasing"],
            ["is below the x-axis", "decreasing"],
            ["crosses the axis + → −", "at a local max"],
            ["crosses the axis − → +", "at a local min"],
            ["is rising (going up)", "concave up"],
            ["is falling (going down)", "concave down"],
            ["has a peak or valley", "at an inflection point"],
          ],
        },
        {
          k: "idea",
          title: "Reading a graph of f itself",
          body: r`- **Height** gives $f(a)$; the height you **approach** gives the limit.
- **Slope** gives $f'(a)$. A flat line has derivative 0. Straight segment slope $= \frac{y_2 - y_1}{x_2 - x_1}$.
- Open circle = not included; filled dot = the actual value.
- Corners, cusps, jumps, holes and vertical tangents → derivative undefined.
- **Continuity test at $x = a$:** left limit = right limit = $f(a)$.`,
        },
        {
          k: "example",
          title: "February 2026, question 4 (graph of f′)",
          problem: r`The graph of $f'$ is below the axis on $(-4, -3)$ and $(1, 3)$. It rises on $(-4, 0)$ and $(2, 5)$, and falls on $(0, 2)$. Where is $f$ decreasing? Concave up? Inflection x-values?`,
          steps: [r`Decreasing where $f' < 0$: $(-4, -3) \cup (1, 3)$.`, r`Concave up where $f'$ rises: $(-4, 0) \cup (2, 5)$.`, r`Inflection where $f'$ switches rising ↔ falling: $x = 0$ and $x = 2$.`],
          answer: r`Decreasing on $(-4,-3)\cup(1,3)$; concave up on $(-4,0)\cup(2,5)$; inflection at $x = 0, 2$.`,
        },
        { k: "tool", tool: "grapher", props: { fns: ["x^3/3 - x", "", "", ""], showDerivative: true, view: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 } }, caption: "Red = f, purple dashes = f′. Where purple is above 0, red climbs. Where purple bottoms out, red changes concavity." },
      ],
      questions: [
        { id: "u13l3q1", type: "interval", level: 2, exam: true, prompt: r`(Feb 2026 Q4) The graph of $f'$ on $(-4, 5)$ is below the axis on $(-4,-3)$ and $(1,3)$, rises on $(-4, 0)$ and $(2, 5)$, and falls on $(0, 2)$. Where is $f$ decreasing?`, answer: "(-4,-3)U(1,3)", solution: [r`$f$ decreases where $f' < 0$.`] },
        { id: "u13l3q2", type: "interval", level: 2, exam: true, prompt: r`(Feb 2026 Q4) The graph of $f'$ on $(-4, 5)$ is below the axis on $(-4,-3)$ and $(1,3)$, rises on $(-4, 0)$ and $(2, 5)$, and falls on $(0, 2)$. Where is $f$ concave up?`, answer: "(-4,0)U(2,5)", solution: [r`$f'$ rising ⇒ $f'' > 0$ ⇒ concave up.`] },
        { id: "u13l3q3", type: "list", level: 2, exam: true, prompt: r`(Feb 2026 Q4) The graph of $f'$ on $(-4, 5)$ is below the axis on $(-4,-3)$ and $(1,3)$, rises on $(-4, 0)$ and $(2, 5)$, and falls on $(0, 2)$. List the inflection x-values of $f$.`, answer: [0, 2], solution: [r`$f'$ switches between rising and falling at 0 and 2.`] },
        { id: "u13l3q4", type: "mc", level: 2, prompt: r`The graph of $f'$ crosses the x-axis from positive to negative at $x = 1$. Then $f$ has…`, choices: ["a local min at 1", "a local max at 1", "an inflection point at 1", "a zero at 1"], answer: 1, solution: [r`$f$ rises then falls → peak.`] },
        { id: "u13l3q5", type: "mc", level: 1, prompt: r`The graph of $f$ is a straight line through $(1, 2)$ and $(4, 11)$. What is $f'(2)$?`, choices: ["2", "3", "5", "11"], answer: 1, solution: [r`Slope $= \frac{11 - 2}{4 - 1} = 3$, the same everywhere on a line.`] },
        { id: "u13l3q6", type: "mc", level: 2, prompt: r`The graph of $f'$ is a horizontal line at height 4. What does $f$ look like?`, choices: ["A horizontal line at 4", "A line with slope 4", "A parabola", "An exponential"], answer: 1, solution: [r`Constant slope 4 → $f$ is a line with slope 4.`] },
        { id: "u13l3q7", type: "mc", level: 3, prompt: r`The graph of $f'$ is a parabola opening up with vertex at $(2, -1)$. Where is $f$ concave down?`, choices: [r`$(-\infty, 2)$`, r`$(2, \infty)$`, "nowhere", "everywhere"], answer: 0, solution: [r`$f'$ falls to the left of its vertex → $f'' < 0$ there → concave down on $(-\infty, 2)$.`] },
      ],
    },
  ],
};
