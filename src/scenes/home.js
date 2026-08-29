import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, button } from "../lib/ui.js";
import { resetSession } from "../state.js";
import { goNext } from "../flow.js";

export default function home(k) {
  k.scene("home", () => {
    background(k, PALETTE.grass);

    heading(k, "PICNIC PHYSICS", 180, 72);
    paragraph(k, "Stack sandwiches. Dodge incoming traffic. Lay out the food.", 250);

    button(k, {
      text: "Start",
      pos: k.vec2(GAME.width / 2, GAME.height / 2 + 60),
      onClick: () => {
        resetSession();
        goNext(k, "home");
      },
    });

    // TODO: title art, a wasp drifting across, ambient birdsong.
  });
}
