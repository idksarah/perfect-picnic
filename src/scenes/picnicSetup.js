import { GAME, PALETTE } from "../config.js";
import { background, button } from "../lib/ui.js";
import { useMinigame } from "../lib/minigame.js";

/**
 * MINIGAME 3 — Set Up the Picnic (45s, click & drag)
 *   Minimum: drag sandwich + water out of the basket onto the right spots.
 *   Extra:   pin the blanket corners; swat flies before they land on food.
 *   Scoring: every second left over * 2.
 */
export default function picnicSetup(k) {
  k.scene("picnic-setup", () => {
    background(k, PALETTE.sand);
    // scene-only sand image background (covers the width, sits behind the blanket)
    const sandBg = k.add([
      k.sprite("sand"),
      k.pos(GAME.width / 2, GAME.height / 2),
      k.anchor("center"),
      k.fixed(),
      k.z(-50),
      "bg-sand",
    ]);
    if (sandBg.width && sandBg.height) {
      const s = GAME.width / sandBg.width; // uniform width-based scale
      sandBg.scale = k.vec2(s);
      sandBg._bgScaled = true;
    } else {
      sandBg._bgScaled = false;
      sandBg.onUpdate(() => {
        if (sandBg._bgScaled) return;
        if (sandBg.width && sandBg.height) {
          const s = GAME.width / sandBg.width;
          sandBg.scale = k.vec2(s);
          sandBg._bgScaled = true;
        }
      });
    }

    const game = useMinigame(k, { id: "picnic-setup", label: "set up the picnic", startPaused: true });

    // START overlay with instructions
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
      k.text("set up the picnic: drag sandwiches, lemonade, and chips into the highlighted slots. hurry!" , { size: 20, width: 520, align: "center" }),
      k.pos(GAME.width / 2, GAME.height / 2 - 40),
      k.anchor("center"),
      k.color(...PALETTE.cream),
      k.fixed(),
      k.z(310),
    ]);

    const startBtn = button(k, { text: "start!", pos: k.vec2(GAME.width / 2, GAME.height / 2 + 60), onClick: () => {
      overlay.destroy?.();
      instr.destroy?.();
      startBtn.destroy?.();
      game.start();
    } });
    startBtn.fixed = true;
    startBtn.z = 320;

    const blanketX = GAME.width / 2;
    const blanketY = GAME.height / 2 + 20;
    const blanketW = GAME.height * 0.8;
    const blanketH = blanketW;
    const basketX = 100;
    const basketY = GAME.height / 2 + 20;
    const targetW = blanketW / 3.5;
    const targetH = targetW;

    const numberSandwiches = 3;
    const numberLemonades = 3;
    const numberChips = 3;

    let numberSandwichesPlaced = 0;
    let numberSandwichesOut = 0;
    let numberLemonadesPlaced = 0;
    let numberLemonadesOut = 0;
    let numberChipsPlaced = 0;
    let numberChipsOut = 0;

    // Call this once every required item is placed: leftover seconds * 2.
    const completeSetup = () => {
      game.addScore(Math.floor(game.timeLeft) * 2);
      game.finish();
    };

    // --- blanket + basket ----------------------------------------------
    // blanket background image (falls back to colored rect if sprite missing)
    const blanketSprite = k.add([
      k.sprite("picnic"),
      k.pos(blanketX, blanketY),
      k.anchor("center"),
      k.z(-10),
      "blanket",
    ]);

    // try to scale the sprite to match the blanket width if intrinsic dimensions are exposed
    if (blanketSprite.width && blanketSprite.height) {
      const s = blanketW / blanketSprite.width; // uniform scale preserving aspect ratio
      blanketSprite.scale = k.vec2(s);
      blanketSprite._scaled = true;
    } else {
      blanketSprite._scaled = false;
      blanketSprite.onUpdate(() => {
        if (blanketSprite._scaled) return;
        if (blanketSprite.width && blanketSprite.height) {
          const s = blanketW / blanketSprite.width;
          blanketSprite.scale = k.vec2(s);
          blanketSprite._scaled = true;
        }
      });
    }
    // clickable area for the basket (invisible) so the visual sprite can overlay it
    const basketW = 48 * 2 * 1.5;
    // make the basket a square clickable area
    const basketH = basketW;
    const basketArea = k.add([
      k.rect(basketW, basketH),
      k.pos(basketX, basketY),
      k.anchor("center"),
      k.area(),
      k.opacity(0),
      "basket",
    ]);

    // visual sprites rendered above the clickable area: closed and open versions
    const basketSprite = k.add([
      k.sprite("basket"),
      k.pos(basketX, basketY),
      k.anchor("center"),
      k.z(1),
      "basket-sprite",
    ]);
    const basketOpenSprite = k.add([
      k.sprite("basket-open"),
      k.pos(basketX, basketY),
      k.anchor("center"),
      k.z(1),
      k.opacity(0),
      "basket-open-sprite",
    ]);
    function scaleBasketSprites() {
      if (basketSprite.width && basketSprite.height) {
        const s = basketW / basketSprite.width; // uniform scale by width
        basketSprite.scale = k.vec2(s);
        basketSprite._scaled = true;
        if (basketOpenSprite.width && basketOpenSprite.height) {
          basketOpenSprite.scale = k.vec2(s);
          basketOpenSprite._scaled = true;
        }
        return true;
      }
      return false;
    }

    if (!scaleBasketSprites()) {
      basketSprite._scaled = false;
      basketOpenSprite._scaled = false;
      const tryScale = () => {
        if (scaleBasketSprites()) {
          basketSprite.offUpdate?.(tryScale);
          basketOpenSprite.offUpdate?.(tryScale);
        }
      };
      basketSprite.onUpdate(tryScale);
      basketOpenSprite.onUpdate(tryScale);
    }

    // toggle visuals on hover and scale basket by same multiplier as items
    basketArea._baseScale = k.vec2(1, 1);
    basketSprite._baseScale = k.vec2(basketSprite.scale?.x ?? 1, basketSprite.scale?.y ?? 1);
    basketOpenSprite._baseScale = k.vec2(basketOpenSprite.scale?.x ?? 1, basketOpenSprite.scale?.y ?? 1);
    basketArea.onHover(() => {
      // show open sprite and scale both area and sprites
      basketSprite.opacity = 0;
      basketOpenSprite.opacity = 1;
      const bbase = basketArea._baseScale;
      const mult = 1.1; // same pickup multiplier
      basketArea.scale = k.vec2(bbase.x * mult, bbase.y * mult);
      const sb = basketSprite._baseScale;
      basketSprite.scale = k.vec2(sb.x * mult, sb.y * mult);
      basketOpenSprite.scale = k.vec2(sb.x * mult, sb.y * mult);
      k.setCursor("pointer");
    });
    basketArea.onHoverEnd(() => {
      basketSprite.opacity = 1;
      basketOpenSprite.opacity = 0;
      const bbase = basketArea._baseScale;
      basketArea.scale = k.vec2(bbase.x, bbase.y);
      const sb = basketSprite._baseScale;
      basketSprite.scale = k.vec2(sb.x, sb.y);
      basketOpenSprite.scale = k.vec2(sb.x, sb.y);
      k.setCursor("default");
    });
    // compute a simple grid: 3 fixed columns (sandwich, lemonade, chips) and rows as needed
    const gap = 33;
    const cols = 3;
    const types = ["sandwich", "lemonade", "chips"];
    const numberByType = { sandwich: numberSandwiches, lemonade: numberLemonades, chips: numberChips };

    const stepY = targetH + gap;
    const left = blanketX - blanketW / 2;
    const top = blanketY - blanketH / 2;
    const colStep = cols > 1 ? (blanketW - targetW) / (cols - 1) : 0;

    const numberRows = Math.max(numberSandwiches, numberLemonades, numberChips);

    const targets = Array.from({ length: numberRows }, () => ({}));
    for (let row = 0; row < numberRows; row++) {
      const y = top + targetH / 2 + row * stepY;
      for (let c = 0; c < cols; c++) {
        const type = types[c];
        const x = left + targetW / 2 + c * colStep;
        if (row < numberByType[type]) {
          targets[row][type] = createDropTarget(k, x, y, targetW, targetH, type);
        } else {
          targets[row][type] = null;
        }
      }
    }

    // state for sequential reveal: row-major, per-row reveal order is sandwich -> lemonade -> chips
    let currentRow = 0;
    let currentStage = 0; // kept for compatibility
    let basketLocked = false; // when true, basket cannot be clicked until row completed

    // utility: shuffle an array
    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function revealRowStage(row, stage) {
      const type = types[stage];
      const t = targets[row][type];
      if (!t) return false;
      t.opacity = 0;
      if (t._borders) for (const b of t._borders) b.opacity = 1;
      return true;
    }

    // find and reveal the first required slot (row-major)
    function findAndRevealNext() {
      for (let r = 0; r < numberRows; r++) {
        for (let s = 0; s < 3; s++) {
          const type = ["sandwich", "lemonade", "chips"][s];
          const t = targets[r][type];
          const req = type === "sandwich" ? numberSandwiches : type === "lemonade" ? numberLemonades : numberChips;
          const placed = type === "sandwich" ? numberSandwichesPlaced : type === "lemonade" ? numberLemonadesPlaced : numberChipsPlaced;
          if (t && placed < req) {
            currentRow = r;
            currentStage = s;
            revealRowStage(currentRow, currentStage);
            return;
          }
        }
      }
    }

    // initial reveal is triggered by clicking the basket for each row
    // --- reusable drag behaviour ---------------------------------------
    // Attach "draggable" + this handler to any item you spawn.
    let dragging = null;
    let lastHoverTarget = null;

    // helper to ensure entities have a stored base scale (vec2)
    function ensureBaseScale(ent) {
      if (ent._baseScale) return ent._baseScale;
      if (ent.scale && typeof ent.scale === 'object' && ent.scale.x != null) {
        ent._baseScale = k.vec2(ent.scale.x, ent.scale.y);
      } else if (typeof ent.scale === 'number') {
        ent._baseScale = k.vec2(ent.scale, ent.scale);
      } else {
        ent._baseScale = k.vec2(1, 1);
      }
      return ent._baseScale;
    }

    // point-in-entity check (works even when another entity is under the mouse)
    function pointInEntity(ent, point) {
      if (!ent || !point) return false;
      const ex = ent.pos?.x ?? 0;
      const ey = ent.pos?.y ?? 0;
      const ew = (ent.width ?? 0) * ((ent.scale && ent.scale.x) || 1);
      const eh = (ent.height ?? 0) * ((ent.scale && ent.scale.y) || 1);
      const dx = Math.abs(point.x - ex);
      const dy = Math.abs(point.y - ey);
      return dx <= ew / 2 && dy <= eh / 2;
    }

    k.onMousePress(() => {
      const hovered = k.get("draggable").find((o) => o.isHovering() && !o.placed);
      if (hovered) {
        dragging = hovered;
        // ensure we remember the base scale and scale relative to it (10% larger)
        const base = ensureBaseScale(dragging);
        dragging.scale = k.vec2(base.x * 1.1, base.y * 1.1);
      }

      const overBasket = k.get("basket").find((o) => pointInEntity(o, k.mousePos()));
      if (overBasket) {
        if (basketLocked) return;

        // collect the types that exist for this row
        const typesForRow = types.filter((t) => !!targets[currentRow]?.[t]);
        if (typesForRow.length === 0) return;

        // reveal targets for this row
        for (const t of typesForRow) {
          const tgt = targets[currentRow][t];
          if (tgt) {
            tgt.opacity = 0;
            if (tgt._borders) for (const b of tgt._borders) b.opacity = 1;
          }
        }

        // spawn all objects for this row in a random order
        const order = shuffle(typesForRow);
        // debug: log the spawn order so randomness can be verified in console
        console.log("Spawn order for row", currentRow, order);
        const spacing = 72;
        const baseX = basketX + 60;
        for (let i = 0; i < order.length; i++) {
          const t = order[i];
          const spawnX = baseX + spacing * i;
          if (t === "sandwich") {
            numberSandwichesOut++;
            spawnSandwich(k, spawnX, basketY);
          } else if (t === "lemonade") {
            numberLemonadesOut++;
            spawnLemonade(k, spawnX, basketY);
          } else if (t === "chips") {
            numberChipsOut++;
            spawnChips(k, spawnX, basketY);
          }
        }

        // lock the basket until all targets in this row are filled
        basketLocked = true;
      }
    });
    k.onMouseMove(() => {
      if (!dragging) return;
      dragging.pos = k.mousePos();

      const base = ensureBaseScale(dragging);
      // if hovering over a matching target, enlarge to 120% relative to base
      const mouse = k.mousePos();
      const hoverTarget = k.get("drop-target").find((t) => pointInEntity(t, mouse));
      if (hoverTarget && hoverTarget.slot === dragging.slot) {
        // scale dragging relative to its base
        dragging.scale = k.vec2(base.x * 1.2, base.y * 1.2);
        // scale the target similarly
        const tbase = ensureBaseScale(hoverTarget);
        hoverTarget.scale = k.vec2(tbase.x * 1.2, tbase.y * 1.2);
        // scale border pieces if present
        if (hoverTarget._borders) {
          for (const b of hoverTarget._borders) {
            const bb = b._baseScale ?? ensureBaseScale(b);
            b.scale = k.vec2(bb.x * 1.2, bb.y * 1.2);
          }
        }
        // restore previous target if different
        if (lastHoverTarget && lastHoverTarget !== hoverTarget) {
          const lb = ensureBaseScale(lastHoverTarget);
          lastHoverTarget.scale = k.vec2(lb.x, lb.y);
          if (lastHoverTarget._borders) {
            for (const b of lastHoverTarget._borders) {
              const bb = b._baseScale ?? ensureBaseScale(b);
              b.scale = k.vec2(bb.x, bb.y);
            }
          }
        }
        lastHoverTarget = hoverTarget;
        k.setCursor("pointer");
      } else {
        // otherwise keep pick-up scale (110%) relative to base
        dragging.scale = k.vec2(base.x * 1.1, base.y * 1.1);
        if (lastHoverTarget) {
          const lb = ensureBaseScale(lastHoverTarget);
          lastHoverTarget.scale = k.vec2(lb.x, lb.y);
          if (lastHoverTarget._borders) {
            for (const b of lastHoverTarget._borders) {
              const bb = b._baseScale ?? ensureBaseScale(b);
              b.scale = k.vec2(bb.x, bb.y);
            }
          }
          lastHoverTarget = null;
        }
        k.setCursor("default");
      }
    });
    k.onMouseRelease(() => {
      if (!dragging) return;

      // find a drop-target under the pointer
      const target = k.get("drop-target").find((t) => pointInEntity(t, k.mousePos()));
      if (target && target.slot === dragging.slot) {
        // expected target for this stage
        const expected = targets[currentRow][dragging.slot];
        if (expected && expected === target) {
          // snap the item to the center of the target and lock it
          dragging.pos = target.pos;
          dragging.placed = true;

          // remove the visual target and its border pieces
          if (expected._borders) {
            for (const b of expected._borders) {
              if (b.destroy) b.destroy();
            }
          }
          if (expected.destroy) expected.destroy();
          targets[currentRow][dragging.slot] = null;

          // increment counts
          if (dragging.slot === "sandwich") {
            numberSandwichesPlaced++;
            numberSandwichesOut = Math.max(0, numberSandwichesOut - 1);
          } else if (dragging.slot === "lemonade") {
            numberLemonadesPlaced++;
            numberLemonadesOut = Math.max(0, numberLemonadesOut - 1);
          } else if (dragging.slot === "chips") {
            numberChipsPlaced++;
            numberChipsOut = Math.max(0, numberChipsOut - 1);
          }

          // check if the current row is fully filled; if so, unlock the basket and advance row
          let rowDone = true;
          for (const t of types) {
            if (targets[currentRow] && targets[currentRow][t]) { rowDone = false; break; }
          }
          if (rowDone) {
            if (currentRow + 1 >= numberRows) {
              completeSetup();
            } else {
              currentRow += 1;
              basketLocked = false;
            }
          }
        }
      }

      // restore scale when released to base
      const base = ensureBaseScale(dragging);
      dragging.scale = k.vec2(base.x, base.y);
      dragging = null;
    });

    // --- TODO: gameplay ------------------------------------------------
    // 1. Spawn items in the basket with [k.area(), "draggable", { slot: "..." }].
    // 2. Draw faint target slots on the blanket; snap on drop.
    // 3. Spawn flies that home in on placed food; click to swat.
    // 4. When every required item is placed, call completeSetup().

    k.onKeyPress("escape", () => completeSetup()); // dev shortcut: skip ahead
  });
}

