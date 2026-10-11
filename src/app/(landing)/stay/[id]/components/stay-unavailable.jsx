"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { CalendarClock, MapPin } from "lucide-react";

// A stay that is not publicly listed (delisted, in review, a draft, or under
// a moderation ban). The API sends a narrow view of it (docs on the API:
// docs/listing-visibility.md) and this page shows what that view supports:
//   variant "public"      anyone: it isn't available — and where to look next
//   variant "bookedGuest" a guest with a confirmed, paid booking of it: the
//                         operational facts they booked under, never the
//                         host's current listing text
const capitalize = (s) =>
  typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : "";

function hourLabel(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 23) return null;
  const h = n % 12 === 0 ? 12 : n % 12;
  return `${h}:00 ${n < 12 ? "AM" : "PM"}`;
}

function placeOf(address) {
  const a = address || {};
  // Some hosts saved the state as the city ("Goa, Goa"): the locality is in
  // the district then (same rule as the stay cards).
  const city =
    a.city && a.state && a.district && String(a.city).trim().toLowerCase() === String(a.state).trim().toLowerCase()
      ? String(a.district).trim()
      : a.city;
  return { city: city ? String(city).trim() : "", label: [city, a.state].filter(Boolean).map(capitalize).join(", ") };
}

export default function StayUnavailable({ property, variant = "public" }) {
  const photo = Array.isArray(property?.photos) ? property.photos[0] : null;
  const title = property?.title || "This stay";
  const { city, label } = placeOf(property?.address);
  const browseHref = city ? `/filter?location=${encodeURIComponent(city)}` : "/stays";
  const booked = variant === "bookedGuest";
  const checkin = booked ? hourLabel(property?.checkinTime) : null;
  const checkout = booked ? hourLabel(property?.checkoutTime) : null;
  const rules = booked
    ? [...(Array.isArray(property?.selectedRules) ? property.selectedRules : []), ...(Array.isArray(property?.customRules) ? property.customRules : [])]
        .filter((r) => typeof r === "string" && r.trim())
    : [];

  return (
    <main data-stay-unbookable className="min-h-screen bg-white pt-[96px] pb-16 md:pt-52 desktop:pt-56 me-fade-in">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <section
          aria-labelledby="stay-unavailable-heading"
          className="overflow-hidden rounded-2xl border border-lightGray bg-white shadow-sm"
        >
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            {photo ? (
              <MediaImage
                src={photo}
                alt={title}
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-medium text-stone">{title}</p>
            {label ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-stone">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </p>
            ) : null}
            <h1
              id="stay-unavailable-heading"
              className="mt-4 font-bricolage text-2xl font-semibold text-graphite text-balance"
            >
              {booked ? "This stay isn't publicly listed or bookable" : "This stay isn't available right now"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {booked
                ? "You booked this stay, so here is what you booked under. Your booking details stay in your bookings."
                : "Its host may have paused it, or it's being reviewed. Plenty of other stays are open for booking."}
            </p>

            {booked && (checkin || checkout || rules.length) ? (
              <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-4">
                {checkin || checkout ? (
                  <p className="flex items-start gap-2 text-sm text-graphite">
                    <CalendarClock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-stone" />
                    <span>
                      {checkin ? <>Check-in from {checkin}</> : null}
                      {checkin && checkout ? " · " : null}
                      {checkout ? <>Check-out by {checkout}</> : null}
                    </span>
                  </p>
                ) : null}
                {rules.length ? (
                  <div>
                    <h2 className="text-sm font-semibold text-graphite">House rules you booked under</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone">
                      {rules.map((r, i) => (
                        <li key={i} className="break-words">{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {booked ? (
                <Link
                  href="/manage-bookings"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primaryGreen px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2 active:scale-95 motion-reduce:active:scale-100"
                >
                  Go to my bookings
                </Link>
              ) : (
                <Link
                  href={browseHref}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primaryGreen px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2 active:scale-95 motion-reduce:active:scale-100"
                >
                  {city ? `Browse stays in ${capitalize(city)}` : "Browse stays"}
                </Link>
              )}
              <Link
                href="/stays"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-lightGray px-6 py-2.5 text-sm font-medium text-graphite transition hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2"
              >
                All stays
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
