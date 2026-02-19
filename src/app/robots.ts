import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/*",
        "/login",
        "/register",
        "/account/*",
        "/manage-bookings",
        "/messages",
        "/booking-summary",
        "/api/*",
        "/book/stay/*",
        "/_next/*",
        "/_vercel/*",
        "/static/*",
      ],
    },
    sitemap: `${process.env.NEXTAUTH_URL}/sitemap.xml`,
  };
}
