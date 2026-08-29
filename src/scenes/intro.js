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
  k.scene("intro", () => {
    background(k, PALETTE.cream);

    let i = 0;
    const title = heading(k, "", 220, 40);

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
