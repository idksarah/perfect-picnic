import { GAME, PALETTE } from "../config.js";
import { background, button } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";
import bunImg from "./assets/pixelated_baguette.png";
import cheeseImg from "./assets/cheese.png";
import tomatoImg from "./assets/tomato.png";
import jalapenoImg from "./assets/jalapeno.png";
import lettuceImg from "./assets/lettuce.png";
import kitchenImg from "./assets/kitchen.png";

export default function sandwich(k) {
  k.loadSprite("bun", bunImg);
  k.loadSprite("cheese", cheeseImg);
  k.loadSprite("tomato", tomatoImg);
  k.loadSprite("jalapeno", jalapenoImg);
  k.loadSprite("lettuce", lettuceImg);
  k.loadSprite("kitchen", kitchenImg);

  const INGREDIENT_SPRITES = ["cheese", "tomato", "jalapeno", "lettuce"];

  k.scene("sandwich", () => {
    background(k, PALETTE.sky);
    k.setGravity(0);

    const game = useMinigame(k, { id: "sandwich", label: "Stack the Sandwich", startPaused: true });

    // --- translucent start overlay, matches picnic-setup's style --------
    const overlay = k.add([
      k.rect(GAME.width, GAME.height),
      k.pos(0, 0),
      k.anchor("topleft"),
      k.color(...PALETTE.ink),
      k.opacity(0.75),
      k.fixed(),
      k.z(300),
    ]);

    const instr = k.add([
      k.text(
        "Let's prepare the perfect sandwich for your perfect picnic!\nClick to drop your ingredients and try to make the tallest sandwich you can!",
        { size: 20, width: 520, align: "center" }
      ),
      k.pos(GAME.width / 2, GAME.height / 2 - 40),
      k.anchor("center"),
      k.color(...PALETTE.cream),
      k.fixed(),
      k.z(310),
    ]);

    const startBtn = button(k, {
      text: "start!",
      pos: k.vec2(GAME.width / 2, GAME.height / 2 + 60),
      onClick: () => {
        overlay.destroy?.();
        instr.destroy?.();
        startBtn.destroy?.();
        game.start();
        beginGameplay();
      },
    });
    startBtn.fixed = true;
    startBtn.z = 320;

    // ---------------------------------------------------------------
    // gameplay, now wrapped in a function called once "start!" is clicked
    // ---------------------------------------------------------------
    function beginGameplay() {
      const STACK_X     = GAME.width / 2;
      const BASE_Y      = GAME.height - 100;
      const LAYER_H     = 34;
      const BASE_WIDTH  = 220;
      const SWING_SPEED = 2.5;
      const SWING_RANGE = 160;
      const FALL_SPEED  = 16;

      const SKY_HEIGHT = GAME.height * 20;
      k.add([
        k.rect(GAME.width, SKY_HEIGHT),
        k.pos(0, GAME.height - SKY_HEIGHT),
        k.color(177, 190, 206),
        k.z(-100),
      ]);

      k.add([
        k.sprite("kitchen", { width: GAME.width, height: GAME.height }),
        k.pos(0, 0),
        k.anchor("topleft"),
        k.z(-99),
      ]);

      const CAM_TOP_MARGIN = 140;
      let camY = GAME.height / 2;
      k.camPos(GAME.width / 2, camY);

      function updateCameraFor(worldY) {
        const visibleTop = camY - GAME.height / 2;
        if (worldY < visibleTop + CAM_TOP_MARGIN) {
          const targetCamY = worldY - CAM_TOP_MARGIN + GAME.height / 2;
          camY = Math.min(camY, targetCamY);
        }
      }

      k.onUpdate(() => {
        const cur = k.getCamPos();
        const newY = k.lerp(cur.y, camY, k.dt() * 6);
        k.camPos(GAME.width / 2, newY);
      });

      let stack = [{ x: STACK_X, width: BASE_WIDTH }];
      k.add([
        k.sprite("bun", { width: BASE_WIDTH, height: LAYER_H }),
        k.area(),
        k.pos(STACK_X, BASE_Y),
        k.anchor("center"),
      ]);

      let current = null;
      let dropping = false;
      let swingT = 0;

      function spawnIngredient() {
        const top = stack[stack.length - 1];
        const spawnY = BASE_Y - stack.length * LAYER_H - 40;

        // pick a random ingredient sprite instead of a random-color rect
        const spriteName = INGREDIENT_SPRITES[Math.floor(Math.random() * INGREDIENT_SPRITES.length)];

        current = k.add([
          k.sprite(spriteName, { width: top.width, height: LAYER_H }),
          k.pos(STACK_X, spawnY),
          k.anchor("center"),
        ]);
        current.w = top.width;
        current.targetY = BASE_Y - stack.length * LAYER_H;

        dropping = false;
        swingT = k.rand(0, Math.PI * 2);

        updateCameraFor(spawnY);
      }

      k.onUpdate(() => {
        if (!current) return;

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
        if (current && !dropping) dropping = true;
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

        current = null;

        if (overlapWidth <= 2) {
          k.destroy(obj);
          endGame();
          return;
        }

        // same cutting effect as before: trim to the overlap width and recenter
        const newX = overlapLeft + overlapWidth / 2;
        obj.width = overlapWidth;
        obj.pos.x = newX;

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

      spawnIngredient();
    }
  });
}