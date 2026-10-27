import type { Unit } from "../../types";

const r = String.raw;

export const u03: Unit = {
  id: "u3",
  n: 3,
  title: "New Functions from Old",
  emoji: "🪆",
  biome: "forest",
  when: "Week 2",
  exam: 1,
  summary: "Plug functions into functions, run them backwards (inverses), and shift/stretch/flip graphs.",
  lessons: [
    {
      id: "u3l1",
      title: "Composition f(g(x))",
      emoji: "🪆",
      minutes: 10,
      tldr: "f(g(x)) means: do g FIRST, then feed its answer into f. Inside out, like opening nesting dolls.",
      gens: ["compose"],
      blocks: [
        {
          k: "eli5",
          body: r`Two machines in a row 🏭🏭. Machine $g$ turns wheat into flour. Machine $f$ turns flour into bread.

$f(g(\text{wheat}))$ = bread. You **must** run $g$ first, because $f$ needs flour, not wheat.

That's composition: the output of one machine becomes the input of the next.`,
        },
        { k: "formula", title: "Composition", tex: r`(f \circ g)(x) = f\big(g(x)\big)`, note: r`Read "$f$ of $g$ of $x$". Do the **inside** ($g$) first. Usually $f \circ g \ne g \circ f$!` },
        {
          k: "example",
          title: "Slides, Week 2",
          problem: r`Let $f(x) = x^3$ and $g(x) = \dfrac{2+x}{x-8}$. Find (a) $(f\circ g)(x)$, (b) $(g \circ f)(x)$, (c) $(f\circ g)(3)$, (d) $(g\circ f)(3)$.`,
          steps: [
            r`(a) Put $g$ inside $f$: $f(g(x)) = \left(\dfrac{2+x}{x-8}\right)^3$.`,
            r`(b) Put $f$ inside $g$: replace every $x$ in $g$ with $x^3$: $g(f(x)) = \dfrac{2 + x^3}{x^3 - 8}$.`,
            r`(c) $g(3) = \dfrac{5}{-5} = -1$, then $f(-1) = (-1)^3 = -1$.`,
            r`(d) $f(3) = 27$, then $g(27) = \dfrac{2 + 27}{27 - 8} = \dfrac{29}{19}$.`,
          ],
          answer: r`Different orders, different answers: $(f\circ g)(3) = -1$ but $(g\circ f)(3) = \tfrac{29}{19}$.`,
        },
        {
          k: "example",
          title: "Slides: square root inside",
          problem: r`$f(x) = x^2 + 1$, $g(x) = \sqrt{x + 2}$. Find $(f\circ g)(x)$ and $(g\circ f)(x)$.`,
          steps: [r`$f(g(x)) = \left(\sqrt{x+2}\right)^2 + 1 = x + 2 + 1 = x + 3$ (but only for $x \ge -2$, since $g$ needs that!)`, r`$g(f(x)) = \sqrt{(x^2 + 1) + 2} = \sqrt{x^2 + 3}$`],
          answer: r`$(f\circ g)(x) = x + 3$ for $x \ge -2$; $(g\circ f)(x) = \sqrt{x^2+3}$.`,
        },
        {
          k: "idea",
          title: "Decomposing: find the inside and the outside",
          body: r`Going backwards: write $h(x)$ as $f(g(x))$. Ask: **"What would I type into a calculator first?"** That's the inside $g$.

- $h(x) = \sqrt{x^3 + 2}$: inside $g(x) = x^3 + 2$, outside $f(u) = \sqrt{u}$.
- $h(x) = \dfrac{1}{(x+1)^3}$: inside $g(x) = x + 1$, outside $f(u) = \dfrac{1}{u^3}$.

You'll use this skill constantly for the **chain rule** in Unit 12.`,
        },
        {
          k: "example",
          title: "Slides: rocket fuel",
          problem: r`A rocket burns $C(D) = \dfrac{\sqrt{D + 100}}{4}$ gallons of fuel at distance $D$ (miles), and $D(t) = 99t^2$ after $t$ seconds. Find $(C\circ D)(t)$ and the fuel used after 10 seconds.`,
          steps: [r`$(C \circ D)(t) = C(99t^2) = \dfrac{\sqrt{99t^2 + 100}}{4}$`, r`At $t = 10$: $99(100) + 100 = 10000$, and $\sqrt{10000} = 100$.`, r`$\dfrac{100}{4} = 25$`],
          answer: r`25 gallons after 10 seconds.`,
        },
        { k: "trap", body: r`$(f\circ g)(x)$ is **not** $f(x)\cdot g(x)$. The little circle $\circ$ means "plug in", not "multiply".` },
      ],
      questions: [
        { id: "u3l1q1", type: "num", level: 1, prompt: r`$f(x) = x^3$, $g(x) = \dfrac{2+x}{x-8}$. Find $(f\circ g)(3)$.`, answer: -1, solution: [r`$g(3) = \frac{5}{-5} = -1$`, r`$f(-1) = -1$`] },
        { id: "u3l1q2", type: "num", level: 1, prompt: r`$f(x) = x^3$, $g(x) = \dfrac{2+x}{x-8}$. Find $(g\circ f)(3)$.`, answer: 29 / 19, verify: { kind: "value", expr: "(2+27)/(27-8)" }, solution: [r`$f(3) = 27$`, r`$g(27) = \frac{29}{19}$`] },
        { id: "u3l1q3", type: "expr", level: 2, prompt: r`$f(x) = x^2 + 1$, $g(x) = \sqrt{x+2}$. Find $(g\circ f)(x)$.`, answer: "sqrt(x^2+3)", solution: [r`$g(f(x)) = \sqrt{x^2 + 1 + 2} = \sqrt{x^2+3}$`] },
        { id: "u3l1q4", type: "expr", level: 2, prompt: r`$f(x) = 2x - 1$, $g(x) = x^2$. Find $(f\circ g)(x)$.`, answer: "2x^2-1", solution: [r`$f(g(x)) = 2(x^2) - 1 = 2x^2 - 1$`] },
        { id: "u3l1q5", type: "expr", level: 2, prompt: r`$f(x) = 2x - 1$, $g(x) = x^2$. Find $(g\circ f)(x)$.`, answer: "(2x-1)^2", solution: [r`$g(f(x)) = (2x - 1)^2 = 4x^2 - 4x + 1$`, r`Compare with the last question: order matters!`] },
        { id: "u3l1q6", type: "num", level: 1, exam: true, prompt: r`Rocket: $C(D) = \frac{\sqrt{D+100}}{4}$ gallons, $D(t) = 99t^2$ miles. Gallons used after $t = 10$ s?`, answer: 25, verify: { kind: "value", expr: "sqrt(99*100+100)/4" }, solution: [r`$D(10) = 9900$`, r`$C(9900) = \frac{\sqrt{10000}}{4} = 25$`] },
        { id: "u3l1q7", type: "mc", level: 2, prompt: r`$h(x) = \sqrt{x^3 + 2}$ is $f(g(x))$. Which choice is right?`, choices: [r`$f(x) = x^3 + 2$, $g(x) = \sqrt x$`, r`$f(x) = \sqrt x$, $g(x) = x^3 + 2$`, r`$f(x) = \sqrt{x^3}$, $g(x) = 2$`, r`$f(x) = x^3$, $g(x) = \sqrt{x + 2}$`], answer: 1, solution: [r`You'd compute $x^3 + 2$ first: that's the inside $g$.`, r`Then take the square root: outside $f(u) = \sqrt u$.`] },
        { id: "u3l1q8", type: "mc", level: 2, prompt: r`$h(x) = \dfrac{1}{(x+1)^3}$. Pick the inside function $g$ and outside function $f$.`, choices: [r`$g(x) = x + 1$, $f(u) = \frac{1}{u^3}$`, r`$g(x) = \frac1x$, $f(u) = (u+1)^3$`, r`$g(x) = x^3$, $f(u) = \frac{1}{u+1}$`, r`$g(x) = (x+1)^3$, $f(u) = u$`], answer: 0, solution: [r`First thing you'd compute: $x + 1$. That's $g$.`, r`Then cube it and flip it: $f(u) = \frac{1}{u^3}$.`] },
      ],
    },
    {
      id: "u3l2",
      title: "Inverse functions",
      emoji: "🔄",
      minutes: 12,
      tldr: "The inverse f⁻¹ runs the machine backwards: if f(2) = 7, then f⁻¹(7) = 2. Swap inputs and outputs.",
      gens: ["inverse"],
      blocks: [
        {
          k: "eli5",
          body: r`A function is a recipe that turns ingredients into a cake 🎂. The **inverse** looks at the cake and tells you the ingredients.

If $f(\text{2 eggs}) = \text{cake}$, then $f^{-1}(\text{cake}) = \text{2 eggs}$.

Inputs and outputs **swap places**.`,
        },
        { k: "formula", title: "The definition", tex: r`f(x) = y \iff f^{-1}(y) = x`, note: r`Domain of $f^{-1}$ = range of $f$, and vice versa. Also: $f^{-1}(x) \ne \dfrac{1}{f(x)}$. The $-1$ is NOT an exponent here!` },
        {
          k: "steps",
          title: "Recipe: find an inverse formula",
          steps: [r`Write $y = f(x)$.`, r`Solve for $x$ in terms of $y$.`, r`Swap the letters: write the answer as $f^{-1}(x)$.`, r`Check: $f(f^{-1}(x))$ should give back $x$.`],
        },
        {
          k: "example",
          title: "Slides (a): a cubic",
          problem: r`Find the inverse of $f(x) = 6x^3 + 2$.`,
          steps: [r`$y = 6x^3 + 2$`, r`$y - 2 = 6x^3 \Rightarrow x^3 = \dfrac{y-2}{6}$`, r`$x = \sqrt[3]{\dfrac{y-2}{6}}$`],
          answer: r`$f^{-1}(x) = \sqrt[3]{\dfrac{x-2}{6}}$`,
        },
        {
          k: "example",
          title: "Slides (b): a fraction (the tricky one)",
          problem: r`Find the inverse of $g(x) = \dfrac{3x + 7}{8 - 6x}$.`,
          steps: [
            r`$y = \dfrac{3x+7}{8-6x}$. Multiply both sides by the bottom: $y(8 - 6x) = 3x + 7$.`,
            r`Distribute: $8y - 6xy = 3x + 7$.`,
            r`Get all $x$ terms on one side: $8y - 7 = 3x + 6xy$.`,
            r`Factor out $x$: $8y - 7 = x(3 + 6y)$, so $x = \dfrac{8y - 7}{6y + 3}$.`,
          ],
          answer: r`$g^{-1}(x) = \dfrac{8x - 7}{6x + 3}$`,
        },
        {
          k: "idea",
          title: "Reading inverses in words (exam favorite!)",
          body: r`Slide setup: $r(t)$ = inches of rain $t$ minutes after it starts, $F(t)$ = temperature (°F) at minute $t$, $P(x)$ = feet a plant grows after $x$ inches of rain.

- $F^{-1}(50) = 45.2$ means: **the temperature is 50°F at 45.2 minutes after the rain starts.** ($F^{-1}$ takes a temperature and gives back a time.)
- "After 10 minutes of rain, the plant has received enough rain to grow 0.2 ft": $P(r(10)) = 0.2$.
- "After 5 inches of rain has fallen, the temperature is 53°F": first find the TIME when 5 inches fell, $r^{-1}(5)$, then the temperature: $F(r^{-1}(5)) = 53$.`,
        },
        { k: "tip", title: "Graphs", body: r`The graph of $f^{-1}$ is the graph of $f$ **mirrored across the line $y = x$**. A function has an inverse only if it passes the **horizontal line test** (one-to-one: no output repeats).` },
        { k: "trap", body: r`$f^{-1}(x)$ means "inverse", while $(f(x))^{-1} = \dfrac{1}{f(x)}$ means "reciprocal". Totally different things with confusingly similar notation.` },
      ],
      questions: [
        { id: "u3l2q1", type: "expr", level: 1, prompt: r`Find $f^{-1}(x)$ for $f(x) = 2x + 6$.`, answer: "(x-6)/2", solution: [r`$y = 2x + 6 \Rightarrow x = \frac{y - 6}{2}$`, r`$f^{-1}(x) = \frac{x - 6}{2}$`] },
        { id: "u3l2q2", type: "expr", level: 2, prompt: r`Find $f^{-1}(x)$ for $f(x) = 6x^3 + 2$. (Use cbrt( ) or ^(1/3).)`, answer: "((x-2)/6)^(1/3)", domain: [2.5, 9], solution: [r`$x^3 = \frac{y-2}{6}$`, r`$f^{-1}(x) = \sqrt[3]{\frac{x-2}{6}}$`] },
        { id: "u3l2q3", type: "expr", level: 3, exam: true, prompt: r`Find $g^{-1}(x)$ for $g(x) = \dfrac{3x+7}{8-6x}$.`, answer: "(8x-7)/(6x+3)", hints: [r`Multiply both sides by $(8 - 6x)$ first.`, r`Collect the $x$ terms, then factor out $x$.`], solution: [r`$y(8-6x) = 3x + 7$`, r`$8y - 7 = x(3 + 6y)$`, r`$g^{-1}(x) = \frac{8x - 7}{6x + 3}$`] },
        { id: "u3l2q4", type: "num", level: 1, prompt: r`If $f(4) = 11$, what is $f^{-1}(11)$?`, answer: 4, solution: [r`Inverse swaps: $f^{-1}(11) = 4$.`] },
        { id: "u3l2q5", type: "mc", level: 2, exam: true, prompt: r`$F(t)$ is the temperature (°F) $t$ minutes after rain starts. What does $F^{-1}(50) = 45.2$ mean?`, choices: ["At 50 minutes, it is 45.2°F", "It is 50°F at 45.2 minutes after the rain starts", "The temperature drops 50° in 45.2 minutes", "45.2 inches of rain fell at 50°F"], answer: 1, solution: [r`$F^{-1}$ eats a temperature and gives a time.`, r`So "temperature 50°F happens at time 45.2 minutes".`] },
        { id: "u3l2q6", type: "mc", level: 3, exam: true, prompt: r`$r(t)$ = inches of rain after $t$ minutes, $F(t)$ = temperature at minute $t$. Write: "After 5 inches of rain has fallen, the temperature is 53°F."`, choices: [r`$F(r(5)) = 53$`, r`$F(r^{-1}(5)) = 53$`, r`$r(F(5)) = 53$`, r`$F^{-1}(53) = 5$`], answer: 1, hints: [r`First you need the TIME when 5 inches have fallen.`], solution: [r`Time when 5 inches fell: $r^{-1}(5)$.`, r`Temperature at that time: $F(r^{-1}(5)) = 53$.`] },
        { id: "u3l2q7", type: "num", level: 2, prompt: r`$f(x) = x^3 + 1$. Find $f^{-1}(28)$.`, answer: 3, solution: [r`Solve $x^3 + 1 = 28$: $x^3 = 27$, $x = 3$.`] },
        { id: "u3l2q8", type: "mc", level: 2, prompt: r`Which function does NOT have an inverse (on all real numbers)?`, choices: [r`$f(x) = 2x + 1$`, r`$f(x) = x^3$`, r`$f(x) = x^2$`, r`$f(x) = e^x$`], answer: 2, solution: [r`$x^2$ fails the horizontal line test: $f(2) = f(-2) = 4$.`, r`If you got 4 back, you couldn't tell whether the input was 2 or −2.`] },
      ],
    },
    {
      id: "u3l3",
      title: "Transformations",
      emoji: "🎛️",
      minutes: 9,
      tldr: "Outside changes act normally (up = up). Inside changes act BACKWARDS (x − 3 moves RIGHT).",
      blocks: [
        {
          k: "eli5",
          body: r`You have a sticker of a graph 🖼️. You can **slide** it, **stretch** it, or **flip** it, without redrawing it.

- Changes **outside** the function ($f(x) + 3$, $2f(x)$) do what they say.
- Changes **inside** ($f(x - 3)$, $f(2x)$) feel backwards: $x - 3$ slides **right**.`,
        },
        {
          k: "table",
          title: "The transformation menu",
          head: ["Formula", "What happens"],
          rows: [
            ["$f(x) + k$", "up $k$ (down if $k<0$)"],
            ["$f(x - h)$", "**right** $h$ (left if $h<0$)"],
            ["$a\\,f(x)$", "vertical stretch by $a$ (squish if $0<a<1$)"],
            ["$-f(x)$", "flip over the x-axis (upside down)"],
            ["$f(bx)$", "horizontal squeeze by $b$ (stretch if $0<b<1$)"],
            ["$f(-x)$", "flip over the y-axis (mirror)"],
          ],
        },
        { k: "tool", tool: "transform", props: { base: "x^2" }, caption: "Move one slider at a time and say out loud what happened." },
        {
          k: "example",
          title: "Describe it",
          problem: r`Describe $g(x) = -2(x + 1)^2 + 3$ starting from $f(x) = x^2$.`,
          steps: [r`$x + 1 = x - (-1)$: shift **left** 1.`, r`$-2$: stretch tall by 2 **and** flip upside down.`, r`$+3$: shift **up** 3.`],
          answer: r`An upside-down, skinnier parabola with its peak at $(-1, 3)$.`,
        },
        { k: "trap", body: r`Order matters when you stretch and shift. The safe way: do the inside stuff (horizontal) first, then the outside stuff in the order "stretch/flip, then shift".` },
      ],
      questions: [
        { id: "u3l3q1", type: "mc", level: 1, prompt: r`How does $y = (x - 4)^2$ compare to $y = x^2$?`, choices: ["Left 4", "Right 4", "Up 4", "Down 4"], answer: 1, solution: [r`Inside change, backwards: $x - 4$ moves **right** 4.`] },
        { id: "u3l3q2", type: "mc", level: 1, prompt: r`How does $y = \sqrt{x} - 2$ compare to $y = \sqrt{x}$?`, choices: ["Down 2", "Up 2", "Right 2", "Left 2"], answer: 0, solution: [r`Outside change, does what it says: $-2$ moves **down** 2.`] },
        { id: "u3l3q3", type: "mc", level: 2, prompt: r`What does $y = -|x|$ look like?`, choices: ["A V opening up", "An upside-down V", "A V shifted left", "A horizontal line"], answer: 1, solution: [r`$-f(x)$ flips over the x-axis. $|x|$ is a V; upside down it's ∧.`] },
        { id: "u3l3q4", type: "expr", level: 2, prompt: r`Write the function you get by shifting $y = x^2$ **left 3** and **down 5**.`, answer: "(x+3)^2-5", solution: [r`Left 3: replace $x$ with $x + 3$.`, r`Down 5: subtract 5 outside.`, r`$y = (x+3)^2 - 5$`] },
        { id: "u3l3q5", type: "num", level: 2, prompt: r`The vertex of $y = x^2$ is $(0, 0)$. What is the y-coordinate of the vertex of $y = -2(x + 1)^2 + 3$?`, answer: 3, solution: [r`Left 1 and up 3 move the vertex to $(-1, 3)$.`, r`Stretching/flipping doesn't move the vertex.`] },
        { id: "u3l3q6", type: "mc", level: 3, prompt: r`$y = e^{-x}$ is $y = e^x$ …`, choices: ["flipped over the x-axis", "flipped over the y-axis", "shifted down 1", "the same graph"], answer: 1, solution: [r`$f(-x)$ is an inside change: mirror left↔right, over the y-axis.`, r`That's why $e^{-x}$ is a decay curve.`] },
      ],
    },
  ],
};

