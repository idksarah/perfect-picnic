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

    // dynamic panel that sizes itself to the text width
    const panelPadX = 28;
    const panelPadY = 18;
    const panelY = 450;

    const panel = k.add([
      k.rect(10, 10, { radius: 16 }),
      k.pos(k.width() / 2, panelY),
      k.anchor("center"),
      k.color(85, 104, 144),
      k.fixed(),
      k.z(2),
    ]);

    let i = 0;
    const title = k.add([
      k.text(BEATS[i], { size: 26 }),
      k.pos(k.width() / 2, panelY),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(3),
      k.fixed(),
    ]);

    const layoutTitle = () => {
      if (!title.width || !title.height) return false;
      const w = Math.ceil(title.width) + panelPadX * 2;
      const h = Math.ceil(title.height) + panelPadY * 2;
      panel.width = w;
      panel.height = h;
      // ensure panel is centered at same x as title
      panel.pos = k.vec2(k.width() / 2, panelY);
      title.pos = k.vec2(k.width() / 2, panelY);
      return true;
    };

    const render = () => { title.text = BEATS[i]; layoutTitle(); };
    render();

    const advance = () => {
      i += 1;
      if (i >= BEATS.length) goNext(k, "intro");
      else render();
    };

    pressAnyKey(k, advance);

    // try layout once per frame until measured
    k.onUpdate(() => { layoutTitle(); });

    // TODO: swap text cards for an animated scene (packing the basket).
  });
}
