// ============================================================
// Scene: Getting to the Picnic
// Game: Crossy-road style forward movement through obstacle lanes.
//
// Registered via index.js's registerScenes(k) loop (see index.js).
// Scene id must match the "id" used in flow.js's FLOW array ("crossing"),
// since goNext() and k.go() look scenes up by that id.
// ============================================================

import { goNext } from "../flow.js"; // adjust path if flow.js lives elsewhere
import { recordScore } from "../state.js";

export default function registerCrossyScene(k) {
  k.scene("crossing", () => {
  const LANE_H = 60;
  const LANE_COUNT = Math.floor(k.height() / LANE_H);
  const PLAYER_SPEED_STEP = LANE_H; 
  const TIME_LIMIT = 30;

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
    k.color(143, 206, 107), // grass green
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

  k.loadSprite("player", "assets/player.png");
  // ---- player ----
  const player = k.add([
    k.sprite("player"),
    k.scale(0.12),
    k.pos(k.width() / 2, k.height() - LANE_H / 2),
    k.area({scale: 0.2}),
    k.anchor("center"),
    k.z(10),
    "player",
  ]);

  k.loadSprite("car", "assets/car.png");
  k.loadSprite("truck", "assets/truck.png")
  k.loadSprite("car2", "assets/car2.png")

  // ---- obstacles ----
  // Each lane gets a direction and speed; obstacles wrap around the screen.
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
        k.area({scale: 0.2}),
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
    k.shake(2); //shakes screen a bit
    if (score.value > 0){
      score.value = score.value - 1;
      score.text = "Score: " + score.value;
    }
    else{
      score.text = "Score: " + score.value;
    }

  });

  // ---- player movement ----
  k.onKeyPress("up", () => {
    player.pos.y = Math.max(20, player.pos.y - PLAYER_SPEED_STEP);
    const row = Math.round((k.height() - player.pos.y) / LANE_H);
    if(row > farthestRow){
      farthestRow = row;
      score.value = score.value + 2;
      score.text = "Score: " + score.value
    }
    if (row == 10){
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
      // TODO: record `farthestRow` into your shared score store here —
      // see note below about where that lives in your project
      recordScore("crossing", score.value);
      k.go("results", { id: "crossing", score: score.value });
    }
  });
  }); 
} // end crossing road schene