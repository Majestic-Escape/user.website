/* eslint-disable @next/next/no-img-element */
// Full-width hero banner.
//
// Batch P: one <picture> instead of three next/image elements that were all
// `priority` + `unoptimized` — both the desktop and the mobile JPEG (654 KB
// + 968 KB) were preloaded on every device. The variants are generated once
// by scripts/optimize-static-images.mjs and served as plain files, so the
// hero never depends on runtime Image Optimization (whose Hobby quota would
// answer 402 and blank it). The CSS aspect ratios reserve the exact box per
// viewport (the desktop file is 2805×1080, the phone file 853×1844), so
// nothing shifts while the image loads.
const HERO = "/images/hero/gen";
const desktop = (ext) => `${HERO}/banner-1280.${ext} 1280w, ${HERO}/banner-1920.${ext} 1920w, ${HERO}/banner-2560.${ext} 2560w`;
const phone = (ext) => `${HERO}/mobile-banner-480.${ext} 480w, ${HERO}/mobile-banner-853.${ext} 853w`;

export default function HeroSection() {
  return (
    <div className="pt-32 md:pt-46 w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden">
      {/* padding on the wrapper: aspect-ratio on a border-box img would eat it */}
      <div className="w-full pt-6 md:pt-8 lg:pt-[58px]">
        <picture>
          <source media="(max-width: 767px)" type="image/avif" srcSet={phone("avif")} sizes="100vw" />
          <source media="(max-width: 767px)" type="image/webp" srcSet={phone("webp")} sizes="100vw" />
          <source media="(max-width: 767px)" srcSet={phone("jpeg")} sizes="100vw" />
          <source type="image/avif" srcSet={desktop("avif")} sizes="100vw" />
          <source type="image/webp" srcSet={desktop("webp")} sizes="100vw" />
          <img
            src={`${HERO}/banner-1920.jpeg`}
            srcSet={desktop("jpeg")}
            sizes="100vw"
            alt="Majestic Escape — handpicked homestays across India"
            width={2805}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="block w-full h-auto object-contain aspect-[853/1844] md:aspect-[2805/1080]"
          />
        </picture>
      </div>
    </div>
  );
}
