// Batch P — pre-generates the responsive variants of the static marketing
// images (hero banners, destination spots, mobile tab icons, the experiences
// banner and tour photos, the host wizard illustrations) so they are
// served as plain files: no runtime Image Optimization (Hobby quota, and a
// 402 on exhaustion would blank the hero), no double preload, right-sized
// bytes. Run once after changing a source image; commit the outputs.
//
//   node scripts/optimize-static-images.mjs
//
// Outputs go to public/images/<group>/gen/<name>-<width>.<ext>.
//
//   node scripts/optimize-static-images.mjs --only=hero/Mobile_Banner.jpeg
//
// --only=<substring> regenerates just the matching sources, so an unchanged
// image keeps its committed bytes. Hero jobs carry the hero policy (measured
// in the admin-managed hero plan: AVIF q60 single generation beats the old
// q55 on SSIM at +16% bytes; WebP with smart chroma for text edges) and also
// refresh the tiny blurred placeholders in hero/gen/hero-lqip.json (a job's
// `lqipFile` names another placeholder file).
import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const pub = path.join(root, "public", "images");

// The hero policy (per-job settings override the defaults further down).
const HERO_SETTINGS = {
  resize: { kernel: "lanczos3", fastShrinkOnLoad: false },
  avif: { quality: 60, effort: 4 },
  webp: { quality: 85, effort: 3, smartSubsample: true },
  jpeg: { quality: 85, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" },
};
// The experiences banner (a watercolour): its paper texture needs more bits
// than the home banner's photo to clear the same bars — SSIM-Y ≥ 0.986
// desktop / 0.988 phone, 1st percentile ≥ 0.94, chroma ≥ 43 dB; WebP ≥ 0.985 /
// 0.93 — so each width gets the smallest quality that clears them (the job's
// `quality`, measured against the source resized with the same kernel).
const EXPERIENCES_SETTINGS = {
  resize: { kernel: "lanczos3", fastShrinkOnLoad: false },
  avif: { quality: 75, effort: 4 },
  webp: { quality: 88, effort: 4, smartSubsample: true },
  jpeg: { quality: 85, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" },
};
// Photos shown as content (the experiences tour cards): the listing-photo
// policy of the CDN variants (server.me services/imageSanitizer.js, WebP q85).
const PHOTO_SETTINGS = {
  resize: { kernel: "lanczos3", fastShrinkOnLoad: false },
  webp: { quality: 85, effort: 6, smartSubsample: true },
};
// Flat illustrations with transparency (host wizard): lossy WebP keeps the
// alpha lossless; q90 holds SSIM-Y ≥ 0.989 over white at a 20th of the PNG.
const ILLUSTRATION_SETTINGS = {
  resize: { kernel: "lanczos3" },
  webp: { quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true },
};

const jobs = [
  // hero: AVIF + WebP + JPEG fallback, widths that cover 1x/2x for each layout.
  // The desktop outputs predate the hero policy and are kept byte-for-byte
  // (regenerate with --only=hero/Banner.jpeg only when the art changes).
  { src: "hero/Banner.jpeg", out: "hero/gen/banner", widths: [1280, 1920, 2560], formats: ["avif", "webp", "jpeg"], lqip: "desktop" },
  // mobile: the designer's 1060×1440 (530:720 at 2×); 640/960 for 1–2.5× phones
  { src: "hero/Mobile_Banner.jpeg", out: "hero/gen/mobile-banner", widths: [640, 960, 1060], formats: ["avif", "webp", "jpeg"], settings: HERO_SETTINGS, lqip: "mobile" },
  // destination spots: rendered 100/200 px tall, ~4:3 → 300/600 px wide covers 2x
  ...["panjim.png", "ujjain.jpg", "nashik.jpg", "margao.jpg", "mapusa.jpg", "lucknow.jpg", "Varanasi.jpg", "ayodhya.jpg", "kutch.jpg"].map((f) => ({
    src: `spots/${f}`,
    out: `spots/gen/${f.replace(/\.[^.]+$/, "").toLowerCase()}`,
    widths: [300, 600],
    formats: ["webp"],
  })),
  // footer partner logos: 350×350 PNG with alpha, rendered 100–150 px → 300 px WebP (2x)
  ...["evoke.png", "nidhi.png", "goa-tourism.png", "goa-forest-dept.png", "rann_utsav.png"].map((f) => ({
    src: `govt/${f}`,
    out: `govt/gen/${f.replace(/\.[^.]+$/, "")}`,
    widths: [300],
    formats: ["webp"],
  })),
  // mobile tab icons: rendered 60–70 px wide; keep the source aspect, 2x
  ...["house1.png", "compass.png", "service1.png"].map((f) => ({
    src: `mobile/${f}`,
    out: `mobile/gen/${f.replace(/\.[^.]+$/, "")}`,
    widths: [140],
    formats: ["webp"],
  })),
  // experiences banner, desktop art (1600×843, shown from 768 px at 100vw)
  {
    src: "hero/Majestic Escape Web Banner.jpg.jpeg",
    out: "experiences/gen/banner",
    widths: [960, 1280, 1600],
    formats: ["avif", "webp", "jpeg"],
    settings: EXPERIENCES_SETTINGS,
    quality: { avif: { 960: 75, 1280: 75, 1600: 65 }, webp: { 960: 88, 1280: 88, 1600: 85 } },
  },
  // experiences banner, phone art (2000×2720, shown below 768 px; phones at
  // 2.5× and denser take the 2× candidate, as on the home page)
  {
    src: "hero/Majestic Escape Mobile Banner Final.jpg.jpeg",
    out: "experiences/gen/mobile-banner",
    widths: [640, 960, 1280, 1600],
    formats: ["avif", "webp", "jpeg"],
    settings: EXPERIENCES_SETTINGS,
    quality: { avif: { 640: 82, 960: 82, 1280: 81, 1600: 80 }, webp: { 640: 90, 960: 90, 1280: 90, 1600: 90 } },
  },
  // experiences tour cards: 1363 px photos shown 391–907 px wide (object-cover)
  ...["CHARDHAM_1.jpg", "do_dhaam.jpg", "statue_of_unity.jpg", "dwarka.jpg", "goa.jpg", "ram_mandir.jpg", "rann_utsav_1.jpg"].map((f) => {
    const name = f.replace(/\.[^.]+$/, "").toLowerCase();
    return { src: `tour/${f}`, out: `tour/gen/${name}`, widths: [480, 800, 1024, 1363], formats: ["webp"], settings: PHOTO_SETTINGS };
  }),
  // host wizard illustrations (1080 px PNGs with alpha, shown ≤ ~560 px): the
  // step ones live at the root of public/
  ...["../step-one-illustration.png", "../step-two-illustration.png", "../step-three-illustration.png", "home-stay.png"].map((f) => ({
    src: f,
    out: `host/gen/${path.basename(f, ".png")}`,
    widths: f === "home-stay.png" ? [400, 800, 1079] : [400, 800, 1080], // the source's own width last
    formats: ["webp"],
    settings: ILLUSTRATION_SETTINGS,
  })),
];

const quality = { avif: 55, webp: 75, jpeg: 78 };
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice("--only=".length);

for (const job of jobs) {
  if (only && !job.src.includes(only)) continue;
  const input = path.join(pub, job.src);
  const settings = job.settings || null;
  await mkdir(path.dirname(path.join(pub, job.out)), { recursive: true });
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    for (const format of job.formats) {
      const target = `${path.join(pub, job.out)}-${width}.${format}`;
      // hero jobs honour EXIF orientation; the older jobs keep their exact
      // pipeline so a full re-run reproduces their committed bytes
      let pipeline = settings ? sharp(input).rotate() : sharp(input);
      pipeline = pipeline.resize({ width, withoutEnlargement: true, ...(settings ? settings.resize : {}) });
      // a job may set the quality per width (measured, see EXPERIENCES_SETTINGS)
      const perWidth = job.quality && job.quality[format] && job.quality[format][width];
      const opts = (base) => (perWidth ? { ...base, quality: perWidth } : base);
      if (format === "avif") pipeline = pipeline.avif(opts(settings ? settings.avif : { quality: quality.avif, effort: 6 }));
      if (format === "webp") pipeline = pipeline.webp(opts(settings ? settings.webp : { quality: quality.webp, effort: 5 }));
      if (format === "jpeg") pipeline = pipeline.jpeg(opts(settings ? settings.jpeg : { quality: quality.jpeg, mozjpeg: true, progressive: true }));
      await pipeline.toFile(target);
      const { size } = await stat(target);
      console.log(`${job.src} ${meta.width}x${meta.height} → ${path.relative(pub, target).replace(/\\/g, "/")} ${Math.round(size / 1024)} KB`);
    }
  }
}

// Placeholders: a 24 px WebP of each banner / photo, shown as its box's
// background until the real image paints (≈300 B inline; far below Chrome's
// 0.05 bits-per-pixel floor, so it never becomes the LCP candidate). Each
// file keeps the entries of the jobs --only skipped.
const lqipJobs = jobs.filter((j) => j.lqip && (!only || j.src.includes(only)));
for (const file of new Set(lqipJobs.map((j) => j.lqipFile || "hero/gen/hero-lqip.json"))) {
  const lqipFile = path.join(pub, file);
  const lqip = JSON.parse(await readFile(lqipFile, "utf8").catch(() => "{}"));
  for (const job of lqipJobs.filter((j) => (j.lqipFile || "hero/gen/hero-lqip.json") === file)) {
    const buf = await sharp(path.join(pub, job.src)).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    lqip[job.lqip] = `data:image/webp;base64,${buf.toString("base64")}`;
  }
  await writeFile(lqipFile, JSON.stringify(lqip, null, 2) + "\n");
  console.log(`LQIPs → ${file} (${Object.entries(lqip).map(([k, v]) => `${k} ${v.length} chars`).join(", ")})`);
}
