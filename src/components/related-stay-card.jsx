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
// Every line has a slot of fixed height, so the same line sits at the same
// height on every card of a row whatever the content: the title always
// reserves two lines (a one-line title leaves the second empty), each detail
// line is one fixed-height line (ellipsis, never wrapping), the distance slot
// is reserved for the whole nearby row (`reserveDistance`), and the footer —
// price left, rating right — is anchored to the bottom of the card, so a
// missing rating can never move the price. Numbers are tabular.
// The whole card is one link whose accessible name is the stay's title;
// `prefetch={false}`: 20 below-the-fold links must not prefetch 20 routes.
export default function RelatedStayCard({ stay, reserveDistance = false }) {
  const facts = stayFacts(stay);
  const place = stayPlace(stay);
  const distance = distanceCopy(stay.distanceKm);
  const id = useId();
  const hasRating = stay.reviewCount > 0 && stay.averageRating !== null;
  const rating = hasRating
    ? `Rated ${stay.averageRating.toFixed(1)} from ${stay.reviewCount} ${stay.reviewCount === 1 ? "review" : "reviews"}`
    : "";
  const price = stay.basePrice !== null ? `${formatINR(stay.basePrice)} per night` : "Price on request";
  const line = "block h-5 truncate text-sm leading-5";
  return (
    <Link
      href={`/stay/${stay._id}`}
      prefetch={false}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      className="group flex h-full flex-1 flex-col rounded-xl font-poppins outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
      <div className="mt-2.5 flex flex-1 flex-col">
        <p
          id={`${id}-t`}
          data-line="title"
          className="line-clamp-2 h-[2.75em] break-words text-[15px] font-medium leading-snug text-absoluteDark [overflow-wrap:anywhere]"
        >
          {stay.title}
        </p>
        <div aria-hidden="true" className="mt-0.5 flex flex-1 flex-col">
          <span data-line="facts" className={`${line} text-graphite`}>{facts}</span>
          <span data-line="place" className={`${line} text-stone`}>{place}</span>
          {reserveDistance || distance ? <span data-line="distance" className={`${line} text-stone`}>{distance}</span> : null}
          <p data-line="footer" className="mt-auto flex flex-wrap items-center justify-between gap-x-3 pt-1.5 text-sm leading-5 tabular-nums text-graphite">
            {stay.basePrice !== null ? (
              <span className="inline-flex h-5 items-center gap-1 whitespace-nowrap">
                <span className="font-semibold text-absoluteDark">{formatINR(stay.basePrice)}</span>
                <span>night</span>
              </span>
            ) : (
              <span className="inline-flex h-5 items-center whitespace-nowrap text-stone">Price on request</span>
            )}
            {hasRating ? (
              <span className="inline-flex h-5 items-center gap-1 whitespace-nowrap">
                <Star className="h-3.5 w-3.5 shrink-0 self-center fill-current text-absoluteDark" aria-hidden="true" />
                <span>{stay.averageRating.toFixed(1)}</span>
                <span className="text-stone">({stay.reviewCount})</span>
              </span>
            ) : null}
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
