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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.majesticescape.in",
          },
        ],
        destination: "https://majesticescape.in/:path*",
        permanent: true,
      },

      {
        source: "/blog/1",
        destination: "/blog/top-5-reasons-why-homestays-are-better-than-hotels",
        permanent: true,
      },
      {
        source: "/blog/2",
        destination:
          "/blog/how-to-plan-a-budget-trip-without-compromising-comfort",
        permanent: true,
      },
      {
        source: "/blog/3",
        destination: "/blog/top-5-reasons-why-homestays-are-better-than-hotels",
        permanent: true,
      },
      {
        source: "/blog/4",
        destination:
          "/blog/spice-of-life-a-culinary-journey-through-goan-cuisine",
        permanent: true,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
