import { PALETTE } from "../config.js";
import { background, heading, pressAnyKey } from "../lib/ui.js";
import { goNext } from "../flow.js";

// Beat-by-beat story cards. Add/remove entries freely.
const BEATS = [
  "It is a beautiful Saturday.",
  "You have a basket, a blanket, and one hour of sunshine.",
  "Three things stand between you and the perfect picnic.",
];


export default function intro(k) {
  k.loadSprite("intro_bg", "/assets/intro.png")
  k.scene("intro", () => {
    background(k, PALETTE.cream);

    k.add([
      k.sprite("intro_bg"),
      k.scale(3.2),
      k.pos(0,0),
      k.z(-10)
    ])

    k.add([
      k.rect(770, 100, { radius: 16 }),        // width, height
      k.pos(100, 450),        // where it goes
      k.color(85, 104, 144),     // red
    ]);

    let i = 0;
    const title = heading(k, "", 500, 26, [255, 255, 255]);

    const render = () => { title.text = BEATS[i]; };
    render();

    const advance = () => {
      i += 1;
      if (i >= BEATS.length) goNext(k, "intro");
      else render();
    };

    pressAnyKey(k, advance);

    // TODO: swap text cards for an animated scene (packing the basket).
  });
}
