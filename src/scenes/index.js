import home from "./home.js";
import intro from "./intro.js";
import titleCard from "./titleCard.js";
import results from "./results.js";
import sandwich from "./sandwich.js";
import crossing from "./crossing.js";
import picnicSetup from "./picnicSetup.js";
import outro from "./outro.js";

// Every scene registers itself. Add a new one here and in flow.js — that's it.
export function registerScenes(k) {
  [home, intro, titleCard, results, sandwich, crossing, picnicSetup, outro]
    .forEach((register) => register(k));
}
