import { GAME, PALETTE } from "../config.js";

export function background(k, rgb = PALETTE.sky) {
  // draw a solid background color; scene-specific image backgrounds
  // should be added inside the scene so they're not global.
  return k.add([
    k.rect(GAME.width, GAME.height),
    k.pos(0, 0),
    k.color(...rgb),
    k.z(-100),
    k.fixed(),
  ]);
}

export function heading(k, text, y = 140, size = 56, color = PALETTE.ink) {
  return k.add([
    k.text(text, { size, align: "center", width: GAME.width - 120 }),
    k.pos(GAME.width / 2, y),
    k.anchor("center"),
    k.color(...color),
  ]);
}

export function paragraph(k, text, y, size = 24) {
  return k.add([
    k.text(text, { size, align: "center", width: GAME.width - 200, lineSpacing: 8 }),
    k.pos(GAME.width / 2, y),
    k.anchor("center"),
    k.color(...PALETTE.ink),
  ]);
}

// Clickable button. Returns the root game obj so you can move/destroy it.
export function button(k, { text, pos, width = 280, height = 64, onClick }) {
  const btn = k.add([
    k.rect(width, height, { radius: 12 }),
    k.pos(pos),
    k.anchor("center"),
    k.area(),
    k.color(...PALETTE.cream),
    k.scale(1),
    "ui-button",
  ]);

  btn.add([
    k.text(text, { size: 26 }),
    k.anchor("center"),
    k.color(...PALETTE.ink),
  ]);

  btn.onHover(() => { btn.scale = k.vec2(1.05); k.setCursor("pointer"); });
  btn.onHoverEnd(() => { btn.scale = k.vec2(1); k.setCursor("default"); });
  btn.onClick(() => onClick?.());

  return btn;
}

// "press any key / click to continue" — used by intro + outro cards.
export function pressAnyKey(k, onContinue, label = "click or press space") {
  const hint = k.add([
    k.text(label, { size: 18 }),
    k.pos(GAME.width / 2, GAME.height - 60),
    k.anchor("center"),
    k.opacity(0.7),
    k.color(...PALETTE.ink),
  ]);
  hint.onUpdate(() => { hint.opacity = 0.5 + Math.sin(k.time() * 4) * 0.3; });

  k.onKeyPress("space", onContinue);
  k.onKeyPress("enter", onContinue);
  k.onClick(onContinue);
  return hint;
}
