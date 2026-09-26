// Batch P — pre-generates the responsive variants of the static marketing
// images (hero banners, destination spots, mobile tab icons) so they are
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
// refresh the tiny blurred placeholders in hero/gen/hero-lqip.json.
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
      if (format === "avif") pipeline = pipeline.avif(settings ? settings.avif : { quality: quality.avif, effort: 6 });
      if (format === "webp") pipeline = pipeline.webp(settings ? settings.webp : { quality: quality.webp, effort: 5 });
      if (format === "jpeg") pipeline = pipeline.jpeg(settings ? settings.jpeg : { quality: quality.jpeg, mozjpeg: true, progressive: true });
      await pipeline.toFile(target);
      const { size } = await stat(target);
      console.log(`${job.src} ${meta.width}x${meta.height} → ${path.relative(pub, target).replace(/\\/g, "/")} ${Math.round(size / 1024)} KB`);
    }
  }
}

// Hero placeholders: a 24 px WebP of each banner, shown as the hero box's
// background until the real image paints (≈300 B inline; far below Chrome's
// 0.05 bits-per-pixel floor, so it never becomes the LCP candidate).
const lqipFile = path.join(pub, "hero", "gen", "hero-lqip.json");
const lqip = JSON.parse(await readFile(lqipFile, "utf8").catch(() => "{}"));
for (const job of jobs.filter((j) => j.lqip)) {
  const buf = await sharp(path.join(pub, job.src)).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  lqip[job.lqip] = `data:image/webp;base64,${buf.toString("base64")}`;
}
await writeFile(lqipFile, JSON.stringify(lqip, null, 2) + "\n");
console.log(`hero LQIPs → ${path.relative(pub, lqipFile).replace(/\\/g, "/")} (${Object.entries(lqip).map(([k, v]) => `${k} ${v.length} chars`).join(", ")})`);
