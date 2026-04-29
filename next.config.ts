import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
