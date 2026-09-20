import type { NextConfig } from "next";

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
