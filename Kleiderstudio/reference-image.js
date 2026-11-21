"use strict";

const ReferenceImage = (() => {
  const unsupported = "Wähle ein JPEG-, PNG- oder WebP-Bild.";
  const unreadable = "Das Bild konnte nicht geöffnet werden. Prüfe die Datei oder wähle ein anderes Bild.";
  const limit = 960;

  function jpegSize(view) {
    let offset = 2;
    while (offset + 4 <= view.byteLength && view.getUint8(offset) === 0xff) {
      while (offset + 1 < view.byteLength && view.getUint8(offset + 1) === 0xff) offset++;
      if (offset + 4 > view.byteLength) break;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xda || marker === 0xd9) break;
      const size = view.getUint16(offset + 2);
      if (size < 2 || offset + size + 2 > view.byteLength) break;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker) && size >= 8) {
        return [view.getUint16(offset + 7), view.getUint16(offset + 5)];
      }
      offset += size + 2;
    }
    return [];
  }

  function webpSize(view, bytes) {
    const chunk = view.getUint32(12);
    const uint24 = (offset) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
    if (chunk === 0x56503858 && bytes.length >= 30) return [1 + uint24(24), 1 + uint24(27)]; // VP8X
    if (chunk === 0x5650384c && bytes[20] === 0x2f) { // VP8L
      const dimensions = view.getUint32(21, true);
      return [1 + (dimensions & 0x3fff), 1 + ((dimensions >>> 14) & 0x3fff)];
    }
    if (chunk === 0x56503820 && bytes.length >= 30 && uint24(23) === 0x2a019d) { // VP8
      return [view.getUint16(26, true) & 0x3fff, view.getUint16(28, true) & 0x3fff];
    }
    return [];
  }

  function inspect(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 24) throw new Error(unreadable);
    const view = new DataView(buffer);
    let type;
    let dimensions;
    if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a && view.getUint32(12) === 0x49484452) {
      type = "image/png";
      dimensions = [view.getUint32(16), view.getUint32(20)];
    } else if (view.getUint16(0) === 0xffd8) {
      type = "image/jpeg";
      dimensions = jpegSize(view);
    } else if (view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57454250) {
      type = "image/webp";
      dimensions = bytes.length >= 25 ? webpSize(view, bytes) : [];
    } else {
      throw new Error(unsupported);
    }
    const [width, height] = dimensions;
    if (!width || !height) throw new Error(unreadable);
    if (width > 12000 || height > 12000 || width * height > 50_000_000) {
      throw new Error("Das Bild hat zu viele Pixel. Wähle ein verkleinertes Bild.");
    }
    return { type, width, height };
  }

  function copy(image) {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const scale = Math.min(1, limit / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  async function read(file) {
    if (file.size > 10_000_000) throw new Error("Das Bild ist zu groß. Die Grenze liegt bei 10 MB.");
    const buffer = await file.arrayBuffer();
    const { type, width, height } = inspect(buffer);
    const imageFile = new Blob([buffer], { type });
    if ("createImageBitmap" in globalThis) {
      try {
        const bitmap = await createImageBitmap(imageFile, {
          resizeWidth: Math.max(1, Math.round(width * Math.min(1, limit / Math.max(width, height)))),
          resizeQuality: "high"
        });
        try {
          return copy(bitmap);
        } finally {
          bitmap.close();
        }
      } catch {
        // Fall back to the browser's image element if resized bitmap decoding fails.
      }
    }
    const url = URL.createObjectURL(imageFile);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return copy(img);
    } catch {
      throw new Error(unreadable);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return { read, inspect };
})();
