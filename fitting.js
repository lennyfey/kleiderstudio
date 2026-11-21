"use strict";

const FittingRoom = (() => {
  const W = Wardrobe;
  const $ = (id) => document.getElementById(id);
  const number = new Intl.NumberFormat("de", { maximumFractionDigits: 1 });
  const decimal = new Intl.NumberFormat("de", { maximumFractionDigits: 8, useGrouping: false });
  const defaultColor = "#692a41";
  const comparisons = {
    top: ["chest", "waist", "arm"],
    mid: ["chest", "waist", "arm"],
    bottom: ["waist", "hip", "inseam"],
    layer: ["chest", "waist", "hip", "arm", "length"],
    shoes: ["foot"]
  };
  const circumferences = ["chest", "waist", "hip"];
  const limits = { chest: [20, 250], waist: [20, 250], hip: [20, 250], arm: [20, 110],
    inseam: [15, 135], foot: [10, 45], length: [30, 165] };
  const names = { chest: "Brust", waist: "Taille", hip: "Hüfte", arm: "Ärmellänge",
    inseam: "Innenbeinlänge", foot: "Schuh-Innenlänge", length: "Rückenlänge" };
  const categoryLabels = Object.fromEntries(W.mainKeys.map((key) => [key, W.slots[key].name]));
  const colorLabels = { ...Object.fromEntries(Object.entries(W.colors).map(([key, value]) => [key, value.name])),
    custom: "Eigener Farbton" };
  const drafts = new Map();
  let current;
  let draft;
  const entry = () => draft.entries[draft.category];
  const divisor = (key) => circumferences.includes(key) && draft.mode === "flat" ? 2 : 1;
  const bound = (value, low, high) => Math.min(high, Math.max(low, value));

  function fillSelect(node, list, selected) {
    node.replaceChildren(...Object.entries(list).map(([key, label]) => new Option(label, key)));
    node.value = selected;
  }

  function defaultDraft() {
    const entries = Object.fromEntries(W.mainKeys.map((category) => [category, {
      cut: category === "layer" ? "peacoat" : Object.keys(W.slots[category].cuts)[0],
      color: "burgundy", custom: defaultColor, fit: "regular", dimensions: {}
    }]));
    return { category: "layer", mode: "around", entries, x: 50, y: 50, size: 28,
      photo: null, texture: null, average: "", uploadSequence: 0, useTexture: true, error: "" };
  }

  function garment() {
    const { cut, color, custom, fit, dimensions } = entry();
    const length = dimensions.length?.centimeters;
    const height = current.measures.height;
    const previewHem = draft.category === "layer" && height && length >= limits.length[0] && length <= limits.length[1]
      ? bound(74 + length * 265 / height, 153, 245)
      : undefined;
    const texture = draft.useTexture ? draft.texture : null;
    const customColor = texture ? draft.average : color === "custom" ? custom : "";
    return {
      name: W.slots[draft.category].cuts[cut], category: draft.category, cut,
      color: color === "custom" ? "grey" : color, customColor,
      colorName: texture ? "Ton aus Referenzbild" : "", fit, style: "casual",
      pattern: "solid", accent: "#eedfcb", texture, previewHem
    };
  }

  function cropPlacement() {
    const preview = $("fit-reference");
    const { width, height } = draft.photo;
    const scale = Math.min(preview.width / width, preview.height / height);
    const px = (preview.width - width * scale) / 2;
    const py = (preview.height - height * scale) / 2;
    const edge = Math.max(1, Math.round(Math.min(width, height) * draft.size / 100));
    const x = Math.round((width - edge) * draft.x / 100);
    const y = Math.round((height - edge) * draft.y / 100);
    return { width, height, scale, px, py, edge, x, y };
  }

  function drawCrop() {
    if (!draft.photo) return;
    const preview = $("fit-reference");
    const ctx = preview.getContext("2d");
    const { width, height, scale, px, py, edge, x, y } = cropPlacement();
    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.drawImage(draft.photo, px, py, width * scale, height * scale);
    ctx.fillStyle = "#162c20aa";
    ctx.fillRect(px, py, width * scale, height * scale);
    const boxX = px + x * scale;
    const boxY = py + y * scale;
    const boxSize = edge * scale;
    ctx.clearRect(boxX, boxY, boxSize, boxSize);
    ctx.drawImage(draft.photo, x, y, edge, edge, boxX, boxY, boxSize, boxSize);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxSize, boxSize);
    const tile = draft.texture || document.createElement("canvas");
    tile.width = tile.height = 52;
    const paint = tile.getContext("2d", { willReadFrequently: true });
    paint.drawImage(draft.photo, x, y, edge, edge, 0, 0, 52, 52);
    const pixels = paint.getImageData(0, 0, 52, 52).data;
    const sums = [0, 0, 0];
    let weight = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha < 40) continue;
      for (let ch = 0; ch < 3; ch++) sums[ch] += pixels[i + ch] * alpha;
      weight += alpha;
    }
    draft.texture = weight ? tile : null;
    draft.average = weight ? "#" + sums.map((sum) => Math.round(sum / weight).toString(16).padStart(2, "0")).join("") : "";
  }

  function drawFit() {
    const item = garment();
    const worn = W.outfit(current);
    worn[item.category] = item;
    const canvas = $("fit-avatar");
    canvas.setAttribute("aria-label", current.name + " probiert " + item.name +
      (item.texture ? " mit einem Muster aus dem Foto an." : " in " + W.itemColor(item).name + " an."));
    AtelierArt.figure(canvas, worn, current);
    const usePhoto = Boolean(item.texture);
    $("fit-color").disabled = usePhoto;
    $("fit-custom-row").hidden = usePhoto || entry().color !== "custom";
    $("fit-custom-color").value = entry().custom;
    const note = draft.photo && draft.useTexture
      ? (usePhoto ? "Farbton der Stoffprobe: " + draft.average.toUpperCase() + ". Beim Speichern wird der Farbton übernommen." :
        "Der Ausschnitt ist transparent. Wähle einen sichtbaren Teil des Bildes.")
      : "";
    if ($("fit-texture-status").textContent !== note) $("fit-texture-status").textContent = note;
    $("fit-texture-status").hidden = !note;
  }

  function drawComparison() {
    const area = $("fit-results");
    const list = document.createElement("ul");
    list.className = "fit-results-list";
    for (const key of comparisons[draft.category]) {
      const value = entry().dimensions[key];
      const control = $("fit-measure-" + key);
      if (!value) {
        control?.removeAttribute("aria-invalid");
        continue;
      }
      const { centimeters } = value;
      const [min, max] = limits[key];
      const row = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = names[key];
      const result = document.createElement("strong");
      const invalid = !Number.isFinite(centimeters) || centimeters < min || centimeters > max;
      if (invalid) {
        result.textContent = "Gib " + decimal.format(min / divisor(key)) + "–" + decimal.format(max / divisor(key)) + " cm ein";
        result.className = "negative";
        control?.setAttribute("aria-invalid", "true");
      } else {
        control?.removeAttribute("aria-invalid");
        if (key === "length") {
          result.textContent = current.measures.height ? "Saumlänge in Vorschau angepasst" : "Körpergröße für Saumvorschau eintragen";
        } else if (!current.measures[key]) {
          result.textContent = "Körpermaß fehlt";
        } else {
          const diff = Math.round((centimeters - current.measures[key]) * 10) / 10;
          result.textContent = (diff > 0 ? "+" : diff < 0 ? "−" : "") + number.format(Math.abs(diff)) + " cm zum Körpermaß";
          result.classList.toggle("negative", diff < 0);
        }
      }
      row.append(text, result);
      list.append(row);
    }
    if (area.textContent !== list.textContent) area.replaceChildren(...(list.childElementCount ? [list] : []));
  }

  function showMeasures() {
    const category = entry();
    const keys = comparisons[draft.category];
    $("fit-mode-label").hidden = !keys.some((key) => circumferences.includes(key));
    $("fit-mode").value = draft.mode;
    $("fit-measure-hint").textContent = draft.category === "shoes"
      ? "Vergleiche die Innenlänge des Schuhs mit deiner Fußlänge."
      : "Nutze die Maße des Kleidungsstücks. Eine flach gemessene Breite wird für den Vergleich verdoppelt. Ärmellänge und Innenbeinlänge bleiben unverändert.";
    $("fit-measure-fields").replaceChildren(...keys.map((key) => {
      const label = document.createElement("label");
      label.className = "field";
      const caption = document.createElement("span");
      caption.textContent = names[key] + " (cm)";
      const input = document.createElement("input");
      input.id = "fit-measure-" + key;
      input.inputMode = "decimal";
      input.maxLength = 12;
      const previous = category.dimensions[key];
      if (previous) {
        const factor = divisor(key);
        input.value = previous.factor === factor || !Number.isFinite(previous.centimeters) ? previous.raw
          : decimal.format(previous.centimeters / factor);
      }
      input.addEventListener("input", () => {
        const parsed = W.parseDecimal(input.value);
        const factor = divisor(key);
        if (parsed === null) delete category.dimensions[key];
        else category.dimensions[key] = { raw: input.value, factor, centimeters: parsed * factor };
        drawComparison();
        if (key === "length") drawFit();
      });
      label.append(caption, input);
      return label;
    }));
    drawComparison();
  }

  function syncCropControls() {
    for (const key of ["x", "y", "size"]) $("fit-" + key).value = draft[key];
  }

  function showImage() {
    $("fit-crop").hidden = !draft.photo;
    $("fit-texture-options").hidden = !draft.photo;
    $("fit-use-texture").checked = draft.useTexture;
    $("fit-error").hidden = !draft.error;
    $("fit-error").textContent = draft.error;
    syncCropControls();
    drawCrop();
    drawFit();
  }

  async function loadImage(file) {
    if (!file) return;
    const target = draft;
    const sequence = ++target.uploadSequence;
    try {
      const photo = await ReferenceImage.read(file);
      if (target.uploadSequence === sequence) Object.assign(target, { photo, x: 50, y: 50, size: 28, useTexture: true, error: "" });
    } catch (error) {
      if (target.uploadSequence === sequence) target.error = error.message;
    }
    if (draft === target && target.uploadSequence === sequence) showImage();
  }

  function showGarmentFields() {
    const { cut, color, fit } = entry();
    fillSelect($("fit-cut"), W.slots[draft.category].cuts, cut);
    $("fit-color").value = color;
    $("fit-ease").value = fit;
    showMeasures();
  }

  function render(profile) {
    current = profile;
    if (!drafts.has(profile.id)) drafts.set(profile.id, defaultDraft());
    draft = drafts.get(profile.id);
    const recorded = Object.keys(profile.measures).length;
    $("fit-person").textContent = profile.name + " · " + (recorded ? recorded + " Körpermaße hinterlegt" : "Körpermaße optional");
    $("fit-category").value = draft.category;
    showGarmentFields();
    showImage();
  }

  function resetDrafts() {
    for (const previous of drafts.values()) previous.uploadSequence += 1;
    drafts.clear();
    draft = null;
  }

  fillSelect($("fit-category"), categoryLabels, "layer");
  fillSelect($("fit-color"), colorLabels, "burgundy");
  fillSelect($("fit-ease"), W.fits, "regular");
  $("fit-form").addEventListener("submit", (event) => event.preventDefault());
  $("fit-category").addEventListener("change", (event) => {
    draft.category = event.target.value;
    showGarmentFields();
    drawFit();
  });
  for (const [id, key] of [["fit-cut", "cut"], ["fit-color", "color"], ["fit-ease", "fit"]]) {
    $(id).addEventListener("change", (event) => {
      entry()[key] = event.target.value;
      drawFit();
    });
  }
  $("fit-custom-color").addEventListener("input", (event) => {
    entry().custom = event.target.value;
    drawFit();
  });
  $("fit-mode").addEventListener("change", (event) => {
    draft.mode = event.target.value;
    showMeasures();
  });
  $("fit-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    event.target.value = "";
    void loadImage(file);
  });
  for (const key of ["x", "y", "size"]) {
    $("fit-" + key).addEventListener("input", (event) => {
      draft[key] = Number(event.target.value);
      drawCrop();
      drawFit();
    });
  }
  $("fit-reference").addEventListener("click", (event) => {
    if (!draft.photo) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const drawScale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const canvasX = (event.clientX - rect.left - (rect.width - canvas.width * drawScale) / 2) / drawScale;
    const canvasY = (event.clientY - rect.top - (rect.height - canvas.height * drawScale) / 2) / drawScale;
    const { width, height, scale, px, py, edge } = cropPlacement();
    const asPercent = (coord, max) => max > 0 ? Math.round(bound(100 * coord / max, 0, 100)) : 50;
    draft.x = asPercent((canvasX - px) / scale - edge / 2, width - edge);
    draft.y = asPercent((canvasY - py) / scale - edge / 2, height - edge);
    syncCropControls();
    drawCrop();
    drawFit();
  });
  $("fit-use-texture").addEventListener("change", (event) => {
    draft.useTexture = event.target.checked;
    drawFit();
  });
  $("fit-remove").addEventListener("click", () => {
    draft.uploadSequence += 1;
    Object.assign(draft, { photo: null, texture: null, error: "", average: "", useTexture: true });
    showImage();
    $("fit-file").focus();
  });

  return { render, garment, resetDrafts };
})();
