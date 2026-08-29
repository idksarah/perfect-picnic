import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, button } from "../lib/ui.js";
import { totalScore, outcome, session } from "../state.js";

// Copy per ending. Keys match OUTCOMES ids in config.js.
const ENDINGS = {
  perfect: "Not one ant. Not one spilled drink. Frame it.",
  good: "Warm lemonade, but nobody complained.",
  okay: "The blanket got damp. The sandwiches held.",
  rough: "You ate standing up, in the car, in the rain.",
};

export default function outro(k) {
  k.scene("outro", () => {
    const result = outcome();
    background(k, result.id === "rough" ? PALETTE.ink : PALETTE.cream);

    heading(k, result.title, 160, 56);
    paragraph(k, ENDINGS[result.id] ?? "", 240);
    paragraph(k, `final score: ${totalScore()}`, 320, 30);

    const lines = Object.entries(session.scores)
      .map(([id, s]) => `${id}: ${s}`)
      .join("\n");
    paragraph(k, lines, 400, 20);

    button(k, {
      text: "Play again",
      pos: k.vec2(GAME.width / 2, GAME.height - 90),
      onClick: () => k.go("home"),
    });

    // TODO: illustrate each ending instead of describing it.
  });
}
