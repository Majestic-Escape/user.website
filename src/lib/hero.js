// The homepage banner's pictures: the admin-managed pair from the API
// (server.me docs/site-hero.md) or the bundled banner. Pure — no server or
// browser APIs — so the hero server component and scripts/check-hero.mjs
// share it.
//
// Contract with the server (scripts/check-hero.mjs checks it against the
// vectors copied from server.me tests/batch-s/fixtures): rendition widths are
// DERIVED from the master width, never taken from the payload; a rendition of
// actual width w lives under the smallest standard variant width ≥ w
// (1060 px → w1280), as AVIF and WebP; the JPEG master is the last-resort
// fallback. The payload is validated strictly (our bucket, our prefix, the
// slot's box, a short description): anything else means "show the bundled
// banner" — the hero is never empty and never points anywhere unexpected.
//
// Delivery: the AVIF/WebP renditions are served from this site's own domain
// (/_hero/…, forwarded to the Spaces CDN by the rewrite in next.config.ts and
// cached at Vercel's edge), so the LCP image rides the page's connection
// instead of opening a second one (measured: tests/pw-final evidence,
// site-hero-perf-notes.md). HERO_DELIVERY=cdn links the CDN directly
// instead. The first fallback step always goes straight to the Spaces
// origin, so a problem with either path is covered by the other.
import { VARIANT_SET, variantWidthFor } from "./spaces-image.js";

export const HERO_SLOTS = Object.freeze({
  // cap: the widest master the server keeps; renditionCap: the widest file
  // browsers are offered (desktop: 2560, as the static hero — server.me
  // services/siteHeroImage.js explains the byte budget behind it)
  desktop: Object.freeze({ ratio: 1920 / 740, cap: 3840, renditionCap: 2560 }),
  mobile: Object.freeze({ ratio: 530 / 720, cap: 1600, renditionCap: 1600 }),
});
export const RENDITION_STEPS = Object.freeze([640, 960, 1280, 1600, 1920, 2560, 3840]);
export const ALT_MAX = 150;
// The built-in banner: the files in public/images/hero/gen (STATIC_HERO
// below, from scripts/optimize-static-images.mjs) and the description of
// what those files show. It is only the safety net — shown when no banner
// is published or nothing else loads; every banner admins publish (any
// festival, offer, season) carries its own description. Replacing the
// built-in art means replacing the files AND this text together.
export const BUILT_IN_ALT = "Rann Utsav — two women with a hand-embroidered Kutchi textile on the white salt desert of Kutch";
const DEFAULT_BUCKET = "majestic-escape-host-properties.blr1";
const DEFAULT_PREFIX = "site/hero/";
const QA_PREFIX_RE = /^_qa\/site\/hero\/[a-z0-9-]{1,40}\/$/;
const BUCKET_RE = /^[a-z0-9][a-z0-9-]{1,62}\.[a-z0-9]{2,12}$/;
const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const LQIP_RE = /^data:image\/webp;base64,[A-Za-z0-9+/=]{1,580}$/;
const RATIO_SLACK = 0.0125; // the server keeps crops within 1% (+ integer rounding)
const ORIGIN_FALLBACK_WIDTH = { desktop: 1920, mobile: 1280 };
// The site path of a rendition; next.config.ts forwards exactly this shape.
export const HERO_SITE_PATH = "/_hero";

// The generated static banner (scripts/optimize-static-images.mjs).
const GEN = "/images/hero/gen";
const set = (name, widths, ext) => widths.map((w) => `${GEN}/${name}-${w}.${ext} ${w}w`).join(", ");
export const STATIC_HERO = Object.freeze({
  desktop: Object.freeze({ avif: set("banner", [1280, 1920, 2560], "avif"), webp: set("banner", [1280, 1920, 2560], "webp"), jpeg: set("banner", [1280, 1920, 2560], "jpeg"), width: 2805, height: 1080 }),
  mobile: Object.freeze({ avif: set("mobile-banner", [640, 960, 1060], "avif"), webp: set("mobile-banner", [640, 960, 1060], "webp"), jpeg: set("mobile-banner", [640, 960, 1060], "jpeg"), width: 1060, height: 1440 }),
});

/** Actual pixel widths of the renditions of a master `masterWidth` px wide (mirrors the server). */
export function heroRenditionWidths(masterWidth, slot) {
  const top = Math.min(Math.floor(Number(masterWidth) || 0), HERO_SLOTS[slot].renditionCap);
  if (top < 1) return [];
  const widths = RENDITION_STEPS.filter((w) => w < top);
  widths.push(top);
  return widths;
}

/**
 * Where hero objects may come from: our bucket (SITE_HERO_BUCKET overrides
 * it for a test backend) and our prefix (a `_qa/site/hero/<run>/` prefix is
 * honoured for a local QA run, never on a Vercel deployment).
 */
