import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, button } from "../lib/ui.js";
import { totalScore, outcome, session } from "../state.js";

// Copy per ending. Keys match OUTCOMES ids in config.js.
const ENDINGS = {
  perfect: "YAY!! ATE IT UP!!",
  good: "warm lemonade but people still liked it :>",
  rough: "SONBEAM! you ate standing up and no one came.",
};

export default function outro(k) {
  k.scene("outro", () => {
    const result = outcome();
    // map outcome id to a background sprite name (large image shown at the top)
    const bgMap = {
      perfect: "3-star-bg",
      good: "2-star-bg",
      rough: "1-star-bg",
    };
    const bgName = bgMap[result.id];

    // Prepare bottom UI elements but don't position until we know the image size
    const lines = Object.entries(session.scores)
      .map(([id, s]) => `${id}: ${s}`)
      .join("\n");

    let headingEl = null;
    let endingEl = null;
    let scoreEl = null;
    let linesEl = null;
    let playBtn = null;

    const createOrPositionUI = (topAreaHeight) => {
      const pad = 20;
      const startY = Math.max(topAreaHeight + pad, GAME.height * 0.55);
      const spacing = 40;

      if (!headingEl) {
        headingEl = heading(k, result.title, startY, 56);
        headingEl.z = 10;
        endingEl = paragraph(k, ENDINGS[result.id] ?? "", startY + spacing);
        scoreEl = paragraph(k, `final score: ${totalScore()}`, startY + spacing * 2, 30);
        linesEl = paragraph(k, lines, startY + spacing * 3, 20);
        playBtn = button(k, {
          text: "Play again",
          pos: k.vec2(GAME.width / 2, GAME.height - 90),
          onClick: () => k.go("home"),
        });
        playBtn.z = 10;
      } else {
        headingEl.pos = k.vec2(GAME.width / 2, startY);
        endingEl.pos = k.vec2(GAME.width / 2, startY + spacing);
        scoreEl.pos = k.vec2(GAME.width / 2, startY + spacing * 2);
        linesEl.pos = k.vec2(GAME.width / 2, startY + spacing * 3);
        playBtn.pos = k.vec2(GAME.width / 2, GAME.height - 90);
      }
    };

    if (bgName) {
      const bg = k.add([
        k.sprite(bgName),
        k.pos(GAME.width / 2, 0), // will reposition after scaling
        k.anchor("center"),
        k.fixed(),
        k.z(-100),
        "outro-bg",
      ]);

      const layoutBgAndUI = () => {
        if (!(bg.width && bg.height)) return false;
        // scale to fit within width and reserve roughly top half for the image
        const maxW = GAME.width * 0.95;
        const maxH = GAME.height * 0.5;
        const sW = maxW / bg.width;
        const sH = maxH / bg.height;
        const s = Math.min(sW, sH, 1) * 1.25;
        bg.scale = k.vec2(s);

        // position bg so its top edge is near the top plus small padding
        const bgHeight = bg.height * s;
        const centerY = bgHeight / 2 + 20;
        bg.pos = k.vec2(GAME.width / 2, centerY);

        // position UI below the image
        createOrPositionUI(bgHeight + 20);
        return true;
      };

      if (bg.width && bg.height) {
        layoutBgAndUI();
      } else {
        bg.onUpdate(() => {
          if (layoutBgAndUI()) {
            bg.onUpdate = null;
          }
        });
      }
    } else {
      // fallback: solid background and center the UI lower on the screen
      background(k, result.id === "rough" ? PALETTE.ink : PALETTE.cream);
      createOrPositionUI(GAME.height * 0.25);
    }
  });
}