function spawnSandwich(k, x, y) {
  const sw = k.add([
    k.sprite("sandwich"),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    "draggable",
    { slot: "sandwich", placed: false },
  ]);
  // scale so the sandwich height matches the shared desired height (1.5x larger)
  const desiredH = Math.round(64 * 1.5);
  if (sw.width && sw.height) {
    const s = desiredH / sw.height;
    sw.scale = k.vec2(s);
    sw._scaled = true;
  } else {
    sw._scaled = false;
    sw.onUpdate(() => {
      if (sw._scaled) return;
      if (sw.width && sw.height) {
        const s = desiredH / sw.height;
        sw.scale = k.vec2(s);
        sw._scaled = true;
      }
    });
  }
}

function spawnLemonade(k, x, y) {
  const lm = k.add([
    k.sprite("lemonade"),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    "draggable",
    { slot: "lemonade", placed: false },
  ]);

  // match sandwich height (1.5x larger)
  const desiredH = Math.round(64 * 1.5);
  if (lm.width && lm.height) {
    const s = desiredH / lm.height;
    lm.scale = k.vec2(s);
    lm._scaled = true;
  } else {
    lm._scaled = false;
    lm.onUpdate(() => {
      if (lm._scaled) return;
      if (lm.width && lm.height) {
        const s = desiredH / lm.height;
        lm.scale = k.vec2(s);
        lm._scaled = true;
      }
    });
  }
}

