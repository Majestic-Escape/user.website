// Listing photos and profile pictures live in DigitalOcean Spaces as a
// sanitised master plus a fixed set of WebP display sizes that the server
// renders at upload time (server.me services/storage.js — the naming below
// mirrors it and is held in step by scripts/check-image-loader.mjs against
// the shared vectors file). The site derives the variant URL from the master
// URL it already holds, so a photo is shown straight from the Spaces CDN:
// no /_next/image, no Vercel image transformation, no request to server.me,
// no database read.
//
//   master   https://<bucket>.<region>.digitaloceanspaces.com/<key>
//   variant  https://<bucket>.<region>.cdn.digitaloceanspaces.com/<key>/v1/w<width>.webp
//
// Variants are never wider than the master (a narrower master is stored at
// its own width under every key), so asking for a width the master cannot
// fill is safe; the loader never returns the master itself.

export const VARIANT_SET = "v1";
export const VARIANT_WIDTHS = [160, 320, 640, 960, 1280, 1600, 1920, 2560, 3840];

const HOST_RE = /^([a-z0-9][a-z0-9-]*)\.([a-z0-9]+)(\.cdn)?\.digitaloceanspaces\.com$/i;
const VARIANT_PATH_RE = /^(.+)\/v[0-9]+\/w[0-9]{2,4}\.webp$/;

// The rollback switch: NEXT_PUBLIC_IMAGE_VARIANTS=off puts every media image
// back on the default next/image path (Vercel optimizer) at the next build.
export const VARIANTS_ENABLED = process.env.NEXT_PUBLIC_IMAGE_VARIANTS !== "off";

/**
 * Bucket, region and master path (percent-encoded, no leading slash) of a
 * Spaces object URL — origin or CDN host, master or variant — or null for
 * anything else (other hosts, http, blob:/data: URLs, query strings).
 */
export function parseSpacesUrl(src) {
  if (typeof src !== "string" || !src.startsWith("https://")) return null;
  let url;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  const host = url.hostname.match(HOST_RE);
  if (!host || url.search || url.hash) return null;
  const path = url.pathname.slice(1);
  if (!path || path.endsWith("/") || path.includes("//")) return null;
  return { bucket: host[1], region: host[2], path: path.replace(VARIANT_PATH_RE, "$1") };
}

export function isSpacesUrl(src) {
  return parseSpacesUrl(src) !== null;
}

/** The variant width a display width maps to: the smallest at least as wide, else the largest. */
export function variantWidthFor(width) {
  const w = Number(width) || 0;
  return VARIANT_WIDTHS.find((v) => v >= w) || VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
}

/** CDN URL of the display variant for `width`, or null when `src` is not a Spaces object. */
export function variantUrl(src, width) {
  const p = parseSpacesUrl(src);
  if (!p) return null;
  return `https://${p.bucket}.${p.region}.cdn.digitaloceanspaces.com/${p.path}/${VARIANT_SET}/w${variantWidthFor(width)}.webp`;
}

/** The master URL of a Spaces object (a variant URL → its master on the origin host). */
export function masterUrl(src) {
  const p = parseSpacesUrl(src);
  if (!p) return src;
  return `https://${p.bucket}.${p.region}.digitaloceanspaces.com/${p.path}`;
}

/** A srcset of variants for a raw <img>: 1x and 2x of the rendered width. */
export function variantSrcSet(src, width) {
  const one = variantUrl(src, width);
  if (!one) return undefined;
  const two = variantUrl(src, width * 2);
  return two === one ? `${one} 1x` : `${one} 1x, ${two} 2x`;
}

/** next/image loader: the CDN variant for the requested width (quality is fixed at encode time). */
export function spacesLoader({ src, width }) {
  return variantUrl(src, width) || src;
}
