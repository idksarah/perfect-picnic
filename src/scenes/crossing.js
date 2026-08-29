import { GAME, PALETTE } from "../config.js";
import { background } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";

/**
 * MINIGAME 2 — Get to the Picnic (45s)
 *   Minimum: move forward through obstacles (2D crossy-road).
 *   Extra:   cars in the road lanes.
 *   Scoring: each step forward +2.
 */
export default function crossing(k) {
  k.scene("crossing", () => {
    background(k, PALETTE.grass);

    const game = useMinigame(k, { id: "crossing", label: "Get to the Picnic" });

    const TILE = 64;
    let furthest = 0;

    const player = k.add([
      k.rect(TILE - 16, TILE - 16, { radius: 6 }),
      k.pos(GAME.width / 2, GAME.height - TILE),
      k.anchor("center"),
      k.area(),
      k.color(...PALETTE.blanket),
      "player",
    ]);

    // --- TODO: gameplay ------------------------------------------------
    // 1. Generate lanes ahead (safe grass / road / water) as the player climbs.
    // 2. Spawn cars per road lane, k.move() them across, destroy off-screen.
    // 3. player.onCollide("car", ...) -> knock back or end the run.
    // 4. Scroll the camera (k.camPos) so the player stays near the bottom.

    const stepTo = (dx, dy) => {
      player.moveBy(dx * TILE, dy * TILE);
      const rowsUp = Math.round((GAME.height - TILE - player.pos.y) / TILE);
      if (rowsUp > furthest) {
        furthest = rowsUp;
        game.addScore(2);
      }
    };

    k.onKeyPress("up", () => stepTo(0, -1));
    k.onKeyPress("w", () => stepTo(0, -1));
    k.onKeyPress("down", () => stepTo(0, 1));
    k.onKeyPress("s", () => stepTo(0, 1));
    k.onKeyPress("left", () => stepTo(-1, 0));
    k.onKeyPress("a", () => stepTo(-1, 0));
    k.onKeyPress("right", () => stepTo(1, 0));
    k.onKeyPress("d", () => stepTo(1, 0));
    k.onKeyPress("escape", () => game.finish());
  });
}