function spawnChips(k, x, y) {
  const cp = k.add([
    k.sprite("chips"),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    "draggable",
    { slot: "chips", placed: false },
  ]);

  // desired visual height for chips (match sandwich/lemonade height)
  const desiredH = Math.round(64 * 1.5);
  if (cp.width && cp.height) {
    const s = desiredH / cp.height;
    cp.scale = k.vec2(s);
    cp._scaled = true;
  } else {
    cp._scaled = false;
    cp.onUpdate(() => {
      if (cp._scaled) return;
      if (cp.width && cp.height) {
        const s = desiredH / cp.height;
        cp.scale = k.vec2(s);
        cp._scaled = true;
      }
    });
  }
}

function createDropTarget(k, x, y, width, height, slot, opts = {}) {
  const tgt = k.add([
    k.rect(width, height),
    k.pos(x, y),
    k.anchor("center"),
    k.area(),
    k.color(...PALETTE.target),
    k.opacity(0),
    "drop-target",
    { slot },
  ]);

  // pick a default border color per type if not provided
  const defaultColor = opts.borderColor ?? (slot === "sandwich" ? PALETTE.sandwichBorder : slot === "lemonade" ? PALETTE.lemonadeBorder : PALETTE.chipsBorder);
  const borders = addDashedBorder(k, x, y, width, height, { color: defaultColor, hidden: true });
  tgt._borders = borders;
  // store base scale for the target and its border pieces
  tgt._baseScale = k.vec2(1, 1);
  for (const b of borders) {
    b._baseScale = k.vec2(1, 1);
  }
  return tgt;
}

