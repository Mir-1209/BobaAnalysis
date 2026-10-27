import { texture } from "./pixel";
import type { Unit } from "@/content/types";

const P: Record<Unit["biome"], { palette: string[]; top?: string[] }> = {
  plains: { palette: ["#866043", "#79553a", "#966c4a"], top: ["#5d9c3a", "#6cb043", "#4f8a31"] },
  desert: { palette: ["#dbcf8e", "#d1c47f", "#e6dba0", "#c9bb73"] },
  forest: { palette: ["#6a5130", "#5c4427", "#7a5d38"], top: ["#2f6b24", "#3b7d2c", "#285c1e"] },
  swamp: { palette: ["#4c5a36", "#56663d", "#3f4c2c"], top: ["#3d5a3a", "#4a6e45", "#2f4a2d"] },
  taiga: { palette: ["#5a4632", "#4f3d2b", "#66513a"], top: ["#3a5f46", "#456e52", "#2f503a"] },
  mountain: { palette: ["#7f7f7f", "#747474", "#8a8a8a", "#6a6a6a"], top: ["#f2f2f2", "#ffffff", "#e3e3e3"] },
  river: { palette: ["#2f5fd0", "#3a6be0", "#2552bd"] },
  cave: { palette: ["#4a4a4f", "#404045", "#55555a", "#383838"] },
  ocean: { palette: ["#2c6e6a", "#357c77", "#245e5a"] },
  nether: { palette: ["#6f2626", "#5e1d1d", "#7d3030"], top: ["#ff7a00", "#ffb000"] },
  mesa: { palette: ["#a65a2e", "#b8693a", "#93502a", "#c9a07a"] },
  jungle: { palette: ["#5b4a22", "#6a5728"], top: ["#2f8a1f", "#3fa62a", "#227016"] },
  mushroom: { palette: ["#6f6369", "#7c6f76", "#625760"], top: ["#9e7fa3", "#b18fb6", "#8c6f91"] },
  snow: { palette: ["#866043", "#79553a"], top: ["#ffffff", "#f0f6fb", "#e3eef7"] },
  end: { palette: ["#dbe3a0", "#cfd78f", "#e6eab4", "#bfc77d"] },
  deepdark: { palette: ["#1a2a33", "#15232a", "#203540"], top: ["#0f6f7d", "#00b4c8"] },
  sky: { palette: ["#c6a1e6", "#b78fd9", "#d3b5ef"], top: ["#ffffff", "#f3e9ff"] },
};

const cache = new Map<string, string>();
export function biomeTexture(b: Unit["biome"], seed = 1): string {
  const k = `${b}:${seed}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const p = P[b];
  const t = texture(p.palette, seed * 31 + b.length, 16, p.top ? { topRows: { colors: p.top, rows: 4 } } : {});
  cache.set(k, t);
  return t;
}
