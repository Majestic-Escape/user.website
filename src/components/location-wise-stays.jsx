/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_LONG } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import { destinations } from "@/lib/data/destinations";
import { COUNT_STAYS_PATH, normalizeCountStays } from "@/lib/catalogue";
import { ChevronRight, ChevronLeft } from "lucide-react";

import SubHeading from "@/components/ui/sub-heading";
import Heading from "@/components/ui/heading";
import Link from "next/link";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Batch P: the destination list lives in lib/data/destinations (shared with
// the server prefetch so both sides build the same countstays request).
const COUNT_TIMEOUT_MS = 8000;

// Bounded (a hung backend ends as "unknown", never an endless placeholder);
// no Content-Type: a GET without it needs no CORS preflight.
async function fetchCountStays() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), COUNT_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${COUNT_STAYS_PATH}`, { signal: ctrl.signal });
    if (!response.ok) {
      const error = new Error(`countstays ${response.status}`);
      error.status = response.status; // a 4xx is final (query-presets)
      throw error;
    }
    return normalizeCountStays(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

// A card's number is the number of stays its page lists (server.me
// countstays runs the search itself); undefined when it is not known.
function countFor(countData, name) {
  const lower = name.toLowerCase();
  const entry = countData.find((item) => item.city.toLowerCase() === lower);
  return entry ? entry.count : undefined;
}

const LINE = "text-sm text-stone text-gray pt-2";
const FADE_IN = " motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300";

// Under the name: "N Stays Nearby", "No stays yet" for none; a quiet
// placeholder while the count loads and a plain invitation when it could not
// be read — never a made-up number.
function StaysLine({ count, pending, fadeIn }) {
  const fade = fadeIn ? FADE_IN : "";
  if (count === 0) return <p className={LINE + fade}>No stays yet</p>;
  if (count > 0) {
    return (
      <p className={LINE + fade}>
        <span className="font-bold text-brightGreen">{count}</span> {count === 1 ? "Stay" : "Stays"} Nearby
      </p>
    );
  }
  if (pending) {
    return (
      <p className={LINE}>
        <span className="inline-block h-4 w-24 rounded bg-gray-200 align-middle animate-pulse motion-reduce:animate-none" aria-hidden="true" />
        <span className="sr-only">Loading stays</span>
      </p>
    );
  }
  return <p className={LINE + fade}>Explore stays</p>;
}

const LocationCard = ({ name, image, image2x, count, pending, fadeIn }) => {
  return (
    <div className="w-full flex-shrink-0 px-2 mb-4">
      <Link
        href={`/location/${name ? name : ""}`}
        /*/filter?propertyType=${""}&location=${
          name ? name : ""
        }&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""} */
      >
        <div className="flex flex-col overflow-hidden ">
          <img
            src={image}
            srcSet={`${image} 1x, ${image2x} 2x`}
            alt={name}
            width={300}
            height={200}
            loading="lazy"
            decoding="async"
            className=" h-[100px] md:h-[200px] w-auto object-cover rounded-lg bg-gray-100"
          />
          <h3 className="mt-2 text-sm leading-tight font-semibold text-graphite whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
          </h3>
          <StaysLine count={count} pending={pending} fadeIn={fadeIn} />
        </div>
      </Link>
    </div>
  );
};

const LocationWisestays = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // +1 / -1: the way the last page change went; 0 until the first one, so
  // the server-rendered cards never animate on load.
  const [direction, setDirection] = useState(0);
  // Always start from the server's value (desktop) and measure in an effect.
  // Reading window.innerWidth during the first client render produced a
  // different tree than the prerendered HTML on phones → hydration error on
  // every mobile home load.
  const [windowWidth, setWindowWidth] = useState(1024);
  // Destination counts change slowly; cached for 30 min so returning to the
  // home page never refetches them. A failure leaves them unknown — the cards
  // still render and link to their pages.
  const {
    data: countData = [],
    isPending,
    isFetchedAfterMount,
  } = useQuery({
    queryKey: queryKeys.countStays,
    queryFn: fetchCountStays,
    ...PUBLIC_LONG,
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getItemsPerView = () => {
    if (windowWidth >= 1024) return 6; // lg
    if (windowWidth >= 768) return 4; // md
    return 2; // mobile and sm
  };

  const itemsPerView = getItemsPerView();
  const maxIndex = Math.max(0, destinations.length - itemsPerView);
  // The page shown is the slice itself. (The row used to be shifted by the
  // index as well, which moved the second desktop page half out of view.)
  const visibleDestinations = destinations.slice(
    currentIndex,
    currentIndex + itemsPerView,
  );
  const goTo = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  const handleNext = () => goTo(Math.min(currentIndex + itemsPerView, maxIndex));
  const handlePrev = () => goTo(Math.max(currentIndex - itemsPerView, 0));

  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < maxIndex;

  // A page change slides the new cards in from the side they came from
  // (transform + opacity only; none with reduced motion).
  const pageMotion =
    direction === 0
      ? ""
      : `motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 ${
          direction > 0
            ? "motion-safe:slide-in-from-right-4"
            : "motion-safe:slide-in-from-left-4"
        }`;
  const cards = visibleDestinations.map((destination) => {
    const count = countFor(countData, destination.name);
    return (
      <LocationCard
        key={destination.id ?? destination.name}
        {...destination}
        count={count}
        pending={isPending}
        fadeIn={isFetchedAfterMount}
      />
    );
  });

  const renderDestinations = () => {
    if (windowWidth < 768) {
      return (
        <div key={currentIndex} className={`grid grid-cols-2 gap-4 ${pageMotion}`}>
          {cards}
        </div>
      );
    }
    if (windowWidth < 1024) {
      // Tablet view: Grid layout with 4 columns
      return (
        <div key={currentIndex} className={`grid grid-cols-4 gap-4 ${pageMotion}`}>
          {cards}
        </div>
      );
    }

    // Desktop view: Carousel
    return (
      <div className="relative mt-8">
        {/* LEFT CHEVRON */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous destinations"
            className="
        absolute
        -left-8
       top-[90px]
        z-10
        h-10 w-10
        rounded-full
        bg-white
        border
        shadow
        flex items-center justify-center
        hover:scale-105
        transition
      "
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </button>
        )}

        {/* CAROUSEL (UNCHANGED WIDTH & POSITION) */}
        <div className="overflow-hidden">
          <div key={currentIndex} className={`flex px-2 ${pageMotion}`}>
            {visibleDestinations.map((destination, i) => (
              <div
                key={destination.id}
                className="flex-shrink-0 "
                style={{ width: `${100 / itemsPerView}%` }}
              >
                {cards[i]}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHEVRON */}
        {showRightArrow && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next destinations"
            className="
        absolute
        -right-6
       top-[90px]
        z-10
        h-10 w-10
        rounded-full
        bg-white
        border
        shadow
        flex items-center justify-center
        hover:scale-105
        transition
      "
          >
            <ChevronRight className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="font-poppins bg-white px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 text-absolute-dark">
      <div className=" w-full max-w-[1760px] mx-auto ">
        <Heading text="Stay Near Your Favorite Spots" />
        <SubHeading text="Discover perfect home-stays around India's iconic locations" />

        <div className="mt-8">{renderDestinations()}</div>

        {/* Progress dots for mobile and tablet */}
        {windowWidth < 1024 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({
              length: Math.ceil(destinations.length / itemsPerView),
            }).map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  Math.floor(currentIndex / itemsPerView) === idx
                    ? "bg-gray-800"
                    : "bg-gray-300"
                }`}
                onClick={() => goTo(idx * itemsPerView)}
                aria-label={`Go to slide group ${idx + 1}`}
                aria-current={Math.floor(currentIndex / itemsPerView) === idx ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationWisestays;
