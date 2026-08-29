import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, pressAnyKey } from "../lib/ui.js";
import { totalScore } from "../state.js";
import { goNext } from "../flow.js";

// Between-minigame scorecard. `id` is the minigame that just finished.
export default function results(k) {
  k.scene("results", ({ id, score }) => {
    background(k, PALETTE.cream);

    heading(k, `+${score}`, GAME.height / 2 - 40, 72);
    paragraph(k, `running total: ${totalScore()}`, GAME.height / 2 + 40);

    pressAnyKey(k, () => goNext(k, id));

    // TODO: per-minigame breakdown (ingredients placed, steps taken, ...).
  });
}
