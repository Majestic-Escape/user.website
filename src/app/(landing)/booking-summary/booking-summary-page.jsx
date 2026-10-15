"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import MediaImage, { PHOTO_PLACEHOLDER } from "@/components/ui/media-image";
import { formatINR, formatTime12h, parseDate } from "@/lib/format";
import LoginLink from "@/components/login-link";
import { LIVE } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import { readStoredToken } from "@/lib/session";

// Never renders "undefined"/"null"/"" for a missing query value.
const show = (value) =>
  value === undefined || value === null || value === "" ? "—" : value;
const capitalize = (value) =>
  typeof value === "string" && value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : "";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Stay ids are Mongo ids; accept only id-shaped values before building a link.
const safeStayId = (value) =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : null;
// Booking ids go into an API path: ObjectId shape only.
const safeBookingId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value) ? value : null;

// Booking dates are stored as UTC-midnight instants; format the calendar
// day itself so it reads the same in every timezone.
const fmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const fmtDate = (d) => (d ? fmt.format(d) : "—");

// Same request and cache entry as the rating page (GET /booking/:id is
// limited to the booking's guest, host and admins on the server).
async function fetchBooking(bookingId) {
  const token = readStoredToken();
  if (!token) throw new Error("Not signed in");
  const response = await fetch(`${API_URL}/booking/${bookingId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const err = new Error(`Failed to fetch booking (status: ${response.status})`);
    err.status = response.status;
    throw err;
  }
  const result = await response.json();
  if (!result?.data) throw new Error("Booking data missing in response");
  return result.data;
}

// What the header says. The booking's real state wins; the URL's `instant`
// flag (set by checkout) is only a fallback while that can't be read. A link
// from My bookings carries no flag, so it used to say "Wait for host email"
// for every booking, confirmed and cancelled ones included.
function headline(live, instantParam, host) {
  const hostName = host || "Your host";
  const refund =
    live?.paymentStatus === "refunded"
      ? live?.refundAmount != null
        ? `A refund of ${formatINR(live.refundAmount)} was issued to your original payment method.`
        : "Your payment was refunded to your original payment method."
      : null;
  if (live) {
    if (live.needsAttention) {
      return {
        tone: "pending",
        title: "We're confirming your booking",
        text: "Your payment has been received. Our team is checking the dates and will email you shortly. Please don't pay again.",
      };
    }
    if (live.status === "confirmed") {
      return {
        tone: "ok",
        title: "Your stay is confirmed",
        text: "We've emailed you the confirmation. Thanks for choosing Majestic Escape.",
      };
    }
    if (live.status === "pending") {
      return {
        tone: "pending",
        title: "Booking request sent",
        text: `${hostName} needs to accept your request. We'll email you as soon as they reply. If they decline, you get a full refund.`,
      };
    }
    if (live.status === "cancelled") {
      return { tone: "closed", title: "This booking was cancelled", text: refund || "This stay won't go ahead." };
    }
    if (live.status === "rejected") {
      return { tone: "closed", title: `${hostName} declined this request`, text: refund || "This stay won't go ahead." };
    }
  }
  if (instantParam === "true") {
    return { tone: "ok", title: "Your stay is confirmed", text: "We've emailed you the confirmation. Thanks for choosing Majestic Escape." };
  }
  if (instantParam === "false") {
    return {
      tone: "pending",
      title: "Booking request sent",
      text: `${hostName} needs to accept your request. We'll email you as soon as they reply. If they decline, you get a full refund.`,
    };
  }
  return { tone: "neutral", title: "Your booking", text: null };
}

