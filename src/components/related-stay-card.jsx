"use client";

import { useId } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import { formatINR } from "@/lib/format";
import { distanceCopy, stayFacts, stayPlace } from "@/lib/related-stays";

// One card of the stay page's related rows (components/related-stays.jsx).
// Deliberately lighter than the catalogue's StayCard: one lazy photo, no
// photo carousel, no dialogs or wishlist context — up to 20 of these sit
// below the fold of a page that already carries a gallery and a map.
// The whole card is one link whose accessible name is the stay's title;
// `prefetch={false}`: 20 below-the-fold links must not prefetch 20 routes.
export default function RelatedStayCard({ stay }) {
  const facts = stayFacts(stay);
  const place = stayPlace(stay);
  const distance = distanceCopy(stay.distanceKm);
  const id = useId();
  const rating =
    stay.reviewCount > 0 && stay.averageRating !== null
      ? `Rated ${stay.averageRating.toFixed(1)} from ${stay.reviewCount} ${stay.reviewCount === 1 ? "review" : "reviews"}`
      : "";
  const price = stay.basePrice !== null ? `${formatINR(stay.basePrice)} per night` : "Price on request";
  return (
    <Link
      href={`/stay/${stay._id}`}
      prefetch={false}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      className="group block h-full rounded-xl font-poppins outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {stay.photo ? (
          <MediaImage
            src={stay.photo}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 639px) 78vw, (max-width: 1023px) 40vw, 300px"
            className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
            draggable={false}
          />
        ) : null}
      </div>
      <div className="mt-2.5 space-y-0.5">
        <p id={`${id}-t`} className="line-clamp-2 break-words text-[15px] font-medium leading-snug text-absoluteDark [overflow-wrap:anywhere]">
          {stay.title}
        </p>
        <div aria-hidden="true" className="space-y-0.5">
          {facts ? <p className="truncate text-sm text-graphite">{facts}</p> : null}
          {place ? <p className="truncate text-sm text-stone">{place}</p> : null}
          {distance ? <p className="truncate text-sm text-stone">{distance}</p> : null}
          <p className="flex flex-wrap items-center gap-x-2 pt-0.5 text-sm text-graphite">
            {stay.reviewCount > 0 && stay.averageRating !== null ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current text-absoluteDark" aria-hidden="true" />
                <span>{stay.averageRating.toFixed(1)}</span>
                <span className="text-stone">({stay.reviewCount})</span>
              </span>
            ) : null}
            {stay.basePrice !== null ? (
              <span>
                <span className="font-semibold text-absoluteDark">{formatINR(stay.basePrice)}</span> night
              </span>
            ) : (
              <span className="text-stone">Price on request</span>
            )}
          </p>
        </div>
      </div>
      {/* Link name = the title; the visible details are read once, as its
          description (aria-describedby may point at a hidden element). */}
      <span id={`${id}-d`} hidden>
        {[facts, place, distance, rating, price].filter(Boolean).join(". ")}
      </span>
    </Link>
  );
}
