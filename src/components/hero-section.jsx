// Full-width hero banner: the admin-managed pair (server.me docs/site-hero.md)
// or the bundled one, rendered on the server into the first HTML.
//
// Batch P: one <picture> instead of three next/image elements that were all
// `priority` + `unoptimized` — both the desktop and the mobile JPEG were
// preloaded on every device. Every candidate is a plain file (the bundled
// set from scripts/optimize-static-images.mjs, the admin's renditions on the
// Spaces CDN), so the hero never depends on runtime Image Optimization.
//
// The box is fixed per viewport — 530:720 below 768 px, 1920:740 from there
// (object-cover: an admin crop is exact, the bundled 2805×1080 art trims
// under a pixel) — so nothing shifts while the image loads, whichever banner
// it is. The desktop sources carry `min-width: 768px` and the phone set is
// the default: `max-width: 767px` left fractional widths (zoom) between 767
// and 768 px matching neither branch.
//
// WebKit: React renders this subtree on the client on desktop today (the
// streamed page segment is revealed after hydration begins) and sets an
// <img>'s attributes before the element joins its <picture>; WebKit starts
// loading an <img> the moment it has a real src, so a real <img src> meant a
// second full-size download on almost every load (measured: 33–35 of 39).
// hero-picture.jsx keeps every candidate in <source>s (0 of 78).
//
// A placeholder (a 24 px WebP, ~300 B inline) shows under the image until it
// paints — far below Chrome's 0.05 bits-per-pixel floor, so it never counts
// as the LCP element. No fade on the LCP image: it would delay LCP.
import { preconnect } from "react-dom";
import HeroPicture from "./hero-picture";
import { heroSource, resolveHero } from "@/lib/hero";
import staticLqip from "../../public/images/hero/gen/hero-lqip.json";

// config: validateHero() output (lib/server/site-hero.ts) or null
export default function HeroSection({ config }) {
  const source = heroSource(process.env);
  const fallback = resolveHero(null, { source, staticLqip });
  const hero = config ? resolveHero(config, { source, staticLqip }) : fallback;
  if (!hero.isStatic && hero.cdnOrigin) preconnect(hero.cdnOrigin); // direct-CDN delivery only
  return (
    <div className="pt-32 md:pt-46 w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden">
      {/* padding on the wrapper: aspect-ratio on a border-box img would eat it */}
      <div className="w-full pt-6 md:pt-8 lg:pt-[58px]">
        <HeroPicture key={`${hero.isStatic ? "static" : "custom"}-${hero.version}`} hero={hero} fallback={fallback} />
      </div>
    </div>
  );
}
