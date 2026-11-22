"use strict";

(() => {
  const W = Wardrobe;
  const $ = (id) => document.getElementById(id);
  const dialog = $("editor");
  const storageKey = "kleiderstudio-v1";
  const pages = ["studio", "schrank", "looks", "anprobe", "ratgeber", "einstellungen"];
  const paths = {
    hanger: "M9 7a3 3 0 1 1 5 2.2l-2 1.3V13m0 0 9 5.4a1 1 0 0 1-.5 1.8h-17a1 1 0 0 1-.5-1.8L12 13Z",
    sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Zm15-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z",
    bookmark: "M6 20V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15l-6-4-6 4Z",
    book: "M12 5v15M12 6c-3-2-6-2.4-9-1.5v13c3-.8 6-.4 9 1.4 3-1.8 6-2.2 9-1.4v-13c-3-.9-6-.5-9 1.5Z",
    settings: "M10 3h4l.6 2.4 1.6.9 2.4-.7 2 3.4-1.7 1.8v1.9l1.7 1.8-2 3.4-2.4-.7-1.6.9L14 21h-4l-.6-2.9-1.6-.9-2.4.7-2-3.4 1.7-1.8v-1.9L3.4 9l2-3.4 2.4.7 1.6-.9L10 3Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    user: "M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2",
    reset: "M4 11a8 8 0 1 1 1.6 6M4 5v6h6",
    plus: "M12 5v14M5 12h14",
    shirt: "M8 4l-5 3-1 5 4 2 1-2v8h10v-8l1 2 4-2-1-5-5-3c-.7 2-2 3-4 3S8.7 6 8 4Z",
    pants: "M6 3h12l2 18h-6l-2-11-2 11H4L6 3Zm-.3 4h12.6M12 7v3",
    layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5m-18 4 9 5 9-5",
    shoe: "M3 18v-5l2-1 2-5 5 5 2 1 5 1.5c1.1.3 2 1.3 2 2.5v1H3Zm0 0v2h18v-2m-9-6-1 2m3-1-1 2",
    bag: "M5 8h14l1 12H4L5 8Zm4 2V7a3 3 0 0 1 6 0v3",
    belt: "M3 9h18v6H3zM9 8h6v8H9zm3 4h1",
    watch: "M9 5l1-3h4l1 3m-6 14 1 3h4l1-3m3-7a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-6-3v3l2 1",
    necklace: "M3 5c0 6 5 9 9 11 4-2 9-5 9-11m-7 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    ruler: "m3 16 13-13 5 5L8 21l-5-5Zm9-8 3 3M9 11l2 2m-5 1 3 3",
    sliders: "M4 7h4m4 0h8M4 17h8m4 0h4M8 5v4m4 6v4",
    search: "M15.5 10a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Zm-1.6 3.9L20 20",
    check: "m5 12 4 4L19 6",
    edit: "m5 15 10-10 4 4L9 19l-5 1 1-5Zm8-8 4 4",
    trash: "M3 6h18M9 6V3h6v3m4 0-1 15H6L5 6m5 4v7m4-7v7",
    palette: "M12 3a9 9 0 1 0 0 18h1.2c2 0 2.4-1.6 1.5-2.8-.7-1 .1-2.2 1.4-2.2H18c1.9 0 3-1.4 3-3 0-5.5-4.2-10-9-10Zm-4 7h.01M10 6.5h.01M15 7h.01M17 11h.01",
    download: "M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4",
    upload: "M12 15V3m-4 4 4-4 4 4M4 16v4h16v-4",
    camera: "M3 7h4l2-3h6l2 3h4v13H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    lock: "M5 10h14v10H5zM8 10V7a4 4 0 1 1 8 0v3m-4 4v2",
    device: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h2",
    cloud: "M7 18a4.5 4.5 0 1 1-.55-8.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 0 8.5H7Zm-3-14v2m-2 0 2 2m5-5-1 2",
    close: "m6 6 12 12M18 6 6 18"
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + paths[name] + '"/></svg>';
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const options = (map, selected) => Object.entries(map).map(([key, label]) =>
    '<option value="' + esc(key) + '"' + (key === selected ? " selected" : "") + ">" + esc(label) + "</option>").join("");
  const swatch = (hex) => '<span aria-hidden="true" class="swatch" style="--swatch:' + hex + '"></span>';
  const countLabel = (count, single, many) => count + " " + (count === 1 ? single : many);
  const categoryNames = Object.fromEntries(W.keys.map((key) => [key, W.slots[key].name]));
  const studioCategories = Object.fromEntries(W.mainKeys.map((key) => [key, W.slots[key]]));
  studioCategories.accessories = { name: "Accessoires", icon: "bag" };
  const colorNames = Object.fromEntries(Object.entries(W.colors).map(([key, value]) => [key, value.name]));

  let state = W.defaults();
  let lastRaw = null;
  let storageMode = "persistent";
  let storageIssue = "";
  let saving = false;
  let page;
  let category = "top";
  let toastTimer;
  let editor;
  let editorOrigin;
  let editorBusy = false;
  let installPrompt;
  let workerUpdate;
  let reloadingForUpdate = false;
  let importSequence = 0;
  let visibleProfileId;
  let profileMarkup;
  const outfitUndo = new Map();
  const suggestionNotes = new Map();
  const previewObservers = new Map();
  const storageConflict = "Die Daten wurden in einem anderen Tab geändert. Starte diese Aktion erneut.";
  let offlineText = location.protocol === "file:" ? "Die lokalen App-Dateien lassen sich offline öffnen." : "Offline-Speicher wird vorbereitet.";
  const current = (data = state) => data.profiles.find((profile) => profile.id === data.active);
  const group = (key) => W.accessoryKeys.includes(key) ? "accessories" : key;
  const itemsWithPhotos = (data) => data.profiles.flatMap((profile) => profile.items.filter((item) => item.photo));
  const announce = (message) => {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    toastTimer = setTimeout(() => { $("toast").textContent = ""; }, 3000);
  };

  function readStorage() {
    try {
      lastRaw = localStorage.getItem(storageKey);
    } catch {
      storageMode = "session";
      storageIssue = "Der Browser blockiert den lokalen Speicher. Änderungen gelten in diesem Tab bis zum Schließen oder Neuladen. Sichere sie unter „Profile & Daten“ als JSON.";
      return;
    }
    try {
      state = lastRaw === null ? W.defaults() : W.validated(JSON.parse(lastRaw));
      storageMode = "persistent";
      storageIssue = "";
    } catch {
      storageMode = "damaged";
      storageIssue = "Die Browserdaten konnten nicht gelesen werden. Unter „Profile & Daten“ kannst du sie sichern oder eine gültige JSON-Sicherung wiederherstellen.";
    }
  }

  async function commit(change, { recovery = false, photos = [] } = {}) {
    if (storageMode === "damaged" && !recovery) return storageIssue;
    if (saving) return "Eine Änderung wird gerade gespeichert.";
    const original = state;
    const expectedRaw = lastRaw;
    const startMode = storageMode;
    const session = startMode === "session";
    const changed = () => state !== original || lastRaw !== expectedRaw || storageMode !== startMode;
    saving = true;
    async function write() {
      if (changed()) return storageConflict;
      let draft;
      try {
        const copy = structuredClone(original);
        change(copy);
        draft = W.validated(copy);
      } catch (error) {
        return "Die Änderung konnte nicht übernommen werden. " + error.message;
      }
      // Publish photo references only after the images are durable.
      if (photos.length) {
        try {
          await GarmentPhotos.insert(photos, session);
        } catch {
          return recovery
            ? "Der Fotospeicher ist voll oder blockiert. Prüfe den Browser-Speicher und versuche es erneut."
            : "Der Browser konnte das Foto nicht speichern. Für einen Eintrag ohne Bild kannst du das Häkchen beim Foto entfernen.";
        }
      }
      const rollback = (message) => {
        if (photos.length) void GarmentPhotos.remove(photos.map(([id]) => id), session).catch(() => {});
        return message;
      };
      if (changed()) return rollback(storageConflict);
      if (!session) {
        try {
          if (localStorage.getItem(storageKey) !== expectedRaw) {
            readStorage();
            outfitUndo.clear();
            render();
            return rollback(storageConflict);
          }
          const serialized = JSON.stringify(draft);
          localStorage.setItem(storageKey, serialized);
          lastRaw = serialized;
        } catch {
          return rollback("Die Änderung konnte nicht gespeichert werden. Der Browser-Speicher ist voll oder blockiert.");
        }
        storageMode = "persistent";
        storageIssue = "";
      }
      state = draft;
      const previousPhotos = itemsWithPhotos(original);
      if (previousPhotos.length) {
        const retained = new Set(itemsWithPhotos(draft).map((item) => item.photo));
        const removed = previousPhotos.map((item) => item.photo).filter((id) => !retained.has(id));
        if (removed.length) void GarmentPhotos.remove(removed, session).catch(() => {});
      }
      return "";
    }
    try {
      if (!session && location.protocol !== "file:" && navigator.locks?.request) {
        return await navigator.locks.request(storageKey, write);
      }
      return await write();
    } catch {
      return "Der Browser konnte die Änderung gerade nicht speichern. Versuche es erneut.";
    } finally {
      saving = false;
    }
  }

  async function update(change, message, focusBack) {
    const error = await commit(change);
    if (error) {
      announce(error);
      return false;
    }
    render();
    focusBack?.()?.focus({ preventScroll: true });
    if (message) announce(message);
    return true;
  }

  async function setOutfit(pieces, message, focusBack, { undo = false, context, suggestion } = {}) {
    const profile = current();
    const previous = { pieces: profile.pieces, context: context ? LookPlanner.context(profile.plan) : undefined };
    const error = await commit((draft) => {
      const next = current(draft);
      next.pieces = pieces;
      if (context) Object.assign(next.plan, context);
      if (suggestion) next.plan.recent = LookPlanner.remember(next.plan, pieces);
    });
    if (error) {
      announce(error);
      return false;
    }
    if (undo) outfitUndo.delete(profile.id);
    else outfitUndo.set(profile.id, previous);
    suggestionNotes.delete(profile.id);
    if (suggestion?.note) suggestionNotes.set(profile.id, suggestion.note);
    render();
    focusBack?.()?.focus({ preventScroll: true });
    if (message) announce(message);
    return true;
  }

  function profileBadge(profile) {
    return '<span class="profile-icon ' + profile.figure + '">' + icon("user") + '</span>';
  }

  function renderProfilePicker() {
    const area = document.querySelector("#view-" + page + " [data-profile-area]");
    if (!area) return;
    const picker = $("profile-picker");
    if (picker.parentElement !== area) area.prepend(picker);
    const markup = state.profiles.map((person) => '<button type="button" data-action="profile" data-id="' + person.id +
      '" aria-pressed="' + (person.id === state.active) + '">' + profileBadge(person) + '<span class="profile-text">' + esc(person.name) +
      "<small>" + W.figures[person.figure] + "</small></span></button>").join("");
    if (markup !== profileMarkup) {
      picker.innerHTML = markup;
      profileMarkup = markup;
    }
  }

  function renderStudio() {
    const profile = current();
    const worn = W.outfit(profile);
    const equipped = Object.values(worn).filter(Boolean);
    const accessoryCount = W.accessoryKeys.filter((key) => worn[key]).length;
    $("figure-caption").textContent = (equipped.length - accessoryCount) + " von " + W.mainKeys.length + " Kleidungsplätzen" +
      (accessoryCount ? " · " + countLabel(accessoryCount, "Accessoire", "Accessoires") : "");
    $("avatar").setAttribute("aria-label", "Figur für " + profile.name + ". " +
      (equipped.length ? "Sie trägt " + equipped.map((item) => item.name).join(", ") + "." : "Sie trägt Unterwäsche und Socken."));
    AtelierArt.figure($("avatar"), worn, profile);
    $("stage-colors").innerHTML = [...new Set(equipped.flatMap((item) =>
      [W.itemColor(item).hex, item.pattern !== "solid" ? item.accent : null, item.soleColor].filter(Boolean)))].slice(0, 8).map(swatch).join("");
    const fixed = new Set(profile.plan.fixed);
    const slotMarkup = (key) => {
      const locked = fixed.has(worn[key]?.id);
      const label = worn[key] ? worn[key].name + " ausziehen" + (locked ? " (für Vorschläge fixiert)" : "") : W.slots[key].short + " auswählen";
      return '<button type="button" class="slot' + (worn[key] ? " filled" : "") +
        '" data-action="slot" data-id="' + key + '" aria-label="' + esc(label) + '" title="' + esc(label) + '">' +
        icon(locked ? "lock" : worn[key] ? "check" : W.slots[key].icon) + W.slots[key].short + "</button>";
    };
    $("outfit-slots").innerHTML = W.mainKeys.map(slotMarkup).join("");
    $("accessory-slots").hidden = category !== "accessories";
    if (category === "accessories") $("accessory-slots").innerHTML = W.accessoryKeys.map(slotMarkup).join("");
    document.querySelector('[data-action="review-look"]').disabled = equipped.length === 0;
    document.querySelector('[data-action="reset"]').disabled = equipped.length === 0;
    document.querySelector('[data-action="suggest"]').disabled = !profile.items.some((item) => W.mainKeys.includes(item.category));
    const weather = Weather.summary(profile.weather);
    $("weather-summary").textContent = weather || "Wetter eingeben";
    $("weather-caption").textContent = weather ? "Für diese Vorschläge aktiv" : "Für passende Look-Vorschläge";
    const weatherButton = document.querySelector('[data-action="edit-weather"]');
    weatherButton.classList.toggle("has-weather", Boolean(weather));
    weatherButton.setAttribute("aria-label", weather ? "Wetter bearbeiten: " + weather : "Wetter eingeben");
    $("look-occasion").value = profile.plan.occasion;
    $("look-dresscode").value = profile.plan.dressCode;
    const dress = LookPlanner.dress(profile.plan);
    showText("look-auto-dress", profile.plan.dressCode === "auto" && dress !== "auto" ? "Vorschläge für " + W.dressCodes[dress] : "");
    $("suggest-label").textContent = LookPlanner.hasHistory(profile.plan) ? "Neuer Look" : "Look vorschlagen";
    showText("look-feedback", suggestionNotes.get(profile.id) || "");
    $("fix-pieces").hidden = !W.mainKeys.some((key) => worn[key]);
    $("fixed-label").textContent = fixed.size ? countLabel(fixed.size, "Teil fixiert", "Teile fixiert") : "Teile fixieren";
    $("weather-tip").hidden = !weather;
    $("weather-advice").textContent = Weather.advice(profile.weather, worn);
    $("undo-outfit").hidden = !outfitUndo.has(profile.id);
    $("studio-categories").innerHTML = Object.entries(studioCategories).map(([key, entry]) => '<button type="button" data-action="category" data-id="' + key +
      '" aria-pressed="' + (key === category) + '">' + icon(entry.icon) + entry.name + "</button>").join("");
    $("target-style").value = profile.style;
    $("match-only").checked = profile.matchOnly;
    renderStudioItems(profile, worn);
    const tip = W.outfitTip(worn, profile.style);
    $("style-tip").innerHTML = '<span class="tip-icon">' + icon("sparkles") + "</span><div><strong>" +
      esc(tip.title) + "</strong><p>" + esc(tip.body) + "</p></div>";
  }

  function renderStudioItems(profile, worn = W.outfit(profile)) {
    const items = profile.items.filter((item) => group(item.category) === category);
    const query = $("studio-search").value.trim();
    const candidates = items.filter(W.searchFor(query)).map((item) => ({
      item, match: W.rate(item, worn, profile.style, profile.weather), chosen: item.id === profile.pieces[item.category]
    }));
    const visible = candidates.filter(({ match, chosen }) => !profile.matchOnly || match.compatible || chosen);
    if (category !== "accessories") visible.sort((a, b) => b.match.score - a.match.score);
    const grid = $("studio-items");
    grid.innerHTML = visible.map(({ item, match, chosen }) => {
      const flag = chosen ? '<span class="card-flag chosen">' + icon("check") + "Angezogen</span>" :
        match.compatible && match.relevant ? '<span class="card-flag">' + (match.weatherScore >= 2.3
          ? icon("cloud") + "Fürs Wetter" : icon("check") + "Passt") + "</span>" : "";
      return '<button type="button" class="garment" data-action="wear" data-id="' + item.id +
        '" aria-pressed="' + chosen + '">' + garmentArt(item, flag) + garmentCopy(item) + "</button>";
    }).join("");
    if (!visible.length) {
      if (!items.length) {
        grid.innerHTML = '<div class="empty">Hier sind noch keine Teile.<br><button type="button" class="button" data-action="add-examples">Beispiele laden</button></div>';
      } else if (!candidates.length) {
        grid.innerHTML = '<div class="empty">In dieser Kategorie gibt es keinen Treffer.<br><button type="button" class="button" data-action="clear-studio-search">Suche zurücksetzen</button></div>';
      } else {
        grid.innerHTML = '<div class="empty">Die Treffer sind durch „Nur passende“ ausgeblendet.<br><button type="button" class="button" data-action="show-all-matches">Alle Treffer anzeigen</button></div>';
      }
    }
    drawGarments(grid, profile);
    const hidden = candidates.length - visible.length;
    const summary = [query && visible.length ? countLabel(visible.length, "Treffer", "Treffer") : "",
      hidden ? countLabel(hidden, "Teil ausgeblendet", "Teile ausgeblendet") : ""].filter(Boolean).join(" · ");
    showText("filter-note", summary);
  }

  function garmentArt(item, flag = "") {
    return '<span class="garment-art" style="--tile:' + W.itemColor(item).tile + '">' + flag +
      '<canvas width="1" height="1" data-garment="' + item.id + '" aria-hidden="true"></canvas>' +
      (item.photo ? '<img class="garment-photo" alt="" decoding="async" hidden>' : "") + "</span>";
  }

  function garmentCopy(item) {
    const color = W.itemColor(item);
    const accent = item.pattern !== "solid" ? swatch(item.accent) : "";
    const sole = item.soleColor ? swatch(item.soleColor) : "";
    return '<span class="garment-copy"><strong class="garment-name">' + esc(item.name) +
      '</strong><span class="garment-info">' + swatch(color.hex) + accent + sole + "<span>" + esc(color.name) +
      " · " + esc(item.pattern === "solid" ? W.styles[item.style] : W.patterns[item.pattern]) + "</span></span></span>";
  }

  function drawGarments(container, profile) {
    const byId = new Map(profile.items.map((item) => [item.id, item]));
    drawPreviews(container, 288, 240, (canvas) => {
      const item = byId.get(canvas.dataset.garment);
      AtelierArt.thumbnail(canvas, item);
      const image = canvas.nextElementSibling;
      if (item.photo && image && !image.hasAttribute("src")) void showPhoto(image, item.photo);
    });
  }

  async function showPhoto(image, id) {
    try {
      const photos = await GarmentPhotos.read([id], storageMode === "session");
      const source = photos.get(id);
      if (!source || !image.isConnected) return;
      image.src = source;
      await image.decode();
      if (image.isConnected) image.hidden = false;
    } catch {
      // The drawn thumbnail remains visible when a photo is unavailable.
    }
  }

  function releasePreviews(container) {
    previewObservers.get(container)?.disconnect();
    previewObservers.delete(container);
  }

  function drawPreviews(container, width, height, paint) {
    releasePreviews(container);
    const canvases = container.querySelectorAll("canvas");
    const draw = (canvas) => {
      if (canvas.width === width) return;
      canvas.width = width;
      canvas.height = height;
      paint(canvas);
    };
    if (!("IntersectionObserver" in window)) {
      canvases.forEach(draw);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting && target.isConnected) draw(target);
        else if (target.width > 1) target.width = target.height = 1;
      }
    }, { rootMargin: "280px 0px" });
    previewObservers.set(container, observer);
    canvases.forEach((canvas) => observer.observe(canvas));
  }

  function renderCatalog() {
    const profile = current();
    $("catalog-caption").textContent = profile.name + " · " + countLabel(profile.items.length, "Kleidungsstück", "Kleidungsstücke");
    const categoryFilter = $("catalog-category").value;
    const query = $("catalog-search").value.trim();
    const matchesSearch = W.searchFor(query);
    const results = profile.items.filter((item) => (categoryFilter === "all" || item.category === categoryFilter) && matchesSearch(item));
    const grid = $("catalog-items");
    grid.innerHTML = results.map((item) => '<article class="garment">' + garmentArt(item) + garmentCopy(item) +
      '<div class="catalog-actions"><button type="button" class="button" data-action="edit-item" data-id="' + item.id + '" aria-label="' + esc("Bearbeiten: " + item.name) + '">' +
      icon("edit") + 'Bearbeiten</button><button type="button" class="icon-button" data-action="delete-item" data-id="' + item.id +
      '" aria-label="' + esc(item.name + " löschen") + '">' + icon("trash") + "</button></div></article>").join("");
    if (!results.length) grid.innerHTML = '<div class="empty">' + (profile.items.length
      ? 'Für diese Auswahl gibt es keine Treffer.<br><button class="button" type="button" data-action="clear-catalog">Filter zurücksetzen</button>'
      : "Der Kleiderschrank ist leer. Füge dein erstes Kleidungsstück hinzu.") + "</div>";
    showText("catalog-results", (query || categoryFilter !== "all") && results.length ? results.length + " von " + profile.items.length + " Teilen" : "");
    drawGarments(grid, profile);
  }

  function renderLooks() {
    const profile = current();
    $("looks-caption").textContent = profile.name + " · " + countLabel(profile.looks.length, "gespeicherter Look", "gespeicherte Looks");
    const grid = $("saved-looks");
    const items = new Map(profile.items.map((item) => [item.id, item]));
    grid.innerHTML = profile.looks.map((look) => {
      const worn = W.outfit(profile, look.pieces, items);
      const names = Object.values(worn).filter(Boolean).map((item) => item.name).join(" · ");
      const context = look.context ? LookPlanner.contextTitle(look.context) : "";
      return '<article class="panel look-card"><div class="look-art"><canvas width="1" height="1" data-look="' + look.id +
        '" aria-hidden="true"></canvas></div><h3>' + esc(look.name) + "</h3>" +
        (context ? '<p class="saved-look-context">' + esc(context) + "</p>" : "") + '<p class="look-details">' + esc(names) +
        '</p><div class="look-actions"><button class="button primary" type="button" data-action="load-look" data-id="' + look.id + '">' +
        icon("shirt") + 'Anziehen</button><button class="icon-button" type="button" data-action="rename-look" data-id="' + look.id +
        '" aria-label="' + esc(look.name + " umbenennen") + '">' + icon("edit") +
        '</button><button class="icon-button" type="button" data-action="delete-look" data-id="' + look.id +
        '" aria-label="' + esc(look.name + " löschen") + '">' + icon("trash") + "</button></div></article>";
    }).join("");
    if (!profile.looks.length) grid.innerHTML =
      '<div class="empty">Speichere im Studio eine Kombination, um sie hier wieder anzuziehen.<br><a class="button" href="#studio">Zum Studio</a></div>';
    const byId = new Map(profile.looks.map((look) => [look.id, look]));
    drawPreviews(grid, 192, 240, (canvas) => AtelierArt.figure(canvas, W.outfit(profile, byId.get(canvas.dataset.look).pieces, items), profile));
  }

  function renderSettings() {
    $("settings-profiles").innerHTML = state.profiles.map((person) =>
      '<div class="settings-profile"><div><strong>' + esc(person.name) + "</strong><small>" + W.figures[person.figure] + " · " + W.haircuts[person.avatar.hair] +
      '</small></div><div class="settings-actions"><button class="button" type="button" data-action="edit-profile" data-id="' + person.id +
      '" aria-label="' + esc("Figur bearbeiten: " + person.name) + '">' + icon("edit") + 'Figur</button><button class="button" type="button" data-action="edit-measures" data-id="' + person.id +
      '" aria-label="' + esc("Körpermaße bearbeiten: " + person.name) + '">' + icon("ruler") + "Maße</button></div></div>" +
      (person.items.some((item) => item.demo) ? '<div class="examples"><button class="button" type="button" data-action="remove-demo" data-id="' +
        person.id + '">' + icon("trash") + "Beispielteile entfernen</button></div>" : "")).join("");
  }

  function showText(id, message) {
    const node = $(id);
    node.hidden = !message;
    if (node.textContent !== message) node.textContent = message;
  }

  function render() {
    showText("storage-warning", storageIssue);
    $("export-raw").hidden = storageMode !== "damaged";
    $("save-status").textContent = storageMode === "session" ? "Nur in diesem Tab gespeichert" :
      storageMode === "damaged" ? "Speicherung pausiert" : "Auf diesem Gerät gespeichert";
    $("offline-status").textContent = offlineText;
    if (visibleProfileId !== state.active) {
      $("studio-search").value = "";
      $("catalog-search").value = "";
      visibleProfileId = state.active;
    }
    renderProfilePicker();
    if (page === "studio") renderStudio();
    if (page === "schrank") renderCatalog();
    if (page === "looks") renderLooks();
    if (page === "anprobe") FittingRoom.render(current());
    if (page === "einstellungen") renderSettings();
  }

  function navigate() {
    const next = location.hash.slice(1);
    const previous = page;
    page = pages.includes(next) ? next : "studio";
    pages.forEach((key) => { $("view-" + key).hidden = key !== page; });
    if (previous && previous !== page) {
      const grid = { studio: $("studio-items"), schrank: $("catalog-items"), looks: $("saved-looks") }[previous];
      if (grid) {
        releasePreviews(grid);
        grid.replaceChildren();
      }
    }
    document.querySelectorAll("[data-page-link]").forEach((link) => {
      if (link.dataset.pageLink === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    render();
    if (previous && previous !== page) {
      window.scrollTo(0, 0);
      focusHeading("title-" + page);
    }
  }

  function focusHeading(id, scroll = false) {
    const heading = $(id);
    heading.tabIndex = -1;
    if (scroll) heading.scrollIntoView({ block: "start" });
    heading.focus({ preventScroll: true });
  }
  function focusAction(action, id) {
    return () => document.querySelector('[data-action="' + action + '"][data-id="' + id + '"]');
  }

  function openEditor({ title, fields, submit = "Speichern", danger = false, photoMode = false, summary = false, run }) {
    editor = run;
    const replacing = dialog.open;
    if (!replacing) {
      const opener = document.activeElement;
      editorOrigin = { opener, page, action: opener?.dataset.action, id: opener?.dataset.id };
    }
    dialog.classList.toggle("photo-mode", photoMode);
    dialog.classList.toggle("summary-mode", summary);
    $("editor-title").textContent = title;
    $("editor-fields").oninput = null;
    $("editor-fields").onchange = null;
    releasePreviews($("editor-fields"));
    $("editor-fields").innerHTML = fields;
    $("editor-cancel").textContent = summary ? "Fertig" : "Abbrechen";
    $("summary-save").hidden = !summary;
    $("editor-submit").textContent = submit || "";
    $("editor-submit").hidden = !submit;
    $("editor-submit").className = "button " + (danger ? "danger" : "primary");
    $("editor-submit").disabled = false;
    $("editor-error").hidden = true;
    if (!replacing) dialog.showModal();
    dialog.scrollTop = 0;
    const focus = summary ? $("editor-title") : dialog.querySelector("[data-first]") || dialog.querySelector('[data-action="close-dialog"]');
    focus.focus({ preventScroll: true });
  }

  function confirm(title, body, submit, change, message, options = {}) {
    const backup = options.recovery
      ? '<button type="button" class="button" data-action="' + (storageMode === "damaged" ? "export-raw" : "export") + '">' +
        icon("download") + "Bisherige Daten herunterladen</button>"
      : "";
    openEditor({ title, fields: "<p>" + esc(body) + "</p>" + backup, submit, danger: !options.recovery, async run() {
      const error = await commit(change, options);
      if (!error) {
        outfitUndo.clear();
        suggestionNotes.clear();
        if (options.recovery) FittingRoom.resetDrafts();
        render();
        announce(message);
      }
      return error;
    } });
  }

  const field = (label, markup) => '<label class="field"><span>' + esc(label) + "</span>" + markup + "</label>";
  const input = (name, value, max) => '<input name="' + name + '" data-first required maxlength="' + max + '" value="' + esc(value) + '">';
  const select = (name, map, selected, prompt) => '<select name="' + name + '"' + (prompt ? " required" : "") + ">" +
    options(prompt ? { "": prompt, ...map } : map, selected) + "</select>";

  const colorInput = (name, value) => '<input type="color" name="' + name + '" value="' + value + '">';
  const editorColors = { ...colorNames, custom: "Eigener Farbton" };
  const soleColors = { auto: "Standard", ...editorColors };

  function garmentFromForm(form) {
    const pick = form.get("color");
    const category = form.get("category");
    const sole = form.get("sole");
    const soleColor = category === "shoes" && sole !== "auto" ?
      (sole === "custom" ? form.get("customSole") : W.colors[sole]?.hex) : undefined;
    return {
      name: form.get("name").trim(),
      category,
      cut: form.get("cut"),
      color: pick === "custom" ? "grey" : pick,
      customColor: pick === "custom" ? form.get("customColor") : "",
      colorName: pick === "custom" ? form.get("colorName").trim() : "",
      pattern: form.get("pattern"),
      accent: form.get("accent"),
      fit: form.get("fit"),
      style: form.get("style"),
      warmth: form.get("warmth"),
      protection: form.get("protection"),
      ...(soleColor ? { soleColor } : {})
    };
  }

  const photoPicker = '<input type="file" id="garment-file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" hidden>';
  const photoStatus = '<p id="photo-status" class="photo-status" role="status" hidden></p>';

  function photoEditor() {
    openEditor({
      title: "Teil aus Foto erfassen",
      photoMode: true,
      submit: null,
      fields: '<div class="capture-zone"><span class="capture-icon">' + icon("camera") + '</span>' +
        '<strong>Ein Kleidungsstück pro Foto</strong><p>Fotografiere es möglichst von vorn vor einem ruhigen Hintergrund.</p>' +
        '<button type="button" class="button primary" data-action="pick-photo" data-first>' + icon("upload") + 'Foto auswählen</button>' +
        '<small>JPEG, PNG oder WebP · bis 10 MB</small></div>' + photoPicker + photoStatus +
        '<p class="photo-note">Das Foto wird auf diesem Gerät ausgewertet.</p>'
    });
    watchPhoto();
  }

  function watchPhoto() {
    const fileInput = $("garment-file");
    const pick = dialog.querySelector('[data-action="pick-photo"]');
    fileInput.addEventListener("change", async () => {
      const [file] = fileInput.files;
      fileInput.value = "";
      if (!file) return;
      pick.disabled = $("editor-submit").disabled = true;
      $("photo-status").classList.remove("error");
      showText("photo-status", "Foto wird ausgewertet …");
      try {
        const result = await PhotoRecognition.read(file);
        if (!fileInput.isConnected || !dialog.open) return;
        const { type, color, accent, pattern } = result;
        const name = type?.name ? type.name + (color ? " · " + color.name : "") : "";
        itemEditor(null, {
          name, category: type?.category, cut: type?.cut,
          customColor: color?.hex, colorName: color?.name, accent: accent?.hex, pattern
        }, result);
      } catch (error) {
        if (!fileInput.isConnected || !dialog.open) return;
        $("photo-status").classList.add("error");
        showText("photo-status", error.message || "Das Foto konnte nicht ausgewertet werden.");
      } finally {
        if (fileInput.isConnected && dialog.open) pick.disabled = $("editor-submit").disabled = false;
      }
    });
  }

  function photoReview({ preview, type, color, accent, pattern, separated }) {
    const tone = (value) => value ? swatch(value.hex) + esc(value.name) : "Bitte auswählen";
    const advice = !separated ? "Das Teil hebt sich zu wenig vom Hintergrund ab. Wähle die Angaben selbst oder probiere ein anderes Foto." :
      !type ? "Der Schnitt ist auf diesem Foto nicht eindeutig. Wähle ihn unten aus." :
      !type.cut ? "Für diesen Vorschlag gibt es noch keine eigene Schnittvorlage. Wähle unten einen vorhandenen Schnitt." :
      "Prüfe den genauen Schnitt und ergänze die Angaben vor dem Speichern.";
    return '<div class="photo-review"><img alt="Vorschau des ausgewählten Fotos" src="' + preview + '">' +
      '<dl class="photo-findings"><dt>Schnittvorschlag</dt><dd>' + esc(type?.label || "Bitte auswählen") +
      '</dd><dt>Grundfarbe</dt><dd>' + tone(color) + "</dd>" +
      (accent ? '<dt>Zweite Farbe</dt><dd>' + tone(accent) + "</dd>" : "") +
      (pattern ? '<dt>Muster</dt><dd>' + esc(W.patterns[pattern]) + "</dd>" : "") + "</dl></div>" +
      '<div class="photo-review-tools"><p class="photo-note">' + esc(advice) +
      (accent && !pattern ? " Wähle ein Muster, um die zweite Farbe zu übernehmen." : "") + '</p>' +
      '<button type="button" class="button" data-action="pick-photo" data-first>' + icon("camera") +
      "Anderes Foto</button></div>" + photoPicker + photoStatus;
  }

  function itemEditor(item, preset, photoResult) {
    const seed = item || preset;
    const selected = page === "studio" ? category : $("catalog-category").value;
    const initialCategory = seed?.category || (selected === "accessories" ? "bag" : selected === "all" ? "top" : selected);
    const cutPrompt = photoResult ? "Schnitt wählen" : undefined;
    const name = field("Name", input("name", seed?.name || "", 48));
    const fitAndStyle = '<div class="fields-pair">' +
      field("Passform", select("fit", W.fits, seed?.fit || "regular")) +
      field("Stil", select("style", W.styles, seed?.style || "casual")) + "</div>";
    const weatherFields = '<div class="fields-pair">' +
      field("Wärme", select("warmth", Weather.warmth, seed?.warmth || "auto")) +
      field("Wetterschutz", select("protection", Weather.protection, seed?.protection || "unknown")) + "</div>";
    const drawnPreview = '<div class="editor-preview"><canvas id="garment-preview" width="360" height="300" aria-hidden="true"></canvas>' + name + "</div>";
    const photoOption = (item?.photo || photoResult)
      ? '<label class="photo-keep"><input type="checkbox" name="keepPhoto" checked><span>Foto beim Kleidungsstück behalten</span></label>' : "";
    const soleChoice = seed?.soleColor
      ? Object.keys(W.colors).find((key) => W.colors[key].hex === seed.soleColor) || "custom" : "auto";
    openEditor({
      title: photoResult ? "Fotovorschlag prüfen" : item ? "Kleidungsstück bearbeiten" : "Teil hinzufügen",
      photoMode: Boolean(photoResult),
      submit: photoResult ? "Teil speichern" : "Speichern",
      fields: (photoResult ? photoReview(photoResult) + name : drawnPreview) + '<div class="fields-pair">' +
        field("Kategorie", select("category", categoryNames, initialCategory)) +
        field("Schnitt", select("cut", W.slots[initialCategory].cuts, seed?.cut || "", cutPrompt)) + "</div>" +
        (photoResult ? "" : fitAndStyle) + '<div class="fields-pair">' +
        field("Grundfarbe", select("color", editorColors, seed?.customColor ? "custom" : seed?.color || (photoResult ? "" : "black"),
          photoResult ? "Farbe wählen" : undefined)) +
        field("Muster", select("pattern", W.patterns, seed?.pattern || "solid")) + '</div><div class="fields-pair" id="custom-colour-fields">' +
        field("Eigener Farbton", colorInput("customColor", seed?.customColor || "#692a41")) +
        field("Farbname (optional)", '<input name="colorName" maxlength="30" placeholder="z. B. Burgunder" value="' + esc(seed?.colorName || "") + '">') +
        '</div><div id="accent-fields">' + field("Musterfarbe", colorInput("accent", seed?.accent || "#eedfcb")) + "</div>" +
        '<div class="fields-pair" id="shoe-fields" hidden>' +
        field("Sohlenfarbe", select("sole", soleColors, soleChoice)) +
        '<div id="custom-sole">' + field("Eigener Sohlenton", colorInput("customSole", seed?.soleColor || "#f1eee4")) + "</div></div>" +
        (photoResult
          ? '<details class="editor-weather"><summary>Passform, Stil und Wetter</summary>' + fitAndStyle + weatherFields + "</details>"
          : '<details class="editor-weather"><summary>Wärme und Wetterschutz</summary>' + weatherFields + "</details>") + photoOption +
        (item ? '<p id="category-change-note" class="filter-note" role="status" hidden></p>' : ""),
      async run(form) {
        const values = garmentFromForm(form);
        const { name, category: key, cut, color, style, fit, pattern, accent, customColor, colorName } = values;
        if (!W.nameValue(name, 48)) return "Gib einen Namen mit 1 bis 48 Zeichen ein.";
        if (!Object.hasOwn(W.slots, key) || !Object.hasOwn(W.slots[key].cuts, cut) || !Object.hasOwn(W.colors, color) ||
          !Object.hasOwn(W.styles, style) || !Object.hasOwn(W.fits, fit) || !Object.hasOwn(W.patterns, pattern) ||
          !W.validHex(accent) || (customColor && !W.validHex(customColor)) ||
          (values.soleColor && !W.validHex(values.soleColor)) || colorName.length > 30) {
          return "Prüfe Kategorie, Schnitt, Farbe, Muster und Stil.";
        }
        if (!item && current().items.length >= W.MAX_ITEMS) return "Dieser Kleiderschrank enthält bereits 300 Teile.";
        const keep = form.has("keepPhoto");
        const photoId = keep ? item?.photo || W.newId() : null;
        const error = await commit((draft) => {
          const profile = current(draft);
          const saved = { id: item?.id || W.newId(), ...values, demo: false };
          if (photoId) saved.photo = photoId;
          if (item) {
            if (item.category !== key) W.moveItemReferences(profile, item, key);
            profile.items = profile.items.map((existing) => existing.id === item.id ? saved : existing);
          } else {
            profile.items.push(saved);
          }
        }, { photos: photoId && photoResult ? [[photoId, photoResult.preview]] : [] });
        if (error) return error;
        if (item && item.category !== key) outfitUndo.delete(current().id);
        if (page === "studio") {
          category = group(key);
          if (!W.searchFor($("studio-search").value)(values)) $("studio-search").value = "";
        }
        if (page === "schrank" && !item) {
          if (!W.searchFor($("catalog-search").value)(values)) $("catalog-search").value = "";
          if ($("catalog-category").value !== "all") $("catalog-category").value = key;
        }
        render();
        announce(item ? "Kleidungsstück aktualisiert." : "Teil hinzugefügt.");
        return "";
      }
    });
    const form = $("editor-form");
    if (photoResult) watchPhoto();
    const categoryInput = form.elements.category;
    const cutInput = form.elements.cut;
    let previousCategory = categoryInput.value;
    function preview() {
      if (categoryInput.value !== previousCategory) {
        previousCategory = categoryInput.value;
        const cuts = W.slots[previousCategory].cuts;
        cutInput.innerHTML = options(cutPrompt ? { "": cutPrompt, ...cuts } : cuts);
      }
      $("custom-colour-fields").hidden = form.elements.color.value !== "custom";
      $("accent-fields").hidden = form.elements.pattern.value === "solid";
      $("shoe-fields").hidden = categoryInput.value !== "shoes";
      $("custom-sole").hidden = form.elements.sole.value !== "custom";
      if (item) {
        const next = categoryInput.value;
        const profile = current();
        const affected = [profile.pieces, ...profile.looks.map((look) => look.pieces)]
          .filter((pieces) => pieces[item.category] === item.id);
        const conflicts = affected.filter((pieces) => pieces[next] && pieces[next] !== item.id).length;
        showText("category-change-note", next !== item.category && affected.length
          ? (conflicts ? "In " + countLabel(conflicts, "Kombination ist", "Kombinationen ist") +
            " der Zielplatz belegt. Dort bleibt das bisherige Teil angezogen." :
            "Das Teil zieht in deinen vorhandenen Kombinationen mit in die neue Kategorie.")
          : "");
      }
      if (!photoResult) AtelierArt.thumbnail($("garment-preview"), garmentFromForm(new FormData(form)));
    }
    $("editor-fields").oninput = preview;
    $("editor-fields").onchange = preview;
    preview();
  }

  function profileEditor(person) {
    openEditor({
      title: "Figur konfigurieren",
      fields: '<div class="avatar-editor"><div class="avatar-editor-stage"><canvas id="profile-preview" width="240" height="300" role="img" aria-label="Vorschau deiner Figur"></canvas></div><div class="avatar-controls">' +
        field("Name", input("name", person.name, 30)) + field("Figur", select("figure", W.figures, person.figure)) +
        field("Frisur", select("hair", W.haircuts, person.avatar.hair)) +
        '<div class="fields-pair">' + field("Hautton", colorInput("skin", person.avatar.skin)) +
        field("Haarfarbe", colorInput("hairColor", person.avatar.hairColor)) + "</div></div></div>",
      async run(form) {
        const name = form.get("name");
        const figure = form.get("figure");
        const avatar = { hair: form.get("hair"), skin: form.get("skin"), hairColor: form.get("hairColor") };
        if (!W.nameValue(name, 30) || !Object.hasOwn(W.figures, figure) || !Object.hasOwn(W.haircuts, avatar.hair) ||
          !W.validHex(avatar.skin) || !W.validHex(avatar.hairColor)) return "Prüfe Name, Figur, Frisur und Farben.";
        const error = await commit((draft) => Object.assign(draft.profiles.find((profile) => profile.id === person.id), { name: name.trim(), figure, avatar }));
        if (!error) {
          render();
          announce("Figur gespeichert.");
        }
        return error;
      }
    });
    const { figure, hair, skin, hairColor } = $("editor-form").elements;
    let previousFigure = figure.value;
    function preview() {
      if (previousFigure !== figure.value) {
        const old = W.baseAvatar(previousFigure);
        const next = W.baseAvatar(figure.value);
        if (hair.value === old.hair) hair.value = next.hair;
        if (skin.value === old.skin) skin.value = next.skin;
        previousFigure = figure.value;
      }
      AtelierArt.figure($("profile-preview"), W.outfit(person), {
        ...person, figure: figure.value, avatar: { hair: hair.value, skin: skin.value, hairColor: hairColor.value }
      });
    }
    $("editor-fields").oninput = preview;
    $("editor-fields").onchange = preview;
    preview();
  }

  function measureEditor(person) {
    openEditor({
      title: "Körpermaße · " + person.name,
      fields: "<p>Alle Angaben sind freiwillig. Miss Umfänge einmal um den Körper herum. Für die Innenbeinlänge miss vom Schritt bis zum Knöchel.</p>" +
        '<div class="measure-fields">' + Object.entries(W.measurements).map(([key, meta]) => field(meta.name + " (cm)",
          '<input inputmode="decimal" name="' + key + '" maxlength="12" value="' +
          String(person.measures[key] ?? "").replace(".", ",") + '"' + (key === "height" ? " data-first" : "") + ">")).join("") + "</div>",
      async run(form) {
        const measures = {};
        for (const [key, meta] of Object.entries(W.measurements)) {
          const value = W.parseDecimal(form.get(key));
          if (value === null) continue;
          if (!W.validMeasure(key, value)) {
            $("editor-form").elements[key].setAttribute("aria-invalid", "true");
            return "„" + meta.name + "“ muss eine Zahl zwischen " + meta.min + " und " + meta.max + " cm sein.";
          }
          measures[key] = value;
        }
        const error = await commit((draft) => { draft.profiles.find((entry) => entry.id === person.id).measures = measures; });
        if (!error) {
          render();
          announce("Körpermaße gespeichert.");
        }
        return error;
      }
    });
  }

  function weatherEditor(person) {
    const weather = person.weather;
    const value = weather.temperature === null ? "" : String(weather.temperature).replace(".", ",");
    openEditor({
      title: "Wetter für den Look",
      fields: "<p>Trag die Bedingungen ein, für die du dich anziehen möchtest. Alle Felder sind freiwillig.</p>" +
        '<div class="fields-pair">' + field("Temperatur (°C)", '<input name="temperature" maxlength="9" data-first placeholder="z. B. −3,5" value="' + esc(value) + '">') +
        field("Himmel", select("sky", Weather.skies, weather.sky)) + field("Niederschlag", select("precipitation", Weather.precipitation, weather.precipitation)) +
        field("Wind", select("wind", Weather.winds, weather.wind)) + "</div>" +
        (Weather.known(weather) ? '<button class="button" type="button" data-action="clear-weather">Wetter weglassen</button>' : ""),
      async run(form) {
        const temperature = W.parseDecimal(form.get("temperature"));
        if (!Weather.validTemperature(temperature)) {
          $("editor-form").elements.temperature.setAttribute("aria-invalid", "true");
          $("editor-form").elements.temperature.focus();
          return "Gib eine Temperatur zwischen " + Weather.minTemperature + " und " + Weather.maxTemperature + " °C ein oder lass das Feld frei.";
        }
        const next = { temperature, sky: form.get("sky"), precipitation: form.get("precipitation"), wind: form.get("wind") };
        const error = await commit((draft) => { current(draft).weather = next; });
        if (!error) {
          suggestionNotes.delete(person.id);
          render();
          announce(Weather.known(next) ? "Wetter für Vorschläge gespeichert." : "Wetter für Vorschläge entfernt.");
        }
        return error;
      }
    });
  }

  function reviewLook(profile) {
    const clothes = Object.values(W.outfit(profile)).filter(Boolean);
    if (!clothes.length) return;
    const context = LookPlanner.contextTitle(profile.plan);
    const weather = Weather.summary(profile.weather);
    const count = countLabel(clothes.length, "Teil", "Teile");
    const items = clothes.map((item) => {
      const color = W.itemColor(item);
      return '<li>' + garmentArt(item) + '<div class="summary-piece"><small>' + W.slots[item.category].short +
        '</small><strong>' + esc(item.name) + '</strong><span class="summary-color">' + swatch(color.hex) +
        (item.pattern !== "solid" ? swatch(item.accent) : "") + (item.soleColor ? swatch(item.soleColor) : "") +
        esc(color.name) + (item.pattern !== "solid" ? " · " + W.patterns[item.pattern] : "") + "</span></div></li>";
    }).join("");
    openEditor({
      title: "Dein fertiger Look", summary: true, submit: null,
      fields: '<p class="summary-context">' + esc([context, count].filter(Boolean).join(" · ")) + "</p>" +
        (weather ? '<p class="summary-weather">' + icon("cloud") + "<span>" + esc(weather) + "</span></p>" : "") +
        '<ul class="summary-items" role="list">' + items + "</ul>"
    });
    drawGarments($("editor-fields"), profile);
  }

  function fixPieces(profile) {
    const worn = W.outfit(profile);
    const pieces = W.mainKeys.map((key) => worn[key]).filter(Boolean);
    if (!pieces.length) return;
    const choices = pieces.map((item, index) =>
      '<label class="fix-choice"><input type="checkbox" name="fixed" value="' + item.id + '"' +
      (index === 0 ? " data-first" : "") + (profile.plan.fixed.includes(item.id) ? " checked" : "") +
      '><span><small>' + W.slots[item.category].short + "</small><strong>" + esc(item.name) + "</strong></span></label>").join("");
    openEditor({
      title: "Teile fixieren", submit: "Übernehmen",
      fields: "<p>Fixierte Teile bleiben beim nächsten Vorschlag angezogen.</p>" + '<div class="fix-list">' + choices + "</div>",
      async run(form) {
        const error = await commit((draft) => { current(draft).plan.fixed = form.getAll("fixed"); });
        if (!error) {
          suggestionNotes.delete(profile.id);
          render();
        }
        return error;
      }
    });
  }

  function lookEditor(look) {
    const profile = current();
    if (!look && profile.looks.length >= W.MAX_LOOKS) return announce("Für dieses Profil sind bereits 300 Looks gespeichert.");
    const suggestedName = profile.plan.occasion === "any" ? "" : W.occasions[profile.plan.occasion] + "-Look";
    openEditor({ title: look ? "Look umbenennen" : "Look speichern", fields: field("Name des Looks", input("name", look?.name ?? suggestedName, 48)), async run(form) {
      const name = form.get("name");
      if (!W.nameValue(name, 48)) return "Gib deinem Look einen Namen mit 1 bis 48 Zeichen.";
      const error = await commit((draft) => {
        const profile = current(draft);
        if (look) profile.looks.find((entry) => entry.id === look.id).name = name.trim();
        else profile.looks.unshift({ id: W.newId(), name: name.trim(), pieces: { ...profile.pieces },
          context: LookPlanner.context(profile.plan) });
      });
      if (!error) {
        render();
        announce(look ? "Look umbenannt." : "Look gespeichert. Du findest ihn unter „Looks“.");
      }
      return error;
    } });
  }

  async function suggest() {
    if (saving) return;
    const profile = current();
    const result = LookPlanner.suggest(profile);
    if (!result) {
      const message = profile.plan.fixed.length
        ? "Mit den fixierten Teilen gibt es gerade keine weitere passende Kombination."
        : "Für diese Auswahl gibt es gerade keine weitere passende Kombination.";
      suggestionNotes.set(profile.id, message);
      showText("look-feedback", message);
      return;
    }
    const message = result.added ? "Look um " + countLabel(result.added, "Teil", "Teile") + " ergänzt." : "Neuer Vorschlag angezogen.";
    await setOutfit(result.pieces, message, undefined, { suggestion: result });
  }

  function download(contents, prefix, type, extension) {
    const date = new Date();
    const dateText = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = prefix + "-" + dateText + extension;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  async function exportData() {
    if (storageMode === "damaged") return announce(storageIssue);
    const backup = structuredClone(state);
    const attached = itemsWithPhotos(backup);
    let photos = new Map();
    if (attached.length) {
      try {
        photos = await GarmentPhotos.read(attached.map((item) => item.photo), storageMode === "session");
      } catch {
        // Preserve the wardrobe export if the photo database cannot be opened.
      }
      for (const item of attached) {
        if (!photos.has(item.photo)) delete item.photo;
      }
      if (photos.size) backup.photos = Object.fromEntries(photos);
    }
    download(JSON.stringify(backup), "kleiderstudio", "application/json", ".json");
    const missing = attached.length - photos.size;
    announce(missing
      ? "JSON-Sicherung erstellt. " + countLabel(missing, "Foto war", "Fotos waren") + " im Browser-Speicher nicht verfügbar."
      : "JSON-Sicherung erstellt.");
  }

  function importFeedback(message, error) {
    const feedback = $("import-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("error", error);
    feedback.hidden = !message;
  }

  async function importPhotos(raw, incoming) {
    const attached = itemsWithPhotos(incoming);
    if (raw.photos === undefined && !attached.length) return [];
    const message = "Die Sicherung enthält ungültige oder fehlende Kleidungsfotos.";
    if (raw.version < 4 || !raw.photos || typeof raw.photos !== "object" || Array.isArray(raw.photos) ||
      Object.keys(raw.photos).length !== attached.length) throw new Error(message);
    const files = attached.map((item) => Object.hasOwn(raw.photos, item.photo) ? raw.photos[item.photo] : null);
    if (!files.every(GarmentPhotos.validThumbnail)) throw new Error(message);
    // Decode in small batches to verify actual JPEG contents before asking to overwrite.
    for (let i = 0; i < files.length; i += 12) {
      const valid = await Promise.all(files.slice(i, i + 12).map(GarmentPhotos.checkThumbnail));
      if (!valid.every(Boolean)) throw new Error(message);
    }
    return attached.map((item, index) => {
      item.photo = W.newId();
      return [item.photo, files[index]];
    });
  }

  async function readImport(file) {
    if (!file) return;
    const sequence = ++importSequence;
    importFeedback("", false);
    if (file.size > W.MAX_FILE) return importFeedback("Die Sicherung ist zu groß. Die Grenze liegt bei 12 MB.", true);
    let raw;
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
      raw = JSON.parse(text);
    } catch {
      if (sequence !== importSequence) return;
      return importFeedback("Die Datei konnte nicht als JSON gelesen werden. Deine vorhandenen Daten wurden beibehalten.", true);
    }
    if (sequence !== importSequence || page !== "einstellungen" || dialog.open) return;
    let incoming, photos;
    try {
      incoming = W.validated(raw);
      if (itemsWithPhotos(incoming).length) importFeedback("Kleidungsfotos werden geprüft …", false);
      photos = await importPhotos(raw, incoming);
    } catch (error) {
      if (sequence !== importSequence || page !== "einstellungen") return;
      return importFeedback(error.message + " Deine vorhandenen Daten wurden beibehalten.", true);
    }
    if (sequence !== importSequence || page !== "einstellungen" || dialog.open) return;
    importFeedback("", false);
    const summary = incoming.profiles.map((person) => person.name + " (" +
      countLabel(person.items.length, "Teil", "Teile") + ", " + countLabel(person.looks.length, "Look", "Looks") + ")").join(" und ");
    confirm("Daten aus Sicherung übernehmen?",
      "Diese Sicherung enthält " + summary + ". Beim Import werden die vorhandenen Daten beider Profile vollständig ersetzt.",
      "Importieren", (draft) => Object.assign(draft, incoming), "Sicherung importiert.", { recovery: true, photos });
  }

  function reportOffline(message) {
    offlineText = message;
    $("offline-status").textContent = message;
  }

  function showUpdate(worker) {
    workerUpdate = worker;
    $("update-banner").hidden = false;
    $("update-message").textContent = worker ? "Ein Update für Kleiderstudio ist bereit." : "Kleiderstudio wurde aktualisiert. Lade diesen Tab neu.";
    document.querySelector('[data-action="update-app"]').textContent = worker ? "Update laden" : "Neu laden";
  }

  function enableOffline() {
    if (location.protocol === "file:") return;
    if (!window.isSecureContext || !("serviceWorker" in navigator)) {
      offlineText = "Für den Offline-Modus braucht die App eine HTTPS-Adresse oder localhost.";
      return;
    }
    const service = navigator.serviceWorker;
    const offlineFailure = "Offline konnte nicht eingerichtet werden. Öffne die App erneut mit Internetverbindung.";
    let hadController = Boolean(service.controller);
    const reportReady = () => reportOffline("Die App ist für die Offline-Nutzung vorbereitet.");
    service.addEventListener("controllerchange", () => {
      if (reloadingForUpdate) {
        location.reload();
        return;
      }
      if (hadController) showUpdate(null);
      hadController = Boolean(service.controller);
    });
    service.register("./sw.js", { updateViaCache: "none" }).then((registration) => {
      if (registration.waiting) showUpdate(registration.waiting);
      function watchInstall() {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && registration.waiting && hadController) showUpdate(registration.waiting);
          if (worker.state === "redundant" && !registration.active) reportOffline(offlineFailure);
        });
      }
      watchInstall();
      registration.addEventListener("updatefound", watchInstall);
      return service.ready;
    }).then(reportReady).catch(() => {
      if (service.controller) reportReady();
      else reportOffline(offlineFailure);
    });
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      $("install-button").hidden = false;
    });
    window.addEventListener("appinstalled", () => { $("install-button").hidden = true; });
  }

  function applyAppUpdate(button) {
    if (saving) return announce("Warte, bis deine Änderung gespeichert ist.");
    if (!workerUpdate || workerUpdate.state === "redundant") return location.reload();
    reloadingForUpdate = true;
    button.disabled = true;
    workerUpdate.postMessage({ type: "ACTIVATE_UPDATE" });
    setTimeout(() => {
      reloadingForUpdate = false;
      button.disabled = false;
      if (workerUpdate?.state === "activated") showUpdate(null);
      else announce("Das Update konnte noch nicht aktiviert werden. Versuche es erneut.");
    }, 8000);
  }

  document.querySelectorAll("[data-icon]").forEach((node) => { node.innerHTML = icon(node.dataset.icon); });
  $("catalog-category").innerHTML = options({ all: "Alle Kategorien", ...categoryNames }, "all");
  $("target-style").innerHTML = options({ any: "Alle Stile", ...W.styles }, "any");
  for (const [id, key, choices] of [["look-occasion", "occasion", W.occasions], ["look-dresscode", "dressCode", W.dressCodes]]) {
    const control = $(id);
    control.innerHTML = options(choices, current().plan[key]);
    control.addEventListener("change", async () => {
      const value = control.value;
      if (!Object.hasOwn(choices, value)) return;
      suggestionNotes.delete(current().id);
      if (!await update((draft) => { current(draft).plan[key] = value; })) control.value = current().plan[key];
    });
  }
  $("catalog-search").addEventListener("input", renderCatalog);
  $("catalog-category").addEventListener("change", renderCatalog);
  $("studio-search").addEventListener("input", () => renderStudioItems(current()));
  $("target-style").addEventListener("change", async (event) => {
    const style = event.target.value;
    if (!await update((draft) => { current(draft).style = style; })) event.target.value = current().style;
  });
  $("match-only").addEventListener("change", async (event) => {
    const checked = event.target.checked;
    if (!await update((draft) => { current(draft).matchOnly = checked; })) event.target.checked = current().matchOnly;
  });
  $("import-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    event.target.value = "";
    void readImport(file);
  });
  $("editor-form").addEventListener("input", (event) => event.target.removeAttribute("aria-invalid"));
  $("editor-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!editor || editorBusy) return;
    editorBusy = true;
    $("editor-submit").disabled = true;
    try {
      const error = await editor(new FormData(event.target));
      if (!error) dialog.close();
      else showText("editor-error", error);
    } catch {
      showText("editor-error", "Beim Speichern ist ein Fehler aufgetreten. Prüfe die Angaben und versuche es erneut.");
    } finally {
      editorBusy = false;
      $("editor-submit").disabled = false;
    }
  });
  dialog.addEventListener("cancel", (event) => {
    if (editorBusy) event.preventDefault();
  });
  dialog.addEventListener("close", () => {
    releasePreviews($("editor-fields"));
    const origin = editorOrigin;
    editor = null;
    editorOrigin = null;
    if (origin?.page !== page) return;
    const opener = origin.opener?.isConnected ? origin.opener
      : origin.action && origin.id ? focusAction(origin.action, origin.id)() : null;
    if (opener && !opener.disabled && !opener.closest("[hidden]")) opener.focus({ preventScroll: true });
    else focusHeading("title-" + page);
  });
  window.addEventListener("hashchange", () => {
    importSequence += 1;
    if (dialog.open) dialog.close();
    navigate();
  });

  for (const [view, panel, action] of [["studio", "figure-panel", "show-figure"], ["anprobe", "fit-preview-panel", "show-fitting"]]) {
    const button = document.querySelector('[data-action="' + action + '"]');
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        button.hidden = page !== view || entry.isIntersecting || entry.boundingClientRect.bottom > 0;
      }).observe($(panel).querySelector(".stage"));
    } else {
      button.hidden = false;
    }
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    if (event.key === storageKey && event.newValue === lastRaw) return;
    importSequence += 1;
    if (dialog.open && !editorBusy) {
      dialog.close();
      announce("Daten aus einem anderen Tab wurden geladen. Öffne die Bearbeitung erneut.");
    }
    readStorage();
    outfitUndo.clear();
    suggestionNotes.clear();
    render();
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    const profile = current();
    const item = profile.items.find((entry) => entry.id === id);
    const look = profile.looks.find((entry) => entry.id === id);
    const person = state.profiles.find((entry) => entry.id === id);
    switch (action) {
      case "skip":
        event.preventDefault();
        focusHeading("title-" + page, true);
        break;
      case "profile":
        if (profile.id !== id) update((draft) => { draft.active = id; }, person.name + " ausgewählt.", focusAction(action, id));
        break;
      case "category":
        category = id;
        renderStudio();
        focusAction(action, id)()?.focus({ preventScroll: true });
        break;
      case "show-figure":
        focusHeading("figure-title", true);
        break;
      case "show-wardrobe":
        focusHeading("wardrobe-title", true);
        break;
      case "clear-studio-search":
        $("studio-search").value = "";
        renderStudioItems(profile);
        $("studio-search").focus();
        break;
      case "show-all-matches":
        if (await update((draft) => { current(draft).matchOnly = false; })) $("match-only").focus();
        break;
      case "clear-catalog":
        $("catalog-search").value = "";
        $("catalog-category").value = "all";
        renderCatalog();
        $("catalog-search").focus();
        break;
      case "wear": {
        const removing = profile.pieces[item.category] === id;
        await setOutfit({ ...profile.pieces, [item.category]: removing ? null : id },
          item.name + (removing ? " ausgezogen." : " angezogen."), focusAction(action, id));
        break;
      }
      case "slot":
        if (profile.pieces[id]) await setOutfit({ ...profile.pieces, [id]: null }, W.slots[id].short + " entfernt.", focusAction(action, id));
        else {
          category = group(id);
          renderStudio();
          const tab = focusAction("category", category)();
          tab?.focus();
        }
        break;
      case "reset":
        await setOutfit(W.emptyPieces(), "Aktuelles Outfit zurückgesetzt.", () => $("undo-outfit"));
        break;
      case "undo-outfit": {
        const previous = outfitUndo.get(profile.id);
        if (previous) await setOutfit(W.piecesOf(W.outfit(profile, previous.pieces)), "Letzte Outfit-Änderung rückgängig gemacht.",
          () => document.querySelector('[data-action="reset"]:not(:disabled), [data-action="suggest"]:not(:disabled)'),
          { undo: true, context: previous.context });
        break;
      }
      case "suggest": await suggest(); break;
      case "review-look": reviewLook(profile); break;
      case "fix-pieces": fixPieces(profile); break;
      case "new-item": itemEditor(); break;
      case "new-photo": photoEditor(); break;
      case "pick-photo": $("garment-file")?.click(); break;
      case "add-examples": {
        const index = state.profiles.findIndex((entry) => entry.id === profile.id);
        const samples = W.defaults().profiles[index].items.filter((entry) => group(entry.category) === category);
        const additions = samples.filter((entry) => !profile.items.some((other) => other.name === entry.name));
        if (profile.items.length + additions.length > W.MAX_ITEMS) {
          announce("Für die Beispiele ist im Schrank kein Platz mehr.");
          break;
        }
        if (additions.length) {
          $("studio-search").value = "";
          await update((draft) => { current(draft).items.push(...additions.map((entry) => ({ ...entry, id: W.newId() }))); }, "Beispiele hinzugefügt.");
        }
        break;
      }
      case "edit-item": itemEditor(item); break;
      case "delete-item":
        confirm("Kleidungsstück löschen?", "„" + item.name + "“ wird aus dem Kleiderschrank und allen Looks entfernt, in denen es vorkommt. Leere Looks werden gelöscht.",
          "Löschen", (draft) => {
            const edited = current(draft);
            W.removeItemReferences(edited, [id]);
            edited.items = edited.items.filter((entry) => entry.id !== id);
          }, "Kleidungsstück gelöscht.");
        break;
      case "save-look": lookEditor(); break;
      case "rename-look": lookEditor(look); break;
      case "load-look":
        if (await setOutfit({ ...look.pieces }, "„" + look.name + "“ angezogen.", undefined, { context: look.context })) location.hash = "studio";
        break;
      case "delete-look":
        confirm("Look löschen?", "„" + look.name + "“ wird aus deinen gespeicherten Looks entfernt.", "Löschen",
          (draft) => { current(draft).looks = current(draft).looks.filter((entry) => entry.id !== id); }, "Look gelöscht.");
        break;
      case "edit-profile": profileEditor(person || profile); break;
      case "edit-measures": measureEditor(person || profile); break;
      case "edit-weather": weatherEditor(profile); break;
      case "clear-weather":
        suggestionNotes.delete(profile.id);
        if (!editorBusy && await update((draft) => { current(draft).weather = Weather.empty(); }, "Wetter für Vorschläge entfernt.")) dialog.close();
        break;
      case "save-fitting": itemEditor(null, FittingRoom.garment()); break;
      case "show-fitting":
        focusHeading("fit-preview-title", true);
        break;
      case "show-fitting-form":
        focusHeading("fit-form-title", true);
        break;
      case "remove-demo":
        confirm("Beispielteile entfernen?", "Die Beispielteile von " + person.name + " werden aus dem Schrank und allen Outfits entfernt. Leere Looks werden gelöscht.",
          "Entfernen", (draft) => {
            const edited = draft.profiles.find((entry) => entry.id === id);
            W.removeItemReferences(edited, edited.items.filter((entry) => entry.demo).map((entry) => entry.id));
            edited.items = edited.items.filter((entry) => !entry.demo);
          }, "Beispielteile entfernt.");
        break;
      case "export": await exportData(); break;
      case "export-raw":
        if (storageMode === "damaged" && lastRaw !== null) download(lastRaw, "kleiderstudio-browserdaten", "text/plain", ".txt");
        break;
      case "import": $("import-file").click(); break;
      case "update-app": applyAppUpdate(button); break;
      case "install":
        if (installPrompt) {
          const invitation = installPrompt;
          installPrompt = null;
          $("install-button").hidden = true;
          try { await invitation.prompt(); }
          catch { announce("Nutze das Browsermenü, um die App zu installieren."); }
        }
        break;
      case "close-dialog":
        if (!editorBusy) dialog.close();
        break;
    }
  });

  readStorage();
  enableOffline();
  navigate();
})();
