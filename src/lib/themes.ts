import { texture } from "./pixel";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  dark: boolean;
  vars: Record<string, string>;
  /** [palette, seed, topRows?] for the page background, the header strip and buttons */
  bg: { palette: string[]; seed: number; top?: string[] } | null;
  strip: { palette: string[]; seed: number; top?: string[] };
  button: { palette: string[]; seed: number };
}

// Token meanings:
// --bg page color behind the texture · --panel GUI windows · --panel-hi/--panel-lo bevel light/shadow
// --slot inset wells · --ink text on panels · --muted secondary text · --accent main action
// --accent-2 second highlight · --good correct · --bad wrong · --xp the XP bar · --gold rewards
export const THEMES: Theme[] = [
  {
    id: "overworld",
    name: "Overworld",
    emoji: "🌳",
    blurb: "Grass, sky and stone. The classic.",
    dark: false,
    vars: {
      "--bg": "#79b4ff", "--bg-2": "#a9d3ff", "--panel": "#c6c6c6", "--panel-hi": "#ffffff", "--panel-lo": "#555555",
      "--slot": "#8b8b8b", "--slot-lo": "#373737", "--ink": "#1e1e1e", "--muted": "#4a4a4a", "--outline": "#000000",
      "--accent": "#3f9b2f", "--accent-hi": "#6fd14f", "--accent-lo": "#245c18", "--accent-ink": "#ffffff",
      "--accent-2": "#2ee6d6", "--good": "#2f9e2f", "--bad": "#c62828", "--xp": "#80ff20", "--gold": "#ffcc33",
      "--card": "#dcdcdc", "--code": "#e9e9e9", "--sky-ink": "#0f2a52",
    },
    bg: null,
    strip: { palette: ["#866043", "#79553a", "#966c4a", "#5d4130"], seed: 7, top: ["#5d9c3a", "#6cb043", "#4f8a31", "#7cc24e"] },
    button: { palette: ["#7f7f7f", "#747474", "#8a8a8a", "#6a6a6a"], seed: 3 },
  },
  {
    id: "nether",
    name: "The Nether",
    emoji: "🔥",
    blurb: "Netherrack and lava. Exam-week energy.",
    dark: true,
    vars: {
      "--bg": "#2a0a0a", "--bg-2": "#3d0f0f", "--panel": "#3b1414", "--panel-hi": "#7a2a2a", "--panel-lo": "#140404",
      "--slot": "#220808", "--slot-lo": "#000000", "--ink": "#ffe9e0", "--muted": "#e0a89a", "--outline": "#000000",
      "--accent": "#ff6a00", "--accent-hi": "#ffa040", "--accent-lo": "#8a2e00", "--accent-ink": "#1a0500",
      "--accent-2": "#ffd000", "--good": "#7fe36b", "--bad": "#ff4d4d", "--xp": "#80ff20", "--gold": "#ffd000",
      "--card": "#4a1a1a", "--code": "#2a0c0c", "--sky-ink": "#ffe9e0",
    },
    bg: { palette: ["#6f2626", "#5e1d1d", "#7d3030", "#4f1717", "#8a3a3a"], seed: 11 },
    strip: { palette: ["#6f2626", "#5e1d1d", "#7d3030"], seed: 12, top: ["#ff7a00", "#ffb000", "#ff5000"] },
    button: { palette: ["#5a1d1d", "#4d1616", "#682424"], seed: 13 },
  },
  {
    id: "end",
    name: "The End",
    emoji: "🐉",
    blurb: "End stone and void purple. Final boss vibes.",
    dark: true,
    vars: {
      "--bg": "#0d0716", "--bg-2": "#1a0f2b", "--panel": "#24173a", "--panel-hi": "#4d3a73", "--panel-lo": "#08040f",
      "--slot": "#150c24", "--slot-lo": "#000000", "--ink": "#f6f0ff", "--muted": "#bfaee0", "--outline": "#000000",
      "--accent": "#b04cff", "--accent-hi": "#d79bff", "--accent-lo": "#5a1a8f", "--accent-ink": "#ffffff",
      "--accent-2": "#eef59b", "--good": "#7dffb0", "--bad": "#ff6b8b", "--xp": "#80ff20", "--gold": "#eef59b",
      "--card": "#2e1f48", "--code": "#160d26", "--sky-ink": "#f6f0ff",
    },
    bg: { palette: ["#120a1f", "#160d26", "#0e0818", "#1b1030"], seed: 21 },
    strip: { palette: ["#dbe3a0", "#cfd78f", "#e6eab4", "#bfc77d"], seed: 22 },
    button: { palette: ["#3a2559", "#33204f", "#432b66"], seed: 23 },
  },
  {
    id: "deep-dark",
    name: "Deep Dark",
    emoji: "🌑",
    blurb: "Sculk glow on black. Quiet, focused, late-night.",
    dark: true,
    vars: {
      "--bg": "#05090c", "--bg-2": "#0a141a", "--panel": "#0f1d24", "--panel-hi": "#24414d", "--panel-lo": "#020405",
      "--slot": "#081217", "--slot-lo": "#000000", "--ink": "#dff8ff", "--muted": "#8fb7c2", "--outline": "#000000",
      "--accent": "#00b4c8", "--accent-hi": "#5fe8f5", "--accent-lo": "#00515c", "--accent-ink": "#001417",
      "--accent-2": "#2ee6d6", "--good": "#3ef0a0", "--bad": "#ff6b6b", "--xp": "#80ff20", "--gold": "#ffd36b",
      "--card": "#13262f", "--code": "#071116", "--sky-ink": "#dff8ff",
    },
    bg: { palette: ["#0b1418", "#091115", "#0e1a1f", "#071013", "#0f3b44"], seed: 31 },
    strip: { palette: ["#1a2a33", "#15232a", "#203540"], seed: 32, top: ["#0f6f7d", "#00b4c8", "#0a4d57"] },
    button: { palette: ["#183039", "#142a32", "#1d3843"], seed: 33 },
  },
  {
    id: "ocean",
    name: "Ocean Monument",
    emoji: "🌊",
    blurb: "Prismarine blues. Calm and cool.",
    dark: true,
    vars: {
      "--bg": "#0b2e3a", "--bg-2": "#0f3d4c", "--panel": "#174c5a", "--panel-hi": "#3f8a99", "--panel-lo": "#06222a",
      "--slot": "#0e3742", "--slot-lo": "#041519", "--ink": "#eafffb", "--muted": "#a6dcd4", "--outline": "#000000",
      "--accent": "#3fd0b4", "--accent-hi": "#8ff0dd", "--accent-lo": "#14725f", "--accent-ink": "#05221c",
      "--accent-2": "#ffd36b", "--good": "#7dffb0", "--bad": "#ff8a8a", "--xp": "#80ff20", "--gold": "#ffd36b",
      "--card": "#1d5a69", "--code": "#0b2e38", "--sky-ink": "#eafffb",
    },
    bg: { palette: ["#2c6e6a", "#357c77", "#245e5a", "#3e8a83"], seed: 41 },
    strip: { palette: ["#5fa79a", "#4f978a", "#6fb8aa", "#3f8579"], seed: 42 },
    button: { palette: ["#2a6a72", "#245f66", "#31767f"], seed: 43 },
  },
  {
    id: "cherry",
    name: "Cherry Grove",
    emoji: "🌸",
    blurb: "Soft pink blossoms. Gentle and happy.",
    dark: false,
    vars: {
      "--bg": "#ffd6ea", "--bg-2": "#ffe9f3", "--panel": "#fbe7f0", "--panel-hi": "#ffffff", "--panel-lo": "#b77b96",
      "--slot": "#e9bdd0", "--slot-lo": "#8c5570", "--ink": "#3a1527", "--muted": "#7a4b62", "--outline": "#3a1527",
      "--accent": "#e2539a", "--accent-hi": "#ff8cc6", "--accent-lo": "#8f2560", "--accent-ink": "#ffffff",
      "--accent-2": "#3fae5f", "--good": "#2f9e4f", "--bad": "#c62848", "--xp": "#5fd400", "--gold": "#f0a500",
      "--card": "#ffffff", "--code": "#fff3f8", "--sky-ink": "#3a1527",
    },
    bg: null,
    strip: { palette: ["#f7b6d2", "#f3a5c8", "#fbc9de", "#e98fb8"], seed: 51, top: ["#ffd6ea", "#ffe3f0", "#f7b6d2"] },
    button: { palette: ["#c46d97", "#b8628b", "#d07aa3"], seed: 53 },
  },
  {
    id: "snow",
    name: "Snowy Tundra",
    emoji: "❄️",
    blurb: "Bright snow and ice. Crisp daytime studying.",
    dark: false,
    vars: {
      "--bg": "#dff1ff", "--bg-2": "#f4fbff", "--panel": "#f2f6fa", "--panel-hi": "#ffffff", "--panel-lo": "#7b8fa3",
      "--slot": "#cbd9e6", "--slot-lo": "#5b6f82", "--ink": "#0f2030", "--muted": "#46607a", "--outline": "#0f2030",
      "--accent": "#2f7fd8", "--accent-hi": "#6fb0ff", "--accent-lo": "#16467f", "--accent-ink": "#ffffff",
      "--accent-2": "#00a3a3", "--good": "#1f8f4f", "--bad": "#c62828", "--xp": "#4fc400", "--gold": "#d99a00",
      "--card": "#ffffff", "--code": "#eef4fa", "--sky-ink": "#0f2030",
    },
    bg: null,
    strip: { palette: ["#ffffff", "#f0f6fb", "#e3eef7"], seed: 61, top: ["#ffffff", "#f7fbff"] },
    button: { palette: ["#8aa7c2", "#7f9db9", "#97b3cc"], seed: 63 },
  },
  {
    id: "low-stim",
    name: "Low-Stim",
    emoji: "🪨",
    blurb: "Flat, muted, no textures. For overloaded days.",
    dark: false,
    vars: {
      "--bg": "#ecebe7", "--bg-2": "#f4f3ef", "--panel": "#f7f6f2", "--panel-hi": "#ffffff", "--panel-lo": "#c9c6bd",
      "--slot": "#e3e1da", "--slot-lo": "#b9b5aa", "--ink": "#22211d", "--muted": "#5e5b52", "--outline": "#8f8b80",
      "--accent": "#4d7a5a", "--accent-hi": "#6f9a7b", "--accent-lo": "#365a41", "--accent-ink": "#ffffff",
      "--accent-2": "#4b6f8f", "--good": "#3d7a4d", "--bad": "#a8453b", "--xp": "#6f9a40", "--gold": "#a8842a",
      "--card": "#ffffff", "--code": "#f0efea", "--sky-ink": "#22211d",
    },
    bg: null,
    strip: { palette: ["#dcd9d0"], seed: 71 },
    button: { palette: ["#6b7a70"], seed: 73 },
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}

export function applyTheme(id: string, font: "pixel" | "readable" | "dyslexic", motion: boolean) {
  const t = themeById(id);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(k, v);
  root.style.setProperty("--tex-bg", t.bg ? texture(t.bg.palette, t.bg.seed, 16) : "none");
  root.style.setProperty("--tex-strip", texture(t.strip.palette, t.strip.seed, 16, t.strip.top ? { topRows: { colors: t.strip.top, rows: 4 } } : {}));
  root.style.setProperty("--tex-button", texture(t.button.palette, t.button.seed, 16));
  root.dataset.theme = t.id;
  root.dataset.dark = String(t.dark);
  root.dataset.font = font;
  root.dataset.motion = motion ? "on" : "off";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.vars["--bg"]!);
}
