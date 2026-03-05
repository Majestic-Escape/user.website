import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === "/blog/1") {
    url.pathname = "/blog/top-5-reasons-why-homestays-are-better-than-hotels";
    return NextResponse.redirect(url, 301);
  }

  if (url.pathname === "/blog/2") {
    url.pathname =
      "/blog/how-to-plan-a-budget-trip-without-compromising-comfort";
    return NextResponse.redirect(url, 301);
  }

  if (url.pathname === "/blog/3") {
    url.pathname =
      "/blog/how-to-choose-the-perfect-homestay-for-your-family-trip";
    return NextResponse.redirect(url, 301);
  }

  if (url.pathname === "/blog/4") {
    url.pathname =
      "/blog/spice-of-life-a-culinary-journey-through-goan-cuisine";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/:path*"],
};
