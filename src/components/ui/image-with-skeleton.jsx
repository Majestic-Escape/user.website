"use client";

import { useState, useEffect } from "react";
import MediaImage from "@/components/ui/media-image";
import { Skeleton } from "@/components/ui/skeleton";

// Wraps next/image with a Skeleton overlay that disappears once the binary
// load fires (or errors). Lives inside a relative-positioned container.
//
// Usage mirrors next/image. Pass `fill`, `sizes`, `className`, etc. as usual —
// the className applies to the underlying <img>, NOT the skeleton. The photo
// comes from the Spaces CDN variants (MediaImage); the conversation thumbnails
// this wraps are 20–112 CSS px, hence the default `sizes`.
export function ImageWithSkeleton({
  src,
  alt,
  fill,
  sizes = "112px",
  className = "",
  onLoad,
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  // Reset skeleton when src changes (e.g., switching conversations).
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <>
      {!loaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      <MediaImage
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        className={`${className} transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={(e) => {
          setLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          // Drop the skeleton even on error so the underlying empty alt-text is visible
          setLoaded(true);
          if (onError) onError(e);
        }}
        {...rest}
      />
    </>
  );
}
