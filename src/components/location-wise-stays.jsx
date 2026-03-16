/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

import SubHeading from "@/components/ui/sub-heading";
import Heading from "@/components/ui/heading";
import Link from "next/link";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const destinations = [
  {
    id: 1,
    name: "Panjim",
    staysNearby: 19,
    image: "/images/spots/panjim.png?height=200&width=300",
    //"/images/spots/baga.png?height=200&width=300",
  },
  {
    id: 2,
    name: "Ujjain",
    staysNearby: 10,
    image: "/images/spots/ujjain.jpg?height=200&width=300",
  },
  {
    id: 3,
    name: "Nashik",
    staysNearby: 6,
    image: "/images/spots/nashik.jpg?height=200&width=300",
  },
  {
    id: 4,
    name: "Mapusa",
    staysNearby: 8,
    image: "/images/spots/margao.jpg?height=200&width=300",
  },
  {
    id: 5,
    name: "Margao",
    staysNearby: 15,
    image: "/images/spots/mapusa.jpg?height=200&width=300",
  },
  {
    id: 6,
    name: "Lucknow",
    staysNearby: 15,
    image: "/images/spots/lucknow.jpg?height=200&width=300",
  },
  {
    id: 7,
    name: "Varanasi",
    staysNearby: 32,
    image: "/images/spots/Varanasi.jpg?height=200&width=300",
  },
  {
    id: 8,
    name: "Ayodhya",
    staysNearby: 32,
    image: "/images/spots/ayodhya.jpg?height=200&width=300",
  },
  {
    id: 9,
    name: "Kutch",
    staysNearby: 32,
    image: "/images/spots/kutch.jpg?height=200&width=300",
  },
];

const LocationCard = ({ name, staysNearby, image, countData }) => {
  const actualStaysNearby = countData?.filter(
    (item) => item?.city?.toLowerCase() == name?.toLowerCase(),
  );

  const displayCount =
    actualStaysNearby?.length > 0 ? actualStaysNearby[0]?.count : staysNearby;
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
            alt={name}
            className=" h-[100px] md:h-[200px] w-auto object-cover rounded-lg"
          />
          <h3 className="mt-2 text-sm leading-tight font-semibold text-graphite whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
          </h3>
          <p className="text-sm text-stone text-gray pt-2">
            <span className="font-bold text-brightGreen">{displayCount}</span>{" "}
            Stays Nearby
          </p>
        </div>
      </Link>
    </div>
  );
};

const LocationWisestays = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const [countData, setCountData] = useState([]);
  const fetchCount = async (cities) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties/countstays?city=${cities}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        return;
      }
      const result = await response.json();
      // console.log("ree", result.data);
      const final = await result.data;
      setCountData(final);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const cities = [];
    destinations.forEach((item) => cities.push(item.name));
    fetchCount(cities);
  }, []);
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
  // const maxIndex = destinations.length - itemsPerView;
  const maxIndex = Math.max(0, destinations.length - itemsPerView);
  const visibleDestinations = destinations.slice(
    currentIndex,
    currentIndex + itemsPerView,
  );
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerView, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerView, 0));
  };

  const showLeftArrow = currentIndex > 0;
  const showRightArrow = currentIndex < maxIndex;

  const renderDestinations = () => {
    if (windowWidth < 768) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {visibleDestinations.map((destination) => (
            <LocationCard {...destination} countData={countData} />
          ))}
        </div>
      );
    }
    if (windowWidth < 1024) {
      if (windowWidth < 1024) {
        // Tablet view: Grid layout with 4 columns
        return (
          <div className="grid grid-cols-4 gap-4">
            {visibleDestinations.map((destination) => (
              <LocationCard {...destination} countData={countData} />
            ))}
          </div>
        );
      }
      // Mobile and Tablet view: Grid layout
      // return (
      //   <div
      //     className={`grid gap-4 ${
      //       windowWidth >= 768 ? "grid-cols-4" : "grid-cols-2"
      //     }`}
      //   >
      //     {destinations.map((destination, index) => (
      //       <div key={destination.id} className="w-1/6 flex-shrink-0">
      //         <LocationCard
      //           key={destination.id}
      //           name={destination.name}
      //           staysNearby={destination.staysNearby}
      //           image={destination.image}
      //           countData={countData}
      //         />
      //       </div>
      //     ))}
      //   </div>
      // );
    }

    // Desktop view: Carousel
    return (
      <div className="relative mt-8">
        {/* LEFT CHEVRON */}
        {showLeftArrow && (
          <button
            onClick={handlePrev}
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
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {/* CAROUSEL (UNCHANGED WIDTH & POSITION) */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out px-2"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {visibleDestinations.map((destination) => (
              <div
                key={destination.id}
                className="flex-shrink-0 "
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <LocationCard {...destination} countData={countData} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHEVRON */}
        {showRightArrow && (
          <button
            onClick={handleNext}
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
