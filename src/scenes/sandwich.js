import { GAME, PALETTE } from "../config.js";
import { background } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";

/**
 * MINIGAME 1 — Stack the Sandwich (45s)
 *   Minimum: drop ingredients, keep the stack standing.
 *   Extra:   completing bread-filling-bread patterns scores a bonus.
 *   Scoring: ingredient +1, completed sandwich +3.
 */
export default function sandwich(k) {
  k.scene("sandwich", () => {
    background(k, PALETTE.sky);
    k.setGravity(1600);

    const game = useMinigame(k, { id: "sandwich", label: "Stack the Sandwich" });

    // --- table / floor -------------------------------------------------
    k.add([
      k.rect(GAME.width, 60),
      k.pos(0, GAME.height - 60),
      k.color(...PALETTE.grass),
      k.area(),
      k.body({ isStatic: true }),
      "table",
    ]);

    // --- TODO: gameplay ------------------------------------------------
    // 1. Pick a random next ingredient from a list (bread/lettuce/tomato/...).
    // 2. Swing it left-right at the top of the screen.
    // 3. On click/space, drop it: k.body() + gravity does the stacking.
    // 4. On landing: game.addScore(1), then check pattern -> game.addScore(3).
    // 5. If a piece falls off screen, wobble/penalise or just ignore.

    k.onKeyPress("space", () => game.addScore(1)); // placeholder so it's playable
    k.onKeyPress("escape", () => game.finish());   // dev shortcut: skip ahead
  });
}
