"use strict";

const GarmentPhotos = (() => {
  const filePrefix = "data:image/jpeg;base64,";
  const sessionPhotos = new Map();
  let connection;

  function validThumbnail(value) {
    if (typeof value !== "string" || value.length > 16000 || !value.startsWith(filePrefix + "/9j/")) return false;
    const encoded = value.slice(filePrefix.length);
    return encoded.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(encoded);
  }

  async function checkThumbnail(value) {
    if (!validThumbnail(value)) return false;
    try {
      const bytes = Uint8Array.from(atob(value.slice(filePrefix.length)), (char) => char.charCodeAt(0));
      const { type, width, height } = ReferenceImage.inspect(bytes.buffer);
      if (type !== "image/jpeg" || width > 240 || height > 240 ||
          bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) return false;
      const image = new Image();
      image.src = value;
      await image.decode();
      return image.naturalWidth <= 240 && image.naturalHeight <= 240;
    } catch {
      return false;
    }
  }

  function database() {
    if (!connection) {
      connection = new Promise((resolve, reject) => {
        const open = indexedDB.open("kleiderstudio-garment-photos", 1);
        open.onupgradeneeded = () => open.result.createObjectStore("photos");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          db.onversionchange = db.onclose = () => {
            db.close();
            connection = undefined;
          };
          resolve(db);
        };
      }).catch((error) => {
        connection = undefined;
        throw error;
      });
    }
    return connection;
  }

  async function transaction(mode, use) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("photos", mode);
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error || new Error("Die Fotodaten konnten nicht gespeichert werden."));
      try {
        use(tx.objectStore("photos"));
      } catch (error) {
        tx.abort();
        reject(error);
      }
    });
  }

  async function insert(entries, session) {
    if (session) {
      if (entries.some(([id]) => sessionPhotos.has(id))) throw new Error("Foto-ID ist bereits vergeben.");
      for (const [id, value] of entries) sessionPhotos.set(id, value);
      return;
    }
    await transaction("readwrite", (store) => {
      for (const [id, value] of entries) store.add(value, id);
    });
  }

  async function remove(ids, session) {
    if (session) {
      ids.forEach((id) => sessionPhotos.delete(id));
      return;
    }
    await transaction("readwrite", (store) => ids.forEach((id) => store.delete(id)));
  }

  async function read(ids, session) {
    const result = new Map();
    if (!ids.length) return result;
    function add(id, value) {
      if (validThumbnail(value)) result.set(id, value);
    }
    if (session) {
      ids.forEach((id) => add(id, sessionPhotos.get(id)));
      return result;
    }
    await transaction("readonly", (store) => {
      for (const id of ids) {
        const request = store.get(id);
        request.onsuccess = () => add(id, request.result);
      }
    });
    return result;
  }

  return { validThumbnail, checkThumbnail, insert, remove, read };
})();
