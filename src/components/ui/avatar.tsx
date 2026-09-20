"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import {
  VARIANTS_ENABLED,
  isSpacesUrl,
  variantSrcSet,
  variantUrl,
} from "@/lib/spaces-image"

// Avatars render at 32–112 CSS px; the 160 / 320 px variants cover DPR 1–3.
const AVATAR_RENDER_WIDTH = 160

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// A profile picture in Spaces is shown from its pre-generated CDN variant
// (src/lib/spaces-image.js) instead of the full-size master; if the variant
// is missing the master is used and the fallback initials never show for a
// photo that exists.
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, srcSet, onLoadingStatusChange, ...props }, ref) => {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const cdn = VARIANTS_ENABLED && failedSrc !== src && isSpacesUrl(src)
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={cdn ? (variantUrl(src, AVATAR_RENDER_WIDTH) as string) : src}
      srcSet={cdn ? variantSrcSet(src, AVATAR_RENDER_WIDTH) : srcSet}
      onLoadingStatusChange={(status) => {
        if (status === "error" && cdn) {
          setFailedSrc(src ?? null)
          return
        }
        if (onLoadingStatusChange) onLoadingStatusChange(status)
      }}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
