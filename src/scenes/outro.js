import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, button } from "../lib/ui.js";
import { totalScore, outcome, session } from "../state.js";

const ENDINGS = {
  perfect: "YAY!! ATE IT UP!!",
  good: "warm lemonade but people still liked it :>",
  rough: "SONBEAM! you ate standing up and no one came.",
};

export default function outro(k) {
  k.scene("outro", () => {
    const result = outcome();
    const bgMap = { perfect: "3-star-bg", good: "2-star-bg", rough: "1-star-bg" };
    const bgName = bgMap[result.id];

    const lines = Object.entries(session.scores)
      .map(([id, s]) => `${id}: ${s}`)
      .join("\n");

    const PILL_Z = 4;
    const TEXT_Z = 10;
    const PAD = 18;
    const GAP = 10;

    const headingEl = heading(k, result.title, -1000, 32);
    const endingEl = paragraph(k, ENDINGS[result.id] ?? "", -1000, 18);
    const scoreEl = paragraph(k, `final score: ${totalScore()}`, -1000, 18);
    const linesEl = paragraph(k, lines, -1000, 16);
    const playBtn = button(k, {
      text: "Play again",
      pos: k.vec2(GAME.width / 2, -1000),
      onClick: () => k.go("home"),
    });

    const stack = [headingEl, endingEl, scoreEl, linesEl, playBtn];
    for (const el of stack) el.z = TEXT_Z;

    const hOf = (el) => el.height || (el.textSize ?? 18) * 1.3;

    let pill = null;
    let blockTop = 0;

    const layout = () => {
      const contentH =
        stack.reduce((sum, el) => sum + hOf(el), 0) + GAP * (stack.length - 1);
      blockTop = GAME.height - PAD - contentH;

      let y = blockTop;
      for (const el of stack) {
        const h = hOf(el);
        el.pos = k.vec2(GAME.width / 2, y + h / 2);
        y += h + GAP;
      }

      const bw = (playBtn.width || 160) + 28;
      const bh = hOf(playBtn) + 14;

      if (!pill) {
        pill = k.add([
          k.rect(bw, bh, { radius: 8 }),
          k.pos(playBtn.pos.x, playBtn.pos.y),
          k.anchor("center"),
          k.color(...PALETTE.cream),
          k.fixed(),
          k.z(PILL_Z),
        ]);
      } else {
        pill.width = bw;
        pill.height = bh;
        pill.pos = k.vec2(playBtn.pos.x, playBtn.pos.y);
      }
    };

    layout();
    k.wait(0, layout);

    if (bgName) {
      const bg = k.add([
        k.sprite(bgName),
        k.pos(GAME.width / 2, 0),
        k.anchor("center"),
        k.fixed(),
        k.z(-100),
        "outro-bg",
      ]);

      const layoutBg = () => {
        if (!(bg.width && bg.height)) return false;
        const avail = blockTop - 24;
        const s = Math.min((GAME.width * 0.95) / bg.width, avail / bg.height);
        bg.scale = k.vec2(s);
        bg.pos = k.vec2(GAME.width / 2, 12 + (bg.height * s) / 2);
        return true;
      };

      if (!layoutBg()) {
        bg.onUpdate(() => {
          if (layoutBg()) bg.onUpdate = null;
        });
      }
    } else {
      background(k, result.id === "rough" ? PALETTE.ink : PALETTE.cream);
    }
  });
}