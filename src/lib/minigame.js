import { GAME, PALETTE } from "../config.js";
import { recordScore } from "../state.js";
import { goNext } from "../flow.js";

/**
 * Shared plumbing for every minigame: countdown, score HUD, clean exit.
 *
 *   const game = useMinigame(k, { id: "sandwich" });
 *   game.addScore(3);
 *   game.onEnd(() => { ... })   // optional cleanup / bonus
 *
 * Ends automatically at 0s, or early via game.finish().
 */
export function useMinigame(k, { id, duration = GAME.minigameDuration, label = "" } = {}) {
  let score = 0;
  let timeLeft = duration;
  let running = true;
  const endHandlers = [];

  const hud = k.add([k.pos(0, 0), k.fixed(), k.z(100)]);

  const scoreLabel = hud.add([
    k.text("0", { size: 28 }),
    k.pos(24, 20),
    k.color(...PALETTE.ink),
  ]);

  const timerLabel = hud.add([
    k.text(String(duration), { size: 28 }),
    k.pos(GAME.width - 24, 20),
    k.anchor("topright"),
    k.color(...PALETTE.ink),
  ]);

  if (label) {
    hud.add([
      k.text(label, { size: 20 }),
      k.pos(GAME.width / 2, 24),
      k.anchor("top"),
      k.opacity(0.6),
      k.color(...PALETTE.ink),
    ]);
  }

  k.onUpdate(() => {
    if (!running) return;
    timeLeft = Math.max(0, timeLeft - k.dt());
    timerLabel.text = timeLeft.toFixed(1);
    timerLabel.color = timeLeft <= 5 ? k.rgb(200, 60, 60) : k.rgb(...PALETTE.ink);
    if (timeLeft <= 0) finish();
  });

  function addScore(n) {
    if (!running) return score;
    score += n;
    scoreLabel.text = String(score);
    return score;
  }

  function finish() {
    if (!running) return;
    running = false;
    endHandlers.forEach((fn) => fn(score));
    recordScore(id, score);
    k.wait(0.6, () => k.go("results", { id, score }));
  }

  return {
    addScore,
    finish,
    onEnd: (fn) => endHandlers.push(fn),
    get score() { return score; },
    get timeLeft() { return timeLeft; },
    get running() { return running; },
  };
}

// Re-exported so minigames don't have to reach into flow.js themselves.
export { goNext };
