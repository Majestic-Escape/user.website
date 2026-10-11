// Fits a picked image under a request-size budget in the browser. Uploads go
// through a Vercel function whose request body cap is 4.5 MB; a larger body
// is refused at the edge WITHOUT CORS headers, so the page only sees a bare
// "Network Error". Files already within budget (and of a type the server
// takes) are sent byte-for-byte; anything else the browser can decode (a big
// camera photo, HEIC — natively on Safari/iOS, via a lazily loaded decoder
// elsewhere — WebP, an untyped file) is re-encoded as an
// upright JPEG (<img> decoding applies EXIF orientation), longest edge capped
// at `maxEdge`, stepping quality — then size — down until it fits.

export class ImagePrepError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // "UNDECODABLE" | "TOO_LARGE"
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImagePrepError("UNDECODABLE", "This image format can't be opened here."));
    };
    img.src = url;
  });
}

function isHeic(file) {
  return /hei[cf]/i.test(file.type || "") || /\.hei[cf]$/i.test(file.name || "");
}

// Safari (and every iOS browser) decodes HEIC natively; elsewhere the HEIC
// is converted with heic2any, loaded only now (~1.3 MB, never downloaded by
// anyone who does not pick a HEIC).
async function loadHeic(file) {
  try {
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    return await loadImage(Array.isArray(out) ? out[0] : out);
  } catch {
    throw new ImagePrepError("UNDECODABLE", "This image format can't be opened here.");
  }
}

function toJpeg(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * @param {File} file
 * @param {{ maxBytes: number, maxEdge: number, passThroughMaxBytes?: number,
 *   passThroughTypes?: string[], qualities?: number[], minEdge?: number }} opts
 * @returns {Promise<{ file: File, converted: boolean }>}
 */
export async function fitImage(file, { maxBytes, maxEdge, passThroughMaxBytes = maxBytes, passThroughTypes = ["image/jpeg", "image/png"], qualities = [0.92, 0.85, 0.78, 0.7], minEdge = 1200 }) {
  if (passThroughTypes.includes(file.type) && file.size <= passThroughMaxBytes) return { file, converted: false };

  const { img, url } = await loadImage(file).catch((error) => {
    if (isHeic(file)) return loadHeic(file);
    throw error;
  });
  const canvas = document.createElement("canvas");
  try {
    let edge = Math.min(maxEdge, Math.max(img.naturalWidth, img.naturalHeight));
    for (;;) {
      const scale = edge / Math.max(img.naturalWidth, img.naturalHeight);
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // transparent areas would turn black in JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const quality of qualities) {
        const blob = await toJpeg(canvas, quality);
        if (blob && blob.size <= maxBytes) {
          const name = `${(file.name || "photo").replace(/\.[^.]+$/, "")}.jpg`;
          return { file: new File([blob], name, { type: "image/jpeg" }), converted: true };
        }
      }
      if (edge <= minEdge) break;
      edge = Math.max(minEdge, Math.round(edge * 0.8));
    }
    throw new ImagePrepError("TOO_LARGE", "This image is too large to upload.");
  } finally {
    URL.revokeObjectURL(url);
    // release the bitmap memory right away (matters on phones/tablets)
    canvas.width = 0;
    canvas.height = 0;
  }
}
