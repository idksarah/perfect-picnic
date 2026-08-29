import kaplay from "kaplay";
import { GAME, PALETTE } from "./config.js";
import { loadAssets } from "./assets.js";
import { registerScenes } from "./scenes/index.js";

const k = kaplay({
  width: GAME.width,
  height: GAME.height,
  letterbox: true,
  background: PALETTE.sky,
  crisp: true,
  global: false, // keep kaplay off window; pass `k` around explicitly
});

loadAssets(k);
registerScenes(k);

// Change this to jump straight into a scene while you're building it,
// e.g. k.go("sandwich") — the flow still works from wherever you land.
k.go("crossing");

export { k };
