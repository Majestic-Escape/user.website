/* eslint-disable @next/next/no-img-element */
// Full-width hero banner.
//
// Batch P: one <picture> instead of three next/image elements that were all
// `priority` + `unoptimized` — both the desktop and the mobile JPEG (654 KB
// + 968 KB) were preloaded on every device. The variants are generated once
// by scripts/optimize-static-images.mjs and served as plain files, so the
// hero never depends on runtime Image Optimization (whose Hobby quota would
// answer 402 and blank it). The CSS aspect ratios reserve the exact box per
// viewport (the desktop file is 2805×1080, the phone file 1060×1440 — the
// designer's 530:720 at 2×), so nothing shifts while the image loads.
//
// The desktop sources carry `min-width: 768px` and the phone set is the
// default: with `max-width: 767px` on the phone sources, a fractional
// viewport between 767 and 768 px (zoom, scaled displays) matched neither
// the phone media query nor Tailwind's `md:` and showed the desktop image in
// the phone box.
//
// Every real candidate lives in a <source> (the untyped JPEG sets serve
// browsers without AVIF/WebP); the <img> itself only carries a 1×1 inline
// GIF. When React renders this subtree on the client (it does on desktop
// today — see the hero report), it sets the <img>'s attributes before the
// element joins its <picture>, and WebKit starts loading an <img> the moment
// it gets a real src — a second full-size JPEG download on every such load
// (measured: 4/4 loads before, 0/4 with the inline src). An inline src costs
// no request; the <picture> still picks the right file once attached.
const HERO = "/images/hero/gen";
const INLINE_1PX = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const desktop = (ext) => `${HERO}/banner-1280.${ext} 1280w, ${HERO}/banner-1920.${ext} 1920w, ${HERO}/banner-2560.${ext} 2560w`;
const phone = (ext) => `${HERO}/mobile-banner-640.${ext} 640w, ${HERO}/mobile-banner-960.${ext} 960w, ${HERO}/mobile-banner-1060.${ext} 1060w`;
const DESKTOP = "(min-width: 768px)";

export default function HeroSection() {
  return (
    <div className="pt-32 md:pt-46 w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden">
      {/* padding on the wrapper: aspect-ratio on a border-box img would eat it */}
      <div className="w-full pt-6 md:pt-8 lg:pt-[58px]">
        <picture>
          <source media={DESKTOP} type="image/avif" srcSet={desktop("avif")} sizes="100vw" />
          <source media={DESKTOP} type="image/webp" srcSet={desktop("webp")} sizes="100vw" />
          <source media={DESKTOP} srcSet={desktop("jpeg")} sizes="100vw" />
          <source type="image/avif" srcSet={phone("avif")} sizes="100vw" />
          <source type="image/webp" srcSet={phone("webp")} sizes="100vw" />
          <source srcSet={phone("jpeg")} sizes="100vw" />
          <img
            src={INLINE_1PX}
            alt="Majestic Escape — handpicked homestays across India"
            width={1060}
            height={1440}
            fetchPriority="high"
            decoding="async"
            className="block w-full h-auto object-contain aspect-[530/720] md:aspect-[2805/1080]"
          />
        </picture>
      </div>
    </div>
  );
}
