"use strict";

const Wardrobe = (() => {
  const slots = {
    top: { name: "Oberteile", short: "Oberteil", icon: "shirt", cuts: { tee: "T-Shirt", shirt: "Hemd", blouse: "Bluse", polo: "Polo", tank: "Top", longsleeve: "Longsleeve" } },
    mid: { name: "Pullover", short: "Pullover", icon: "layers", cuts: { sweater: "Strickpullover", hoodie: "Hoodie", turtleneck: "Rollkragenpullover", vest: "Pullunder" } },
    bottom: { name: "Unterteile", short: "Unterteil", icon: "pants", cuts: { pants: "Stoffhose", jeans: "Jeans", widepants: "Weite Hose", cargo: "Cargohose", shorts: "Shorts", skirt: "A-Linien-Rock", pencil: "Bleistiftrock", pleated: "Faltenrock" } },
    layer: { name: "Jacken", short: "Jacke", icon: "layers", cuts: { jacket: "Jacke", denim: "Jeansjacke", overshirt: "Overshirt", bomber: "Bomberjacke", blazer: "Blazer / Sakko", cardigan: "Cardigan", coat: "Wollmantel", peacoat: "Pea Coat / Caban", trench: "Trenchcoat", puffer: "Steppjacke" } },
    shoes: { name: "Schuhe", short: "Schuhe", icon: "shoe", cuts: { sneaker: "Sneaker", boot: "Boots", loafer: "Loafer", flat: "Ballerinas" } },
    bag: { name: "Taschen", short: "Tasche", icon: "bag", cuts: { tote: "Shopper", crossbody: "Umhängetasche", handbag: "Handtasche", backpack: "Rucksack" } },
    belt: { name: "Gürtel", short: "Gürtel", icon: "belt", cuts: { leather: "Ledergürtel", woven: "Flechtgürtel" } },
    watch: { name: "Uhren", short: "Uhr", icon: "watch", cuts: { watch: "Armbanduhr", smartwatch: "Smartwatch" } },
    necklace: { name: "Ketten", short: "Kette", icon: "necklace", cuts: { chain: "Halskette", pendant: "Kette mit Anhänger" } }
  };

  const styles = { casual: "Casual", smart: "Smart Casual", formal: "Elegant", sport: "Sportlich" };
  const figures = { male: "Männlich", female: "Weiblich" };
  const haircuts = { short: "Kurzhaar", buzz: "Sehr kurz", curls: "Locken", afro: "Offener Afro", afroPuff: "Afro-Puff mit Locken",
    curlyPony: "Afro-Zopf mit langen Locken", ponytail: "Pferdeschwanz", long: "Langes Haar", bald: "Rasierter Kopf" };
  const fits = { slim: "Schmal", regular: "Normal", relaxed: "Locker", oversized: "Oversize" };
  const patterns = { solid: "Uni", stripes: "Querstreifen", pinstripe: "Längsstreifen", checks: "Karo", dots: "Punkte", floral: "Blumen", blocks: "Colorblocking" };
  const measurements = {
    height: { name: "Körpergröße", min: 100, max: 240 },
    chest: { name: "Brustumfang", min: 45, max: 220 },
    waist: { name: "Taillenumfang", min: 45, max: 220 },
    hip: { name: "Hüftumfang", min: 45, max: 230 },
    inseam: { name: "Innenbeinlänge", min: 35, max: 125 },
    arm: { name: "Armlänge", min: 30, max: 100 },
    foot: { name: "Fußlänge", min: 12, max: 40 }
  };
  const colors = {
    black: { name: "Schwarz", hex: "#30343b", tile: "#eeede9", group: "neutral" },
    grey: { name: "Grau", hex: "#8d969c", tile: "#ecefee", group: "neutral" },
    white: { name: "Weiß", hex: "#f6f5ee", tile: "#eeeef1", group: "neutral" },
    cream: { name: "Creme", hex: "#e8dcc0", tile: "#f5f0e4", group: "neutral" },
    beige: { name: "Beige", hex: "#b89a71", tile: "#f3eddf", group: "neutral" },
    brown: { name: "Braun", hex: "#815946", tile: "#f3e9e1", group: "neutral" },
    navy: { name: "Marineblau", hex: "#354c6a", tile: "#e8edf3", group: "neutral" },
    blue: { name: "Blau", hex: "#6286aa", tile: "#e9eff7", group: "cool" },
    green: { name: "Salbeigrün", hex: "#83a78e", tile: "#e9f1e6", group: "cool" },
    olive: { name: "Olivgrün", hex: "#767e50", tile: "#edf0e1", group: "earth" },
    yellow: { name: "Gelb", hex: "#e8bf58", tile: "#fbf3d9", group: "warm" },
    orange: { name: "Orange", hex: "#d57c50", tile: "#faede3", group: "warm" },
    red: { name: "Rot", hex: "#a8424e", tile: "#f8e8e8", group: "bright" },
    rose: { name: "Rosé", hex: "#d79caa", tile: "#f8ebef", group: "soft" },
    lilac: { name: "Flieder", hex: "#a694c3", tile: "#f1edf8", group: "soft" },
    burgundy: { name: "Burgunder", hex: "#692a41", tile: "#f2e6e9", group: "earth" },
    wine: { name: "Weinrot", hex: "#852b3c", tile: "#f4e6e8", group: "earth" },
    ecru: { name: "Ecru", hex: "#dfd5b6", tile: "#f5f0e5", group: "neutral" },
    camel: { name: "Camel", hex: "#bd8957", tile: "#f4e9d9", group: "neutral" },
    graphite: { name: "Anthrazit", hex: "#4a4c54", tile: "#edecef", group: "neutral" },
    teal: { name: "Petrol", hex: "#3e6c70", tile: "#e5eef0", group: "cool" },
    emerald: { name: "Smaragd", hex: "#367454", tile: "#e5eee6", group: "cool" },
    sky: { name: "Hellblau", hex: "#a7c5dc", tile: "#e9f2f7", group: "cool" },
    rust: { name: "Rost", hex: "#ad5b3e", tile: "#f6e9e3", group: "earth" },
    mustard: { name: "Senf", hex: "#b88b2f", tile: "#f4edda", group: "earth" },
    violet: { name: "Violett", hex: "#675583", tile: "#eeeaf3", group: "soft" },
    ink: { name: "Dunkelblau", hex: "#242e45", tile: "#e9edf4", group: "neutral" }
  };

  const samples = [
    ["tee", "Sonnengelbes T-Shirt", "yellow", "casual", "top"],
    ["tee", "Salbeigrünes T-Shirt", "green", "casual", "top"],
    ["shirt", "Weißes Hemd", "white", "smart", "top"],
    ["sweater", "Cremefarbener Strickpulli", "cream", "casual", "mid"],
    ["shirt", "Hellblaues Hemd", "blue", "smart", "top"],
    ["tee", "Schwarzes T-Shirt", "black", "casual", "top"],
    ["pants", "Schwarze Stoffhose", "black", "smart", "bottom"],
    ["jeans", "Blaue Jeans", "blue", "casual", "bottom"],
    ["pants", "Beige Chino", "beige", "smart", "bottom"],
    ["shorts", "Olivgrüne Shorts", "olive", "casual", "bottom"],
    ["pants", "Rote Hose", "red", "casual", "bottom"],
    ["denim", "Jeansjacke", "blue", "casual", "layer"],
    ["coat", "Beiger Mantel", "beige", "formal", "layer"],
    ["cardigan", "Cremefarbener Cardigan", "cream", "casual", "layer"],
    ["sneaker", "Weiße Sneaker", "white", "casual", "shoes"],
    ["boot", "Schwarze Boots", "black", "smart", "shoes"],
    ["loafer", "Braune Loafer", "brown", "smart", "shoes"],
    ["peacoat", "Marineblauer Pea Coat", "navy", "smart", "layer"],
    ["shirt", "Burgunderfarbenes Karohemd", "burgundy", "casual", "top", "checks", "#eddbca"]
  ];

  const secondSamples = [
    ["tee", "Sonnengelbes T-Shirt", "yellow", "casual", "top"],
    ["tank", "Schwarzes Top", "black", "casual", "top"],
    ["blouse", "Weiße Bluse", "white", "smart", "top"],
    ["sweater", "Fliederfarbener Pullover", "lilac", "casual", "mid"],
    ["blouse", "Roséfarbene Bluse", "rose", "formal", "top"],
    ["tee", "Salbeigrünes T-Shirt", "green", "casual", "top"],
    ["pants", "Schwarze Stoffhose", "black", "smart", "bottom"],
    ["jeans", "Blaue Jeans", "blue", "casual", "bottom"],
    ["skirt", "Beiger Midirock", "beige", "smart", "bottom"],
    ["skirt", "Roter Midirock", "red", "formal", "bottom"],
    ["denim", "Jeansjacke", "blue", "casual", "layer"],
    ["coat", "Schwarzer Mantel", "black", "formal", "layer"],
    ["cardigan", "Cremefarbener Cardigan", "cream", "casual", "layer"],
    ["sneaker", "Weiße Sneaker", "white", "casual", "shoes"],
    ["boot", "Braune Boots", "brown", "smart", "shoes"],
    ["loafer", "Schwarze Loafer", "black", "formal", "shoes"],
    ["peacoat", "Burgunderfarbener Pea Coat", "burgundy", "smart", "layer"],
    ["tee", "Gestreiftes Shirt", "cream", "casual", "top", "stripes", "#364a60"]
  ];

  const keys = Object.keys(slots);
  const accessoryKeys = ["bag", "belt", "watch", "necklace"];
  const mainKeys = keys.filter((key) => !accessoryKeys.includes(key));
  const accessorySamples = [
    ["crossbody", "Schwarze Umhängetasche", "black", "casual", "bag"],
    ["leather", "Brauner Ledergürtel", "brown", "smart", "belt"],
    ["watch", "Silbergraue Armbanduhr", "grey", "smart", "watch"],
    ["pendant", "Goldfarbene Kette", "mustard", "smart", "necklace"]
  ];
  const weatherSamples = [
    ["jacket", "Wasserabweisende Jacke", "olive", "casual", "layer", "solid", "#eedfcb", "medium", "both"],
    ["boot", "Wasserabweisende Boots", "black", "casual", "shoes", "solid", "#eedfcb", "warm", "water"]
  ];
  const emptyPieces = () => Object.fromEntries(keys.map((key) => [key, null]));
  const MAX_ITEMS = 300;
  const MAX_LOOKS = 300;
  const MAX_FILE = 12_000_000;
  const has = (obj, key) => typeof key === "string" && Object.hasOwn(obj, key);
  const styleName = (style) => styles[style] || "Alle Stile";
  const validHex = (value) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  const baseAvatar = (figure) => ({ hair: figure === "female" ? "long" : "short", skin: figure === "female" ? "#c59376" : "#bb8d73", hairColor: "#3d2d28" });
  function defaults() {
    const profiles = [samples, secondSamples].map((list, index) => {
      const id = "profil-" + (index + 1);
      const items = list.concat(accessorySamples, weatherSamples).map(([cut, name, color, style, category, pattern = "solid", accent = "#eedfcb",
        warmth = "auto", protection = "unknown"], i) => ({
        id: id + "-teil-" + (i + 1), cut, name, color, style, category, pattern, accent, fit: "regular", customColor: "", colorName: "",
        warmth, protection, demo: true
      }));
      const pieces = { ...emptyPieces(), top: items[0].id, bottom: items[6].id };
      const figure = index === 0 ? "male" : "female";
      return { id, name: "Person " + (index + 1), figure, avatar: baseAvatar(figure), measures: {}, weather: Weather.empty(),
        items, looks: [], pieces, style: "any", matchOnly: false };
    });
    return { version: 4, active: profiles[0].id, profiles };
  }

  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const idValue = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{1,65}$/.test(value);
  const nameValue = (value, max) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
  function parseDecimal(value) {
    const input = String(value).trim();
    if (!input) return null;
    if (!/^[+−-]?\d+(?:[.,]\d+)?$/.test(input)) return NaN;
    return Number(input.replace(",", ".").replace("−", "-"));
  }

  function check(condition, message) {
    if (!condition) throw new Error(message);
  }

  function validated(raw) {
    check(object(raw) && [1, 2, 3, 4].includes(raw.version), "Die Datei hat kein unterstütztes Kleiderstudio-Format (Version 1 bis 4).");
    const legacy = raw.version === 1;
    const beforeWeather = raw.version < 3;
    check(Array.isArray(raw.profiles) && raw.profiles.length === 2, "Die Sicherung muss genau zwei Profile enthalten.");
    const seenProfiles = new Set();
    const seenPhotos = new Set();
    const profiles = raw.profiles.map((profile, index) => {
      const label = "Profil " + (index + 1) + ": ";
      check(object(profile) && idValue(profile.id) && !seenProfiles.has(profile.id) && nameValue(profile.name, 30) && has(figures, profile.figure), label + "Name, Figur oder ID ist ungültig.");
      seenProfiles.add(profile.id);
      check((profile.style === "any" || has(styles, profile.style)) && typeof profile.matchOnly === "boolean", label + "Die Studio-Einstellungen sind ungültig.");
      const avatar = legacy ? baseAvatar(profile.figure) : profile.avatar;
      check(object(avatar) && has(haircuts, avatar.hair) && validHex(avatar.skin) && validHex(avatar.hairColor), label + "Die Figur enthält ungültige Angaben.");
      const recorded = legacy ? {} : profile.measures;
      check(object(recorded) && Object.keys(recorded).every((key) => has(measurements, key) && validMeasure(key, recorded[key])), label + "Die Körpermaße sind ungültig.");
      const weather = beforeWeather ? Weather.empty() : profile.weather;
      check(Weather.valid(weather), label + "Die Wetterangaben sind ungültig.");
      check(Array.isArray(profile.items) && profile.items.length <= MAX_ITEMS, label + "Die Liste der Kleidungsstücke ist ungültig oder zu groß.");
      const itemsById = new Map();
      const items = profile.items.map((item, i) => {
        const category = legacy && item?.category === "top" && item.cut === "sweater" ? "mid" : item?.category;
        const accent = legacy ? "#eedfcb" : item?.accent;
        const pattern = legacy ? "solid" : item?.pattern;
        const fit = legacy ? "regular" : item?.fit;
        const customColor = legacy ? "" : item?.customColor;
        const colorName = legacy ? "" : item?.colorName;
        const warmth = beforeWeather ? "auto" : item?.warmth;
        const protection = beforeWeather ? "unknown" : item?.protection;
        const photo = raw.version === 4 ? item?.photo : undefined;
        check(object(item) && idValue(item.id) && !itemsById.has(item.id) && nameValue(item.name, 48) &&
          has(slots, category) && has(slots[category].cuts, item.cut) &&
          has(colors, item.color) && has(styles, item.style) && has(patterns, pattern) && has(fits, fit) &&
          validHex(accent) && (customColor === "" || validHex(customColor)) && (colorName === "" || nameValue(colorName, 30)) &&
          has(Weather.warmth, warmth) && has(Weather.protection, protection) &&
          (item.demo === undefined || typeof item.demo === "boolean"),
        label + "Kleidungsstück " + (i + 1) + " enthält ungültige Angaben.");
        const clean = { id: item.id, name: item.name.trim(), category, cut: item.cut, color: item.color, style: item.style, pattern, fit,
          accent: accent.toLowerCase(), customColor: customColor.toLowerCase(), colorName: colorName.trim(), warmth, protection, demo: item.demo === true };
        if (photo !== undefined) {
          check(idValue(photo) && !seenPhotos.has(photo), label + "Kleidungsstück " + (i + 1) + " hat einen ungültigen Fotoverweis.");
          seenPhotos.add(photo);
          clean.photo = photo;
        }
        if (raw.version === 4 && item.soleColor !== undefined) {
          check(category === "shoes" && validHex(item.soleColor), label + "Kleidungsstück " + (i + 1) + " hat eine ungültige Sohlenfarbe.");
          clean.soleColor = item.soleColor.toLowerCase();
        }
        itemsById.set(clean.id, clean);
        return clean;
      });

      function cleanPieces(value) {
        check(object(value), label + "Ein Outfit hat ein ungültiges Format.");
        const result = emptyPieces();
        for (const key of keys) {
          if (legacy && (key === "mid" || accessoryKeys.includes(key))) continue;
          const id = value[key];
          const actual = itemsById.get(id)?.category;
          const migrated = legacy && key === "top" && actual === "mid";
          check(id === null || (idValue(id) && (actual === key || migrated)), label + "Ein Outfit verweist auf ein fehlendes oder falsch einsortiertes Teil.");
          result[migrated ? "mid" : key] = id;
        }
        return result;
      }

      check(Array.isArray(profile.looks) && profile.looks.length <= MAX_LOOKS, label + "Die Liste gespeicherter Looks ist ungültig oder zu groß.");
      const lookIds = new Set();
      const looks = profile.looks.map((look, i) => {
        check(object(look) && idValue(look.id) && !lookIds.has(look.id) && nameValue(look.name, 48),
          label + "Look " + (i + 1) + " enthält ungültige Angaben.");
        lookIds.add(look.id);
        const pieces = cleanPieces(look.pieces);
        check(keys.some((key) => pieces[key]), label + "Ein gespeicherter Look enthält kein Kleidungsstück.");
        return { id: look.id, name: look.name.trim(), pieces };
      });
      return { id: profile.id, name: profile.name.trim(), figure: profile.figure, avatar: { hair: avatar.hair, skin: avatar.skin.toLowerCase(), hairColor: avatar.hairColor.toLowerCase() },
        measures: { ...recorded }, weather: { temperature: weather.temperature, sky: weather.sky, precipitation: weather.precipitation, wind: weather.wind },
        items, looks, pieces: cleanPieces(profile.pieces), style: profile.style, matchOnly: profile.matchOnly };
    });
    check(seenProfiles.has(raw.active), "Das aktive Profil fehlt in dieser Sicherung.");
    return { version: 4, active: raw.active, profiles };
  }

  function newId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function outfit(profile, pieces = profile.pieces, items = new Map(profile.items.map((item) => [item.id, item]))) {
    return Object.fromEntries(keys.map((key) => {
      const item = items.get(pieces[key]);
      return [key, item?.category === key ? item : null];
    }));
  }

  function piecesOf(worn) {
    return Object.fromEntries(keys.map((key) => [key, worn[key]?.id ?? null]));
  }

  function searchFor(query) {
    const fold = (value) => value.toLocaleLowerCase("de").replace(/ß/g, "ss").normalize("NFD").replace(/\p{M}/gu, "");
    const expand = (value) => fold(value.toLocaleLowerCase("de").replace(/[äöü]/g, (letter) => ({ ä: "ae", ö: "oe", ü: "ue" })[letter]));
    const words = fold(query).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return () => true;
    return (item) => {
      const details = [item.name, itemColor(item).name, styles[item.style], patterns[item.pattern], fits[item.fit],
        slots[item.category].name, slots[item.category].cuts[item.cut], item.warmth === "auto" ? "" : Weather.warmth[item.warmth],
        ["unknown", "none"].includes(item.protection) ? "" : Weather.protection[item.protection]].join(" ");
      const plain = fold(details);
      const expanded = expand(details);
      return words.every((word) => plain.includes(word) || expanded.includes(word));
    };
  }

  function classify(hex) {
    const [r, g, b] = [1, 3, 5].map((position) => parseInt(hex.slice(position, position + 2), 16));
    const max = Math.max(r, g, b);
    const span = max - Math.min(r, g, b);
    if (span < 28 || max < 60) return "neutral";
    if (max === g || (max === b && g > r * 1.13)) return "cool";
    if (max === r && g > b * 1.16) return max < 170 ? "earth" : "warm";
    if (max === r && g < b * .9 && max < 145) return "earth";
    if (max > 180 && span < 95) return "soft";
    return max === b ? "soft" : "bright";
  }

  function itemColor(item) {
    const preset = colors[item.color];
    if (!item.customColor) return preset;
    const hex = item.customColor;
    return { name: item.colorName || hex.toUpperCase(), hex, tile: preset.tile, group: classify(hex) };
  }

  function validMeasure(key, value) {
    const range = measurements[key];
    return Boolean(range) && Number.isFinite(value) && value >= range.min && value <= range.max;
  }

  function colorMatch(a, b) {
    if (a.hex === b.hex) return { score: 2, reason: "Gleiche Farbtöne verbinden die Teile." };
    const first = a.group;
    const second = b.group;
    if ([first, second].includes("neutral")) return { score: 3, reason: a.name + " und " + b.name + " lassen sich durch den neutralen Ton leicht kombinieren." };
    if (first === second || first === "earth" || second === "earth" || (first === "soft" && second === "cool") || (first === "cool" && second === "soft")) {
      return { score: 2, reason: "Die verwandten oder gedeckten Farbtöne wirken stimmig zusammen." };
    }
    if ((first === "warm" && second === "cool") || (first === "cool" && second === "warm")) {
      return { score: 1, reason: "Die Farben erzeugen einen sichtbaren Warm-Kalt-Kontrast." };
    }
    return { score: -2, reason: "Die kräftigen Farbtöne konkurrieren miteinander. Ein neutraler Ton bringt Ruhe in die Kombination." };
  }

  function styleMatch(a, b) {
    if (a === b) return 2;
    if ([a, b].includes("smart") && ![a, b].includes("sport")) return 1;
    if ([a, b].includes("casual") && [a, b].includes("sport")) return 1;
    return -2;
  }

  const showsCollar = (top, mid) => top && ["shirt", "blouse", "polo"].includes(top.cut) && !["hoodie", "turtleneck"].includes(mid?.cut);
  const coveredByKnit = (top, mid) => top && mid && mid.cut !== "vest" && !showsCollar(top, mid);

  function pair(a, b) {
    const parts = Object.fromEntries([[a.category, a], [b.category, b]]);
    const { top, mid, layer, bottom } = parts;
    const hiddenTop = coveredByKnit(top, mid);
    const color = hiddenTop ? { score: 0, reason: "" } : colorMatch(itemColor(a), itemColor(b));
    const sharedStyle = hiddenTop ? 0 : styleMatch(a.style, b.style);
    let layerScore = 0;
    let layerReason = "";
    if (top && mid) {
      layerScore = 2;
      layerReason = showsCollar(top, mid)
        ? "Pullover und Hemd lassen sich übereinander tragen. Der Kragen bleibt sichtbar."
        : "Der Pullover liegt als eigene Schicht über dem Oberteil.";
    } else if (mid && layer) {
      const tight = layer.fit === "slim" || (layer.fit === "regular" && mid.cut === "hoodie" && ["blazer", "cardigan"].includes(layer.cut));
      layerScore = tight ? -2 : 2;
      layerReason = tight ? "Diese Jacke kann über dem Pullover eng sitzen. Prüfe die Mehrweite." : "Die Jacke liegt als äußere Schicht über dem Pullover.";
    } else if (bottom && layer && ["skirt", "pleated"].includes(bottom.cut) && ["coat", "peacoat", "trench"].includes(layer.cut)) {
      layerScore = layer.fit === "slim" ? -2 : 2;
      layerReason = layerScore < 0 ? "Ein weiter Rock kann unter einem schmalen Mantel am Saum auftragen." : "Der Mantel fällt über den Rock. Ein längerer Rocksaum bleibt darunter sichtbar.";
    }
    const weak = color.score < 0 || sharedStyle < 0 || layerScore < 0;
    const patternsTogether = !hiddenTop && a.pattern !== "solid" && b.pattern !== "solid";
    const reason = layerScore < 0 ? layerReason : color.score < 0 ? color.reason :
      sharedStyle < 0 ? "Die Teile mischen unterschiedliche Stile. Für einen einheitlichen Look wähle einen ähnlichen Stil." :
      layerReason || color.reason;
    return { score: color.score + sharedStyle + layerScore - (patternsTogether ? 1 : 0), weak, fitConcern: layerScore < 0, reason };
  }

  function rate(item, worn, targetStyle, weather) {
    const top = item.category === "top" ? item : worn.top;
    const mid = item.category === "mid" ? item : worn.mid;
    const peers = Object.values(worn).filter((other) => other && other.category !== item.category);
    let relevantPeers = peers;
    if (coveredByKnit(top, mid)) {
      if (item.category === "top") relevantPeers = peers.filter((other) => other.category === "mid");
      else if (item.category !== "mid") relevantPeers = peers.filter((other) => other.category !== "top");
    }
    const scores = relevantPeers.map((other) => pair(item, other));
    const style = targetStyle === "any" ? 0 : styleMatch(item.style, targetStyle);
    const climate = Weather.assess(item, weather);
    const score = (scores.length ? scores.reduce((total, match) => total + match.score, 0) / scores.length : 0) + style + climate.score;
    return {
      score, relevant: scores.length > 0 || targetStyle !== "any" || climate.score > 0,
      weatherScore: climate.score, compatible: !climate.weak && style >= 0 && scores.every((match) => !match.weak)
    };
  }

  function outfitTip(worn, targetStyle) {
    const items = Object.values(worn).filter(Boolean);
    const visible = coveredByKnit(worn.top, worn.mid) ? items.filter((item) => item.category !== "top") : items;
    const pairs = visible.flatMap((item, i) => visible.slice(i + 1).map((other) => pair(item, other)));
    const fitConcern = pairs.find((entry) => entry.fitConcern);
    if (fitConcern) return { title: "Passform prüfen", body: fitConcern.reason };
    if (worn.belt && worn.bottom && worn.mid) {
      return { title: "Gürtel unter dem Pullover", body: "Der Pullover bedeckt Gürtel und Schnalle. Ohne Pullover sitzt der Gürtel sichtbar am Bund." };
    }
    if (targetStyle !== "any" && visible.some((item) => styleMatch(item.style, targetStyle) < 0)) {
      return { title: "Stil abstimmen", body: "Mindestens ein angezogenes Teil weicht von „" + styleName(targetStyle) + "“ ab. „Nur passende“ hilft bei der Suche nach Alternativen." };
    }
    if (items.length < 2) return { title: "Stiltipp", body: "Kombiniere zwei Teile, um Hinweise zu Farben, Stil und Schichten zu sehen." };
    const match = pairs.find((entry) => entry.weak) || (worn.top && worn.mid && pair(worn.top, worn.mid)) ||
      (worn.mid && worn.layer && pair(worn.mid, worn.layer)) || (worn.layer && worn.bottom && pair(worn.layer, worn.bottom)) || pairs[0];
    return { title: match.weak ? "Das kannst du ausprobieren" : "Darum passt’s", body: match.reason };
  }

  function removeItemReferences(profile, ids) {
    const removed = new Set(ids);
    const clean = (pieces) => Object.fromEntries(keys.map((key) => [key, removed.has(pieces[key]) ? null : pieces[key]]));
    profile.pieces = clean(profile.pieces);
    profile.looks = profile.looks.map((look) => ({ ...look, pieces: clean(look.pieces) }))
      .filter((look) => keys.some((key) => look.pieces[key]));
  }

  function moveItemReferences(profile, item, category) {
    const move = (pieces) => pieces[item.category] === item.id
      ? { ...pieces, [item.category]: null, [category]: pieces[category] ?? item.id }
      : pieces;
    profile.pieces = move(profile.pieces);
    profile.looks = profile.looks.map((look) => ({ ...look, pieces: move(look.pieces) }));
  }

  function suggestOutfit(profile) {
    const worn = outfit(profile);
    const clothes = Object.fromEntries(mainKeys.map((key) => [key, worn[key]]));
    const weather = profile.weather;
    const outlook = Weather.conditions(weather);
    function option(key, excluded) {
      let best;
      for (const item of profile.items) {
        if (item.category !== key || item.id === excluded) continue;
        const match = rate(item, clothes, profile.style, weather);
        if (match.compatible && (!best || match.score > best.score)) best = { item, score: match.score };
      }
      return best?.item;
    }

    let added = 0;
    for (const key of ["top", "bottom", "shoes", "mid", "layer"]) {
      const existing = clothes[key];
      const wanted = key === "mid" ? !clothes.top || outlook?.mid : key === "layer" ? !outlook || outlook.layer : true;
      const rating = existing && Weather.assess(existing, weather, outlook);
      if (existing && !rating.weak && !(outlook?.wet && ["layer", "shoes"].includes(key))) continue;
      const item = wanted ? option(key, existing?.id) : null;
      if (!existing) {
        if (!item) continue;
        clothes[key] = item;
        added += 1;
      } else if (item && (rating.weak || Weather.assess(item, weather, outlook).score > rating.score + 2.35)) {
        clothes[key] = item;
      } else if (!wanted && rating.weak && ["mid", "layer"].includes(key)) {
        clothes[key] = null;
      }
    }
    const pieces = piecesOf({ ...worn, ...clothes });
    if (mainKeys.some((key) => pieces[key] !== profile.pieces[key])) return { pieces, added };

    const equipped = ["layer", "shoes", "bottom", "mid", "top"].filter((key) => clothes[key] &&
      (!outlook || (key !== "mid" || outlook.mid) && (key !== "layer" || outlook.layer)));
    for (const key of equipped) {
      const item = option(key, clothes[key].id);
      if (!item || (outlook && Weather.assess(item, weather, outlook).score + .5 < Weather.assess(clothes[key], weather, outlook).score)) continue;
      return { pieces: piecesOf({ ...worn, [key]: item }), alternative: item.name };
    }
    return null;
  }

  return { slots, keys, mainKeys, accessoryKeys, styles, figures, colors, haircuts, measurements, fits, patterns, validHex, validMeasure,
    baseAvatar, itemColor, styleName, defaults, validated, outfit, piecesOf, emptyPieces, newId,
    nameValue, parseDecimal, searchFor, rate, outfitTip, removeItemReferences, moveItemReferences, suggestOutfit,
    MAX_ITEMS, MAX_LOOKS, MAX_FILE };
})();