export function heroSource(env = {}) {
  const bucket = BUCKET_RE.test(env.SITE_HERO_BUCKET || "") ? env.SITE_HERO_BUCKET : DEFAULT_BUCKET;
  const qa = env.SITE_HERO_PREFIX && QA_PREFIX_RE.test(env.SITE_HERO_PREFIX) && !env.VERCEL;
  return { bucket, prefix: qa ? env.SITE_HERO_PREFIX : DEFAULT_PREFIX, delivery: env.HERO_DELIVERY === "cdn" ? "cdn" : "site" };
}

// "<bucket>.<region>" → the origin and CDN host names of the Space.
const originHost = (source) => `${source.bucket}.digitaloceanspaces.com`;
const cdnHost = (source) => `${source.bucket}.cdn.digitaloceanspaces.com`;

function validSlot(value, slot, source) {
  if (!value || typeof value !== "object") return null;
  const { url, width, height, lqip } = value;
  if (typeof url !== "string" || url.length > 300) return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const hosts = [originHost(source), cdnHost(source)];
  if (u.protocol !== "https:" || u.username || u.password || u.port || u.search || u.hash || !hosts.includes(u.hostname)) return null;
  let key;
  try {
    key = decodeURIComponent(u.pathname.slice(1));
  } catch {
    return null;
  }
  const prefix = source.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`^${prefix}${slot}/${UUID_RE}\\.jpg$`).test(key)) return null;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > HERO_SLOTS[slot].cap || height > 3840) return null;
  const r = width / height;
  const R = HERO_SLOTS[slot].ratio;
  if (Math.max(r / R, R / r) - 1 > RATIO_SLACK) return null;
  return { key, width, height, lqip: typeof lqip === "string" && LQIP_RE.test(lqip) ? lqip : "" };
}

/**
 * The API payload, validated. { version, alt, desktop, mobile } with both
 * slots (a custom banner) or both null (the bundled one); null when anything
 * is off — the caller then shows the bundled banner.
 */
export function validateHero(payload, source) {
  if (!payload || typeof payload !== "object") return null;
  const version = payload.version;
  if (!Number.isInteger(version) || version < 0) return null;
  if (payload.desktop == null && payload.mobile == null) return { version, alt: null, desktop: null, mobile: null };
  const desktop = validSlot(payload.desktop, "desktop", source);
  const mobile = validSlot(payload.mobile, "mobile", source);
  if (!desktop || !mobile) return null; // one banner = both artworks
  if (typeof payload.alt !== "string") return null;
  const alt = payload.alt.trim();
  if (!alt || alt.length > ALT_MAX) return null;
  return { version, alt, desktop, mobile };
}

function dynamicSlot(v, slot, source) {
  const cdn = `https://${cdnHost(source)}`;
  const origin = `https://${originHost(source)}`;
  const path = v.key.split("/").map(encodeURIComponent).join("/");
  // validSlot() guarantees key = <prefix><slot>/<uuid>.jpg
  const base = source.delivery === "cdn" ? `${cdn}/${path}` : `${HERO_SITE_PATH}/${v.key.slice(source.prefix.length)}`;
  const widths = heroRenditionWidths(v.width, slot);
  const srcset = (ext) => widths.map((w) => `${base}/${VARIANT_SET}/w${variantWidthFor(w)}.${ext} ${w}w`).join(", ");
  const fallbackWidth = Math.min(ORIGIN_FALLBACK_WIDTH[slot], widths[widths.length - 1]);
  return {
    avif: srcset("avif"),
    webp: srcset("webp"),
    jpeg: `${cdn}/${path}`,
    origin: `${origin}/${path}/${VARIANT_SET}/w${variantWidthFor(fallbackWidth)}.webp`,
    width: v.width,
    height: v.height,
    lqip: v.lqip,
  };
}

/**
 * What the <picture> renders: per slot the AVIF / WebP / JPEG candidates, the
 * size, the placeholder; plus the description and a version key. With no
 * valid custom banner: the bundled one.
 * @param {object|null} config validateHero() output
 * @param {{ source?: object, staticLqip?: { desktop?: string, mobile?: string } }} [opts]
 */
export function resolveHero(config, { source = heroSource({}), staticLqip = {} } = {}) {
  if (config && config.desktop && config.mobile) {
    return {
      isStatic: false,
      version: config.version,
      alt: config.alt,
      cdnOrigin: source.delivery === "cdn" ? `https://${cdnHost(source)}` : null, // preconnect target
      desktop: dynamicSlot(config.desktop, "desktop", source),
      mobile: dynamicSlot(config.mobile, "mobile", source),
    };
  }
  const lqip = (s) => (typeof staticLqip[s] === "string" && LQIP_RE.test(staticLqip[s]) ? staticLqip[s] : "");
  return {
    isStatic: true,
    version: config && Number.isInteger(config.version) ? config.version : 0,
    alt: BUILT_IN_ALT,
    cdnOrigin: null,
    desktop: { ...STATIC_HERO.desktop, origin: null, lqip: lqip("desktop") },
    mobile: { ...STATIC_HERO.mobile, origin: null, lqip: lqip("mobile") },
  };
}
