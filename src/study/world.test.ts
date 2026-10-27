import { test } from "node:test";
import assert from "node:assert/strict";
import { Deck } from "./world";

const deck = new Deck();

test("cell ↔ world round trip", () => {
  const [x, z] = deck.worldAt(40.5, 12.5);
  assert.deepEqual(deck.cellAt(x, z), [40, 12]);
});

test("spawn area is walkable and on the deck", () => {
  const [ix, iy] = deck.nearestWalkable(46, 13);
  const [x, z] = deck.worldAt(ix + 0.5, iy + 0.5);
  const floor = deck.standable(x, z, deck.floor0);
  assert.ok(floor !== null, "spawn must be standable");
  assert.ok(Math.abs(floor! - deck.floor0) <= 1.01);
});

test("you can't walk off the ship: every edge of the walkable area is a barrier", () => {
  const [ix, iy] = deck.nearestWalkable(46, 13);
  let [x, z] = deck.worldAt(ix + 0.5, iy + 0.5);
  let feet = deck.standable(x, z, deck.floor0)!;
  // walk in every direction for a long time; we must never leave walkable ground
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7]]) {
    for (let i = 0; i < 400; i++) {
      const nx = x + dx! * 0.1, nz = z + dz! * 0.1;
      const f = deck.standable(nx, nz, feet);
      if (f === null) continue;
      x = nx; z = nz; feet = f;
    }
    assert.ok(deck.standable(x, z, feet) !== null);
  }
});

test("void and railing cells are not standable", () => {
  const [x, z] = deck.worldAt(1, 1);
  assert.equal(deck.standable(x, z, deck.floor0), null);
});
