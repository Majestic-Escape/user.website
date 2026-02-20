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

  // Check if path should have noindex
  const shouldNoIndex = NOINDEX_PATHS.some(
    (path) => pathname.startsWith(path) || pathname === path,
  );

  // Create response
  const response = NextResponse.next();

  // Add X-Robots-Tag header for noindex pages
  if (shouldNoIndex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    console.log(`🔒 Added X-Robots-Tag for: ${pathname}`);
  }

  // Add pathname to headers for generateMetadata
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
