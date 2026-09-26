"use client";
/* eslint-disable @next/next/no-img-element */
// The hero <picture> with a bounded fallback (server.me docs/site-hero.md).
//
// A <picture> whose selected source fails does NOT try its other sources, so
// recovery is explicit, one step at a time, each re-rendering the picture
// WITHOUT the sources that failed (changing only <img src> would leave the
// failing <source> selected):
//   0. the CDN renditions (AVIF, WebP, JPEG) — every successful load;
//   1. the same art's WebP straight from the Spaces origin (a CDN problem);
//   2. the bundled banner and its description;
// then it stops. An error that happened before hydration is caught from the
// element's state on mount (complete with no pixels). The parent keys this
// component by banner version, so a new banner starts again at step 0.
//
// Candidates live in <source>s only; the <img> carries a 1×1 inline GIF.
// React sets an <img>'s attributes before the element joins its <picture>
// when it renders on the client, and WebKit starts loading an <img> as soon
// as it has a real src — a second full-size download (see hero-section.jsx).
import { useCallback, useEffect, useRef, useState } from "react";

const DESKTOP = "(min-width: 768px)";
const INLINE_1PX = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const lqipVar = (s) => (s ? `url("${s}")` : "none");

export default function HeroPicture({ hero, fallback }) {
  const steps = hero.isStatic ? 1 : 3;
  const [step, setStep] = useState(0);
  const imgRef = useRef(null);
  const next = useCallback(() => setStep((s) => (s < steps - 1 ? s + 1 : s)), [steps]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0 && img.currentSrc && !img.currentSrc.startsWith("data:")) next();
  }, [step, next]);

  const shown = step === 2 ? fallback : hero;
  const style = { "--lqip-m": lqipVar(shown.mobile.lqip), "--lqip-d": lqipVar(shown.desktop.lqip) };
  const img = (
    <img
      ref={imgRef}
      src={INLINE_1PX}
      alt={shown.alt}
      width={shown.mobile.width}
      height={shown.mobile.height}
      fetchPriority="high"
      decoding="async"
      elementtiming="hero-banner"
      onError={next}
      style={style}
      className="block w-full h-auto object-cover aspect-[530/720] md:aspect-[1920/740] bg-cover bg-center bg-no-repeat bg-[image:var(--lqip-m)] md:bg-[image:var(--lqip-d)]"
    />
  );

  // Each step is a new <picture> (key): replacing its <source>s one by one
  // would let WebKit re-select on every intermediate state (an extra fetch).
  if (step === 1) {
    return (
      <picture key="origin">
        <source media={DESKTOP} srcSet={hero.desktop.origin} />
        <source srcSet={hero.mobile.origin} />
        {img}
      </picture>
    );
  }
  return (
    <picture key={step === 2 ? "bundled" : "cdn"}>
      <source media={DESKTOP} type="image/avif" srcSet={shown.desktop.avif} sizes="100vw" />
      <source media={DESKTOP} type="image/webp" srcSet={shown.desktop.webp} sizes="100vw" />
      <source media={DESKTOP} srcSet={shown.desktop.jpeg} sizes="100vw" />
      <source type="image/avif" srcSet={shown.mobile.avif} sizes="100vw" />
      <source type="image/webp" srcSet={shown.mobile.webp} sizes="100vw" />
      <source srcSet={shown.mobile.jpeg} sizes="100vw" />
      {img}
    </picture>
  );
}
