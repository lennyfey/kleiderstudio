"use strict";

const PhotoRecognition = (() => {
  const edgeLimit = 144;
  const modelSize = 28;
  // Groups in the original order of the Fashion-MNIST classifier.
  const types = [
    { label: "T-Shirt oder Top", category: "top", cut: "tee", name: "T-Shirt" },
    { label: "Hose", category: "bottom", cut: "pants", name: "Hose" },
    { label: "Pullover", category: "mid", cut: "sweater", name: "Pullover" },
    { label: "Kleid" },
    { label: "Jacke oder Mantel", category: "layer", cut: "jacket", name: "Jacke" },
    { label: "Sandale", category: "shoes" },
    { label: "Hemd oder Bluse", category: "top", cut: "shirt", name: "Hemd" },
    { label: "Sneaker", category: "shoes", cut: "sneaker", name: "Sneaker" },
    { label: "Tasche", category: "bag", cut: "handbag", name: "Tasche" },
    { label: "Boots", category: "shoes", cut: "boot", name: "Boots" }
  ];
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const linear = Float32Array.from({ length: 256 }, (_, i) => {
    const value = i / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });

  function lab(r, g, b) {
    r = linear[r];
    g = linear[g];
    b = linear[b];
    const l = Math.cbrt(.41222147 * r + .53633254 * g + .05144599 * b);
    const m = Math.cbrt(.21190350 * r + .68069955 * g + .10739696 * b);
    const s = Math.cbrt(.08830246 * r + .28171884 * g + .62997870 * b);
    return [.21045426 * l + .79361779 * m - .00407205 * s,
      1.97799850 * l - 2.42859221 * m + .45059371 * s, .02590404 * l + .78277177 * m - .80867577 * s];
  }

  function distance(colors, offset, tone, weight = 1.6) {
    const l = colors[offset] - tone[0];
    const a = colors[offset + 1] - tone[1];
    const b = colors[offset + 2] - tone[2];
    return l * l + weight * (a * a + b * b);
  }

  const palette = Object.values(Wardrobe.colors).map(({ name, hex }) =>
    ({ name, tone: lab(...hex.slice(1).match(/../g).map((value) => parseInt(value, 16))) }));
  palette.push(
    { name: "Schwarz", tone: lab(18, 18, 18) },
    { name: "Schwarz", tone: lab(37, 37, 37) },
    { name: "Weiß", tone: lab(255, 255, 255) },
    { name: "Weiß", tone: lab(226, 228, 231) },
    { name: "Braun", tone: lab(76, 49, 32) },
    { name: "Braun", tone: lab(97, 68, 49) },
    { name: "Grau", tone: lab(189, 189, 189) }
  );

  function canvas(width, height) {
    const image = document.createElement("canvas");
    image.width = width;
    image.height = height;
    return image;
  }

  function sample(source) {
    const scale = Math.min(1, edgeLimit / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const ctx = canvas(width, height).getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const colors = new Float32Array(width * height * 3);
    for (let i = 0, p = 0; i < pixels.length; i += 4, p += 3) {
      colors.set(lab(pixels[i], pixels[i + 1], pixels[i + 2]), p);
    }
    return { width, height, pixels, colors };
  }

  function quantile(values, fraction) {
    values.sort((a, b) => a - b);
    return values[Math.floor((values.length - 1) * fraction)];
  }

  function perimeter(width, height) {
    const edge = [];
    for (let x = 0; x < width; x++) edge.push(x, (height - 1) * width + x);
    for (let y = 1; y < height - 1; y++) edge.push(y * width, y * width + width - 1);
    return edge;
  }

  function medianTone(colors, indices) {
    return [0, 1, 2].map((channel) => quantile(indices.map((index) => colors[index * 3 + channel]), .5));
  }

  function foreground(scene) {
    const { width, height, colors, pixels } = scene;
    if (Math.min(width, height) < 16) return null;
    const size = width * height;
    const edge = perimeter(width, height);
    const transparent = edge.filter((index) => pixels[index * 4 + 3] < 44).length >= edge.length * .33;
    const background = medianTone(colors, edge);
    const spread = quantile(edge.map((index) => distance(colors, index * 3, background)), .84);
    const mixedBackground = !transparent && spread > .105 ** 2;
    const threshold = clamp(Math.sqrt(spread) * 1.55 + .03, .048, .145) ** 2;
    const isBackground = transparent
      ? (index) => pixels[index * 4 + 3] < 64
      : (index) => distance(colors, index * 3, background) <= threshold;

    const seen = new Uint8Array(size);
    const queue = new Uint32Array(size);
    let end = 0;
    function visit(index, mark) {
      if (seen[index] || (mark === 1 && !isBackground(index))) return;
      seen[index] = mark;
      queue[end++] = index;
    }
    function expand(mark) {
      for (let next = 0; next < end; next++) {
        const point = queue[next];
        const x = point % width;
        if (x > 0) visit(point - 1, mark);
        if (x < width - 1) visit(point + 1, mark);
        if (point >= width) visit(point - width, mark);
        if (point < size - width) visit(point + width, mark);
      }
    }
    if (mixedBackground) {
      // A consistent patch in the center can isolate a garment from a busy scene.
      const center = [];
      for (let y = Math.floor(height * .35); y < Math.ceil(height * .64); y++) {
        for (let x = Math.floor(width * .42); x < Math.ceil(width * .58); x++) center.push(y * width + x);
      }
      const main = medianTone(colors, center);
      const variability = quantile(center.map((index) => distance(colors, index * 3, main)), .85);
      if (variability > .085 ** 2) return null;
      const tolerance = clamp(Math.sqrt(variability) * 1.8 + .053, .076, .127) ** 2;
      for (let i = 0; i < size; i++) {
        if (distance(colors, i * 3, main) > tolerance) seen[i] = 1;
      }
    } else {
      edge.forEach((index) => visit(index, 1));
      expand(1);
    }

    let largest = new Uint32Array();
    let secondSize = 0;
    for (let start = 0; start < size; start++) {
      if (seen[start]) continue;
      end = 0;
      visit(start, 2);
      expand(2);
      if (end > largest.length) {
        secondSize = largest.length;
        largest = queue.slice(0, end);
      } else {
        secondSize = Math.max(secondSize, end);
      }
    }
    if (largest.length < size * .035 || largest.length > size * .9 || secondSize > largest.length * .54) return null;
    const mask = new Uint8Array(size);
    let left = width, top = height, right = 0, bottom = 0;
    for (const index of largest) {
      const x = index % width;
      const y = Math.floor(index / width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
      mask[index] = 1;
    }
    const bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
    if (Math.min(bounds.width, bounds.height) < 10 || edge.filter((index) => mask[index]).length > edge.length * .12) return null;
    if (mixedBackground && (!mask[Math.floor(height / 2) * width + Math.floor(width / 2)] ||
      largest.length < size * .11 || largest.length / (bounds.width * bounds.height) < .51 ||
      left < 2 || top < 2 || right > width - 3 || bottom > height - 3)) return null;
    return { ...scene, points: largest, mask, bounds };
  }

  function describe(rgb) {
    const tone = lab(...rgb);
    let best = palette[0];
    for (const color of palette) {
      if (distance(tone, 0, color.tone, 5) < distance(tone, 0, best.tone, 5)) best = color;
    }
    return { name: best.name, hex: "#" + rgb.map((value) => value.toString(16).padStart(2, "0")).join(""), tone };
  }

  function dominantColors(scene) {
    const { points, pixels, colors, mask, width, height } = scene;
    const interior = points.filter((i) => i >= width && i < width * (height - 1) && i % width > 0 &&
      i % width < width - 1 && mask[i - 1] && mask[i + 1] && mask[i - width] && mask[i + width] && pixels[i * 4 + 3] > 148);
    if (!interior.length) return [];
    const buckets = new Map();
    for (const i of interior) {
      const [l, a, b] = colors.subarray(i * 3, i * 3 + 3);
      const key = [Math.floor(l / .08), Math.floor(a / .05), Math.floor(b / .05)].join();
      const bucket = buckets.get(key);
      if (bucket) bucket.count++;
      else buckets.set(key, { index: i, count: 1 });
    }
    const ranked = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, 12);
    const groups = ranked.map(({ index }) => {
      const tone = colors.subarray(index * 3, index * 3 + 3);
      const members = interior.filter((i) => distance(colors, i * 3, tone) < .081 ** 2);
      return { members, tone };
    }).sort((a, b) => b.members.length - a.members.length);
    const first = groups[0];
    const second = groups.find((group) => group.members.length >= interior.length * .16 &&
      distance(group.tone, 0, first.tone, 3) >= .19 ** 2);
    return [first, second].filter(Boolean).map(({ members }) => {
      const sums = [0, 0, 0];
      for (const index of members) {
        for (let channel = 0; channel < 3; channel++) sums[channel] += pixels[index * 4 + channel];
      }
      return describe(sums.map((sum) => Math.round(sum / members.length)));
    });
  }

  function stripes(scene, [first, second]) {
    if (!second) return "";
    const { bounds, width, colors, mask } = scene;
    const x1 = bounds.x + Math.round(bounds.width * .3);
    const x2 = bounds.x + Math.round(bounds.width * .7);
    const y1 = bounds.y + Math.round(bounds.height * .22);
    const y2 = bounds.y + Math.round(bounds.height * .83);
    function bands(vertical) {
      const start = vertical ? x1 : y1;
      const stop = vertical ? x2 : y2;
      let previous = -1, span = 0, longBands = 0, clear = 0;
      for (let line = start; line < stop; line++) {
        let light = 0, valid = 0;
        for (let pos = vertical ? y1 : x1; pos < (vertical ? y2 : x2); pos++) {
          const index = vertical ? pos * width + line : line * width + pos;
          if (!mask[index]) continue;
          valid++;
          if (distance(colors, index * 3, second.tone) < distance(colors, index * 3, first.tone)) light++;
        }
        const ratio = valid ? light / valid : .5;
        const dominant = ratio > .8 ? 1 : ratio < .2 ? 0 : -1;
        if (dominant === -1) continue;
        clear++;
        if (previous !== dominant) {
          if (span >= 2) longBands++;
          previous = dominant;
          span = 0;
        }
        span++;
      }
      return clear >= (stop - start) * .76 && longBands >= 4;
    }
    return bands(false) ? "stripes" : bands(true) ? "pinstripe" : "";
  }

  let layers;
  function unpack() {
    return GarmentModelWeights.map(({ data, scales, biases }) => {
      const bytes = atob(data);
      const weights = new Float32Array(bytes.length);
      const stride = bytes.length / biases.length;
      for (let i = 0; i < bytes.length; i++) {
        const value = bytes.charCodeAt(i);
        weights[i] = (value < 128 ? value : value - 256) * scales[Math.floor(i / stride)];
      }
      return { weights, biases };
    });
  }

  function convolveAndPool(input, size, channels, { weights, biases }) {
    const side = Math.floor((size - 2) / 2);
    const filters = biases.length;
    const output = new Float32Array(side * side * filters);
    const block = channels * 3;
    for (let y = 0; y < side * 2; y++) {
      for (let x = 0; x < side * 2; x++) {
        const origin = (y * size + x) * channels;
        const pooled = ((y >> 1) * side + (x >> 1)) * filters;
        for (let filter = 0; filter < filters; filter++) {
          let sum = biases[filter];
          for (let row = 0; row < 3; row++) {
            const start = origin + row * size * channels;
            const kernel = filter * block * 3 + row * block;
            for (let i = 0; i < block; i++) sum += input[start + i] * weights[kernel + i];
          }
          if (sum > output[pooled + filter]) output[pooled + filter] = sum;
        }
      }
    }
    return output;
  }

  function dense(input, { weights, biases }, relu = false) {
    return biases.map((bias, output) => {
      let sum = bias;
      const offset = output * input.length;
      for (let i = 0; i < input.length; i++) sum += input[i] * weights[offset + i];
      return relu ? Math.max(0, sum) : sum;
    });
  }

  function classify(input) {
    layers ||= unpack();
    const features = convolveAndPool(convolveAndPool(input, modelSize, 1, layers[0]), 13, 32, layers[1]);
    const logits = dense(dense(features, layers[2], true), layers[3]);
    const max = Math.max(...logits);
    const scores = logits.map((score) => Math.exp(score - max));
    const sum = scores.reduce((a, b) => a + b, 0);
    return scores.map((score) => score / sum);
  }

  function hasRoundNeckAndShortSleeves(scene) {
    const { bounds, width, mask, colors } = scene;
    const xAt = (part) => bounds.x + Math.round((bounds.width - 1) * part);
    const yAt = (part) => bounds.y + Math.round((bounds.height - 1) * part);
    function topOfColumn(part) {
      const x = xAt(part);
      for (let y = bounds.y; y <= yAt(.28); y++) {
        if (mask[y * width + x]) return y;
      }
      return yAt(.28);
    }
    const center = topOfColumn(.5);
    const neckline = center - ((topOfColumn(.35) + topOfColumn(.65)) / 2);
    const round = [.45, .55].every((x) => Math.abs(topOfColumn(x) - center) < bounds.height * .043);
    if (!round || neckline < bounds.height * .052 || neckline > bounds.height * .19) return false;
    function across(part) {
      const start = yAt(part) * width;
      let filled = 0;
      for (let x = bounds.x; x < bounds.x + bounds.width; x++) filled += mask[start + x];
      return filled;
    }
    const sleeves = Math.max(across(.24), across(.30), across(.36));
    const torso = (across(.54) + across(.65) + across(.72)) / 3;
    if (sleeves < bounds.width * .75 || torso < bounds.width * .34 || sleeves < torso * 1.25) return false;
    // A visible placket is evidence for a shirt rather than a tee.
    let centerContrast = 0;
    const start = yAt(.22), end = yAt(.76);
    for (let y = start; y < end; y++) {
      const offset = (y * width + xAt(.50)) * 3;
      const left = (y * width + xAt(.42)) * 3;
      const right = (y * width + xAt(.58)) * 3;
      if (distance(colors, left, colors.subarray(offset, offset + 3)) > .10 ** 2 &&
          distance(colors, right, colors.subarray(offset, offset + 3)) > .10 ** 2) centerContrast++;
    }
    return centerContrast < (end - start) * .28;
  }

  function guessType(scene, first) {
    const { bounds, width, pixels, colors, points } = scene;
    const stencil = canvas(bounds.width, bounds.height);
    const ctx = stencil.getContext("2d");
    const gray = ctx.createImageData(bounds.width, bounds.height);
    const reference = first?.tone[0] ?? .55;
    for (const index of points) {
      const x = index % width - bounds.x;
      const y = Math.floor(index / width) - bounds.y;
      const offset = (y * bounds.width + x) * 4;
      const intensity = 255 * clamp(.76 + (colors[index * 3] - reference) * .78, .22, 1);
      gray.data[offset] = gray.data[offset + 1] = gray.data[offset + 2] = intensity;
      gray.data[offset + 3] = pixels[index * 4 + 3];
    }
    ctx.putImageData(gray, 0, 0);
    const scaled = canvas(modelSize, modelSize).getContext("2d", { willReadFrequently: true });
    function classifyAt(size) {
      const scale = size / Math.max(bounds.width, bounds.height);
      const w = bounds.width * scale;
      const h = bounds.height * scale;
      scaled.fillStyle = "#000";
      scaled.fillRect(0, 0, modelSize, modelSize);
      scaled.imageSmoothingQuality = "high";
      scaled.drawImage(stencil, (modelSize - w) / 2, (modelSize - h) / 2, w, h);
      const rgba = scaled.getImageData(0, 0, modelSize, modelSize).data;
      return classify(Float32Array.from({ length: modelSize ** 2 }, (_, i) => rgba[i * 4] / 255));
    }
    const close = classifyAt(27.8);
    const loose = classifyAt(25.8);
    const ranked = types.map((type, index) => ({ ...type, score: (close[index] + loose[index]) / 2 }))
      .sort((a, b) => b.score - a.score);
    if (["tee", "shirt", "sweater"].includes(ranked[0].cut) && hasRoundNeckAndShortSleeves(scene)) return types[0];
    return ranked[0].score >= .63 && ranked[0].score - ranked[1].score >= .22 ? ranked[0] : null;
  }

  function thumbnail(source, scene) {
    const region = scene?.bounds;
    const crop = region ? {
      x: region.x * source.width / scene.width,
      y: region.y * source.height / scene.height,
      width: region.width * source.width / scene.width,
      height: region.height * source.height / scene.height
    } : { x: 0, y: 0, width: source.width, height: source.height };
    const padding = Math.max(crop.width, crop.height) * (region ? .10 : 0);
    const x = Math.max(0, crop.x - padding);
    const y = Math.max(0, crop.y - padding);
    const w = Math.min(source.width - x, crop.x + crop.width + padding - x);
    const h = Math.min(source.height - y, crop.y + crop.height + padding - y);
    const output = canvas(1, 1);
    for (const maxSide of [240, 180, 128, 88]) {
      const scale = Math.min(1, maxSide / Math.max(w, h));
      output.width = Math.max(1, Math.round(w * scale));
      output.height = Math.max(1, Math.round(h * scale));
      const ctx = output.getContext("2d", { alpha: false });
      ctx.fillStyle = "#f6f6f2";
      ctx.fillRect(0, 0, output.width, output.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, x, y, w, h, 0, 0, output.width, output.height);
      const encoded = output.toDataURL("image/jpeg", .72);
      if (GarmentPhotos.validThumbnail(encoded)) return encoded;
    }
    throw new Error("Die Fotovorschau konnte nicht erstellt werden. Wähle ein kleineres Bild.");
  }

  async function read(file) {
    const image = await ReferenceImage.read(file);
    const scene = foreground(sample(image));
    const [color, accent] = scene ? dominantColors(scene) : [];
    const type = scene ? guessType(scene, color) : null;
    const pattern = scene ? stripes(scene, [color, accent]) : "";
    return { preview: thumbnail(image, scene), type, color, accent, pattern, separated: Boolean(scene) };
  }

  return { read };
})();
