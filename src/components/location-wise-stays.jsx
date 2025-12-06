/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import SubHeading from "@/components/ui/sub-heading";
import Heading from "@/components/ui/heading";
import Link from "next/link";

const destinations = [
  {
    id: 1,
    name: "Baga",
    staysNearby: 42,
    image: "/images/spots/baga.png?height=200&width=300",
  },
  {
    id: 2,
    name: "Arambol",
    staysNearby: 27,
    image: "/images/spots/arambol.png?height=200&width=300",
  },
  {
    id: 3,
    name: "Vagator",
    staysNearby: 7,
    image: "/images/spots/vagator.png?height=200&width=300",
  },
  {
    id: 4,
    name: "Candolim",
    staysNearby: 15,
    image: "/images/spots/candolim.png?height=200&width=300",
  },
  {
    id: 5,
    name: "Agonda",
    staysNearby: 15,
    image: "/images/spots/agonda.png?height=200&width=300",
  },
  {
    id: 6,
    name: "Panjim",
    staysNearby: 15,
    image: "/images/spots/panjim.png?height=200&width=300",
  },
  {
    id: 7,
    name: "Calangute",
    staysNearby: 32,
    image: "/images/spots/baga.png?height=200&width=300",
  },
];

const LocationCard = ({ name, staysNearby, image }) => (
  <div className="w-full flex-shrink-0 px-2 mb-4">
    <Link
      href={`/filter?propertyType=${""}&location=${
        name ? name : ""
      }&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}`}
    >
      <div className="flex flex-col overflow-hidden ">
        <img
          src={image}
          alt={name}
          className=" h-[100px] md:h-[200px] w-auto object-cover rounded-lg"
        />
        <h3 className="mt-2 text-sm leading-tight font-semibold text-graphite whitespace-nowrap overflow-hidden text-ellipsis">
          {name}
        </h3>
        <p className="text-sm text-stone text-gray pt-2">
          <span className="font-bold text-brightGreen">{staysNearby}</span>{" "}
          Stays Nearby
        </p>
      </div>
    </Link>
  </div>
);

const LocationWisestays = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getItemsPerView = () => {
    if (windowWidth >= 1024) return 6; // lg
    if (windowWidth >= 768) return 4; // md
    return 2; // mobile and sm
  };

  const itemsPerView = getItemsPerView();
  const maxIndex = destinations.length - itemsPerView;

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerView, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerView, 0));
  };

  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < maxIndex;

  const renderDestinations = () => {
    if (windowWidth < 1024) {
      // Mobile and Tablet view: Grid layout
      return (
        <div
          className={`grid gap-4 ${
            windowWidth >= 768 ? "grid-cols-4" : "grid-cols-2"
          }`}
        >
          {destinations.map((destination) => (
            <LocationCard
              key={destination.id}
              name={destination.name}
              staysNearby={destination.staysNearby}
              image={destination.image}
            />
          ))}
        </div>
      );
    }

    // Desktop view: Carousel
    return (
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {destinations.map((destination, index) => (
              <div key={destination.id} className="w-1/6 flex-shrink-0">
                <LocationCard
                  name={destination.name}
                  staysNearby={destination.staysNearby}
                  image={destination.image}
                />
              </div>
            ))}
          </div>
        </div>

        {showLeftArrow && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-[100px] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-[100px] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
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
                key={idx}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  Math.floor(currentIndex / itemsPerView) === idx
                    ? "bg-gray-800"
                    : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(idx * itemsPerView)}
                aria-label={`Go to slide group ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationWisestays;
