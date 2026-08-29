import { GAME, PALETTE } from "../config.js";
import { background } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";

/**
 * MINIGAME 1 — Stack the Sandwich (45s)
 *   Minimum: drop ingredients, keep the stack standing.
 *   Scoring: ingredient +1.
 *
 *   Mechanic: a single ingredient slides left-right above the stack.
 *   Click (or space) freezes its x position and it falls straight down.
 *   Any part that overhangs the current stack width is trimmed off.
 *   A complete miss (no overlap at all) ends the game.
 *   As the stack grows taller than the screen, the camera pans upward.
 */
export default function sandwich(k) {
  k.scene("sandwich", () => {
    background(k, PALETTE.sky);
    k.setGravity(0); // everything is moved manually, no physics needed

    // ---------------------------------------------------------------
    // STATE 1: loading bar -> intro text + start button
    // ---------------------------------------------------------------
    const barWidth = 240;
    const barBg = k.add([
      k.rect(barWidth, 20),
      k.pos(GAME.width / 2 - barWidth / 2, GAME.height / 2),
      k.color(60, 60, 60),
      k.outline(2, k.rgb(0, 0, 0)),
    ]);
    const barFill = k.add([
      k.rect(0, 20),
      k.pos(GAME.width / 2 - barWidth / 2, GAME.height / 2),
      k.color(120, 220, 120),
    ]);

    let loaded = 0;
    const loadTimer = k.loop(0.02, () => {
      loaded = Math.min(1, loaded + 0.02);
      barFill.width = barWidth * loaded;
      if (loaded >= 1) {
        loadTimer.cancel();
        showStartScreen();
      }
    });

    function showStartScreen() {
      k.destroy(barBg);
      k.destroy(barFill);

      const introText = k.add([
        k.text(
          "Let's prepare the perfect sandwich for your perfect picnic!\nClick to drop your ingredients and try to make the tallest sandwich you can!",
          { size: 20, width: GAME.width - 80, align: "center" }
        ),
        k.pos(GAME.width / 2, GAME.height / 2 - 80),
        k.anchor("center"),
      ]);

      const btn = k.add([
        k.rect(160, 56),
        k.pos(GAME.width / 2 - 80, GAME.height / 2 + 40),
        k.color(90, 170, 250),
        k.area(),
        k.outline(2, k.rgb(0, 0, 0)),
      ]);
      const btnText = k.add([
        k.text("Start", { size: 28 }),
        k.pos(GAME.width / 2, GAME.height / 2 + 68),
        k.anchor("center"),
      ]);

      btn.onClick(() => {
        k.destroy(introText);
        k.destroy(btn);
        k.destroy(btnText);
        startGame();
      });
    }

    // ---------------------------------------------------------------
    // STATE 2: actual gameplay
    // ---------------------------------------------------------------
    function startGame() {
      const game = useMinigame(k, { id: "sandwich", label: "Stack the Sandwich" });

      const STACK_X     = GAME.width / 2;
      const BASE_Y      = GAME.height - 100;
      const LAYER_H     = 34;
      const BASE_WIDTH  = 220;
      const SWING_SPEED = 2.5;
      const SWING_RANGE = 160;
      const FALL_SPEED  = 16;

      // --- extended sky so scrolling up never reveals empty space --------
      const SKY_HEIGHT = GAME.height * 20;
      k.add([
        k.rect(GAME.width, SKY_HEIGHT),
        k.pos(0, GAME.height - SKY_HEIGHT), // bottom edge lines up with original ground level
        k.color(...PALETTE.sky),
        k.z(-100),
      ]);

      k.add([
        k.rect(GAME.width, 60),
        k.pos(0, GAME.height - 60),
        k.color(...PALETTE.grass),
        "table",
      ]);

      // --- camera setup: follows the stack upward, never moves back down --
      const CAM_TOP_MARGIN = 140; // keep this much space between stack top and top of screen
      let camY = GAME.height / 2;
      k.camPos(GAME.width / 2, camY);

      function updateCameraFor(worldY) {
        // worldY: the y-coordinate (in world space) of the highest point in play
        const visibleTop = camY - GAME.height / 2;
        if (worldY < visibleTop + CAM_TOP_MARGIN) {
          const targetCamY = worldY - CAM_TOP_MARGIN + GAME.height / 2;
          camY = Math.min(camY, targetCamY); // camera only ever moves UP, never back down
        }
      }

      k.onUpdate(() => {
        // smooth scroll toward camY rather than snapping
        const cur = k.getCamPos();
        const newY = k.lerp(cur.y, camY, k.dt() * 6);
        k.camPos(GAME.width / 2, newY);
      });

      // --- the sandwich bun (static, on the ground, does not move) -------
      let stack = [{ x: STACK_X, width: BASE_WIDTH }];
      k.add([
        k.rect(BASE_WIDTH, LAYER_H),
        k.pos(STACK_X, BASE_Y),
        k.anchor("center"),
        k.color(222, 184, 135),
      ]);

      // --- single active ingredient, tracked by reference only -----------
      let current = null;   // the ONE game object currently in play
      let dropping = false; // false = sliding, true = falling
      let swingT = 0;
      let ready = false;    // gates input + movement until the start-click buffer passes

      function spawnIngredient() {
        const top = stack[stack.length - 1];
        const spawnY = BASE_Y - stack.length * LAYER_H - 40;

        current = k.add([
          k.rect(top.width, LAYER_H),
          k.pos(STACK_X, spawnY),
          k.anchor("center"),
          k.color(k.rand(100, 255), k.rand(100, 255), k.rand(100, 255)),
        ]);
        current.w = top.width;
        current.targetY = BASE_Y - stack.length * LAYER_H;

        dropping = false;
        swingT = 0;

        updateCameraFor(spawnY); // scroll up if this new ingredient spawns off-screen
      }

      // single update loop, always acting on `current` only, gated by `ready`
      k.onUpdate(() => {
        if (!ready || !current) return;

        if (dropping) {
          current.pos.y += FALL_SPEED;
          if (current.pos.y >= current.targetY) {
            current.pos.y = current.targetY;
            landIngredient();
          }
          return;
        }

        swingT += k.dt() * SWING_SPEED;
        current.pos.x = STACK_X + Math.sin(swingT) * SWING_RANGE;
      });

      function tryDrop() {
        if (ready && current && !dropping) dropping = true;
      }
      k.onClick(tryDrop);
      k.onKeyPress("space", tryDrop);

      function landIngredient() {
        const obj = current;
        const top = stack[stack.length - 1];

        const left  = obj.pos.x - obj.w / 2;
        const right = obj.pos.x + obj.w / 2;
        const topLeft  = top.x - top.width / 2;
        const topRight = top.x + top.width / 2;

        const overlapLeft  = Math.max(left, topLeft);
        const overlapRight = Math.min(right, topRight);
        const overlapWidth = overlapRight - overlapLeft;

        current = null; // this piece is done being "active" either way

        if (overlapWidth <= 2) {
          k.destroy(obj);
          endGame();
          return;
        }

        const newX = overlapLeft + overlapWidth / 2;
        obj.width = overlapWidth; // shrink the rect in place
        obj.pos.x = newX;         // recenter it

        stack.push({ x: newX, width: overlapWidth });
        game.addScore(1);

        if (overlapWidth < 6) {
          endGame();
          return;
        }

        spawnIngredient();
      }

      function endGame() {
        k.wait(0.5, () => game.finish());
      }

      k.onKeyPress("escape", () => game.finish());

      // delay both spawning and enabling input by a short buffer, so the
      // same click that pressed "Start" can't also register as a drop
      k.wait(0.4, () => {
        spawnIngredient();
        ready = true;
      });
    }
  });
}