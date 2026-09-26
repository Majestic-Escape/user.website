// Homepage banner guard (run: npm run check:hero).
//
// 1. Contract with the server: src/lib/hero.js derives the same rendition
//    widths and storage keys as server.me services/siteHeroImage.js — the
//    vectors are copied from server.me tests/batch-s/fixtures.
// 2. The payload validator refuses everything that is not exactly our
//    bucket, our prefix and the slot's box, so a bad or hostile API answer
//    can only ever mean "show the bundled banner".
// 3. The resolved <picture> candidates: true pixel widths in the srcset, the
//    derived keys, AVIF + WebP + JPEG, the bundled set when nothing is custom.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hero = await import(pathToFileURL(path.join(root, "src/lib/hero.js")).href);
const problems = [];
const expect = (ok, what) => {
  if (!ok) problems.push(what);
};

// --- 1. vectors -------------------------------------------------------------
const vectors = JSON.parse(fs.readFileSync(path.join(root, "scripts/fixtures/hero-renditions-vectors.json"), "utf8"));
const spaces = await import(pathToFileURL(path.join(root, "src/lib/spaces-image.js")).href);
expect(JSON.stringify(vectors.renditionSteps) === JSON.stringify(hero.RENDITION_STEPS), `rendition steps: site ${hero.RENDITION_STEPS} vs server ${vectors.renditionSteps}`);
expect(JSON.stringify(vectors.variantWidths) === JSON.stringify(spaces.VARIANT_WIDTHS), "variant widths differ from the server");
for (const s of ["desktop", "mobile"]) {
  expect(Math.abs(vectors.slots[s].ratio - hero.HERO_SLOTS[s].ratio) < 1e-12 && vectors.slots[s].cap === hero.HERO_SLOTS[s].cap && vectors.slots[s].renditionCap === hero.HERO_SLOTS[s].renditionCap && vectors.slots[s].renditionMin === hero.HERO_SLOTS[s].renditionMin, `${s} slot differs from the server`);
}
for (const v of vectors.vectors) {
  const widths = hero.heroRenditionWidths(v.masterWidth, v.slot);
  expect(JSON.stringify(widths) === JSON.stringify(v.widths), `heroRenditionWidths(${v.masterWidth}, ${v.slot}) = ${widths} ≠ ${v.widths}`);
  expect(JSON.stringify(widths.map(spaces.variantWidthFor)) === JSON.stringify(v.keyWidths), `keys for ${v.masterWidth} ${v.slot}`);
}

