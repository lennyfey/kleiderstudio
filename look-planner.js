"use strict";

const LookPlanner = (() => {
  const W = Wardrobe;
  const order = ["top", "mid", "bottom", "shoes", "layer"];
  const editorialLayers = new Set(["blazer", "cardigan", "overshirt"]);
  const cutFor = {
    office: { shirt: 1.5, blouse: 1.5, pants: 1.5, polo: 1, pencil: 1, loafer: .8 },
    beach: { shorts: 6, tank: 3, tee: 2.8, blouse: .5, widepants: 1.5, skirt: 1.4, jeans: -2,
      boot: -4, loafer: -2, blazer: -5 },
    gala: { blazer: 2.5, pants: 1.5, pencil: 1.5, loafer: 1.5 },
    conference: { blazer: 2, pants: 1.5, widepants: .7, blouse: 1.4, shirt: 1.4, pencil: 1 },
    dinner: { blouse: 1.7, shirt: 1.2, blazer: .8, skirt: 1, loafer: 1.3 },
    wedding: { blazer: 1.8, blouse: 1.3, pleated: 1.6, skirt: 1.6, loafer: .8, flat: .8 },
    everyday: { tee: 1.3, jeans: 1.2, sneaker: 1.5, cardigan: .4 },
    trip: { sneaker: 3, tee: 1.1, cargo: 1.3, widepants: 1.3, jacket: .9, polo: .8 },
    outdoor: { jacket: 2.6, boot: 2.2, cargo: 1.6, sneaker: 1, blazer: -4, loafer: -3 },
    sport: { sneaker: 4, tank: 2.4, tee: 2.2, shorts: 2.5, hoodie: 1.5, jeans: -3.5, loafer: -6 }
  };
  const automaticDress = { any: "auto", office: "business", beach: "casual", gala: "blackTie",
    conference: "formal", dinner: "smart", wedding: "formal", everyday: "casual", trip: "casual",
    outdoor: "casual", sport: "sport" };
  const dressFor = {
    casual: { casual: 3, smart: .7, formal: -2.6, sport: .6 },
    smart: { casual: .25, smart: 3.4, formal: 2.3, sport: -4.5 },
    business: { casual: -1.4, smart: 4, formal: 3, sport: -6 },
    formal: { casual: -3.6, smart: 3.1, formal: 5, sport: -8 },
    blackTie: { casual: -5, smart: 2.8, formal: 5.6, sport: -9 },
    sport: { casual: 1.8, smart: -2, formal: -5, sport: 5 }
  };
  const polished = { shirt: 1.7, blouse: 1.7, pants: 1.7, pencil: 1.5, blazer: 2.3, loafer: 2.3, flat: 1.3,
    shorts: -4, cargo: -2.9, hoodie: -3, denim: -2.4, sneaker: -2 };
  const tailored = new Set(["business", "formal", "blackTie"]);
  const dark = new Set(["black", "navy", "ink", "graphite"]);
  const required = ["bottom", "shoes"];
  const recentWindow = 8;

  const dress = ({ occasion, dressCode }) => dressCode === "auto" ? automaticDress[occasion] : dressCode;
  const context = ({ occasion, dressCode }) => ({ occasion, dressCode });
  const sameContext = (a, b) => a.occasion === b.occasion && a.dressCode === b.dressCode;
  const contextTitle = (plan) => [
    plan.occasion !== "any" ? W.occasions[plan.occasion] : "",
    dress(plan) !== "auto" ? W.dressCodes[dress(plan)] : ""
  ].filter(Boolean).join(" · ");
  const mainIds = (pieces) => W.mainKeys.map((key) => pieces[key] ?? null);
  const signature = (ids) => ids.join("|");
  const hasHistory = (plan) => plan.recent.some((entry) => sameContext(entry, plan));

  function remember(plan, pieces) {
    const ids = mainIds(pieces);
    const key = signature(ids);
    const recent = plan.recent.filter((entry) => !sameContext(entry, plan) || signature(entry.ids) !== key);
    recent.push({ ...context(plan), ids });
    return recent.slice(-W.MAX_RECENT_LOOKS);
  }

  function itemValue(item, profile, code, weather) {
    const climate = Weather.assess(item, profile.weather, weather);
    const dressed = dressFor[code]?.[item.style] ?? 0;
    const purpose = cutFor[profile.plan.occasion]?.[item.cut] ?? 0;
    const detail = tailored.has(code) ? polished[item.cut] ?? 0 : code === "smart" ? (polished[item.cut] ?? 0) * .6 : 0;
    const darkTone = code === "blackTie" && ["bottom", "shoes", "layer"].includes(item.category) && dark.has(item.color) ? 1.3 : 0;
    const preference = profile.style === "any" ? 0 : W.styleMatch(item.style, profile.style) * (code === "auto" ? 1.7 : .45);
    return dressed + purpose + detail + darkTone + preference + climate.score * 1.8 - (climate.weak ? 10 : 0);
  }

  function itemOptions(profile, code, outlook, fixed, reuse) {
    const items = Object.fromEntries(order.map((key) => [key, profile.items.filter((item) => item.category === key)]));
    function allowable(key, item) {
      if (key === "mid") return !items.top.length || Boolean(outlook?.mid);
      if (key !== "layer" || outlook?.layer) return true;
      if (outlook?.hot) return false;
      if (editorialLayers.has(item.cut) && (tailored.has(code) || code === "smart" || profile.plan.occasion === "any")) return true;
      return !outlook && ["outdoor", "trip"].includes(profile.plan.occasion) && ["jacket", "overshirt", "bomber"].includes(item.cut);
    }
    return Object.fromEntries(order.map((key) => {
      const pinned = items[key].find((item) => fixed.has(item.id));
      const optional = key === "layer" || key === "mid" && items.top.length > 0;
      let candidates = pinned ? [pinned] : items[key].filter((item) => allowable(key, item));
      if (!pinned && (code === "formal" || code === "blackTie") && !(outlook?.wet && ["layer", "shoes"].includes(key))) {
        const polishedChoices = candidates.filter((item) => ["smart", "formal"].includes(item.style) &&
          (polished[item.cut] ?? 0) >= 0 && !Weather.assess(item, profile.weather, outlook).weak);
        if (polishedChoices.length) candidates = polishedChoices;
      }
      const options = candidates.map((item) => {
        const layerValue = key === "layer" ? (outlook?.layer ? 5 : -5.4) : key === "mid" && items.top.length ? 4.2 : 0;
        return { item, value: itemValue(item, profile, code, outlook) + layerValue,
          reuse: fixed.has(item.id) ? 0 : reuse.get(item.id) ?? 0 };
      });
      const sample = [...new Set([
        ...[...options].sort((a, b) => (b.value - b.reuse) - (a.value - a.reuse)).slice(0, 14),
        ...[...options].sort((a, b) => b.value - a.value).slice(0, 6)
      ])];
      if (!sample.length || optional && !pinned) sample.push({ item: null, value: 0, reuse: 0 });
      return [key, sample];
    }));
  }

  function assemble(options) {
    const pairs = new Map();
    function pairValue(left, right) {
      const id = left.id + "|" + right.id;
      if (!pairs.has(id)) {
        const match = W.pair(left, right);
        pairs.set(id, match.score * .37 - (match.fitConcern ? 11 : match.weak ? 1.25 : 0));
      }
      return pairs.get(id);
    }
    function harmony(items) {
      const hideTop = W.coveredByKnit(items.top, items.mid);
      const active = order.filter((slot) => items[slot]);
      let score = 0;
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const left = active[i];
          const right = active[j];
          if (hideTop && left === "top" && right !== "mid") continue;
          score += pairValue(items[left], items[right]);
        }
      }
      return score;
    }
    let beam = [{ items: {}, base: 0, reuse: 0, score: 0, rank: 0 }];
    for (const key of order) {
      const candidates = beam.flatMap((choice) => options[key].map((option) => {
        const items = { ...choice.items, [key]: option.item };
        const base = choice.base + option.value;
        const reuse = choice.reuse + option.reuse;
        const score = base + harmony(items);
        return { items, base, reuse, score, rank: score - reuse };
      }));
      // Keep both the highest quality and the most varied partial combinations.
      beam = [...new Set([
        ...[...candidates].sort((a, b) => b.rank - a.rank).slice(0, 82),
        ...candidates.sort((a, b) => b.score - a.score).slice(0, 22)
      ])];
    }
    return beam;
  }

  function note(profile, worn, code, revisited) {
    const parts = [];
    if (code === "blackTie") parts.push("Dieser Vorschlag nähert sich Black Tie mit deinen vorhandenen Teilen an.");
    else if (code !== "auto" && Object.values(worn).some((item) => item && W.mainKeys.includes(item.category) &&
      dressFor[code][item.style] <= -3 && !(item.category === "top" && W.coveredByKnit(worn.top, worn.mid)))) {
      parts.push("Einige Teile passen nur ungefähr zum gewählten Dresscode.");
    }
    if (!worn.top && !worn.mid || required.some((key) => !worn[key])) parts.push("Ergänze fehlende Teile im Schrank.");
    if (revisited) parts.push("Die passenden Varianten wurden bereits gezeigt. Das ist ein früherer Vorschlag.");
    return parts.join(" ");
  }

  function suggest(profile) {
    const { plan } = profile;
    const worn = W.outfit(profile);
    const recent = plan.recent.filter((entry) => sameContext(entry, plan));
    const code = dress(plan);
    if (!recent.length && plan.occasion === "any" && code === "auto") {
      const completed = W.completeOutfit(profile);
      if (completed) return { ...completed, note: note(profile, W.outfit(profile, completed.pieces), code, false) };
    }

    const reuse = new Map();
    function count(ids, weight) {
      for (const id of ids) if (id) reuse.set(id, (reuse.get(id) ?? 0) + weight);
    }
    recent.slice(-recentWindow).reverse().forEach(({ ids }, index) => count(ids, 3.6 * .78 ** index));
    count(mainIds(profile.pieces), recent.length ? 1.4 : .15);

    const outlook = Weather.conditions(profile.weather);
    const beam = assemble(itemOptions(profile, code, outlook, new Set(plan.fixed), reuse));
    const best = Math.max(...beam.map((choice) => choice.score));
    const current = signature(mainIds(profile.pieces));
    const seen = new Map(recent.map((entry, index) => [signature(entry.ids), index]));
    const candidates = beam.filter((choice) => choice.score >= best - 9).map((choice) => {
      const outfit = { ...worn, ...choice.items };
      const pieces = W.piecesOf(outfit);
      return { outfit, pieces, key: signature(mainIds(pieces)), rank: choice.rank };
    }).filter((choice) => choice.key !== current && W.mainKeys.some((key) => choice.pieces[key]));
    if (!candidates.length) return null;
    candidates.sort((a, b) => (seen.get(a.key) ?? -1) - (seen.get(b.key) ?? -1) || b.rank - a.rank);
    const choice = candidates[0];
    return { pieces: choice.pieces, note: note(profile, choice.outfit, code, seen.has(choice.key)) };
  }

  return { dress, context, contextTitle, hasHistory, remember, suggest };
})();
