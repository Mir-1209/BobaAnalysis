import type { ToolId } from "@/content/types";

// Names only, so pages can list tools without pulling in the tool code.
export const TOOLS_META: Record<ToolId, { name: string; emoji: string; blurb: string }> = {
  grapher: { name: "Grapher", emoji: "📈", blurb: "Graph up to 4 functions. Pan, zoom, read values." },
  limit: { name: "Limit Lab", emoji: "🔍", blurb: "Sneak up on x = a from both sides with tables + graph." },
  tangent: { name: "Secant → Tangent", emoji: "📐", blurb: "Shrink h and watch a secant turn into the tangent line." },
  derivative: { name: "Derivative Lab", emoji: "🎢", blurb: "Auto sign charts: increasing/decreasing, concavity, inflection." },
  signchart: { name: "Sign Chart Builder", emoji: "➕", blurb: "Where is it positive or negative? Auto sign chart." },
  transform: { name: "Transformations", emoji: "🎛️", blurb: "Shift, stretch and flip any parent function with sliders." },
  exponential: { name: "Exponential & Log", emoji: "🚀", blurb: "a·bˣ growth/decay, doubling time, and the log mirror." },
  rational: { name: "Rational Builder", emoji: "🕳️", blurb: "Build p(x)/q(x) and see holes and asymptotes appear." },
  piecewise: { name: "Piecewise Fixer", emoji: "🧩", blurb: "Tune A and B until the pieces join smoothly." },
  riemann: { name: "Riemann Boxes", emoji: "📦", blurb: "Approximate area with rectangles; watch the error vanish." },
  box: { name: "Box Optimizer", emoji: "🎁", blurb: "The classic open-box problem, as a toy." },
  unitcircle: { name: "Unit Circle", emoji: "⭕", blurb: "Angles, sin and cos, radians." },
};
