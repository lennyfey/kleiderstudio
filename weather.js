"use strict";

const Weather = (() => {
  const skies = { unknown: "Nicht angegeben", sunny: "Sonnig", partly: "Teils bewölkt", cloudy: "Bewölkt", fog: "Neblig" };
  const precipitation = { unknown: "Nicht angegeben", dry: "Trocken", drizzle: "Nieselregen", rain: "Regen", snow: "Schnee" };
  const winds = { unknown: "Nicht angegeben", calm: "Windstill", breezy: "Windig", strong: "Starker Wind" };
  const warmth = { auto: "Nach Schnitt geschätzt", light: "Leicht", medium: "Mittel", warm: "Warm" };
  const protection = { unknown: "Nicht angegeben", none: "Kein Wetterschutz", wind: "Windabweisend",
    water: "Wasserabweisend", both: "Wind- und wasserabweisend" };
  const empty = () => ({ temperature: null, sky: "unknown", precipitation: "unknown", wind: "unknown" });
  const minTemperature = -50;
  const maxTemperature = 60;
  const validTemperature = (value) => value === null || (Number.isFinite(value) && value >= minTemperature && value <= maxTemperature);
  const known = (weather) => Boolean(weather && (weather.temperature !== null ||
    weather.sky !== "unknown" || weather.precipitation !== "unknown" || weather.wind !== "unknown"));
  const number = new Intl.NumberFormat("de", { maximumFractionDigits: 1 });

  function valid(weather) {
    return weather && typeof weather === "object" && validTemperature(weather.temperature) &&
      [weather.sky, weather.precipitation, weather.wind].every((value) => typeof value === "string") &&
      Object.hasOwn(skies, weather.sky) && Object.hasOwn(precipitation, weather.precipitation) && Object.hasOwn(winds, weather.wind);
  }

  function summary(weather) {
    if (!known(weather)) return "";
    return [weather.temperature === null ? "" : number.format(weather.temperature) + " °C",
      weather.sky === "unknown" ? "" : skies[weather.sky],
      weather.precipitation === "unknown" ? "" : precipitation[weather.precipitation],
      weather.wind === "unknown" ? "" : winds[weather.wind]].filter(Boolean).join(" · ");
  }

  function conditions(weather) {
    if (!known(weather)) return null;
    const { temperature, sky, precipitation: falling, wind } = weather;
    const wet = ["drizzle", "rain", "snow"].includes(falling);
    const heavy = falling === "rain" || falling === "snow";
    const windy = wind === "breezy" || wind === "strong";
    const breeze = wind === "strong" ? 3 : wind === "breezy" ? 1 : 0;
    const index = temperature === null ? null : temperature + (sky === "sunny" && !wet ? 1 : 0) - breeze - (wet ? 1 : 0);
    const cold = falling === "snow" || (index !== null && index <= 6);
    const cool = cold || (index !== null && index <= 15);
    const hot = index !== null && index >= 26;
    return { wet, heavy, windy, cold, cool, hot, sky, falling,
      layer: cool || wet || wind === "strong", mid: cold || (index !== null && index <= 11) };
  }

  const cutWarmth = { tank: 1, tee: 1, polo: 1, blouse: 1.4, longsleeve: 1.7, shirt: 1.6,
    sweater: 3, hoodie: 3, turtleneck: 3.2, vest: 2.2,
    jacket: 2.1, denim: 2.1, overshirt: 1.7, bomber: 2.5, blazer: 1.8, cardigan: 2.2,
    coat: 3.2, peacoat: 3.1, trench: 2.3, puffer: 3.5,
    skirt: 1.3, pencil: 1.4, pleated: 1.3, shorts: 1, pants: 2.2, jeans: 2.5, cargo: 2.2, widepants: 2,
    sneaker: 1.7, flat: 1, loafer: 1.3, boot: 2.9 };
  const manualHeat = { light: 1, medium: 2.1, warm: 3.2 };
  const waterResistant = (item) => item?.protection === "water" || item?.protection === "both";
  const windResistant = (item) => item?.protection === "wind" || item?.protection === "both";

  function assess(item, weather, context) {
    const outlook = context === undefined ? conditions(weather) : context;
    if (!outlook) return { score: 0, weak: false };
    const { category, cut } = item;
    const heat = manualHeat[item.warmth] || cutWarmth[cut] || 2;
    const { wet, heavy, windy, cold, cool, hot } = outlook;
    let score = 0;
    let weak = false;
    if (["top", "mid", "bottom", "layer", "shoes"].includes(category)) {
      if (cold) score += (heat - 1.7) * 1.45;
      else if (cool) score += (heat - 1.7) * .85;
      else if (hot) score += (2.2 - heat) * 1.25;
      else if (outlook.sky === "sunny") score += (2 - heat) * .35;
      weak = (cold && ((category === "bottom" && (cut === "shorts" || heat <= 1.4)) || (category === "shoes" && cut === "flat"))) ||
        (hot && ((category === "mid" && heat >= 2.2) || (category === "layer" && heat >= 2.8 && !wet && !windy) ||
          (category === "bottom" && heat >= 2.35) || (category === "shoes" && heat >= 2.8 && !wet)));
    }
    if (wet && ["layer", "shoes"].includes(category)) {
      if (waterResistant(item)) score += heavy ? 4.5 : 3.1;
      else if (item.protection === "none") score -= 1.5;
      if (category === "shoes" && cut === "boot") score += 1.35;
      if (category === "shoes" && ["flat", "loafer"].includes(cut) && !waterResistant(item)) {
        score -= 2;
        if (heavy) weak = true;
      }
      if (heavy && category === "layer" && cut === "cardigan" && !waterResistant(item)) weak = true;
    }
    if (windy && category === "layer") score += windResistant(item) ? 3 : cut === "cardigan" ? -.8 : .35;
    return { score, weak };
  }

  function advice(weather, worn) {
    const outlook = conditions(weather);
    if (!outlook) return "";
    const notes = [];
    if (outlook.cold) notes.push("Warme Schichten, lange Unterteile und geschlossene Schuhe haben Vorrang.");
    else if (outlook.cool) notes.push("Eine zusätzliche Schicht hält den Look flexibel.");
    else if (outlook.hot) notes.push("Leichte Teile und wenige Schichten haben Vorrang.");
    if (outlook.wet) {
      const protectedOutfit = waterResistant(worn.layer) && waterResistant(worn.shoes);
      notes.push(protectedOutfit ? "Jacke und Schuhe sind als wasserabweisend markiert." :
        "Für Niederschlag werden Teile mit angegebenem Wasserschutz bevorzugt.");
    } else if (outlook.windy) {
      notes.push("Eine windabweisende Außenschicht wird bevorzugt.");
    }
    return notes.join(" ") || "Bei diesen Angaben zählt vor allem, wie die Teile zusammenpassen.";
  }

  return { skies, precipitation, winds, warmth, protection, empty, known, valid, summary, conditions, assess, advice,
    validTemperature, minTemperature, maxTemperature };
})();
