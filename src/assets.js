// All loading happens once, before the first scene. Drop files in /public/sprites.
export function loadAssets(k) {
  k.loadRoot("./");

  // k.loadSprite("bread", "sprites/bread.png");
  // k.loadSprite("wasp", "sprites/wasp.png");
  // k.loadSprite("basket", "sprites/basket.png");
  // Prefer public sprite path, but fall back to the repo asset if present.
  k.loadSprite("picnic", "sprites/picnic.png");
  k.loadSprite("picnic", "src/assets/picnic.png");
  // sand background (prefer public path, fall back to repo asset)
  k.loadSprite("sand", "sprites/sand.png");
  k.loadSprite("sand", "src/assets/sand.png");
  // basket sprite (prefer public path, fall back to repo asset)
  k.loadSprite("basket", "sprites/basket.png");
  k.loadSprite("basket", "src/assets/basket.png");
  // alternate basket-open sprite for hover state
  k.loadSprite("basket-open", "sprites/basket-open.png");
  k.loadSprite("basket-open", "src/assets/basket-open.png");
  // sandwich sprite for spawned sandwiches
  k.loadSprite("sandwich", "sprites/sandwich.png");
  k.loadSprite("sandwich", "src/assets/sandwich.png");
  // lemonade sprite for spawned drinks
  k.loadSprite("lemonade", "sprites/lemonade.png");
  k.loadSprite("lemonade", "src/assets/lemonade.png");
  // chips sprite for spawned chips
  k.loadSprite("chips", "sprites/chips.png");
  k.loadSprite("chips", "src/assets/chips.png");
  // k.loadSound("plop", "sounds/plop.mp3");

  k.loadSprite("bun", "sprites/pixelated_baguettefr.png");
  k.loadSprite("bun", "src/scenes/assets/pixelated_baguettefr.png");

  // Bitmap font is optional; kaplay ships a default so text works out of the box.
}
