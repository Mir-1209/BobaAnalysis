// Procedural pixel art: block textures and little icons, generated as SVG data URIs.
// No image files to load, so it's instant and every theme can recolor it.

/** Tiny deterministic RNG so a texture looks the same on every load. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function svg(w: number, h: number, rects: string): string {
  const body = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(body)}")`;
}

/** Noisy block texture from a palette (first color is the most common). */
export function texture(palette: string[], seed = 1, size = 8, opts: { topRows?: { colors: string[]; rows: number } } = {}): string {
  const r = rng(seed);
  let rects = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let pal = palette;
      if (opts.topRows && y < opts.topRows.rows + (r() < 0.4 ? 1 : 0)) pal = opts.topRows.colors;
      const pick = r();
      const c = pick < 0.55 ? pal[0]! : pal[1 + Math.floor(r() * (pal.length - 1))] ?? pal[0]!;
      rects += `<rect x='${x}' y='${y}' width='1' height='1' fill='${c}'/>`;
    }
  }
  return svg(size, size, rects);
}

// ── Icons from ASCII grids. Each char maps to a color; "." is transparent. ──
export type IconName = keyof typeof ICONS;

const ICONS = {
  diamond: {
    colors: { a: "#0a6e6a", b: "#2ee6d6", c: "#a8fff6", d: "#ffffff" },
    grid: ["...aaaa...", "..abbbba..", ".abcbbcba.", "abccbbbcba", "abbbbbbbba", ".abbbbbba.", "..abbbba..", "...abba...", "....aa....", ".........."],
  },
  heart: {
    colors: { a: "#3a0000", b: "#ff1f1f", c: "#ffb3b3" },
    grid: [".aa...aa.", "abba.abba", "abcbbbbba", "abbbbbbba", ".abbbbba.", "..abbba..", "...aba...", "....a...."],
  },
  orb: {
    colors: { a: "#245c00", b: "#7fff1a", c: "#e8ff9e", d: "#4fb300" },
    grid: ["..aaaa..", ".abbbba.", "abccbbda", "abcbbbda", "abbbbdda", "abbbddda", ".adddda.", "..aaaa.."],
  },
  pickaxe: {
    colors: { a: "#1f6f6a", b: "#33ebcb", c: "#8a5a2b", d: "#5c3a17" },
    grid: ["..aaaaa...", ".abbbbba..", "a.....cba.", ".....cd.a.", "....cd..a.", "...cd.....", "..cd......", ".cd.......", "cd........", "d........."],
  },
  book: {
    colors: { a: "#3b1d0e", b: "#8b4a23", c: "#f3e6c4", d: "#c9b88f", e: "#d9a400" },
    grid: ["aaaaaaaaa.", "abbbbbbbba", "abbebbbbca", "abeeebbbca", "abbebbbbca", "abbbbbbbca", "abbbbbbbca", "abbbbbbbda", ".aaaaaaaaa"],
  },
  clock: {
    colors: { a: "#4a3500", b: "#ffd83a", c: "#fff4b0", d: "#1d2a6b", e: "#5876ff" },
    grid: ["..aaaa..", ".abccba.", "abcddcba", "abdeedba", "abeeeeba", "abeeeeba", ".abeeba.", "..aaaa.."],
  },
  flame: {
    colors: { a: "#7a1500", b: "#ff6a00", c: "#ffd000", d: "#fff6b0" },
    grid: ["....a...", "...aba..", "..abba..", ".abbcba.", ".abccba.", "abccdcba", "abcddcba", ".abccba.", "..aaaa.."],
  },
  sword: {
    colors: { a: "#1f6f6a", b: "#33ebcb", c: "#8a5a2b", d: "#5c3a17", e: "#ffffff" },
    grid: [".......aa", "......aba", ".....abea", "....abea.", "d..abea..", ".dabea...", "..dca....", ".dc.d....", "dc.......", ],
  },
  star: {
    colors: { a: "#6b4b00", b: "#ffd83a", c: "#fff7c2" },
    grid: ["....a....", "...aba...", "aaabcbaaa", "abbbcbbba", ".abbbbba.", "..abbba..", ".abbabba.", ".aba.aba.", ".a.....a."],
  },
  chest: {
    colors: { a: "#2b1a08", b: "#9b6a2f", c: "#c48a43", d: "#d8d8d8", e: "#6a4519" },
    grid: ["aaaaaaaaaa", "accccccca.", "abbbbbbbba", "aeeeddeeea", "aaaaddaaaa", "abbbbbbbba", "abbbbbbbba", "aeeeeeeeea", "aaaaaaaaaa"],
  },
  map: {
    colors: { a: "#3d2a12", b: "#e9d9a6", c: "#5aa02c", d: "#3b7dd8", e: "#c43c2c" },
    grid: ["aaaaaaaaaa", "abbbbbbbba", "abccbbddba", "abcccbddba", "abbcbbbdba", "abbbbebbba", "abddbbbcba", "abbbbbbbba", "aaaaaaaaaa"],
  },
  redstone: {
    colors: { a: "#4a0000", b: "#ff2a2a", c: "#ff9b9b" },
    grid: ["...a....", "..aba...", ".abcba..", "abbbbba.", ".abbbbba", "..abbba.", "...aba..", "....a..."],
  },
  emerald: {
    colors: { a: "#0b4d1d", b: "#1fd65f", c: "#b8ffcf" },
    grid: ["...aa...", "..abba..", ".abcbba.", ".abcbba.", ".abbbba.", ".abbbba.", "..abba..", "...aa..."],
  },
  torch: {
    colors: { a: "#ffef7a", b: "#ffb000", c: "#8a5a2b", d: "#5c3a17" },
    grid: ["..aa..", ".abba.", ".abba.", "..cc..", "..cd..", "..cd..", "..cd..", "..cd.."],
  },
  gear: {
    colors: { a: "#2c2c2c", b: "#9a9a9a", c: "#d6d6d6" },
    grid: ["...aa...", ".a.bb.a.", "..abba..", "abbaabba", "abbaabba", "..abba..", ".a.bb.a.", "...aa..."],
  },
  skull: {
    colors: { a: "#1a1a1a", b: "#e6e6e6", c: "#7a7a7a" },
    grid: [".aaaaaa.", "abbbbbba", "abbbbbba", "aaabbaaa", "aaabbaaa", "abbbbbba", ".abcbcba", "..aaaa.."],
  },
  dragon: {
    colors: { a: "#120018", b: "#3a1050", c: "#b04cff", d: "#ff66ff" },
    grid: ["a......a", "ab....ba", "abbbbbba", "abdbbdba", "abbbbbba", ".abccba.", ".abbbba.", "..aaaa.."],
  },
  potion: {
    colors: { a: "#2a2a3a", b: "#d8e6ff", c: "#ff4fc3", d: "#ffa3e4" },
    grid: ["...aa...", "...bb...", "..abba..", ".abccba.", "abcdccba", "abccccba", "abccccba", ".aaaaaa."],
  },
} satisfies Record<string, { colors: Record<string, string>; grid: string[] }>;

const iconCache = new Map<string, string>();

export function iconUri(name: IconName): string {
  const hit = iconCache.get(name);
  if (hit) return hit;
  const { colors, grid } = ICONS[name] as { colors: Record<string, string>; grid: string[] };
  const h = grid.length;
  const w = Math.max(...grid.map((r) => r.length));
  let rects = "";
  grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const c = colors[ch];
      if (c) rects += `<rect x='${x}' y='${y}' width='1' height='1' fill='${c}'/>`;
    });
  });
  const uri = svg(w, h, rects);
  iconCache.set(name, uri);
  return uri;
}
