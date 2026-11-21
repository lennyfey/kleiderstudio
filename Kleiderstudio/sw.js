"use strict";

const cachePrefix = "kleiderstudio:" + self.registration.scope + ":";
const cacheName = cachePrefix + "15";
const assets = [
  "./index.html", "./style.css", "./weather.js", "./data.js", "./drawing.js", "./reference-image.js",
  "./photo-store.js", "./photo-weights.js", "./photo-recognition.js", "./fitting.js", "./app.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"
].map((file) => new URL(file, self.registration.scope).href);
const index = assets[0];
const assetSet = new Set(assets);
const start = new URL(self.registration.scope);
const indexPath = new URL(index).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) =>
    cache.addAll(assets.map((url) => new Request(url, { cache: "reload" })))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith(cachePrefix) && key !== cacheName)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== start.origin || !url.pathname.startsWith(start.pathname)) return;
  const isApp = request.mode === "navigate" && (url.pathname === start.pathname || url.pathname === indexPath);
  url.search = "";
  url.hash = "";
  const asset = isApp ? index : url.href;
  if (!assetSet.has(asset)) return;
  event.respondWith((async () => {
    let cache;
    try {
      cache = await caches.open(cacheName);
      const saved = await cache.match(asset);
      if (saved) return saved;
    } catch {
      // The network remains usable if the browser blocks its cache.
    }
    const response = await fetch(request);
    if (cache && response.ok) await cache.put(asset, response.clone()).catch(() => {});
    return response;
  })());
});
