// Batch P — pre-generates the responsive variants of the static marketing
// images (hero banners, destination spots, mobile tab icons) so they are
// served as plain files: no runtime Image Optimization (Hobby quota, and a
// 402 on exhaustion would blank the hero), no double preload, right-sized
// bytes. Run once after changing a source image; commit the outputs.
//
//   node scripts/optimize-static-images.mjs
//
// Outputs go to public/images/<group>/gen/<name>-<width>.<ext>.
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const pub = path.join(root, "public", "images");

const jobs = [
  // hero: AVIF + WebP + JPEG fallback, widths that cover 1x/2x for each layout
  { src: "hero/Banner.jpeg", out: "hero/gen/banner", widths: [1280, 1920, 2560], formats: ["avif", "webp", "jpeg"] },
  { src: "hero/Mobile_Banner.jpeg", out: "hero/gen/mobile-banner", widths: [480, 853], formats: ["avif", "webp", "jpeg"] },
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

for (const job of jobs) {
  const input = path.join(pub, job.src);
  await mkdir(path.dirname(path.join(pub, job.out)), { recursive: true });
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    for (const format of job.formats) {
      const target = `${path.join(pub, job.out)}-${width}.${format}`;
      let pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      if (format === "avif") pipeline = pipeline.avif({ quality: quality.avif, effort: 6 });
      if (format === "webp") pipeline = pipeline.webp({ quality: quality.webp, effort: 5 });
      if (format === "jpeg") pipeline = pipeline.jpeg({ quality: quality.jpeg, mozjpeg: true, progressive: true });
      await pipeline.toFile(target);
      const { size } = await stat(target);
      console.log(`${job.src} ${meta.width}x${meta.height} → ${path.relative(pub, target).replace(/\\/g, "/")} ${Math.round(size / 1024)} KB`);
    }
  }
}
