// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NOINDEX_PATHS = [
  "/host",
  "/dashboard",
  "/login",
  "/register",
  "/account",
  "/manage-bookings",
  "/messages",
  "/booking-summary",
  "/api",
  "/book/stay",
  "/_next",
  "/_vercel",
  "/static",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const shouldNoIndex = NOINDEX_PATHS.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );

  // Create response
  const response = NextResponse.next();

  // ALWAYS set headers - don't rely on shouldNoIndex for response
  if (shouldNoIndex) {
    // Method A: X-Robots-Tag header (works for ALL content types)
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Method B: Also set as regular header for redundancy
    response.headers.set("x-robots-tag", "noindex, nofollow");

    console.log(`🔒 Added noindex headers for: ${pathname}`);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
