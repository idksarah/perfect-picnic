import { OUTCOMES } from "./config.js";

// Score + progress that survives across scenes. One object, no framework.
export const session = {
  scores: {},        // { sandwich: 12, crossing: 30, ... }
  startedAt: 0,
};

export function resetSession() {
  session.scores = {};
  session.startedAt = Date.now();
}

export function recordScore(minigameId, score) {
  session.scores[minigameId] = Math.max(0, Math.round(score));
}

export function totalScore() {
  return Object.values(session.scores).reduce((a, b) => a + b, 0);
}

export function outcome() {
  const total = totalScore();
  return OUTCOMES.find((o) => total >= o.min) ?? OUTCOMES[OUTCOMES.length - 1];
}
