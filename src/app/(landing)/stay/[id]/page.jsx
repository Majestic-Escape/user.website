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
import { backendBase } from "@/lib/server/catalogue";
import { RELATED_PATH, RELATED_TIMEOUT_MS, readRelatedStays } from "@/lib/related-stays";

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
    // Revalidate every hour, or as soon as the backend reports a change to
    // this listing (Batch P: POST /api/revalidate with `listing:<id>`).
    next: { revalidate: 3600, tags: ["listings", `listing:${id}`] },
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
  // `access` is present only for a listing that is not public (this fetch is
  // anonymous, so it is always "public": the API's narrow view).
  return result.access ? { ...result.data, access: result.access } : result.data;
}

// "More stays hosted by …" / "Similar stays nearby" (server.me
// docs/related-stays.md), rendered with the page so most guests never call
// the API for them. Cached with the page's data (1 h, purged with the
// `listings` / `listing:<id>` tags on any listing change); with the site's
// catalogue secret it bypasses the API's edge copy, so a regeneration after
// a purge never refills from a stale response (lib/server/catalogue.ts).
// Never throws: any failure, a timeout (bounded so the page is not held up)
// or a malformed payload gives null, and the browser fetches the rows itself.
async function fetchRelatedStays(id) {
  try {
    const base = backendBase();
    if (!base) return null;
    const secret = process.env.CATALOGUE_FRESH_SECRET;
    const response = await fetch(`${base}${RELATED_PATH(id)}${secret ? "?fresh=1" : ""}`, {
      headers: secret ? { "x-catalogue-fresh": secret } : {},
      next: { revalidate: 3600, tags: ["listings", `listing:${id}`] },
      signal: AbortSignal.timeout(RELATED_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const rows = readRelatedStays(await response.json(), id);
    // "could not answer" is not "nothing related": leave it to the browser
    return rows && !rows.unavailable ? rows : null;
  } catch (error) {
    console.error("[related] server fetch failed:", error && error.message);
    return null;
  }
}

// A listing that is not publicly listed (delisted, in review, a draft, under
// a moderation ban) — older API without the marker: any non-active status.
const isHiddenListing = (p) =>
  !!p && (!!p.access || (typeof p.status === "string" && p.status !== "active"));

// DYNAMIC METADATA FOR PROPERTY PAGE
export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!isListingId(id)) notFound();
  try {
    const property = await fetchProperty(id);
    const siteUrl = process.env.NEXTAUTH_URL;

    // Not bookable: no booking / price metadata, and kept out of search
    // results until it is live again (the page is re-rendered when the
    // listing changes — Batch P revalidation by tag).
    if (isHiddenListing(property)) {
      return {
        title: `${property.title || "Stay"} | Majestic Escape`,
        description: "This stay isn't available right now. Browse other stays on Majestic Escape.",
        robots: { index: false, follow: true },
      };
    }

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
  // In parallel with the listing; never rejects (see fetchRelatedStays).
  const relatedPromise = fetchRelatedStays(id);
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
  // A stay that is not live shows no related rows.
  const initialRelated = isHiddenListing(property) ? null : await relatedPromise;
  return <PropertyPageClient initialProperty={property} initialRelated={initialRelated} params={{ id }} />;
}
