// All loading happens once, before the first scene. Drop files in /public/sprites.
export function loadAssets(k) {
  k.loadRoot("./");

  // k.loadSprite("bread", "sprites/bread.png");
  // k.loadSprite("wasp", "sprites/wasp.png");
  // k.loadSprite("basket", "sprites/basket.png");
  // k.loadSound("plop", "sounds/plop.mp3");

  // Bitmap font is optional; kaplay ships a default so text works out of the box.
}
