import { GAME, PALETTE } from "../config.js";
import { button } from "../lib/ui.js";
import { goNext } from "../flow.js";
import { recordScore } from "../state.js";

export default function registerCrossyScene(k) {
  k.scene("crossing", () => {
    const LANE_H = 60;
    const LANE_COUNT = Math.floor(k.height() / LANE_H);
    const PLAYER_SPEED_STEP = LANE_H;
    const TIME_LIMIT = 30;

    k.loadSprite("player", "assets/player.png");
    k.loadSprite("car", "assets/car.png");
    k.loadSprite("truck", "assets/truck.png");
    k.loadSprite("car2", "assets/car2.png");
    k.add([
      k.rect(k.width(), k.height()),
      k.color(143, 206, 107), // grass green green
      k.pos(0, 0),
      k.z(-10),
    ]);
  let timeLeft = TIME_LIMIT;
  let farthestRow = 0;

  const score = k.add([
    k.text("Score: 0", { size: 20 }),
    k.pos(16, 16),
    { value: 0 }

  ]);

  // ---- ground / background lanes ----
  k.add([
    k.rect(k.width(), k.height()),
    k.color(251, 245, 226),
    k.pos(0, 0),
    k.z(-10),
  ]);

    for (let i = 0; i < LANE_COUNT; i++) {
      if (i % 2 === 0) {
        k.add([
          k.rect(k.width(), LANE_H),
          k.color(0, 0, 0),
          k.opacity(0.05),
          k.pos(0, k.height() - (i + 1) * LANE_H),
          k.z(-5),
        ]);
      }
    }

    // ---------------------------------------------------------------
    // START overlay — same style as picnic-setup: translucent gray,
    // instructions, and a "start!" button
    // ---------------------------------------------------------------
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.anchor("topleft"),
      k.color(...PALETTE.ink),
      k.opacity(0.75),
      k.fixed(),
      k.z(300),
    ]);

    const instr = k.add([
      k.text(
        "get to the picnic! dodge the cars and trucks and cross as many lanes as you can before time runs out.",
        { size: 20, width: 520, align: "center" }
      ),
      k.pos(k.width() / 2, k.height() / 2 - 40),
      k.anchor("center"),
      k.color(...PALETTE.cream),
      k.fixed(),
      k.z(310),
    ]);

    const startBtn = button(k, {
      text: "start!",
      pos: k.vec2(k.width() / 2, k.height() / 2 + 60),
      onClick: () => {
        overlay.destroy?.();
        instr.destroy?.();
        startBtn.destroy?.();
        beginGameplay();
      },
    });
    startBtn.fixed = true;
    startBtn.z = 320;

    
    function beginGameplay() {
      let timeLeft = TIME_LIMIT;
      let farthestRow = 0;

      const score = k.add([
        k.text("Score: 0", { size: 20 }),
        k.pos(16, 16),
        { value: 0 },
      ]);

      // ---- player ----
      const player = k.add([
        k.sprite("player"),
        k.scale(0.12),
        k.pos(k.width() / 2, k.height() - LANE_H / 2),
        k.area({ scale: 0.2 }),
        k.anchor("center"),
        k.z(10),
        "player",
      ]);

      // ---- obstacles ----
      const laneConfigs = [];
      for (let i = 0; i < LANE_COUNT - 1; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const speed = (80 + Math.random() * 120) * dir;
        laneConfigs.push({ y: k.height() - LANE_H / 2 - (i + 1) * LANE_H, speed });
      }

      const types = ["car", "truck", "car2"];

      laneConfigs.forEach((lane) => {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < count; j++) {
          const type = types[Math.floor(Math.random() * types.length)];
          k.add([
            k.sprite(type),
            k.scale(lane.speed < 0.4 ? -0.4 : 0.4, 0.4),
            k.pos((k.width() / count) * j + Math.random() * 40, lane.y),
            k.anchor("center"),
            k.area({ scale: 0.2 }),
            k.z(5),
            "obstacle",
            { speed: lane.speed },
          ]);
        }
      });

      // ---- obstacle movement + wraparound ----
      k.onUpdate("obstacle", (obs) => {
        obs.pos.x += obs.speed * k.dt();
        if (obs.pos.x > k.width() + 50) obs.pos.x = -50;
        if (obs.pos.x < -50) obs.pos.x = k.width() + 50;
      });

      // ---- collision: bump player back a row on hit ----
      player.onCollide("obstacle", () => {
        player.pos.y = Math.min(k.height() - 30, player.pos.y + LANE_H);
        k.shake(2);
        if (score.value > 0) {
          score.value = score.value - 1;
          score.text = "Score: " + score.value;
        } else {
          score.text = "Score: " + score.value;
        }
      });

      // ---- player movement ----
      k.onKeyPress("up", () => {
        player.pos.y = Math.max(20, player.pos.y - PLAYER_SPEED_STEP);
        const row = Math.round((k.height() - player.pos.y) / LANE_H);
        if (row > farthestRow) {
          farthestRow = row;
          score.value = score.value + 2;
          score.text = "Score: " + score.value;
        }
        if (row == 10) {
          k.wait(0.5, () => {
            recordScore("crossing", score.value);
            k.go("results", { id: "crossing", score: score.value });
          });
        }
      });
      k.onKeyPress("down", () => {
        player.pos.y = Math.min(k.height() - 30, player.pos.y + PLAYER_SPEED_STEP);
      });
      k.onKeyPress("left", () => {
        player.pos.x = Math.max(20, player.pos.x - 30);
      });
      k.onKeyPress("right", () => {
        player.pos.x = Math.min(k.width() - 20, player.pos.x + 30);
      });

      // reaching the very top row = "made it" -> loop back down, keep progress
      k.onUpdate(() => {
        if (player.pos.y < 20) {
          player.pos.y = k.height() - LANE_H / 2;
        }
      });

      // ---- HUD ----
      const hud = k.add([
        k.text(`Rows Crossed: ${farthestRow}   Time: ${timeLeft.toFixed(1)}s`, { size: 20 }),
        k.pos(150, 16),
        k.z(20),
        k.fixed(),
      ]);

      k.onUpdate(() => {
        timeLeft -= k.dt();
        hud.text = `Rows Crossed: ${farthestRow}   Time: ${Math.max(0, timeLeft).toFixed(1)}s`;
        if (timeLeft <= 0) {
          recordScore("crossing", score.value);
          k.go("results", { id: "crossing", score: score.value });
        }
      });
    }
  });
} // end crossing road scene