export const u04: Unit = {
  id: "u4",
  n: 4,
  title: "Logarithms & e",
  emoji: "🪵",
  biome: "swamp",
  when: "Week 2",
  exam: 1,
  summary: "Logs are exponents in disguise. Learn the rules, solve equations, and crack growth/decay problems.",
  lessons: [
    {
      id: "u4l1",
      title: "The number e and logarithms",
      emoji: "🔢",
      minutes: 10,
      tldr: "log_b(x) answers: 'b to WHAT power gives x?' ln is log base e ≈ 2.718.",
      gens: ["logeval"],
      blocks: [
        {
          k: "eli5",
          body: r`$\log_2 8$ is a question: **"2 to what power makes 8?"** Answer: 3, because $2^3 = 8$.

A logarithm is just an **exponent** you're trying to find. 🕵️ That's all it is.`,
        },
        {
          k: "idea",
          title: "The special number e",
          body: r`$e = \dfrac{1}{0!} + \dfrac{1}{1!} + \dfrac{1}{2!} + \cdots = 2.7182818\ldots$

It's named after Leonhard Euler. **$e$ is a number, not a variable**, just like $\pi$. It shows up whenever something grows continuously, and calculus loves it because $\frac{d}{dx}e^x = e^x$ (Unit 11).`,
        },
        { k: "formula", title: "Definition of a logarithm", tex: r`y = \log_a x \iff a^y = x \qquad (a > 0,\ a \ne 1,\ x > 0)`, note: r`Special names: $\log x = \log_{10} x$ (common log) and $\ln x = \log_e x$ (natural log).` },
        {
          k: "example",
          title: "Slides: evaluate without a calculator",
          problem: r`Find $\log_2 8$, $\log_{11} 121$, $\log_3 \frac19$, $\ln\sqrt e$, $\log_{12} 1$, $\log_{13} 0$.`,
          steps: [
            r`$\log_2 8 = 3$ since $2^3 = 8$.`,
            r`$\log_{11} 121 = 2$ since $11^2 = 121$.`,
            r`$\log_3 \frac19 = -2$ since $3^{-2} = \frac19$.`,
            r`$\ln\sqrt e = \ln e^{1/2} = \frac12$.`,
            r`$\log_{12} 1 = 0$ since anything$^0 = 1$.`,
            r`$\log_{13} 0$ is **undefined**: no power of 13 is ever 0.`,
          ],
          answer: r`$3,\ 2,\ -2,\ \tfrac12,\ 0,\ \text{undefined}$`,
        },
        {
          k: "table",
          title: "eˣ vs ln x (they're inverses)",
          head: ["", "$e^x$", "$\\ln x$"],
          rows: [
            ["Domain", "$(-\\infty, \\infty)$", "$(0, \\infty)$"],
            ["Range", "$(0, \\infty)$", "$(-\\infty, \\infty)$"],
            ["Key point", "$(0, 1)$", "$(1, 0)$"],
            ["Asymptote", "$y = 0$ (horizontal)", "$x = 0$ (vertical)"],
          ],
        },
        { k: "tool", tool: "exponential", props: { a: 1, b: 2.718 }, caption: "Turn on the mirror to see ln x as the reflection of eˣ." },
        { k: "trap", body: r`You can't take the log of 0 or a negative number. $\ln 0$ and $\ln(-5)$ are undefined. That's the third "danger zone" for domains.` },
      ],
      questions: [
        { id: "u4l1q1", type: "num", level: 1, prompt: r`$\log_2 32 = ?$`, answer: 5, solution: [r`$2^5 = 32$, so the answer is 5.`] },
        { id: "u4l1q2", type: "num", level: 1, prompt: r`$\log_3 \frac{1}{9} = ?$`, answer: -2, solution: [r`$3^{-2} = \frac{1}{9}$.`] },
        { id: "u4l1q3", type: "num", level: 1, prompt: r`$\ln \sqrt{e} = ?$`, answer: 0.5, solution: [r`$\sqrt e = e^{1/2}$, and $\ln e^{1/2} = \frac12$.`] },
        { id: "u4l1q4", type: "num", level: 1, prompt: r`$\log 1000 = ?$ (common log, base 10)`, answer: 3, solution: [r`$10^3 = 1000$.`] },
        { id: "u4l1q5", type: "mc", level: 1, prompt: r`$\log_{13} 0$ is…`, choices: ["0", "1", "13", "undefined"], answer: 3, solution: [r`No power of 13 equals 0. Undefined.`] },
        { id: "u4l1q6", type: "num", level: 2, prompt: r`$\ln(e^{7}) + \log_{12} 1 = ?$`, answer: 7, solution: [r`$\ln e^7 = 7$ and $\log_{12} 1 = 0$.`] },
        { id: "u4l1q7", type: "interval", strict: true, level: 2, prompt: r`What is the domain of $g(x) = \ln x$?`, answer: "(0,inf)", solution: [r`Only positive inputs: $(0, \infty)$.`] },
        { id: "u4l1q8", type: "num", level: 2, prompt: r`Solve for $x$: $\log_5 x = 3$.`, answer: 125, solution: [r`Rewrite as an exponential: $x = 5^3 = 125$.`] },
      ],
    },
    {
      id: "u4l2",
      title: "Log rules",
      emoji: "📜",
      minutes: 10,
      tldr: "Logs turn × into +, ÷ into −, and powers into multipliers in front.",
      blocks: [
        {
          k: "eli5",
          body: r`Logs are **demoters**. They push every operation down one level:

- multiplication ✖️ becomes addition ➕
- division ➗ becomes subtraction ➖
- exponents ⬆️ become multiplication ✖️ (the power jumps out front)`,
        },
        { k: "formula", title: "Product rule", tex: r`\ln(AB) = \ln A + \ln B` },
        { k: "formula", title: "Quotient rule", tex: r`\ln\!\left(\frac{A}{B}\right) = \ln A - \ln B` },
        { k: "formula", title: "Power rule", tex: r`\ln(A^p) = p\ln A`, note: "The same three rules work for any base." },
        { k: "formula", title: "Undo buttons + change of base", tex: r`\ln(e^x) = x,\quad e^{\ln x} = x,\quad \log_b x = \frac{\ln x}{\ln b}` },
        {
          k: "example",
          title: "Slides: write as a single log",
          problem: r`(a) $\log(x^2) - \log(x+3)$ (b) $2\ln(\sin x) + (x+1)\ln(\cos x) - \ln(\sec^2(x+1))$`,
          steps: [
            r`(a) Minus becomes division: $\log\left(\dfrac{x^2}{x+3}\right)$.`,
            r`(b) Powers go inside first: $\ln(\sin^2 x) + \ln(\cos^{x+1} x) - \ln(\sec^2(x+1))$.`,
            r`Plus → multiply, minus → divide: $\ln\left(\dfrac{\sin^2 x\,\cos^{x+1}x}{\sec^2(x+1)}\right)$.`,
            r`Bonus: dividing by $\sec^2$ is multiplying by $\cos^2$: $\ln\left(\sin^2 x\cos^{x+1}x\cos^2(x+1)\right)$.`,
          ],
          answer: r`(a) $\log\frac{x^2}{x+3}$ (b) $\ln\left(\sin^2 x\,\cos^{x+1}x\,\cos^2(x+1)\right)$`,
        },
        { k: "trap", body: r`There is **no** rule for $\ln(A + B)$. It does NOT equal $\ln A + \ln B$. Logs break up products, not sums.` },
      ],
      questions: [
        { id: "u4l2q1", type: "num", level: 1, prompt: r`Simplify $\log_2 4 + \log_2 8$ (use the product rule or just evaluate).`, answer: 5, solution: [r`$\log_2 4 + \log_2 8 = \log_2 32 = 5$`] },
        { id: "u4l2q2", type: "num", level: 1, prompt: r`$\ln 50 - \ln 5 = \ln(?)$`, answer: 10, solution: [r`$\ln\frac{50}{5} = \ln 10$`] },
        { id: "u4l2q3", type: "num", level: 1, prompt: r`If $\ln 2 \approx 0.693$, then $\ln 8 \approx ?$ (3 decimals)`, answer: 2.079, tol: 0.003, solution: [r`$\ln 8 = \ln 2^3 = 3\ln 2 \approx 2.079$`] },
        { id: "u4l2q4", type: "mc", level: 2, prompt: r`Which equals $\log(x^2) - \log(x+3)$?`, choices: [r`$\log\frac{x^2}{x+3}$`, r`$\frac{\log x^2}{\log(x+3)}$`, r`$\log(x^2 - x - 3)$`, r`$2\log x - 3$`], answer: 0, solution: [r`Difference of logs = log of a quotient.`] },
        { id: "u4l2q5", type: "mc", level: 2, prompt: r`Which is TRUE?`, choices: [r`$\ln(a + b) = \ln a + \ln b$`, r`$\ln(ab) = \ln a \cdot \ln b$`, r`$\ln(a^3) = 3\ln a$`, r`$\ln\frac ab = \frac{\ln a}{\ln b}$`], answer: 2, solution: [r`Only the power rule is written correctly. The others are classic fake rules.`] },
        { id: "u4l2q6", type: "num", level: 2, prompt: r`Use change of base: $\log_2 10 \approx ?$ (3 decimals)`, answer: Math.log(10) / Math.log(2), tol: 2e-3, verify: { kind: "value", expr: "ln(10)/ln(2)" }, solution: [r`$\log_2 10 = \frac{\ln 10}{\ln 2} \approx \frac{2.3026}{0.6931} \approx 3.322$`] },
        { id: "u4l2q7", type: "num", level: 3, prompt: r`Simplify completely: $e^{2\ln 3}$.`, answer: 9, hints: [r`Move the 2 inside the log first.`], solution: [r`$2\ln 3 = \ln 9$`, r`$e^{\ln 9} = 9$`] },
      ],
    },
    {
      id: "u4l3",
      title: "Solving exponential & log equations",
      emoji: "🗝️",
      minutes: 12,
      tldr: "Variable in an exponent? Take ln of both sides. Variable inside a log? Exponentiate both sides. Then check the domain.",
      gens: ["expsolve"],
      blocks: [
        {
          k: "eli5",
          body: r`Every operation has an **undo button** ↩️.

- The undo for $e^{\square}$ is $\ln$.
- The undo for $\ln(\square)$ is $e^{\square}$.

To free a trapped $x$, press the right undo button on **both sides**.`,
        },
        {
          k: "steps",
          title: "Recipe",
          steps: [
            r`**Isolate** the exponential (or the log) first.`,
            r`Exponential: take $\ln$ of both sides. Log: raise $e$ to both sides.`,
            r`Solve the regular algebra that's left.`,
            r`**Check** answers in the original. Log arguments must be positive!`,
          ],
        },
        {
          k: "example",
          title: "Slides: solve these",
          problem: r`(a) $e^{2x} = 4$ (b) $e^{x^2-1} = 1$ (c) $\ln(x^2+2x-14) = 0$ (d) $2\ln x = \ln 9$ (e) $5^{2x-1} = e^{7x+3}$`,
          steps: [
            r`(a) $2x = \ln 4 \Rightarrow x = \frac{\ln 4}{2} = \ln 2 \approx 0.693$.`,
            r`(b) $x^2 - 1 = \ln 1 = 0 \Rightarrow x = \pm 1$.`,
            r`(c) $x^2 + 2x - 14 = e^0 = 1 \Rightarrow x^2 + 2x - 15 = 0 \Rightarrow (x+5)(x-3) = 0 \Rightarrow x = -5, 3$. Both make the inside equal 1 > 0 ✓.`,
            r`(d) $\ln x^2 = \ln 9 \Rightarrow x^2 = 9 \Rightarrow x = \pm 3$, but $\ln(-3)$ is undefined, so **only $x = 3$**.`,
            r`(e) Take ln: $(2x-1)\ln 5 = 7x + 3$. Expand: $2x\ln5 - \ln 5 = 7x + 3$. Collect: $x(2\ln 5 - 7) = 3 + \ln 5$, so $x = \dfrac{3+\ln5}{2\ln5 - 7} \approx -1.219$.`,
          ],
          answer: r`(a) $\ln 2$ (b) $\pm1$ (c) $-5, 3$ (d) $3$ (e) $\frac{3+\ln 5}{2\ln 5-7}$`,
        },
        { k: "trap", body: r`In (d), $x = -3$ looks fine algebraically but **breaks the original equation**. Always plug back in when logs are involved.` },
      ],
      questions: [
        { id: "u4l3q1", type: "num", level: 1, prompt: r`Solve $e^{2x} = 4$. (Decimal or exact like ln(2).)`, answer: Math.log(2), verify: { kind: "value", expr: "ln(4)/2" }, solution: [r`$2x = \ln 4$`, r`$x = \frac{\ln 4}{2} = \ln 2 \approx 0.6931$`] },
        { id: "u4l3q2", type: "list", level: 2, prompt: r`Solve $e^{x^2-1} = 1$. List all solutions.`, answer: [-1, 1], solution: [r`$x^2 - 1 = 0$`, r`$x = -1, 1$`] },
        { id: "u4l3q3", type: "list", level: 2, exam: true, prompt: r`Solve $\ln(x^2 + 2x - 14) = 0$. List all solutions.`, answer: [-5, 3], solution: [r`$x^2 + 2x - 14 = 1$`, r`$(x+5)(x-3) = 0$`, r`Check both: the inside equals 1 for each. ✓`] },
        { id: "u4l3q4", type: "list", level: 2, prompt: r`Solve $2\ln x = \ln 9$. List all valid solutions.`, answer: [3], solution: [r`$x^2 = 9$, so $x = \pm 3$`, r`Reject $-3$ (can't take ln of a negative).`, r`Answer: $x = 3$ only.`] },
        { id: "u4l3q5", type: "num", level: 3, exam: true, prompt: r`Solve $5^{2x-1} = e^{7x+3}$. (3 decimals)`, answer: (3 + Math.log(5)) / (2 * Math.log(5) - 7), tol: 2e-3, verify: { kind: "value", expr: "(3+ln(5))/(2ln(5)-7)" }, hints: [r`Take ln of both sides. $\ln(5^{2x-1}) = (2x-1)\ln 5$.`, r`Get all $x$ terms on one side and factor out $x$.`], solution: [r`$(2x - 1)\ln 5 = 7x + 3$`, r`$x(2\ln 5 - 7) = 3 + \ln 5$`, r`$x = \frac{3+\ln 5}{2\ln5 - 7} \approx -1.219$`] },
        { id: "u4l3q6", type: "num", level: 1, prompt: r`Solve $\ln x = 2$. (3 decimals)`, answer: Math.E ** 2, tol: 2e-3, solution: [r`$x = e^2 \approx 7.389$`] },
        { id: "u4l3q7", type: "num", level: 2, prompt: r`Solve $3\cdot 2^x = 48$.`, answer: 4, solution: [r`$2^x = 16$`, r`$x = 4$`] },
      ],
    },
    {
      id: "u4l4",
      title: "Growth, decay, doubling & half-life",
      emoji: "⏳",
      minutes: 10,
      tldr: "Write A = A₀·bᵗ, set it equal to the target, and solve for t with logs.",
      gens: ["halflife", "expgrowth"],
      blocks: [
        { k: "eli5", body: r`"When will I have \$100 left?" "When will the ducks triple?" These are all the same question: **find the exponent**. And finding exponents is what logs do. 🦆🦆🦆` },
        {
          k: "steps",
          title: "Recipe",
          steps: [r`Find the multiplier: $b = 1 + r$ (growth) or $b = 1 - r$ (decay).`, r`Model: $A(t) = A_0 b^t$.`, r`Set $A(t)$ equal to the target and divide by $A_0$.`, r`Take ln: $t = \dfrac{\ln(\text{target}/A_0)}{\ln b}$.`],
        },
        {
          k: "example",
          title: "Slides: Joel's savings",
          problem: r`Joel has \$800 and spends 10% of his savings each year. When will \$100 be left?`,
          steps: [r`$b = 1 - 0.10 = 0.9$, so $A(t) = 800(0.9)^t$.`, r`$800(0.9)^t = 100 \Rightarrow (0.9)^t = \frac18$.`, r`$t = \dfrac{\ln(1/8)}{\ln 0.9} \approx 19.74$ years.`],
          answer: r`About 19.74 years.`,
        },
        {
          k: "example",
          title: "Slides: ducks and isotopes",
          problem: r`(a) Ducks grow 2% per year. When do they triple? (b) An isotope decreases 3% per year. Find its half-life.`,
          steps: [r`(a) $(1.02)^t = 3 \Rightarrow t = \dfrac{\ln 3}{\ln 1.02} \approx 55.48$ years.`, r`(b) $(0.97)^t = \frac12 \Rightarrow t = \dfrac{\ln 0.5}{\ln 0.97} \approx 22.76$ years.`],
          answer: r`Notice: you never needed the starting amount! It cancels.`,
        },
        { k: "formula", title: "Continuous growth", tex: r`A(t) = A_0 e^{kt}`, note: r`$k > 0$ grows, $k < 0$ decays. Doubling time $= \frac{\ln 2}{k}$.` },
      ],
      questions: [
        { id: "u4l4q1", type: "num", level: 2, exam: true, prompt: r`Joel has \$800 and spends 10% of his savings each year. After how many years will \$100 be left? (2 decimals)`, answer: Math.log(1 / 8) / Math.log(0.9), tol: 0.01, verify: { kind: "value", expr: "ln(1/8)/ln(0.9)" }, solution: [r`$(0.9)^t = \frac18$`, r`$t = \frac{\ln(1/8)}{\ln(0.9)} \approx 19.74$`] },
        { id: "u4l4q2", type: "num", level: 2, exam: true, prompt: r`A duck population grows 2% per year. How many years until it triples? (2 decimals)`, answer: Math.log(3) / Math.log(1.02), tol: 0.01, verify: { kind: "value", expr: "ln(3)/ln(1.02)" }, solution: [r`$(1.02)^t = 3$`, r`$t = \frac{\ln 3}{\ln 1.02} \approx 55.48$`] },
        { id: "u4l4q3", type: "num", level: 2, exam: true, prompt: r`An isotope decreases 3% per year. What is its half-life in years? (2 decimals)`, answer: Math.log(0.5) / Math.log(0.97), tol: 0.01, verify: { kind: "value", expr: "ln(0.5)/ln(0.97)" }, solution: [r`$(0.97)^t = 0.5$`, r`$t \approx 22.76$ years`] },
        { id: "u4l4q4", type: "num", level: 2, prompt: r`Bacteria follow $A(t) = 50e^{0.4t}$. When is $A = 400$? (3 decimals)`, answer: Math.log(8) / 0.4, tol: 2e-3, solution: [r`$e^{0.4t} = 8$`, r`$t = \frac{\ln 8}{0.4} \approx 5.199$`] },
        { id: "u4l4q5", type: "num", level: 3, prompt: r`A substance has a half-life of 10 years. What percent remains after 25 years? (2 decimals, as a percent)`, answer: 100 * 0.5 ** 2.5, tol: 0.02, solution: [r`Fraction left $= (\frac12)^{t/10}$.`, r`$(\frac12)^{2.5} \approx 0.1768$, so about 17.68%.`] },
      ],
    },
  ],
};