function addDashedBorder(k, x, y, width, height, opts = {}) {
  const dashLen = opts.dashLen ?? 12;
  const gap = opts.gap ?? 8;
  const thickness = opts.thickness ?? 3;
  const color = opts.color ?? PALETTE.ink;
  const z = opts.z ?? 1;
  const hidden = !!opts.hidden;

  const pieces = [];

  // top & bottom horizontal dashes
  const horizCount = Math.max(1, Math.floor(width / (dashLen + gap)));
  for (let i = 0; i < horizCount; i++) {
    const dx = -width / 2 + i * (dashLen + gap) + dashLen / 2;
    // top
    pieces.push(k.add([
      k.rect(dashLen, thickness),
      k.pos(x + dx, y - height / 2 - thickness / 2),
      k.anchor("center"),
      k.color(...color),
      hidden ? k.opacity(0) : k.opacity(1),
      k.z(z),
      "drop-border",
    ]));
    // bottom
    pieces.push(k.add([
      k.rect(dashLen, thickness),
      k.pos(x + dx, y + height / 2 + thickness / 2),
      k.anchor("center"),
      k.color(...color),
      hidden ? k.opacity(0) : k.opacity(1),
      k.z(z),
      "drop-border",
    ]));
  }

  // left & right vertical dashes
  const vertCount = Math.max(1, Math.floor(height / (dashLen + gap)));
  for (let i = 0; i < vertCount; i++) {
    const dy = -height / 2 + i * (dashLen + gap) + dashLen / 2;
    // left
    pieces.push(k.add([
      k.rect(thickness, dashLen),
      k.pos(x - width / 2 - thickness / 2, y + dy),
      k.anchor("center"),
      k.color(...color),
      hidden ? k.opacity(0) : k.opacity(1),
      k.z(z),
      "drop-border",
    ]));
    // right
    pieces.push(k.add([
      k.rect(thickness, dashLen),
      k.pos(x + width / 2 + thickness / 2, y + dy),
      k.anchor("center"),
      k.color(...color),
      hidden ? k.opacity(0) : k.opacity(1),
      k.z(z),
      "drop-border",
    ]));
  }

  // ensure baseScale on pieces (some engines don't expose scale until later)
  for (const p of pieces) {
    p._baseScale = k.vec2(1, 1);
  }

  return pieces;
}