// The host wizard's illustrations as pre-generated WebP
// (scripts/optimize-static-images.mjs → public/images/host/gen) instead of
// the 1–1.4 MB PNGs. width/height are the source's: an <img> with a
// w-descriptor srcset otherwise takes its intrinsic size from `sizes`, and
// the step-one picture (no width class) would change size.
const GEN = "/images/host/gen";
const make = (name, width, height) => ({
  src: `${GEN}/${name}-800.webp`,
  srcSet: [400, 800, width].map((w) => `${GEN}/${name}-${w}.webp ${w}w`).join(", "),
  width,
  height,
});

export const HOST_ILLUSTRATIONS = Object.freeze({
  stepOne: make("step-one-illustration", 1080, 1080),
  stepTwo: make("step-two-illustration", 1080, 1080),
  stepThree: make("step-three-illustration", 1080, 1080),
  homeStay: make("home-stay", 1079, 953),
});