export const u05: Unit = {
  id: "u5",
  n: 5,
  title: "Polynomials & Rational Functions",
  emoji: "🕳️",
  biome: "taiga",
  when: "Week 2",
  exam: 1,
  summary: "Degrees, end behavior, holes vs vertical asymptotes, horizontal asymptotes, and sign charts.",
  lessons: [
    {
      id: "u5l1",
      title: "Polynomials",
      emoji: "🐛",
      minutes: 8,
      tldr: "Polynomial = add up terms like 3x⁵ with whole-number powers. The biggest power is the degree, and it controls the ends of the graph.",
      blocks: [
        { k: "eli5", body: r`A polynomial is built from **LEGO bricks** 🧱 of the form (number)·$x^{\text{whole number}}$, snapped together with + and −. No $x$ in a denominator, no roots of $x$, no $x$ in an exponent.` },
        { k: "formula", title: "Definition", tex: r`f(x) = a_nx^n + a_{n-1}x^{n-1} + \cdots + a_1x + a_0,\quad a_n \ne 0`, note: r`$n$ is a non-negative **integer**: the **degree**. $a_n$ is the **leading coefficient**.` },
        {
          k: "example",
          title: "Slides: which are polynomials?",
          problem: r`(a) $3x^5 + 5^3$ (b) $2$ (c) $x^{-2} + 7$ (d) $(x+5)(x^7+2)$`,
          steps: [r`(a) ✅ $5^3 = 125$ is just a constant. Degree 5.`, r`(b) ✅ A constant is a polynomial of degree 0.`, r`(c) ❌ The power $-2$ isn't a whole number.`, r`(d) ✅ Multiply out: highest term $x \cdot x^7 = x^8$. Degree 8.`],
          answer: r`(a), (b), (d) are polynomials.`,
        },
        {
          k: "idea",
          title: "Degree arithmetic & end behavior",
          body: r`- Cubic + quadratic: degree **3** (the bigger one wins).
- Cubic × quadratic: degree **5** (degrees add).
- A line $mx + b$ with $m \ne 0$ is degree 1. A constant is degree 0. (That's the "correction" on the slide: a flat line isn't degree 1.)

**End behavior** only depends on the leading term $a_nx^n$: even degree → both ends the same way; odd degree → opposite ways. $a_n > 0$ means the right end goes up.`,
        },
      ],
      questions: [
        { id: "u5l1q1", type: "mc", level: 1, prompt: r`Which is NOT a polynomial?`, choices: [r`$3x^5 + 125$`, r`$7$`, r`$x^{-2} + 7$`, r`$(x+5)(x^7+2)$`], answer: 2, solution: [r`Negative powers are not allowed.`] },
        { id: "u5l1q2", type: "num", level: 1, prompt: r`What is the degree of $(x+5)(x^7+2)$?`, answer: 8, solution: [r`Leading term $x\cdot x^7 = x^8$.`] },
        { id: "u5l1q3", type: "num", level: 1, prompt: r`$f$ is cubic and $g$ is quadratic. What is the degree of $f\cdot g$?`, answer: 5, solution: [r`Degrees add when you multiply: $3 + 2 = 5$.`] },
        { id: "u5l1q4", type: "num", level: 1, prompt: r`$f$ is cubic and $g$ is quadratic. What is the degree of $f + g$?`, answer: 3, solution: [r`The cubic term can't be canceled by a quadratic.`] },
        { id: "u5l1q5", type: "mc", level: 2, prompt: r`As $x \to -\infty$, $f(x) = -2x^3 + x^2 - 9$ goes to…`, choices: [r`$+\infty$`, r`$-\infty$`, r`$0$`, r`$-9$`], answer: 0, solution: [r`Leading term $-2x^3$. For huge negative $x$, $x^3$ is hugely negative, times $-2$ is hugely positive.`] },
        { id: "u5l1q6", type: "num", level: 1, prompt: r`What is the leading coefficient of $4 - x + 6x^4 - 2x^2$?`, answer: 6, solution: [r`Highest power is $x^4$, with coefficient 6. Order of writing doesn't matter.`] },
      ],
    },
    {
      id: "u5l2",
      title: "Rational functions: holes & asymptotes",
      emoji: "🧱",
      minutes: 14,
      tldr: "Factor top and bottom. Cancels → hole. Bottom still 0 → vertical asymptote. Compare degrees → horizontal asymptote.",
      gens: ["asymptote"],
      blocks: [
        { k: "eli5", body: r`A rational function is a fraction of polynomials $\frac{p(x)}{q(x)}$. When the bottom hits 0 you get trouble. Two kinds of trouble:

- 🕳️ **Hole**: the trouble cancels out. One missing point.
- 🧱 **Wall** (vertical asymptote): the trouble doesn't cancel. The graph shoots to $\pm\infty$.` },
        {
          k: "idea",
          title: "The rules (from the slides)",
          body: r`For $f(x) = \frac{p(x)}{q(x)}$:

- **Hole at $x = a$** if $p(a) = q(a) = 0$ (a factor cancels).
- **Vertical asymptote $x = a$** if $q(a) = 0$ but $p(a) \ne 0$ (after canceling).
- **Horizontal asymptote $y = b$** if $f(x) \approx b$ for huge positive or negative $x$.`,
        },
        {
          k: "table",
          title: "Horizontal asymptote shortcut (compare degrees)",
          head: ["Top vs bottom degree", "Horizontal asymptote"],
          rows: [["Top smaller", "$y = 0$"], ["Same", "$y = \\dfrac{\\text{leading coef. of top}}{\\text{leading coef. of bottom}}$"], ["Top bigger", "None"]],
        },
        {
          k: "example",
          title: "Slides: the full analysis",
          problem: r`Find the holes, vertical and horizontal asymptotes of $f(x) = \dfrac{x^2 + 4x - 45}{x^2 - 25}$.`,
          steps: [
            r`Factor: $\dfrac{(x+9)(x-5)}{(x-5)(x+5)}$.`,
            r`$(x - 5)$ cancels → **hole at $x = 5$**. Its height: plug 5 into what's left: $\dfrac{5+9}{5+5} = \dfrac{14}{10} = \dfrac75$. Hole at $(5, \tfrac75)$.`,
            r`$(x + 5)$ stays on the bottom → **vertical asymptote $x = -5$**.`,
            r`Degrees equal (2 and 2), leading coefficients 1 and 1 → **horizontal asymptote $y = 1$**.`,
          ],
          answer: r`Hole $(5, \frac75)$, VA $x = -5$, HA $y = 1$.`,
        },
        { k: "tool", tool: "rational", props: { top: [-9, 5], bottom: [5, -5], lead: 1 }, caption: "This is exactly the slide example. Add and remove roots to build your own." },
        { k: "trap", body: r`**Not every zero of the denominator is an asymptote!** If it cancels, it's a hole. This is on the exam sheet in bold for a reason.` },
      ],
      questions: [
        { id: "u5l2q1", type: "num", level: 2, exam: true, prompt: r`$f(x) = \dfrac{x^2+4x-45}{x^2-25}$ has a hole at $x = ?$`, answer: 5, solution: [r`$(x+9)(x-5)/((x-5)(x+5))$: the $(x - 5)$ cancels.`] },
        { id: "u5l2q2", type: "num", level: 2, exam: true, prompt: r`$f(x) = \dfrac{x^2+4x-45}{x^2-25}$ has a hole. What is the hole's y-coordinate?`, answer: 1.4, solution: [r`After canceling: $\frac{x+9}{x+5}$ at $x = 5$: $\frac{14}{10} = 1.4$`] },
        { id: "u5l2q3", type: "num", level: 2, exam: true, prompt: r`$f(x) = \dfrac{x^2+4x-45}{x^2-25}$: vertical asymptote at $x = ?$`, answer: -5, solution: [r`$(x + 5)$ stays in the denominator.`] },
        { id: "u5l2q4", type: "num", level: 1, prompt: r`Horizontal asymptote of $f(x) = \dfrac{6x^2 - 1}{3x^2 + x}$: $y = ?$`, answer: 2, solution: [r`Same degree: $\frac63 = 2$.`] },
        { id: "u5l2q5", type: "num", level: 1, prompt: r`Horizontal asymptote of $f(x) = \dfrac{5x + 2}{x^3 - 1}$: $y = ?$`, answer: 0, solution: [r`Bottom degree is bigger → $y = 0$.`] },
        { id: "u5l2q6", type: "mc", level: 2, prompt: r`Find a rational function with $f(2) = 0$ that is undefined at $x = -1$ (slide question).`, choices: [r`$\frac{x+1}{x-2}$`, r`$\frac{x-2}{x+1}$`, r`$\frac{x+2}{x-1}$`, r`$(x-2)(x+1)$`], answer: 1, solution: [r`Put $(x - 2)$ on top so $f(2) = 0$.`, r`Put $(x + 1)$ on the bottom so $x = -1$ breaks it.`] },
        { id: "u5l2q7", type: "list", level: 2, prompt: r`List all vertical asymptotes of $g(x) = \dfrac{x+1}{x^2-4}$ (x-values).`, answer: [-2, 2], solution: [r`$x^2 - 4 = (x-2)(x+2)$; nothing cancels with $x + 1$.`, r`VAs at $x = -2$ and $x = 2$.`] },
        { id: "u5l2q8", type: "mc", level: 3, prompt: r`$h(x) = \dfrac{x^3 + 1}{x - 4}$ has…`, choices: ["HA y = 1", "HA y = 0", "no horizontal asymptote", "HA y = −1/4"], answer: 2, solution: [r`Top degree 3 > bottom degree 1 → no horizontal asymptote.`] },
      ],
    },
    {
      id: "u5l3",
      title: "Sign charts: where is it positive?",
      emoji: "➕",
      minutes: 12,
      tldr: "Find every x where the function is zero or undefined, cut the number line there, and test one number per piece.",
      blocks: [
        { k: "eli5", body: r`A function can only switch from + to − by passing through **zero** or through a **break** (undefined point). So those are the only places to check. Between them, the sign stays the same, like how the weather is the same all day between two storms ⛅.` },
        {
          k: "steps",
          title: "Sign chart recipe",
          steps: [
            r`Factor everything (top and bottom).`,
            r`List the **critical numbers**: zeros of the top and zeros of the bottom.`,
            r`Put them on a number line. They cut it into intervals.`,
            r`Pick a test number in each interval and find the sign (just + or −, not the value).`,
            r`Shortcut: an **odd** power flips the sign as you cross its root; an **even** power doesn't.`,
          ],
        },
        {
          k: "example",
          title: "Slides: the final boss of Week 2",
          problem: r`Find where $f(x) = \dfrac{(x+3)^2(2x-6)^3}{x^6(x+7)^7}$ is positive.`,
          steps: [
            r`Critical numbers: $-7$ (bottom), $-3$ (top), $0$ (bottom), $3$ (top).`,
            r`Even powers $(x+3)^2$ and $x^6$ are never negative, so they don't affect the sign (just zero/undefined at their roots).`,
            r`So the sign of $f$ = the sign of $\dfrac{(2x-6)^3}{(x+7)^7}$ = the sign of $\dfrac{x - 3}{x + 7}$ (odd powers keep the sign).`,
            r`That's positive when $x < -7$ (both negative) or $x > 3$ (both positive).`,
            r`Remove points where $f = 0$ or undefined: $-3$ isn't in those intervals anyway.`,
          ],
          answer: r`$f > 0$ on $(-\infty, -7) \cup (3, \infty)$`,
        },
        { k: "tool", tool: "signchart", props: { f: "(x+3)^2*(2x-6)^3/(x^6*(x+7)^7)", view: { xmin: -10, xmax: 6, ymin: -2, ymax: 2 } }, caption: "Auto sign chart. Switch to f′/f″ later in the course; for now look at the graph's sign." },
      ],
      questions: [
        { id: "u5l3q1", type: "interval", level: 3, exam: true, prompt: r`Where is $f(x) = \dfrac{(x+3)^2(2x-6)^3}{x^6(x+7)^7}$ positive?`, answer: "(-inf,-7)U(3,inf)", hints: [r`Even powers don't change the sign.`, r`So it has the same sign as $\frac{x-3}{x+7}$.`], solution: [r`Sign of $f$ = sign of $\frac{x-3}{x+7}$.`, r`Positive for $x < -7$ and $x > 3$.`] },
        { id: "u5l3q2", type: "interval", level: 2, prompt: r`Where is $(x-1)(x+4) > 0$?`, answer: "(-inf,-4)U(1,inf)", solution: [r`Roots $-4, 1$.`, r`Test $x = 0$: $(-1)(4) < 0$. Outside the roots it's positive.`] },
        { id: "u5l3q3", type: "interval", level: 2, prompt: r`Where is $\dfrac{x-2}{x+3} < 0$?`, answer: "(-3,2)", solution: [r`Critical numbers $-3, 2$.`, r`Test $x = 0$: $\frac{-2}{3} < 0$ ✓. So between them.`] },
        { id: "u5l3q4", type: "interval", level: 2, prompt: r`Where is $x^2(x - 5) < 0$?`, answer: "(-inf,0)U(0,5)", hints: [r`$x^2$ is never negative, but it IS zero at 0.`], solution: [r`Sign = sign of $(x - 5)$, negative when $x < 5$.`, r`But at $x = 0$, the expression equals 0, which is not $< 0$.`, r`$(-\infty, 0) \cup (0, 5)$`] },
        { id: "u5l3q5", type: "interval", level: 3, prompt: r`Where is $\dfrac{(x+1)^3}{(x-2)^2} \ge 0$? (Include endpoints where it equals 0.)`, answer: "[-1,2)U(2,inf)", strict: true, solution: [r`$(x-2)^2 > 0$ (except undefined at 2).`, r`Sign = sign of $(x+1)^3$ = sign of $(x+1)$: $\ge 0$ for $x \ge -1$.`, r`Exclude 2: $[-1, 2) \cup (2, \infty)$`] },
      ],
    },
  ],
};
