import { GAME, PALETTE } from "../config.js";
import { background, heading, paragraph, button } from "../lib/ui.js";
import { resetSession } from "../state.js";
import { goNext } from "../flow.js";

export default function home(k) {
  k.loadSprite("background", "/assets/background.png")
  k.scene("home", () => {
    background(k, PALETTE.grass);

    k.add([
      k.sprite("background"),
      k.scale(3.2),
      k.pos(0,0),
      k.z(-10)
    ])

    button(k, {
      text: "Start",
      pos: k.vec2(170, 580),
      color: PALETTE.accent,
      onClick: () => {
        resetSession();
        goNext(k, "home");
      },
    });

    // TODO: title art, a wasp drifting across, ambient birdsong.
  });
}
