// Ship deck collision. The deck was rasterized offline from the End City model into a grid of
// half-block cells: each cell knows its floor height and whether you may stand there. Walking
// off a walkable cell is impossible, so nobody falls off the ship (Minecraft "barrier" blocks).
import map from "./shipmap.json";

/** One Minecraft block in model units (the model was exported at 97 blocks per unit). */
export const BLOCKS_PER_UNIT = 97;
const VOID = -999;

export interface ShipMap {
  cell: number;
  x0: number;
  y0: number;
  base: number;
  nx: number;
  ny: number;
  h4: number[][];
  walk: string[];
}

export class Deck {
  readonly m: ShipMap;
  /** world Y of deck level 0 */
  readonly floor0: number;
  private blocked = new Set<string>();

  constructor(m: ShipMap = map as ShipMap) {
    this.m = m;
    // The offline rasterizer picked up the underside of the top block in each column
    // (the export uses clockwise winding), so the real walking surface is one block higher.
    this.floor0 = m.base * BLOCKS_PER_UNIT + 1;
  }

  /** World (x, z) → grid cell. World = (97·rawX, 97·rawZ, −97·rawY). */
  cellAt(x: number, z: number): [number, number] {
    const rawX = x / BLOCKS_PER_UNIT;
    const rawY = -z / BLOCKS_PER_UNIT;
    return [Math.floor((rawX - this.m.x0) / this.m.cell), Math.floor((rawY - this.m.y0) / this.m.cell)];
  }

  /** Grid cell (can be fractional, e.g. a cell corner) → world (x, z). */
  worldAt(ix: number, iy: number): [number, number] {
    const rawX = this.m.x0 + ix * this.m.cell;
    const rawY = this.m.y0 + iy * this.m.cell;
    return [rawX * BLOCKS_PER_UNIT, -rawY * BLOCKS_PER_UNIT];
  }

  private ok(ix: number, iy: number): boolean {
    if (ix < 0 || iy < 0 || ix >= this.m.nx || iy >= this.m.ny) return false;
    return this.m.walk[iy]![ix] === "1" && !this.blocked.has(`${ix},${iy}`);
  }

  /** Floor height (world Y) of a cell, or null for void. */
  floorAtCell(ix: number, iy: number): number | null {
    const h = this.m.h4[iy]?.[ix];
    if (h === undefined || h === VOID) return null;
    return this.floor0 + h / 4;
  }

  /** Mark cells as solid (e.g. where we place the bookshelf). */
  block(ix: number, iy: number) {
    this.blocked.add(`${ix},${iy}`);
  }

  /**
   * Can a player (radius r) stand at (x, z) with feet at `feet`? Returns the floor height there,
   * or null if any part of the body would be over a barrier or the step is too tall.
   */
  standable(x: number, z: number, feet: number, r = 0.28, maxStep = 1.1): number | null {
    let floor = -Infinity;
    for (const [dx, dz] of [[0, 0], [r, r], [r, -r], [-r, r], [-r, -r]] as const) {
      const [ix, iy] = this.cellAt(x + dx, z + dz);
      if (!this.ok(ix, iy)) return null;
      const f = this.floorAtCell(ix, iy)!;
      if (f - feet > maxStep) return null;
      floor = Math.max(floor, f);
    }
    return floor;
  }

  /** A walkable spot near the given cell (used for spawning). */
  nearestWalkable(ix: number, iy: number): [number, number] {
    for (let d = 0; d < 20; d++) {
      for (let dy = -d; dy <= d; dy++) {
        for (let dx = -d; dx <= d; dx++) {
          let all = true;
          for (let a = -1; a <= 1 && all; a++) for (let b = -1; b <= 1 && all; b++) all = this.ok(ix + dx + a, iy + dy + b);
          if (all) return [ix + dx, iy + dy];
        }
      }
    }
    return [ix, iy];
  }
}
