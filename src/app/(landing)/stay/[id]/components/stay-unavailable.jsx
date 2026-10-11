"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { MapPin } from "lucide-react";

// A stay that is not publicly listed (delisted, in review, a draft, or under
// a moderation ban). The API sends a narrow view of it (docs on the API:
// docs/listing-visibility.md) and this page shows what that view supports:
//   variant "public"      anyone: it isn't available — and where to look next
//   variant "bookedGuest" a guest with a confirmed, paid booking of it: the
//                         check-in hours, house rules and cancellation terms
//                         of each booking live with that booking (a guest may
//                         hold several), so this page points there
const capitalize = (s) =>
  typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : "";

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

const primaryCta =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-primaryGreen px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2 active:scale-95 motion-reduce:active:scale-100";
const secondaryCta =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-lightGray px-6 py-2.5 text-sm font-medium text-graphite transition hover:border-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2";

export default function StayUnavailable({ property, variant = "public" }) {
  const photo = Array.isArray(property?.photos) ? property.photos[0] : null;
  const title = property?.title || "This stay";
  const { city, label } = placeOf(property?.address);
  const browseHref = city ? `/filter?location=${encodeURIComponent(city)}` : "/stays";
  const booked = variant === "bookedGuest";

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
                ? "You have a booking here. Your check-in times, house rules and cancellation terms are kept with your booking."
                : "Its host may have paused it, or it's being reviewed. Plenty of other stays are open for booking."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {booked ? (
                <Link href="/manage-bookings" className={primaryCta}>
                  Go to my bookings
                </Link>
              ) : (
                <Link href={browseHref} className={primaryCta}>
                  {city ? `Browse stays in ${capitalize(city)}` : "Browse stays"}
                </Link>
              )}
              <Link href="/stays" className={secondaryCta}>
                All stays
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
