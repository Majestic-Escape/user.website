// src/app/stay/[id]/page.jsx - server component for the stay detail page.
//
// Rendering/caching policy (see the ISR notes below): the route output for a
// listing is generated on first visit, cached for an hour and served from the
// edge, then refreshed in the background. The client re-fetches the listing
// on mount (placeholderData in PropertyPageClient) and availability / fees /
// booking totals are always fetched live, so nothing price- or
// availability-critical depends on this cache.
import { notFound } from "next/navigation";
import PropertyPageClient from "./PropertyPageClient";

// ISR: cache each listing's HTML + RSC payload for 1 hour (matches the Data
// Cache window on fetchProperty below).
export const revalidate = 3600;

// Build nothing ahead of time; with `dynamicParams` (default true) each
// listing is rendered on its first request and then cached. Without this a
// dynamic segment stays fully dynamic and `revalidate` has no effect.
export async function generateStaticParams() {
  return [];
}

// Listing ids are Mongo ObjectIds. Anything else ("abc", a mistyped
// 25-char id, …) can never resolve to a listing, so it is a 404 decided here
// without a backend round-trip. This also shields the page from the API,
// which currently answers such ids with a 500 (an uncaught Mongoose
// CastError — tracked for Batch S) that used to surface as a raw 500 page.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const isListingId = (id) => typeof id === "string" && OBJECT_ID.test(id);

// Status codes that mean "there is no such listing" as opposed to "the API
// failed": 404 (missing) and 400 (malformed id, once the API validates it).
const NOT_FOUND_STATUSES = new Set([400, 404]);

// Function to fetch property data (server-side)
async function fetchProperty(id) {
  if (!id) throw new Error("Property ID is missing");

  // Server-side fetch needs a fully-qualified URL. NEXT_PUBLIC_API_BASE_URL is
  // typically a relative path ("/api/v1") that only resolves in the browser,
  // so prefer BACKEND_URL on the server.
  const API_URL =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${API_URL}/properties/${id}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
    // A hung backend must become an error (error.jsx / 500) within a bounded
    // time instead of holding the render until the platform kills it.
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const error = new Error(
      `Failed to fetch property data (status: ${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  const result = await response.json();
  return result.data;
}

// DYNAMIC METADATA FOR PROPERTY PAGE
export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!isListingId(id)) notFound();
  try {
    const property = await fetchProperty(id);
    const siteUrl = process.env.NEXTAUTH_URL;

    return {
      title: `${property.title} | Majestic Escape`,
      description:
        property.description ||
        `Book ${property.title} in ${property.address?.city || "Goa"}. ${property.basePrice ? `₹${property.basePrice} per night` : ""}`,

      openGraph: {
        title: property.title,
        description:
          property.description ||
          `Experience ${property.title} with Majestic Escape. ${property.basePrice ? `₹${property.basePrice} per night` : ""}`,
        url: `${siteUrl}/stay/${id}`,
        siteName: "Majestic Escape",
        images: [
          {
            url: property.photos?.[0] || `${siteUrl}/default-property.jpg`,
            width: 1200,
            height: 630,
            alt: property.title,
          },
        ],
        locale: "en_IN",
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: property.title,
        description:
          property.description || `Book ${property.title} on Majestic Escape`,
        images: [property.photos?.[0] || `${siteUrl}/default-property.jpg`],
      },

      other: {
        "og:price:amount": property.basePrice?.toString() || "",
        "og:price:currency": "INR",
      },
    };
  } catch (error) {
    // Keep metadata consistent with the not-found render below. Note: because
    // this segment sits under loading.tsx boundaries, the 200 shell has already
    // streamed by the time notFound() propagates, so unknown ids render the
    // not-found UI with <meta name="robots" content="noindex"> rather than a
    // 404 status (a Next streaming limitation; previously this was a 200 error
    // page without noindex).
    if (NOT_FOUND_STATUSES.has(error?.status)) notFound();
    console.error("Error generating metadata:", error);
    return {
      title: "Property | Majestic Escape",
      description: "Discover amazing properties on Majestic Escape",
    };
  }
}

// Server component that fetches data and passes to client
export default async function PropertyPage({ params }) {
  const { id } = await params;
  if (!isListingId(id)) notFound();
  let property;
  try {
    property = await fetchProperty(id);
  } catch (error) {
    if (NOT_FOUND_STATUSES.has(error?.status)) notFound();
    // Any other failure must surface as an error (handled by ./error.jsx),
    // never as a successful render: with ISR a rendered error page would be
    // cached and served for an hour.
    throw error;
  }
  return <PropertyPageClient initialProperty={property} params={{ id }} />;
}
