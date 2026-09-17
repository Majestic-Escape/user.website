import { NextResponse, type NextRequest } from "next/server";

// /stay/[id] streams (loading boundaries), so a notFound() thrown inside the
// page can only mark the response noindex — the 200 status has already been
// sent. Listing ids are Mongo ObjectIds, so a malformed id ("abc", a mistyped
// 25-char id) can be rejected here, before any rendering or backend call,
// with a real 404 status. Well-formed ids that don't exist still go through
// the page (which renders the not-found UI + noindex after asking the API).
//
// Scoped to /stay/* only; every other route is untouched by this middleware.
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const id = segments[2] ?? "";
  if (segments.length === 3 && id && !OBJECT_ID.test(id)) {
    return NextResponse.rewrite(new URL("/stay-not-found", request.url), {
      status: 404,
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/stay/:id"],
};
