"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Wraps next/image with a Skeleton overlay that disappears once the binary
// load fires (or errors). Lives inside a relative-positioned container.
//
// Usage mirrors next/image. Pass `fill`, `sizes`, `className`, etc. as usual —
// the className applies to the underlying <img>, NOT the skeleton.
export function ImageWithSkeleton({
  src,
  alt,
  fill,
  sizes,
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
      <Image
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
