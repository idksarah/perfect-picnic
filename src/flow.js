// The whole game order lives here. Reorder / add a minigame by editing this array.
export const FLOW = [
  { id: "home" },
  { id: "intro" },
  { id: "sandwich", label: "Stack the Sandwich", step: "1 / 3", minigame: true },
  { id: "crossing", label: "Get to the Picnic", step: "2 / 3", minigame: true },
  { id: "picnic-setup", label: "Set Up the Picnic", step: "3 / 3", minigame: true },
  { id: "outro" },
];

export const MINIGAMES = FLOW.filter((s) => s.minigame);

export function stepFor(id) {
  return FLOW.find((s) => s.id === id) ?? null;
}

export function nextStep(id) {
  const i = FLOW.findIndex((s) => s.id === id);
  return i === -1 ? null : FLOW[i + 1] ?? null;
}

// Go to whatever comes after `fromId`. Minigames get a title card first.
export function goNext(k, fromId) {
  const next = nextStep(fromId);
  if (!next) return k.go("home");
  if (next.minigame) return k.go("title-card", next);
  return k.go(next.id);
}
