"use strict";

const AtelierArt = (() => {
  const skirtCuts = ["skirt", "pencil", "pleated"];
  const longCoats = ["coat", "trench"];
  const closedCuts = [...longCoats, "peacoat", "puffer", "bomber"];
  const ease = { slim: 1.6, regular: 3, relaxed: 5, oversized: 8 };
  const sockTop = 258;
  const tiles = new WeakMap();
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
  const tint = (hex, amount) => "#" + [1, 3, 5].map((n) => {
    const value = parseInt(hex.slice(n, n + 2), 16);
    return Math.round(value + ((amount < 0 ? 0 : 255) - value) * Math.abs(amount)).toString(16).padStart(2, "0");
  }).join("");
  const colour = (item) => Wardrobe.itemColor(item).hex;

  function cloth(ctx, hex, left = -43, right = 43) {
    const gradient = ctx.createLinearGradient(left, 0, right, 0);
    gradient.addColorStop(0, tint(hex, -.17));
    gradient.addColorStop(.32, tint(hex, .13));
    gradient.addColorStop(.69, hex);
    gradient.addColorStop(1, tint(hex, -.18));
    return gradient;
  }

  function skinPaint(ctx, tone) {
    const gradient = ctx.createLinearGradient(-50, 0, 54, 0);
    gradient.addColorStop(0, tint(tone, .085));
    gradient.addColorStop(.34, tint(tone, .035));
    gradient.addColorStop(.63, tone);
    gradient.addColorStop(1, tint(tone, -.09));
    return gradient;
  }

  function softTone(ctx, x, y, rx, ry, color, opacity, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(rx, ry);
    const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    fade.addColorStop(0, color);
    fade.addColorStop(1, color + "00");
    ctx.globalAlpha = opacity;
    ctx.fillStyle = fade;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function shape(ctx, path, fill, line, width = 1) {
    const outline = typeof path === "string" ? new Path2D(path) : path;
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(outline);
    }
    if (line) {
      ctx.strokeStyle = line;
      ctx.lineWidth = width;
      ctx.stroke(outline);
    }
  }

  function dot(ctx, x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function shade(ctx, y, rx, ry) {
    ctx.save();
    ctx.translate(0, y);
    ctx.scale(rx, ry);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    glow.addColorStop(0, "#414c407d");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function patternTile(item) {
    if (item.texture) return item.texture;
    if (item.pattern === "solid" || !item.pattern) return null;
    if (tiles.has(item)) return tiles.get(item);
    const tile = document.createElement("canvas");
    tile.width = tile.height = 24;
    const ctx = tile.getContext("2d");
    const accent = item.accent;
    ctx.fillStyle = accent;
    if (item.pattern === "stripes") {
      ctx.fillRect(0, 3, 24, 4);
      ctx.fillRect(0, 15, 24, 4);
    } else if (item.pattern === "pinstripe") {
      for (let x = 0; x < 24; x += 6) ctx.fillRect(x, 0, 1, 24);
    } else if (item.pattern === "checks") {
      ctx.globalAlpha = .55;
      for (const pos of [3, 15]) {
        ctx.fillRect(pos, 0, 3, 24);
        ctx.fillRect(0, pos, 24, 3);
      }
    } else if (item.pattern === "dots") {
      dot(ctx, 6, 6, 1.6, accent);
      dot(ctx, 18, 18, 1.6, accent);
    } else if (item.pattern === "floral") {
      for (const [x, y] of [[6, 7], [18, 17]]) {
        for (const [dx, dy] of [[0, -2], [0, 2], [-2, 0], [2, 0]]) dot(ctx, x + dx, y + dy, 1.75, accent);
        dot(ctx, x, y, 1.1, tint(colour(item), -.32));
      }
    }
    tiles.set(item, tile);
    return tile;
  }

  function fabric(ctx, d, item) {
    const col = colour(item);
    const path = typeof d === "string" ? new Path2D(d) : d;
    shape(ctx, path, cloth(ctx, col));
    if (item.pattern === "blocks" && !item.texture) {
      ctx.save();
      ctx.clip(path);
      ctx.fillStyle = cloth(ctx, item.accent);
      ctx.fillRect(-90, item.category === "bottom" ? 180 : 107, 180, 160);
      ctx.restore();
    } else {
      const tile = patternTile(item);
      if (tile) {
        ctx.save();
        ctx.globalAlpha = item.texture ? .93 : .82;
        shape(ctx, path, ctx.createPattern(tile, "repeat"));
        ctx.restore();
      }
    }
    shape(ctx, path, null, tint(col, -.25), .8);
  }

  function geometry(person) {
    const female = person.figure === "female";
    const m = person.measures || {};
    const change = (key, average, factor) => m[key] ? clamp((m[key] - average) * factor, -5, 14) : 0;
    const chest = (female ? 26 : 31) + change("chest", female ? 90 : 99, .15);
    const waist = (female ? 18.5 : 24.8) + change("waist", female ? 72 : 83, .16);
    const hip = (female ? 32 : 26.8) + change("hip", female ? 98 : 99, .15);
    const leg = m.height && m.inseam ? clamp((m.inseam / m.height - .45) * 115, -9, 9) : 0;
    return { female, chest, waist, hip, shoulder: chest + (female ? 1.5 : 6.5), neck: female ? 8.4 : 10.8,
      armFullness: female ? 3.15 : 5.1, arm: change("arm", female ? 58 : 63, .32), leg };
  }

  function band(g, y) {
    const t = (y - 81) / (65 + g.arm);
    const fullness = (center, radius) => Math.max(0, 1 - ((y - center) / radius) ** 2) ** 2;
    const muscle = (g.female ? .75 : 1.25) * fullness(100, 15) + (g.female ? .5 : 1.05) * fullness(129, 13);
    return { x: g.shoulder + 14.5 * t, width: (g.shoulder * .082 + g.armFullness) - 2.7 * t + muscle };
  }

  function armContour(levels, x) {
    let curve = "";
    const slope = (y) => (x(y + .01) - x(y - .01)) / .02;
    for (let i = 1; i < levels.length; i++) {
      const from = levels[i - 1];
      const to = levels[i];
      const step = (to - from) / 3;
      curve += " C" + (x(from) + slope(from) * step) + " " + (from + step) + " " +
        (x(to) - slope(to) * step) + " " + (to - step) + " " + x(to) + " " + to;
    }
    return curve;
  }

  function arm(ctx, g, end, pad, fill, item) {
    const start = band(g, 80);
    const bend = band(g, 86);
    const cuff = band(g, end);
    const capY = item ? 72 : 77;
    const startY = item ? 76 : 79;
    const outside = (part) => part.x + part.width + pad;
    const inside = (part) => part.x - part.width - pad;
    const levels = [86, ...[94, 101, 108, 115, 122, 129, 136, 143, 150].filter((y) => y < end), end];
    const outerEdge = armContour(levels, (y) => outside(band(g, y)));
    const innerEdge = armContour(levels.slice().reverse(), (y) => inside(band(g, y)));
    const d = new Path2D("M" + inside(start) + " " + startY + " C" + (start.x - 1) + " " + capY +
      " " + (start.x + 5) + " " + capY + " " + outside(bend) + " 86" + outerEdge +
      " Q" + cuff.x + " " + (end + 2.3) + " " + inside(cuff) + " " + end + innerEdge + "Z");
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      if (item) {
        fabric(ctx, d, item);
        const stitching = band(g, end - 3);
        shape(ctx, "M" + (inside(stitching) + .8) + " " + (end - 3) + " Q" +
          stitching.x + " " + (end - 1.2) + " " + (outside(stitching) - .8) + " " + (end - 3), null, tint(colour(item), -.22), .65);
      } else {
        shape(ctx, d, fill.gradient, fill.line, .48);
        ctx.save();
        ctx.clip(d);
        softTone(ctx, band(g, 89).x - .6, 88, 5.5, 15, tint(fill.tone, .42), .22, -.11);
        softTone(ctx, band(g, 103).x - .8, 101, 4.1, 19, tint(fill.tone, .33), g.female ? .19 : .29, -.19);
        softTone(ctx, band(g, 119).x - 3.5, 117, 2.9, 13, tint(fill.tone, -.32), g.female ? .20 : .30, -.16);
        softTone(ctx, band(g, 134).x + 1, 131, 3.1, 15, tint(fill.tone, .3), .24, -.15);
        ctx.restore();
        const x = cuff.x;
        const hand = new Path2D("M" + (x - 3.5) + " " + (end - 4) + "L" + (x + 3.4) + " " + (end - 4) +
          " C" + (x + 4.1) + " " + end + " " + (x + 5.1) + " " + (end + 4) + " " + (x + 4) + " " + (end + 8) +
          " Q" + (x + 2.6) + " " + (end + 13) + " " + (x + .5) + " " + (end + 12) +
          " Q" + (x - 2.4) + " " + (end + 11.9) + " " + (x - 3.1) + " " + (end + 6.4) +
          " Q" + (x - 5.5) + " " + (end + 8.9) + " " + (x - 5.4) + " " + (end + 4.4) +
          " Q" + (x - 4.9) + " " + (end + 1.3) + " " + (x - 3.5) + " " + (end - 4) + "Z");
        shape(ctx, hand, fill.gradient, fill.line, .45);
        shape(ctx, "M" + (x - 1.8) + " " + (end + 5.1) + "q.7 3.4 1.5 4.9", null, tint(fill.tone, -.19), .47);
      }
      ctx.restore();
    }
  }

  function upperShape(g, item, extra, tuck) {
    const pad = ease[item.fit] + extra;
    const chest = g.chest + pad;
    const waist = g.waist + pad;
    const sleeveless = item.cut === "tank" || item.cut === "vest";
    const shoulder = g.shoulder + (sleeveless ? -10 : 1.5) + pad * .12;
    const mid = item.category === "mid";
    const hem = tuck ? tuck.y + 1 : mid ? Math.max(150, 151 - g.leg * .33) : item.cut === "blouse" ? 145 : 144;
    const hemWidth = tuck ? Math.min(waist + 2, tuck.width - .5) : waist + 2;
    const collar = item.cut === "tank" ? 89 : item.cut === "vest" ? 97 : item.cut === "turtleneck" ? 75 : 84;
    return { pad, chest, waist, shoulder, hem, hemWidth, collar };
  }

  function collar(ctx, item, y) {
    const c = colour(item);
    shape(ctx, "M-9 " + y + " L-1 " + (y + 9) + " L-8 " + (y + 14) + " L-13 " + (y + 2) + " Z M9 " + y + " L1 " + (y + 9) +
      " L8 " + (y + 14) + " L13 " + (y + 2) + " Z", tint(c, .14), tint(c, -.27), .8);
  }

  function upper(ctx, g, item, under, extra = 0, tuck) {
    const { cut } = item;
    const { chest, waist, pad, shoulder, hem, hemWidth, collar: neck } = upperShape(g, item, extra, tuck);
    const knit = item.category === "mid";
    const sleeveless = cut === "tank" || cut === "vest";
    const end = cut === "tee" || cut === "polo" ? 108 : (knit ? 149 : 145) + g.arm;
    const col = colour(item);
    const seam = tint(col, -.27);
    if (!sleeveless) arm(ctx, g, end, 1.4 + pad * .47, null, item);
    const edge = g.neck + (sleeveless ? 1 : .8);
    const neckY = sleeveless ? 74 : 70.5;
    const rise = sleeveless ? 75 : 71.2;
    const next = sleeveless ? " Q" + (shoulder - 1) + " 94 " + chest + " 106" : " Q" + (shoulder + 1) + " 93 " + chest + " 107";
    const back = sleeveless ? " Q" + (-shoulder + 1) + " 94 " + -shoulder + " 79" : " Q" + (-shoulder - 1) + " 93 " + -shoulder + " 79";
    const torso = new Path2D("M" + -edge + " " + neckY + " Q0 " + (neck + 8) + " " + edge + " " + neckY +
      " C" + (edge + 7) + " " + rise + " " + shoulder + " " + rise + " " + shoulder + " 79" +
      next + " Q" + (waist - 1) + " 124 " + hemWidth + " " + hem + " Q0 " + (hem + 4.5) + " " + -hemWidth + " " + hem +
      " Q" + (-waist + 1) + " 124 " + -chest + " 107" + back +
      " C" + -shoulder + " " + rise + " " + (-edge - 7) + " " + rise + " " + -edge + " " + neckY + "Z");
    fabric(ctx, torso, item);
    ctx.save();
    ctx.clip(torso);
    softTone(ctx, -chest * .33, 95, chest * .55, 20, tint(col, .55), .20, -.1);
    softTone(ctx, chest * .38, 98, chest * .59, 17, tint(col, .37), .17, .19);
    if (g.female) softTone(ctx, 0, 108, chest * .8, 8.7, tint(col, -.31), .22);
    softTone(ctx, waist, 122, 10, 22, tint(col, -.34), .19, -.15);
    ctx.restore();
    if (!tuck) shape(ctx, "M" + (1 - hemWidth) + " " + (hem - 3) + " Q0 " + (hem + 2) + " " + (hemWidth - 1) + " " + (hem - 3), null, seam, knit ? 1.5 : .75);
    if (["shirt", "blouse", "polo"].includes(cut)) {
      collar(ctx, item, 73);
      shape(ctx, "M0 83V" + (cut === "polo" ? 102 : hem), null, seam, .8);
      const endButton = cut === "polo" ? 101 : hem - 5;
      for (let y = 90; y < endButton; y += 9) dot(ctx, 1.5, y, .85, seam);
    } else if (cut === "hoodie") {
      shape(ctx, "M-12 76 Q-14 66 0 67 Q14 66 12 76 Q9 85 0 87 Q-9 85 -12 76 Z", cloth(ctx, col), seam);
      shape(ctx, "M-8 78 Q0 87 8 78 M-4 84l-2 23 M4 84l2 22 M-11 130l-4 9h30l-4-9z", null, seam, .9);
    } else if (cut === "turtleneck") {
      fabric(ctx, "M-9 67Q0 70 9 67l1 11Q0 82-10 78Z", item);
      shape(ctx, "M-8 72Q0 75 8 72", null, seam, 1);
    } else {
      shape(ctx, "M" + -edge + " " + (neckY + .7) + " Q0 " + (neck + 9) + " " + edge + " " + (neckY + .7), null, seam, knit ? 2.3 : 1);
      if (under && ["shirt", "blouse", "polo"].includes(under.cut)) collar(ctx, under, 73);
    }
  }

  function hemFor(item, g) {
    if (item.cut === "shorts") return 192 + g.leg * .4;
    if (skirtCuts.includes(item.cut)) return (item.cut === "pencil" ? 203 : 218) + g.leg * .45;
    return 264;
  }

  function skirtWidth(g, item, y) {
    const hip = g.hip + ease[item.fit];
    const flare = item.cut === "pencil" ? -5 : item.cut === "pleated" ? 15 : 12;
    const t = clamp((y - (162 - g.leg)) / (hemFor(item, g) - (162 - g.leg)), 0, 1);
    return hip + flare * t;
  }

  function waistband(g, item) {
    return { width: g.waist + ease[item.fit], y: 143 - g.leg * .33 };
  }

  function ankle(g) {
    return { center: Math.max(13, g.hip * (g.female ? .515 : .56)), half: (g.female ? 3.9 : 4.45) + g.hip * .024 };
  }

  function bottom(ctx, g, item) {
    const { width: base, y: rise } = waistband(g, item);
    const hip = g.hip + ease[item.fit];
    const middle = 163 - g.leg;
    const hem = hemFor(item, g);
    const col = colour(item);
    const seam = tint(col, -.25);
    if (skirtCuts.includes(item.cut)) {
      const edge = skirtWidth(g, item, hem);
      fabric(ctx, "M" + -base + " " + rise + " Q0 " + (rise + 4) + " " + base + " " + rise +
        " Q" + (hip - 2) + " " + (middle - 7) + " " + hip + " " + middle +
        " L" + edge + " " + hem + " Q0 " + (hem + 9) + " " + -edge + " " + hem + " L" + -hip + " " + middle +
        " Q" + (2 - hip) + " " + (middle - 7) + " " + -base + " " + rise + " Z", item);
      shape(ctx, "M" + -base + " " + (rise + 6) + " Q0 " + (rise + 11) + " " + base + " " + (rise + 6), null, seam, .9);
      if (item.cut !== "pencil") {
        for (const x of item.cut === "pleated" ? [-19, -10, -3, 6, 14, 23] : [-15, 16]) {
          shape(ctx, "M" + (x * .82) + " " + (rise + 10) + " L" + (x * edge / 29) + " " + (hem - 2), null, seam, .8);
        }
      }
      return;
    }
    const foot = ankle(g);
    const legWidth = item.cut === "widepants" ? hip + 2 : item.cut === "shorts" ? hip - 1 : Math.max(foot.center + foot.half + 1.2, hip - 4);
    const centerHem = item.cut === "widepants" ? 2.2 : item.cut === "shorts" ? 2.5 : Math.min(6, foot.center - foot.half - 1);
    fabric(ctx, "M" + -base + " " + rise + " Q0 " + (rise + 4) + " " + base + " " + rise +
      " Q" + hip + " " + (middle - 6) + " " + hip + " " + (middle + 4) +
      " L" + legWidth + " " + hem + " Q" + (legWidth / 2) + " " + (hem + 3) + " " + centerHem + " " + hem + " L0 " + (middle + 18) +
      " L" + -centerHem + " " + hem + " Q" + (-legWidth / 2) + " " + (hem + 3) + " " + -legWidth + " " + hem +
      " L" + -hip + " " + (middle + 4) + " Q" + -hip + " " + (middle - 6) + " " + -base + " " + rise + " Z", item);
    const detail = item.cut === "jeans" ? tint(col, .34) : seam;
    shape(ctx, "M" + -base + " " + (rise + 6) + " Q0 " + (rise + 11) + " " + base + " " + (rise + 6) +
      " M0 " + (rise + 7) + "v13q5 0 5-6v-6 M" + (3 - hip) + " " + (rise + 11) + "q10 0 12-2q-1 8-12 10 M" + (hip - 3) +
      " " + (rise + 11) + "q-10 0-12-2q1 8 12 10", null, detail, .82);
    dot(ctx, 0, rise + 4, 1.2, tint(col, .52));
    if (item.cut === "cargo") shape(ctx, "M" + (legWidth - 11) + " 189h9v14h-9z M" + (2 - legWidth) + " 189h9v14h-9z", cloth(ctx, col), seam, .75);
  }

  function knitEase(knit, shirt) {
    return Math.max(ease[knit.fit], shirt ? ease[shirt.fit] + 1.5 : 0);
  }

  function outer(ctx, g, item, worn) {
    const { cut } = item;
    const underneath = worn.mid ? knitEase(worn.mid, worn.top) : worn.top ? ease[worn.top.fit] : 0;
    const pad = Math.max(ease[item.fit] + 4, underneath + 3.5);
    const chest = g.chest + pad;
    const long = longCoats.includes(cut);
    const hem = item.previewHem ?? (long ? (cut === "trench" ? 232 : 224) : cut === "peacoat" ? 181 : cut === "cardigan" ? 168 : cut === "blazer" ? 162 : 154);
    const isSkirt = worn.bottom && skirtCuts.includes(worn.bottom.cut);
    const rise = worn.bottom ? g.waist + ease[worn.bottom.fit] : g.waist;
    const hip = Math.max(g.hip + (worn.bottom ? ease[worn.bottom.fit] : 0) + 2, rise + pad * .48);
    const edge = Math.max(hip, isSkirt ? skirtWidth(g, worn.bottom, hem) + 3.5 : 0) + (long ? 2.2 : 0);
    const shoulder = g.shoulder + 2.5 + pad * .13;
    const yHip = Math.min(170, hem - 2);
    const open = !closedCuts.includes(cut);
    const overlap = open ? 3.8 : -2.1;
    const neckEdge = g.neck + 1.3;
    const col = colour(item);
    const seam = tint(col, -.32);
    arm(ctx, g, 151 + g.arm, 2.5 + pad * .48, null, item);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      fabric(ctx, "M" + neckEdge + " 70 C" + (neckEdge + 8) + " 70.8 " + shoulder + " 71 " + shoulder + " 80 Q" + (shoulder + 1) + " 97 " + chest +
        " 110 Q" + (chest - 5) + " 129 " + (rise + pad * .56) + " 140 Q" + hip + " 153 " + hip + " " + yHip +
        " L" + edge + " " + hem + " Q" + (edge * .35) + " " + (hem + 4) + " " + overlap + " " + (hem + 1.5) + " L" +
        overlap + " 104 Z", item);
      if (["blazer", "peacoat", "coat", "trench"].includes(cut)) {
        shape(ctx, "M10 73l10 10-6 7 5 5-" + (19 - overlap) + " 17L9 85Z", tint(col, .13), seam, .86);
      }
      if (cut === "puffer") {
        for (const y of [106, 120, 133, 146]) shape(ctx, "M" + overlap + " " + y + "Q" + (chest * .5) + " " + (y + 3) + " " + (chest - 6) + " " + y, null, seam, .85);
      } else {
        const pocketY = long ? 152 : cut === "denim" || cut === "overshirt" ? 109 : 134;
        shape(ctx, "M" + (chest * .48) + " " + pocketY + "l11 -3 1 5-11 3Z", tint(col, .07), seam, .75);
      }
      if (cut === "peacoat") {
        for (const y of [117, 135, 153]) dot(ctx, 7.7, y, 1.7, tint(col, -.5));
      }
      ctx.restore();
    }
    if (!open && cut !== "peacoat") {
      shape(ctx, "M0 105V" + hem, null, seam, .8);
      if (cut === "trench") {
        const waist = rise + pad * .56;
        shape(ctx, "M" + -waist + " 140Q0 147 " + waist + " 140l1 6Q0 153 " + (-waist - 1) + " 146Z", tint(col, -.12), seam, .8);
        shape(ctx, "M-3.5 143h7v6h-7Z", null, "#c8a560", 1.2);
      }
    }
  }

  function shoes(ctx, item, g) {
    const col = colour(item);
    const line = tint(col, -.27);
    const { center, half } = ankle(g);
    const boot = item.cut === "boot";
    const sneaker = item.cut === "sneaker";
    const shaft = boot ? 248 : sneaker ? 268 : 275;
    const width = half + (boot ? 4.1 : 2);
    const sole = item.soleColor || (sneaker ? "#f1eee4" : tint(col, -.39));
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.translate(center, 0);
      const opening = boot || sneaker
        ? "Q0 " + (shaft - 2.6) + " " + width + " " + shaft + " Q" + (width - 1) + " 270 12 273"
        : "Q-1 " + (item.cut === "flat" ? 282 : 279) + " 11 274 Q15 272 18 275";
      fabric(ctx, "M-7 284 Q" + (-width - 1) + " 280 " + -width + " " + shaft + " " + opening +
        " Q25 274 26 282 Q26 286 22 287 H-5 Q-8 287-7 284Z", item);
      const solePath = sneaker
        ? "M-8 281.8 Q7 284.5 25.5 281.6 Q27 286 23 288 H-5 Q-9 287-8 281.8Z"
        : "M-7 283 Q7 286 25 283 Q27 286 23 288 H-5 Q-9 287-7 283Z";
      shape(ctx, solePath, cloth(ctx, sole, -8, 26), tint(sole, -.36), .73);
      if (boot || sneaker) shape(ctx, "M5 273l7 1m-6 2 8 1m-6 2 8 1", null, tint(col, sneaker ? -.24 : .35), .95);
      if (item.cut === "loafer") shape(ctx, "M9 275l10 1-1 3-10-1Z", tint(col, .2), line, .7);
      ctx.restore();
    }
  }

  function accessory(ctx, g, item, worn = {}) {
    const col = colour(item);
    const seam = tint(col, -.3);
    if (item.category === "belt") {
      const band = worn.bottom ? waistband(g, worn.bottom) : { width: g.waist + 2, y: 143 };
      const width = band.width + .5;
      const y = band.y + 1;
      fabric(ctx, "M" + -width + " " + y + "Q0 " + (y + 4) + " " + width + " " + y + "l.7 4Q0 " +
        (y + 8) + " " + (-width - .7) + " " + (y + 4) + "Z", item);
      shape(ctx, "M-3.5 " + (y + 1.25) + "h7v5h-7Z", null, "#c0a170", 1.15);
      shape(ctx, "M-2 " + (y + 3.7) + "h3", null, "#c0a170", .8);
      if (item.cut === "woven") shape(ctx, "M-19 " + (y + 4) + "h12m13 0h12", null, tint(col, .4), .65);
    } else if (item.category === "necklace") {
      const y = 77;
      shape(ctx, "M-10 " + y + "Q-6 " + (y + 16) + " 0 " + (y + 19) + "Q6 " + (y + 16) + " 10 " + y, null, seam, 1.55);
      shape(ctx, "M-10 " + y + "Q-6 " + (y + 16) + " 0 " + (y + 19) + "Q6 " + (y + 16) + " 10 " + y, null, tint(col, .26), .85);
      if (item.cut === "pendant") dot(ctx, 0, y + 20, 2.2, col);
    } else if (item.category === "watch") {
      const y = 152 + g.arm;
      const x = band(g, y).x;
      shape(ctx, "M" + (x - 4) + " " + (y - 1) + "l8 -1 1 5-8 1Z", cloth(ctx, col, x - 5, x + 5), seam, .8);
      if (item.cut === "smartwatch") shape(ctx, "M" + (x - 2.9) + " " + (y - 2.5) + "h5.8v6.5h-5.8Z", "#273037", seam, .7);
      else {
        dot(ctx, x, y + .4, 3.1, seam);
        dot(ctx, x, y + .4, 2.5, "#f2ecdb");
        shape(ctx, "M" + x + " " + (y - .9) + "v1.4l1 .7", null, "#3c3f39", .6);
      }
    } else {
      const x = item.cut === "crossbody" ? g.hip + 5 : g.shoulder + 14;
      const y = item.cut === "crossbody" ? 143 : item.cut === "backpack" ? 116 : item.cut === "tote" ? 168 : 166;
      const w = item.cut === "tote" ? 27 : item.cut === "backpack" ? 21 : 23;
      const h = item.cut === "tote" ? 27 : item.cut === "backpack" ? 36 : 17;
      if (item.cut === "crossbody") shape(ctx, "M" + (-g.chest + 1) + " 78 Q-5 103 " + (x + w / 2 - 3) + " " + (y + 2), null, seam, 2.9);
      else shape(ctx, "M" + (x - 6) + " " + (y + 4) + " Q" + x + " " + (y - 31) + " " + (x + 7) + " " + (y + 4), null, seam, 2);
      fabric(ctx, "M" + (x - w / 2) + " " + y + "q" + (w * .5) + " -4 " + w + " 0l-1 " + (h - 2) + "q" + (-w * .49) + " 5 " +
        (2 - w) + " 0Z", item);
      shape(ctx, "M" + (x - w / 2 + 2) + " " + (y + 4) + "q" + (w * .44) + " 7 " + (w - 4) + " 0", null, seam, .8);
      dot(ctx, x, y + 7.5, 1.15, tint(col, .44));
    }
  }

  function skinBody(ctx, g, skin, showSocks) {
    const fill = { gradient: skinPaint(ctx, skin), line: tint(skin, -.15), tone: skin };
    const { hip, waist, chest, shoulder, neck } = g;
    const foot = ankle(g);
    const hipY = (g.female ? 160 : 158) - g.leg * .7;
    const crotch = 178 - g.leg;
    const knee = 222 - g.leg * .5;
    const outerKnee = foot.center + foot.half + (g.female ? .65 : 1.3);
    const outerCalf = outerKnee + (g.female ? 1.5 : 2);
    const ankleOuter = foot.center + foot.half;
    const ankleInner = foot.center - foot.half;
    const ankleEnd = sockTop + 2;
    const flank = (side) => ({
      shoulder: side * shoulder, chest: side * chest, waist: side * waist, hip: side * hip,
      knee: side * outerKnee, calf: side * outerCalf, outer: side * ankleOuter, inner: side * ankleInner
    });
    const r = flank(1);
    const l = flank(-1);
    const silhouette = new Path2D("M" + (-neck + 1) + " 60H" + (neck - 1) + "L" + neck + " 72 " +
      "C" + (neck + 6) + " 73 " + r.shoulder + " 75 " + r.shoulder + " 84 Q" + r.shoulder + " 98 " + r.chest + " 108 " +
      "C" + (r.waist + 1) + " 120 " + r.waist + " 127 " + r.waist + " 132 " +
      "C" + r.waist + " 142 " + r.hip + " " + (hipY - 11) + " " + r.hip + " " + hipY + " " +
      "C" + r.hip + " " + (hipY + 23) + " " + (r.knee + 1.6) + " " + (knee - 12) + " " + r.knee + " " + knee + " " +
      "C" + (r.knee - .35) + " " + (knee + 6) + " " + r.calf + " 231 " + r.calf + " 238 " +
      "Q" + r.calf + " 249 " + r.outer + " " + ankleEnd +
      "H" + r.inner + " C" + r.inner + " " + (sockTop - 19) + " " + (r.inner - 2.4) + " " + (knee + 12) + " " + (r.inner - 2.4) + " " + knee +
      " Q" + (r.inner - 1) + " " + (crotch + 16) + " 1 " + (crotch + 1.5) + " Q0 " + (crotch - .1) + " -1 " + (crotch + 1.5) +
      " Q" + (l.inner + 1) + " " + (crotch + 16) + " " + (l.inner + 2.4) + " " + knee +
      " C" + (l.inner + 2.4) + " " + (knee + 12) + " " + l.inner + " " + (sockTop - 19) + " " + l.inner + " " + ankleEnd +
      "H" + l.outer + " Q" + l.calf + " 249 " + l.calf + " 238" +
      " C" + l.calf + " 231 " + (l.knee + .35) + " " + (knee + 6) + " " + l.knee + " " + knee +
      " C" + (l.knee - 1.6) + " " + (knee - 12) + " " + l.hip + " " + (hipY + 23) + " " + l.hip + " " + hipY +
      " C" + l.hip + " " + (hipY - 11) + " " + l.waist + " 142 " + l.waist + " 132 " +
      "C" + l.waist + " 127 " + (l.waist - 1) + " 120 " + l.chest + " 108 Q" + l.shoulder + " 98 " + l.shoulder + " 84 " +
      "C" + l.shoulder + " 75 " + (-neck - 6) + " 73 " + -neck + " 72Z");
    arm(ctx, g, 151 + g.arm, 0, fill);
    shape(ctx, silhouette, fill.gradient, fill.line, .48);
    ctx.save();
    ctx.clip(silhouette);
    skinVolume(ctx, g, skin, foot, knee);
    foundationBottom(ctx, g, crotch);
    ctx.restore();
    if (!showSocks) return;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.translate(foot.center, 0);
      const width = foot.half + 1.1;
      shape(ctx, "M" + -width + " " + sockTop + " Q0 " + (sockTop + 2) + " " + width + " " + sockTop +
        " L" + (width - .2) + " 271 Q17 272 21 279 Q23 286 17 286H-4 Q-7 285-7 281Z", cloth(ctx, "#f1ebde", -8, 22), "#c8c1b1", .85);
      shape(ctx, "M" + (-width + .3) + " " + (sockTop + 3) + " Q0 " + (sockTop + 5) + " " + (width - .3) + " " + (sockTop + 3), null, "#d7ccba", .65);
      ctx.restore();
    }
  }

  function skinVolume(ctx, g, skin, foot, knee) {
    const dark = tint(skin, -.36);
    const light = tint(skin, .38);
    softTone(ctx, 0, 68, 12, 11, dark, .42);
    softTone(ctx, -11, 79, 14, 3.5, light, .20, .19);
    softTone(ctx, 12, 79, 14, 3.5, light, .18, -.17);
    softTone(ctx, 0, 93, 3.6, 24, dark, g.female ? .16 : .23);
    softTone(ctx, -g.chest * .36, 95, g.chest * .46, 11, light, g.female ? .19 : .34, .19);
    softTone(ctx, g.chest * .37, 96, g.chest * .42, 10, light, g.female ? .17 : .27, -.19);
    if (!g.female) {
      softTone(ctx, -g.chest * .43, 104, g.chest * .46, 4.7, dark, .31, .15);
      softTone(ctx, g.chest * .42, 104, g.chest * .44, 4.7, dark, .25, -.15);
      softTone(ctx, -7, 118, 7.5, 13, light, .24, .06);
      softTone(ctx, 7, 121, 6.8, 16, light, .17, -.09);
      softTone(ctx, 0, 115, 2, 16, dark, .16);
    }
    softTone(ctx, -g.waist * .88, 126, 6.4, 19, dark, .23, .15);
    softTone(ctx, g.waist * .9, 124, 7.6, 18, dark, .29, -.20);
    softTone(ctx, -1, 128, g.waist * .48, 16, light, .18);
    shape(ctx, "M-.7 129q.65.8 1.4-.1", null, tint(skin, -.27), .65);
    for (const side of [-1, 1]) {
      const x = side * foot.center;
      softTone(ctx, x - 2, knee - 28, (g.female ? 11 : 9), 26, light, side < 0 ? .28 : .22, .1 * side);
      softTone(ctx, x - side * 5.5, knee - 18, 5.4, 20, dark, .23, -.11 * side);
      softTone(ctx, x + 1, knee + 1, 6.3, 6.2, dark, .15);
      softTone(ctx, x - 1.2, knee + 14, 5.1, 17.2, light, .25, .06 * side);
      softTone(ctx, x + side * 2.5, 253, 3.1, 6.5, dark, .15);
    }
  }

  function foundationBottom(ctx, g, crotch) {
    const start = (g.female ? 138 : 141) - g.leg * .33;
    const hem = crotch + (g.female ? 1.7 : 8.6);
    const clothColor = g.female ? "#466058" : "#46505a";
    const { hip } = g;
    const path = new Path2D("M-54 " + start + "Q0 " + (start + 5.2) + " 54 " + start + "V" + (hem - 3) +
      "Q" + (hip * .7) + " " + (hem + 3) + " 4 " + hem + "L0 " + (crotch + .8) + "L-4 " + hem +
      "Q" + (-hip * .7) + " " + (hem + 3) + " -54 " + (hem - 3) + "Z");
    shape(ctx, path, cloth(ctx, clothColor), tint(clothColor, -.16), .65);
    ctx.save();
    ctx.clip(path);
    softTone(ctx, -hip * .51, start + 19, 12, 19, tint(clothColor, .35), .36, .16);
    softTone(ctx, hip * .95, start + 25, 12, 23, tint(clothColor, -.38), .45, -.13);
    shape(ctx, "M-50 " + (start + 5.1) + "Q0 " + (start + 11) + " 50 " + (start + 5.1), null,
      tint(clothColor, .24), .67);
    shape(ctx, "M0 " + (start + 9.2) + "Q1.4 " + (hem - 9) + " 0 " + (crotch + 1.5), null,
      tint(clothColor, -.2), .52);
    ctx.restore();
  }

  function foundationTop(ctx, g) {
    const color = "#466058";
    const strap = Math.max(g.neck + 7, g.shoulder - 7);
    const bust = g.chest + .7;
    const hem = g.waist + 3.5;
    const bottomY = 117;
    const path = new Path2D("M-9.4 74 Q0 91 9.4 74 L" + strap + " 76 Q" + (strap - 2.5) + " 86 " + bust +
      " 98 Q" + (bust + .6) + " 103 " + hem + " " + bottomY + " Q0 " + (bottomY + 3.8) + " " + -hem + " " + bottomY +
      " Q" + (-bust - .6) + " 103 " + -bust + " 98 Q" + (-strap + 2.5) + " 86 " + -strap + " 76Z");
    shape(ctx, path, cloth(ctx, color), tint(color, -.22), .63);
    ctx.save();
    ctx.clip(path);
    softTone(ctx, -bust * .47, 96, bust * .50, 12, tint(color, .38), .55, .18);
    softTone(ctx, bust * .42, 96, bust * .50, 12, tint(color, .34), .43, -.17);
    softTone(ctx, -bust * .46, 105, bust * .48, 4.7, tint(color, -.35), .51, .11);
    softTone(ctx, bust * .44, 105, bust * .46, 4.5, tint(color, -.35), .49, -.13);
    shape(ctx, "M" + (-hem - 1.8) + " " + (bottomY - 4) + " Q0 " + (bottomY + .7) + " " + (hem + 1.8) + " " + (bottomY - 4), null,
      tint(color, .28), 1.1);
    ctx.restore();
  }
  function curlCluster(ctx, cx, cy, rx, ry, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = i * 2.39996;
      const radius = Math.sqrt((i + .5) / count);
      const x = cx + Math.cos(angle) * rx * radius;
      const y = cy + Math.sin(angle) * ry * radius;
      const r = 2.7 + (i * 7 % 9) * .22;
      dot(ctx, x, y, r + .58, tint(color, -.23));
      dot(ctx, x, y, r, tint(color, (.031 * (i % 5)) - .04));
      shape(ctx, "M" + (x - 1.7) + " " + (y + .8) + "q-1.3 -2.2 1 -2.8 2.1 -.3 2 1.6", null, tint(color, .23), .44);
    }
  }

  function backHair(ctx, avatar) {
    const { hair, hairColor: color } = avatar;
    if (hair === "long") {
      shape(ctx, "M-18 30Q-9 19 5 20Q21 20 22 38Q22 52 27 68Q30 77 22 81Q15 81 11 73Q0 70-10 73Q-16 82-24 80Q-30 77-27 68Q-22 54-22 40Z",
        cloth(ctx, color, -28, 28), tint(color, -.19), .7);
    } else if (hair === "ponytail") {
      shape(ctx, "M14 24Q36 29 26 48Q23 60 30 71Q11 67 17 48L10 37Z",
        cloth(ctx, color, -25, 27), tint(color, -.19), .7);
    }
  }

  function head(ctx, avatar, female) {
    const { skin, hair, hairColor: c } = avatar;
    const face = skinPaint(ctx, skin);
    const line = tint(skin, -.16);
    const hairline = tint(c, -.19);
    if (hair === "afroPuff") {
      curlCluster(ctx, 1, 21, 16, 14, c, 51);
      curlCluster(ctx, -14, 44, 2, 8, c, 7);
      curlCluster(ctx, 14, 44, 2, 8, c, 7);
    }
    if (hair === "curlyPony") {
      curlCluster(ctx, 9, 21, 14, 12, c, 45);
      curlCluster(ctx, 20, 36, 9, 15, c, 28);
      curlCluster(ctx, 25, 56, 9, 17, c, 33);
      curlCluster(ctx, 22, 72, 7, 15, c, 21);
    }
    if (hair === "afro" || hair === "curls") {
      curlCluster(ctx, 0, 39, hair === "afro" ? 24 : 18, hair === "afro" ? 25 : 20, c, 63);
    }
    const ears = female ? "M-13 46Q-18 43-18 50Q-17 56-13 57M13 46Q18 43 18 50Q17 56 13 57" :
      "M-16 45Q-22 42-21 51Q-20 58-15 58M16 45Q22 42 21 51Q20 58 15 58";
    const jaw = new Path2D(female
      ? "M-14 41Q-13.5 27 -.5 26Q14 27 14.7 42Q16 50 12 59Q8.2 66 3.2 69Q.2 70.6-3.1 69Q-9.6 65.3-12.5 57Q-16 50-14 41Z"
      : "M-16 42Q-15.8 26-.5 26Q15.5 26 16.7 42Q17.2 49 14.7 59Q14 64 9.3 67.9Q4.8 71-1 71.1Q-8 70.7-12.2 65.1Q-17 57.9-16 42Z");
    shape(ctx, ears, face, line, .56);
    shape(ctx, "M-16.7 48.7q-1.5.5-.5 4.4m33.8-4.4q1.5.5.5 4.4", null, tint(skin, -.23), .68);
    shape(ctx, jaw, face, line, .65);
    ctx.save();
    ctx.clip(jaw);
    softTone(ctx, -3.4, 36, 10.4, 8.3, tint(skin, .32), .28, -.12);
    softTone(ctx, 11.5, 57, 7.2, 15, tint(skin, -.32), .34, .23);
    softTone(ctx, -9.5, 55.6, 7.9, 5, tint(skin, .34), female ? .26 : .22, -.22);
    softTone(ctx, 8.5, 55.8, 7.5, 6, tint(skin, .16), .20, .26);
    softTone(ctx, -7.2, 48.4, 5.5, 4.2, tint(skin, -.32), .22);
    softTone(ctx, 7.8, 48.9, 5.6, 4.4, tint(skin, -.32), .25);
    softTone(ctx, -.6, 53.5, 1.8, 6.6, tint(skin, .45), .30, -.08);
    softTone(ctx, -.2, 65.7, 4.6, 2.6, tint(skin, .29), .25);
    ctx.restore();
    if (hair !== "bald") {
      const cap = hair === "buzz" ? "M-15 43Q-18 30-10 26Q0 20 11 25Q19 30 16 43L13 35Q0 33-13 36Z" :
        hair === "short" ? "M-15.9 47Q-19 42-19.1 37Q-21.2 29.7-13.4 25.9Q-8.8 22-4.7 21.9Q1.2 19.5 6.4 22Q13.8 21.4 18 28.2Q21.8 33.8 18.5 42.2L15.3 46.8L12.8 37.2Q10.9 33.1 6.6 34Q-.4 36.6-5.4 33.8Q-9.3 32.1-12.4 36.1Z" :
        ["afroPuff", "curlyPony"].includes(hair) ? "M-15 46Q-21 32-11 27Q0 22 11 27Q21 32 16 46Q11 36 0 33Q-11 36-15 46Z" :
        "M-15 47Q-22 38-16 29Q-12 21 3 22Q20 22 22 36Q23 44 17 49L13 39Q5 36 0 30Q-5 38-15 43Z";
      shape(ctx, cap, cloth(ctx, hair === "buzz" ? tint(c, .16) : c, -21, 21), hairline, .85);
      if (hair === "afro" || hair === "curls") curlCluster(ctx, 0, 28, hair === "afro" ? 17 : 14, 6.2, c, 28);
      else if (hair === "short") {
        shape(ctx, "M-14 32q5-7 15-7m-13.4 9q4.9-6.1 11.9-6.2m-7.7 5.2q5-4.2 13.3-4.1m-7.5 3.5q4.2-2.6 10.2-2.2m1.6-5.6q4.2 1.2 6 5", null, tint(c, .22), .5);
      } else if (hair === "long") {
        shape(ctx, "M-19 34Q-14.4 35-15.2 48Q-16.2 61-17.7 69Q-18.3 76-15.3 81Q-23.4 80-22.9 71Q-23.2 56-21.4 43Z " +
          "M16.4 36Q22 36.7 21 48Q21.3 61 24.5 72Q25.5 80 19.5 84Q21.5 75 17.9 67Q14.7 58 15.5 48Z",
          cloth(ctx, c, -24, 24), hairline, .65);
        shape(ctx, "M-18.2 48q.2 12-2.6 23m39.6-20q.1 10 4.3 21m-35.1-37q6-6.5 16-7", null, tint(c, .24), .62);
      } else if (hair !== "buzz") {
        shape(ctx, "M-12 35Q-6 28 4 28m-14 8q5-5 10-5", null, tint(c, .25), .54);
      }
    }
    const feature = tint(skin, -.53);
    shape(ctx, female ? "M-11.3 47.3q2.9-2.3 6.6-1.1m9.3.4q3.6-1.85 6.35.4" :
      "M-11.9 47.1q3.1-1.6 7.25-.7m9.15.65q3.4-1.2 7.25-.1", null, feature, female ? .83 : 1.11);
    shape(ctx, "M-10.4 50.7q2.6-1.7 4.95-.15m10.85.3q2.55-1.55 4.8-.1", null, feature, .65);
    dot(ctx, -7.7, 50.7, .87, feature);
    dot(ctx, 7.7, 50.9, .82, feature);
    shape(ctx, "M-.05 52l-1.15 4.8q.9.95 2.7.2", null, tint(skin, -.28), .72);
    shape(ctx, female ? "M-4.15 62q1.7-.7 3.65-.3 2.1.5 4.1-.35Q.3 64.3-4.15 62Z" :
      "M-4.25 62q4.35.35 8.15-.3Q1.45 63.65-1.15 63Z", tint(skin, -.09), null);
    shape(ctx, "M-4.2 62q3.8.95 7.9-.35", null, tint(skin, -.30), .62);
  }

  function context(canvas, width, height) {
    const ctx = canvas.getContext("2d");
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = ctx.lineCap = "round";
    return ctx;
  }

  function figure(canvas, worn, person) {
    const ctx = context(canvas, 240, 300);
    ctx.translate(120, 0);
    const g = geometry(person);
    const avatar = person.avatar;
    shade(ctx, 284, 85, 10);
    backHair(ctx, avatar);
    skinBody(ctx, g, avatar.skin, worn.shoes?.cut !== "boot");
    if (worn.shoes) shoes(ctx, worn.shoes, g);
    if (worn.bottom) bottom(ctx, g, worn.bottom);
    const exposedBelt = worn.belt && worn.bottom && !worn.mid;
    const tuck = exposedBelt ? waistband(g, worn.bottom) : undefined;
    if (worn.top) upper(ctx, g, worn.top, null, 0, tuck);
    else if (g.female) foundationTop(ctx, g);
    if (exposedBelt) accessory(ctx, g, worn.belt, worn);
    if (worn.mid) upper(ctx, g, worn.mid, worn.top, knitEase(worn.mid, worn.top) - ease[worn.mid.fit]);
    if (worn.necklace && !worn.layer) accessory(ctx, g, worn.necklace, worn);
    if (worn.layer) outer(ctx, g, worn.layer, worn);
    if (worn.necklace && worn.layer && !closedCuts.includes(worn.layer.cut)) accessory(ctx, g, worn.necklace, worn);
    if (worn.watch) accessory(ctx, g, worn.watch);
    if (worn.bag) accessory(ctx, g, worn.bag);
    head(ctx, avatar, person.figure === "female");
  }

  function thumbnail(canvas, item) {
    const ctx = context(canvas, 180, 150);
    const g = geometry({ figure: "male" });
    const key = item.category;
    ctx.translate(90, 0);
    shade(ctx, 133, 58, 8);
    if (key === "top" || key === "mid") {
      ctx.translate(0, -64);
      ctx.scale(1.23, 1.23);
      upper(ctx, g, item);
    } else if (key === "bottom") {
      const hem = hemFor(item, g);
      const scale = Math.min(1.35, 100 / (hem - 143));
      ctx.translate(0, 74 - ((143 + hem) / 2) * scale);
      ctx.scale(scale, scale);
      bottom(ctx, g, item);
    } else if (key === "layer") {
      const scale = longCoats.includes(item.cut) ? .72 : item.cut === "peacoat" ? .96 : 1.17;
      ctx.translate(0, 17 - 72 * scale);
      ctx.scale(scale, scale);
      outer(ctx, g, item, {});
    } else if (key === "shoes") {
      ctx.translate(0, item.cut === "boot" ? -325 : -341);
      ctx.scale(1.52, 1.52);
      shoes(ctx, item, g);
    } else {
      const settings = { bag: [item.cut === "crossbody" ? -5 : -52, 119, 1.3], belt: [0, 146, 1.85], watch: [-49, 152, 5.8], necklace: [0, 86, 3.45] };
      const [x, y, size] = settings[key];
      ctx.translate(x * size, 72 - y * size);
      ctx.scale(size, size);
      accessory(ctx, g, item);
    }
  }

  return { figure, thumbnail };
})();
