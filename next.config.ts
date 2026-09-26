import type { NextConfig } from "next";

// The admin-managed homepage banner (src/lib/hero.js, server.me
// docs/site-hero.md) is served from this domain: the LCP image reuses the
// page's connection instead of opening one to the CDN first. Only the exact
// shape of a banner rendition is forwarded — never any other object of the
// bucket — to the Spaces CDN (immutable objects; vercel.json lets Vercel's
// edge cache them). Same bucket/prefix rules as heroSource() in
// src/lib/hero.js (scripts/check-hero.mjs holds the two together).
const HERO_BUCKET = /^[a-z0-9][a-z0-9-]{1,62}\.[a-z0-9]{2,12}$/.test(process.env.SITE_HERO_BUCKET || "")
  ? (process.env.SITE_HERO_BUCKET as string)
  : "majestic-escape-host-properties.blr1";
const HERO_PREFIX =
  !process.env.VERCEL && /^_qa\/site\/hero\/[a-z0-9-]{1,40}\/$/.test(process.env.SITE_HERO_PREFIX || "")
    ? (process.env.SITE_HERO_PREFIX as string)
    : "site/hero/";
const HERO_REWRITE = {
  source:
    "/_hero/:slot(desktop|mobile)/:file([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.jpg)/v1/:variant(w[0-9]{2,4}\\.avif|w[0-9]{2,4}\\.webp)",
  destination: `https://${HERO_BUCKET}.cdn.digitaloceanspaces.com/${HERO_PREFIX}:slot/:file/v1/:variant`,
};

const nextConfig: NextConfig = {
  images: {
    // Listing photos and profile pictures are served from pre-generated
    // variants on the Spaces CDN (src/lib/spaces-image.js, MediaImage) and
    // never touch the optimizer; the settings below now only concern the
    // site's own static images. 960, 1280, 1600 and 2560 are added to the
    // default device sizes so the srcset can name every CDN variant (no static
    // image renders at a width that snaps to any of them — checked against
    // every static `width` prop — so their optimizer URLs and cache entries
    // are unchanged).
    deviceSizes: [640, 750, 828, 960, 1080, 1200, 1280, 1600, 1920, 2048, 2560, 3840],
    // Batch P: optimised static images stay cached for 31 days instead of
    // the 60-second default → fewer re-transformations of the same image.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "majesticescape.blr1.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname:
          "majestic-escape-host-properties.blr1.cdn.digitaloceanspaces.com",
      },

      {
        protocol: "https",
        hostname: "majesticescape.blr1.cdn.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "majestic-escape-host-properties.blr1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "s3-media0.fl.yelpcdn.com",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:5005/api/v1";
    return [
      HERO_REWRITE,
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      // The legacy /chat/[propertyId] page (a third, unmaintained copy of the
      // messaging UI that nothing linked to) was removed; old bookmarks land
      // on the real inbox.
      {
        source: "/chat/:propertyId",
        destination: "/messages",
        permanent: false,
      },

      // 1. Redirect www to non-www (HTTPS version)
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.majesticescape.in",
          },
        ],
        destination: "https://majesticescape.in/:path*",
        permanent: true, // 301 redirect
      },

      // 2. HTTP to HTTPS redirect (if not handled automatically)
      // This catches both majesticescape.in and www.majesticescape.in on HTTP
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
        destination: "https://majesticescape.in/:path*",
        permanent: true,
      },
    ];
  },

  /* config options here */
};

export default nextConfig;