// --- 2. validation -------------------------------------------------------------
const source = hero.heroSource({});
const uuid = "6f2c1f8e-1b1d-4a57-9b2a-0123456789ab";
const url = (slot, { host = "majestic-escape-host-properties.blr1.digitaloceanspaces.com", key = `site/hero/${slot}/${uuid}.jpg`, proto = "https:" } = {}) => `${proto}//${host}/${key}`;
const ok = () => ({
  version: 3,
  alt: "Rann Utsav — the white desert",
  desktop: { url: url("desktop"), width: 2805, height: 1080, lqip: "data:image/webp;base64,UklGRg==" },
  mobile: { url: url("mobile"), width: 1060, height: 1440, lqip: "" },
});
const good = hero.validateHero(ok(), source);
expect(good && good.desktop.key === `site/hero/desktop/${uuid}.jpg` && good.alt === "Rann Utsav — the white desert", "a valid payload is accepted");
expect(!!hero.validateHero({ ...ok(), desktop: { ...ok().desktop, url: url("desktop", { host: "majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com" }) } }, source), "the CDN host is accepted");
expect(JSON.stringify(hero.validateHero({ version: 2, alt: null, desktop: null, mobile: null }, source)) === JSON.stringify({ version: 2, alt: null, desktop: null, mobile: null }), "no custom banner");
const rejects = [
  ["foreign bucket", { desktop: { ...ok().desktop, url: url("desktop", { host: "evil-bucket.blr1.digitaloceanspaces.com" }) } }],
  ["foreign host", { desktop: { ...ok().desktop, url: "https://majestic-escape-host-properties.blr1.digitaloceanspaces.com.evil.com/site/hero/desktop/x.jpg" } }],
  ["http", { desktop: { ...ok().desktop, url: url("desktop", { proto: "http:" }) } }],
  ["javascript:", { desktop: { ...ok().desktop, url: "javascript:alert(1)" } }],
  ["credentials", { desktop: { ...ok().desktop, url: `https://user:pw@majestic-escape-host-properties.blr1.digitaloceanspaces.com/site/hero/desktop/${uuid}.jpg` } }],
  ["port", { desktop: { ...ok().desktop, url: `https://majestic-escape-host-properties.blr1.digitaloceanspaces.com:8443/site/hero/desktop/${uuid}.jpg` } }],
  ["query", { desktop: { ...ok().desktop, url: `${url("desktop")}?x=1` } }],
  ["hash", { desktop: { ...ok().desktop, url: `${url("desktop")}#x` } }],
  ["wrong prefix", { desktop: { ...ok().desktop, url: url("desktop", { key: `listings/64b000000000000000000001/${uuid}.jpg` }) } }],
  ["slot swapped", { desktop: { ...ok().desktop, url: url("mobile") } }],
  ["not a uuid key", { desktop: { ...ok().desktop, url: url("desktop", { key: "site/hero/desktop/../../x.jpg" }) } }],
  ["encoded traversal", { desktop: { ...ok().desktop, url: url("desktop", { key: "site/hero/desktop/%2e%2e%2fx.jpg" }) } }],
  ["wider than the cap", { desktop: { ...ok().desktop, width: 3841, height: 1480 } }],
  ["not the box", { desktop: { ...ok().desktop, width: 2000, height: 1000 } }],
  ["fractional size", { desktop: { ...ok().desktop, width: 1920.5, height: 740 } }],
  ["mobile only", { desktop: null }],
  ["empty alt", { alt: "  " }],
  ["long alt", { alt: "x".repeat(151) }],
  ["alt not text", { alt: { toString: () => "x" } }],
  ["bad version", { version: -1 }],
  ["version as text", { version: "3" }],
];
for (const [label, patch] of rejects) expect(hero.validateHero({ ...ok(), ...patch }, source) === null, `refused: ${label}`);
expect(hero.validateHero({ ...ok(), desktop: { ...ok().desktop, lqip: "data:text/html;base64,PHNjcmlwdD4=" } }, source).desktop.lqip === "", "a bad placeholder is dropped, not rendered");
expect(hero.validateHero("nope", source) === null && hero.validateHero(null, source) === null, "non-objects refused");
// QA prefix: only when configured and not on a Vercel deployment
const qa = hero.heroSource({ SITE_HERO_PREFIX: "_qa/site/hero/run-7/", SITE_HERO_BUCKET: "test-bucket.blr1" });
expect(qa.prefix === "_qa/site/hero/run-7/" && qa.bucket === "test-bucket.blr1", "QA source honoured locally");
expect(hero.heroSource({ SITE_HERO_PREFIX: "_qa/site/hero/run-7/", VERCEL: "1" }).prefix === "site/hero/", "QA prefix ignored on Vercel");
expect(hero.heroSource({ SITE_HERO_PREFIX: "../evil/" }).prefix === "site/hero/", "invalid prefix ignored");
expect(hero.validateHero(ok(), qa) === null, "production keys are not accepted by a QA source");

// --- 3. resolution ---------------------------------------------------------------
// default delivery: renditions from this site's /_hero path (next.config.ts)
const r = hero.resolveHero(good, { source });
expect(source.delivery === "site", "site delivery is the default");
expect(!r.isStatic && r.alt === good.alt && r.version === 3, "custom banner resolved");
expect(r.desktop.avif.split(", ").length === 5 && r.desktop.avif.endsWith(`/_hero/desktop/${uuid}.jpg/v1/w2560.avif 2560w`) && !r.desktop.avif.includes("2805w") && r.desktop.avif.startsWith(`/_hero/desktop/${uuid}.jpg/v1/w960.avif 960w`), `desktop avif srcset: ${r.desktop.avif}`);
expect(r.mobile.webp === ["640", "960", "1060"].map((w) => `/_hero/mobile/${uuid}.jpg/v1/w${spaces.variantWidthFor(Number(w))}.webp ${w}w`).join(", "), `mobile webp srcset: ${r.mobile.webp}`);
expect(r.desktop.jpeg === `https://majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com/site/hero/desktop/${uuid}.jpg`, "JPEG fallback is the master on the CDN");
expect(r.mobile.origin === `https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/site/hero/mobile/${uuid}.jpg/v1/w1280.webp`, `origin fallback: ${r.mobile.origin}`);
expect(r.cdnOrigin === null, "no preconnect needed for site delivery");
// HERO_DELIVERY=cdn: the CDN directly, with a preconnect
const cdnSource = hero.heroSource({ HERO_DELIVERY: "cdn" });
const rc = hero.resolveHero(good, { source: cdnSource });
expect(rc.desktop.avif.endsWith(`https://majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com/site/hero/desktop/${uuid}.jpg/v1/w2560.avif 2560w`), `cdn delivery desktop avif: ${rc.desktop.avif}`);
expect(rc.mobile.webp === ["640", "960", "1060"].map((w) => `https://majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com/site/hero/mobile/${uuid}.jpg/v1/w${spaces.variantWidthFor(Number(w))}.webp ${w}w`).join(", "), `cdn delivery mobile webp: ${rc.mobile.webp}`);
expect(rc.cdnOrigin === "https://majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com", "preconnect origin for cdn delivery");
expect(rc.mobile.origin === r.mobile.origin && rc.desktop.jpeg === r.desktop.jpeg, "fallbacks do not depend on the delivery");

