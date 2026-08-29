import { GAME, PALETTE } from "../config.js";
import { background } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";

/**
 * MINIGAME 3 — Set Up the Picnic (45s, click & drag)
 *   Minimum: drag sandwich + water out of the basket onto the right spots.
 *   Extra:   pin the blanket corners; swat flies before they land on food.
 *   Scoring: every second left over * 2.
 */
export default function picnicSetup(k) {
  k.scene("picnic-setup", () => {
    background(k, PALETTE.grass);

    const game = useMinigame(k, { id: "picnic-setup", label: "Set Up the Picnic" });

    // Call this once every required item is placed: leftover seconds * 2.
    const completeSetup = () => {
      game.addScore(Math.floor(game.timeLeft) * 2);
      game.finish();
    };

    // --- blanket + basket ----------------------------------------------
    k.add([
      k.rect(420, 300, { radius: 8 }),
      k.pos(GAME.width / 2, GAME.height / 2 + 20),
      k.anchor("center"),
      k.color(...PALETTE.blanket),
      k.z(-10),
      "blanket",
    ]);

    // --- reusable drag behaviour ---------------------------------------
    // Attach "draggable" + this handler to any item you spawn.
    let dragging = null;

    k.onMousePress(() => {
      const hovered = k.get("draggable").find((o) => o.isHovering());
      if (hovered) dragging = hovered;
    });
    k.onMouseMove(() => { if (dragging) dragging.pos = k.mousePos(); });
    k.onMouseRelease(() => {
      if (!dragging) return;
      // TODO: check if dropped on its target slot -> lock in place, score it.
      dragging = null;
    });

    // --- TODO: gameplay ------------------------------------------------
    // 1. Spawn items in the basket with [k.area(), "draggable", { slot: "..." }].
    // 2. Draw faint target slots on the blanket; snap on drop.
    // 3. Spawn flies that home in on placed food; click to swat.
    // 4. When every required item is placed, call completeSetup().

    k.onKeyPress("escape", () => completeSetup()); // dev shortcut: skip ahead
  });
}
