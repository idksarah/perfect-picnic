import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph } from "../lib/ui.js";

// Shown for a beat before each minigame. Receives the FLOW entry as its arg.
export default function titleCard(k) {
  k.scene("title-card", (step) => {
    background(k, PALETTE.blanket);

    paragraph(k, step?.step ?? "", GAME.height / 2 - 70, 22);
    heading(k, step?.label ?? "Ready?", GAME.height / 2, 52);

    const countdown = paragraph(k, "3", GAME.height / 2 + 90, 40);
    let n = 3;
    k.loop(0.7, () => {
      n -= 1;
      if (n > 0) countdown.text = String(n);
      else if (n === 0) countdown.text = "GO";
      else k.go(step.id);
    });
  });
}
