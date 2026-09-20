"use client";

import Image, { type ImageProps } from "next/image";
import {
  forwardRef,
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";
import {
  VARIANTS_ENABLED,
  isSpacesUrl,
  masterUrl,
  spacesLoader,
  variantSrcSet,
  variantUrl,
} from "@/lib/spaces-image";

// Listing photos and profile pictures.
//
// MediaImage is next/image with the Spaces loader: next/image still builds
// the srcset from `sizes`/`width`, lazy-loads, reserves layout and preloads
// `priority` images, but every candidate URL is a pre-generated WebP on the
// Spaces CDN (src/lib/spaces-image.js) — no /_next/image, no Vercel image
// transformation, nothing touches server.me or the database to show a
// photo. Anything that is not a Spaces object (a local asset, a foreign
// host, a blob: preview) renders through the default next/image path
// unchanged.
//
// If a variant is missing (a photo the backfill has not reached, one size
// whose upload failed) the <img> errors once and the component re-renders
// with the sanitised master served as-is — never through /_next/image — so
// a mixed rollout cannot show a broken image. The caller's onError only
// fires when the master fails too.
export type MediaImageProps = ImageProps;

export const MediaImage = forwardRef<HTMLImageElement, MediaImageProps>(
  function MediaImage({ src, onError, unoptimized, ...props }, ref) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const url = typeof src === "string" ? src : null;
    const fallback = url !== null && failedSrc === url;
    const cdn = VARIANTS_ENABLED && !fallback && url !== null && isSpacesUrl(url);
    return (
      <Image
        ref={ref}
        {...props}
        src={fallback ? masterUrl(url) : src}
        loader={cdn ? spacesLoader : undefined}
        unoptimized={fallback ? true : unoptimized}
        onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
          if (cdn) {
            setFailedSrc(url);
            return;
          }
          if (onError) onError(e);
        }}
      />
    );
  },
);

// A plain <img> for places that cannot use next/image (previews that may be
// blob: URLs, markup that must stay a bare img). `renderWidth` is the CSS
// width the image is shown at; the srcset covers 1x and 2x of it.
export type MediaImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  src?: string;
  renderWidth?: number;
};

export function MediaImg({
  src,
  renderWidth = 320,
  srcSet,
  onError,
  ...props
}: MediaImgProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const cdn = VARIANTS_ENABLED && !!src && failedSrc !== src && isSpacesUrl(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={cdn ? (variantUrl(src as string, renderWidth) as string) : src}
      srcSet={cdn ? variantSrcSet(src as string, renderWidth) : srcSet}
      onError={(e) => {
        if (cdn) {
          setFailedSrc(src as string);
          return;
        }
        if (onError) onError(e);
      }}
    />
  );
}

export default MediaImage;