const TONE_ICON = { ok: CircleCheck, pending: Clock, closed: CircleX };

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();
  const [queryData, setQueryData] = useState(null);
  // The property image arrives as a query param: a full URL (the stay page
  // passes photos[0]) or a bucket key from older links. Without it the page
  // used to request ".../null" from the image optimizer (a 403 and a broken
  // image on the confirmation page).
  const propertyImageSrc = queryData?.propertyImage
    ? /^https?:\/\//.test(queryData.propertyImage)
      ? queryData.propertyImage
      : `https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/${queryData.propertyImage}`
    : null;
  const stayId = safeStayId(queryData?.propertyId);
  const bookingId = safeBookingId(queryData?.bookingId);
  const [isAuth, setIsAuth] = useState(false);
  // Until the stored session has been read, show the loader, not a
  // one-frame "You are not authorized" flash.
  const [authChecked, setAuthChecked] = useState(false);
  const auth = () => {
    setIsAuth(!!readStoredToken());
    setAuthChecked(true);
  };
  const router = useRouter();

  const bookingQuery = useQuery({
    queryKey: queryKeys.bookingById(bookingId),
    queryFn: () => fetchBooking(bookingId),
    enabled: isAuth && !!bookingId,
    ...LIVE,
  });

  // Push a fake entry into history so back button fires popstate

  useEffect(() => {
    auth();
  }, []);

  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    const bookingHistory = searchParams.get("bookingHistory")
      ? searchParams.get("bookingHistory")
      : null;
    // Add a fake history entry so back button doesn't leave the page
    if (bookingHistory && bookingHistory != "true") {
      window.history.pushState({ preventBack: true }, "");

      const handlePopState = (event) => {
        // Instead of going back, redirect where you want
        router.replace(`/stay/${propertyId}`);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  useEffect(() => {
    const keys = [
      "bookingId",
      "propertyId",
      "propertyName",
      "propertyImage",
      "checkin",
      "checkout",
      "numberOfGuests",
      "totalAmount",
      "nights",
      "street",
      "district",
      "city",
      "state",
      "country",
      "hostFirstName",
      "propertyType",
      "placeType",
      "adults",
      "children",
      "infants",
      "checkinTime",
      "checkoutTime",
      "instant",
    ];
    setQueryData(Object.fromEntries(keys.map((k) => [k, searchParams.get(k)])));
  }, [searchParams]);

  if (!queryData || !authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You are not authorized to access this page. &nbsp;{" "}
        <LoginLink>
          <u>
            <b>Click Here</b>
          </u>
        </LoginLink>
        &nbsp; to log in now to access.
      </div>
    );
  }

  // checkin/checkout arrive as epoch-ms strings (UTC-midnight instants);
  // parseDate returns null for "NaN"/"" instead of a 1970 date.
  const checkInDate = parseDate(queryData?.checkin);
  const checkOutDate = parseDate(queryData?.checkout);
  const live = bookingQuery.data;
  // Until the booking's state is known (and only while it can still arrive)
  // the header claims nothing rather than flash a wrong status.
  const resolving = !!bookingId && bookingQuery.isPending && !bookingQuery.isError;
  const head = headline(live, queryData?.instant, queryData?.hostFirstName);
  const Icon = TONE_ICON[head.tone];
  const hostName = queryData?.hostFirstName || "your host";
  const guestBreakdown = [
    ["adult", queryData?.adults],
    ["child", queryData?.children],
    ["infant", queryData?.infants],
  ]
    .map(([label, n]) => [label, Number(n)])
    .filter(([, n]) => Number.isFinite(n) && n > 0)
    .map(([label, n]) =>
      n === 1 ? `1 ${label}` : `${n} ${label === "child" ? "children" : `${label}s`}`,
    )
    .join(", ");
  const nights = Number(queryData?.nights);
  const address =
    [
      [queryData?.district, queryData?.city].filter(Boolean).join(" "),
      queryData?.state,
      queryData?.country,
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const closed = head.tone === "closed";

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(queryData.bookingId);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Couldn't copy. Please select the ID and copy it.");
    }
  };

  return (
    <div className="min-h-screen font-poppins pt-8 md:pt-20 pb-24 md:pb-10">
      <header className="bg-primaryGreen">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 text-center text-white">
          <div
            key={resolving ? "resolving" : head.title}
            className="animate-in fade-in-0 zoom-in-95 duration-300 motion-reduce:animate-none"
            aria-live="polite"
          >
            {Icon && !resolving ? (
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
            ) : null}
            <h1 className="font-bricolage text-2xl sm:text-3xl font-semibold text-balance">
              {resolving ? "Your booking" : head.title}
            </h1>
            {resolving ? (
              <div className="mx-auto mt-3 h-4 w-56 max-w-full rounded bg-white/20 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            ) : head.text ? (
              <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-white/90">{head.text}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section
          aria-label="Booking details"
          className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,5fr),minmax(0,6fr)] gap-6 rounded-2xl border bg-white p-4 sm:p-6 shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
        >
          <div className="min-w-0">
            <MediaImage
              src={propertyImageSrc || PHOTO_PLACEHOLDER}
              unoptimized={!propertyImageSrc}
              alt={queryData?.propertyName || "Stay photo"}
              width={600}
              height={400}
              sizes="(max-width: 767px) 100vw, 45vw"
              className={`w-full h-auto aspect-[3/2] rounded-xl object-cover bg-gray-100 ${closed ? "grayscale-[60%]" : ""}`}
            />
            <h2 className="mt-4 font-bricolage text-lg font-semibold text-absoluteDark break-words">
              {queryData?.propertyName || "Your stay"}
            </h2>
            <p className="text-sm text-stone">
              {[capitalize(queryData?.placeType), capitalize(queryData?.propertyType)]
                .filter(Boolean)
                .join(" ")}
              {queryData?.hostFirstName ? ` · Hosted by ${queryData.hostFirstName}` : null}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/manage-bookings"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-primaryGreen px-5 text-sm font-medium text-white transition hover:bg-brightGreen active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryGreen"
              >
                View my bookings
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-medium text-absoluteDark transition hover:bg-gray-50 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryGreen"
              >
                Back to home
              </Link>
            </div>
          </div>

          <div className="min-w-0 space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Check-in
                </p>
                <p className="mt-1 font-semibold text-absoluteDark">{fmtDate(checkInDate)}</p>
                <p className="text-stone">From {formatTime12h(queryData?.checkinTime)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Check-out
                </p>
                <p className="mt-1 font-semibold text-absoluteDark">{fmtDate(checkOutDate)}</p>
                <p className="text-stone">By {formatTime12h(queryData?.checkoutTime)}</p>
              </div>
            </div>

            <dl className="divide-y divide-gray-100 rounded-xl border">
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="flex items-center gap-2 text-stone">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Guests
                </dt>
                <dd className="text-right text-absoluteDark">
                  {show(queryData?.numberOfGuests)}
                  {guestBreakdown ? <span className="block text-xs text-stone">{guestBreakdown}</span> : null}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="text-stone">Nights</dt>
                <dd className="text-absoluteDark">{Number.isFinite(nights) && nights > 0 ? nights : "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="text-stone">{closed ? "Amount" : "Total paid"}</dt>
                <dd className="font-semibold tabular-nums text-absoluteDark">
                  {formatINR(queryData?.totalAmount)}
                  {live?.paymentStatus === "refunded" ? (
                    <span className="block text-xs font-normal text-green-700">
                      Refunded{live?.refundAmount != null ? ` ${formatINR(live.refundAmount)}` : ""}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 whitespace-nowrap text-stone">Booking ID</dt>
                <dd className="flex min-w-0 items-center gap-1 text-absoluteDark">
                  <span className="font-mono text-xs break-all">{show(queryData?.bookingId)}</span>
                  {queryData?.bookingId ? (
                    <button
                      type="button"
                      onClick={copyBookingId}
                      className="-my-2 inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-stone transition hover:bg-gray-100 hover:text-absoluteDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primaryGreen"
                      aria-label="Copy booking ID"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="flex items-center gap-2 text-stone">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Location
                </dt>
                <dd className="min-w-0 text-right text-absoluteDark break-words">{address}</dd>
              </div>
            </dl>

            {!closed ? (
              <div className="rounded-xl bg-primaryGreen/5 p-4">
                <h3 className="font-semibold text-absoluteDark">What happens next</h3>
                <ul className="mt-2 space-y-2 text-stone">
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primaryGreen" aria-hidden="true" />
                    <span>
                      Message {hostName} from Messages to plan your arrival time and key exchange.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primaryGreen" aria-hidden="true" />
                    <span>
                      Review the house rules and amenities before you go.
                      {stayId ? (
                        <>
                          {" "}
                          <Link
                            href={`/stay/${stayId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[24px] items-center rounded-sm font-medium text-primaryGreen underline underline-offset-2 hover:text-absoluteDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryGreen"
                          >
                            View listing
                            <span className="sr-only"> (opens in a new tab)</span>
                          </Link>
                        </>
                      ) : null}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primaryGreen" aria-hidden="true" />
                    <span>
                      Your invoice and cancellation options are in{" "}
                      <Link
                        href="/manage-bookings"
                        className="inline-flex min-h-[24px] items-center rounded-sm font-medium text-primaryGreen underline underline-offset-2 hover:text-absoluteDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryGreen"
                      >
                        My bookings
                      </Link>
                      .
                    </span>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-label="Help" className="mt-6 rounded-2xl border bg-white p-4 sm:p-6 text-sm">
          <h3 className="font-semibold text-absoluteDark">Need help?</h3>
          <p className="mt-1 text-stone">
            Questions about this booking or the{" "}
            <Link href="/cancellation-policy" className="font-medium text-primaryGreen underline underline-offset-2">
              cancellation policy
            </Link>
            ? Email{" "}
            <a className="font-medium text-primaryGreen underline underline-offset-2" href="mailto:info@majesticescape.in">
              info@majesticescape.in
            </a>{" "}
            with your booking ID, or visit the{" "}
            <Link href="/help-center" className="font-medium text-primaryGreen underline underline-offset-2">
              Help Centre
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