// --- 4. the rewrite in next.config.ts forwards exactly what resolveHero emits ------
// Loaded as the real config (Node strips its types), matched with Next's own
// path-to-regexp; the destination must be the CDN URL of the very same object.
const { match, compile } = (await import("next/dist/compiled/path-to-regexp/index.js")).default;
async function heroRule(env) {
  const saved = { ...process.env };
  for (const k of ["VERCEL", "SITE_HERO_PREFIX", "SITE_HERO_BUCKET", "HERO_DELIVERY"]) delete process.env[k];
  Object.assign(process.env, env);
  try {
    const cfg = (await import(`${pathToFileURL(path.join(root, "next.config.ts")).href}?${new URLSearchParams(env)}`)).default;
    return (await cfg.rewrites()).find((x) => x.source.startsWith("/_hero/"));
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
}
for (const [label, env, src] of [
  ["production", { VERCEL: "1", SITE_HERO_PREFIX: "_qa/site/hero/run-7/" }, hero.heroSource({ VERCEL: "1", SITE_HERO_PREFIX: "_qa/site/hero/run-7/" })],
  ["local QA", { SITE_HERO_PREFIX: "_qa/site/hero/run-7/" }, hero.heroSource({ SITE_HERO_PREFIX: "_qa/site/hero/run-7/" })],
]) {
  const rule = await heroRule(env);
  expect(!!rule, `${label}: next.config.ts has the /_hero rewrite`);
  if (!rule) continue;
  const m = match(rule.source, { decode: decodeURIComponent });
  const dest = compile(rule.destination.replace(/^https:\/\/[^/]+/, ""), { encode: (x) => x });
  const destHost = rule.destination.match(/^https:\/\/([^/]+)/)[1];
  expect(destHost === `${src.bucket}.cdn.digitaloceanspaces.com`, `${label}: rewrite goes to the CDN of our bucket (${destHost})`);
  const payload = { ...ok(), desktop: { ...ok().desktop, url: `https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/${src.prefix}desktop/${uuid}.jpg` }, mobile: { ...ok().mobile, url: `https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/${src.prefix}mobile/${uuid}.jpg` } };
  const resolved = hero.resolveHero(hero.validateHero(payload, src), { source: src });
  const direct = hero.resolveHero(hero.validateHero(payload, src), { source: { ...src, delivery: "cdn" } });
  for (const slot of ["desktop", "mobile"]) {
    for (const fmt of ["avif", "webp"]) {
      const via = resolved[slot][fmt].split(", ").map((c) => c.split(" ")[0]);
      const cdn = direct[slot][fmt].split(", ").map((c) => c.split(" ")[0]);
      via.forEach((u, i) => {
        const hit = m(u);
        expect(!!hit, `${label}: ${u} is forwarded by the rewrite`);
        if (hit) expect(`https://${destHost}${dest(hit.params)}` === cdn[i], `${label}: ${u} → https://${destHost}${dest(hit.params)} ≠ ${cdn[i]}`);
      });
    }
  }
  // nothing but a rendition is ever forwarded
  for (const bad of [
    `/_hero/desktop/${uuid}.jpg`,
    `/_hero/desktop/../../listings/64b000000000000000000001/${uuid}.jpg/v1/w640.webp`,
    `/_hero/desktop/%2e%2e/${uuid}.jpg/v1/w640.webp`,
    `/_hero/other/${uuid}.jpg/v1/w640.avif`,
    `/_hero/desktop/${uuid}.png/v1/w640.avif`,
    `/_hero/desktop/${uuid}.jpg/v1/w640.svg`,
    `/_hero/desktop/${uuid}.jpg/v1/w640.avif/x`,
    `/_hero/desktop/${uuid}.jpg/v2/w640.avif`,
    `/_hero/desktop/not-a-uuid.jpg/v1/w640.avif`,
  ]) expect(!m(bad), `${label}: ${bad} must not be forwarded`);
}
const s = hero.resolveHero(null, { source, staticLqip: { desktop: "data:image/webp;base64,AAAA", mobile: "javascript:x" } });
expect(s.isStatic && s.alt === hero.BUILT_IN_ALT && s.desktop.avif === hero.STATIC_HERO.desktop.avif && s.desktop.lqip === "data:image/webp;base64,AAAA" && s.mobile.lqip === "", "bundled banner");
expect(hero.resolveHero({ version: 4, alt: null, desktop: null, mobile: null }, { source }).isStatic, "no custom banner → bundled");

if (problems.length) {
  console.error(`check-hero: ${problems.length} problem(s)`);
  for (const p of problems) console.error(" -", p);
  process.exit(1);
}
console.log(`check-hero: OK (${vectors.vectors.length} rendition vectors, ${rejects.length} refusals)`);
