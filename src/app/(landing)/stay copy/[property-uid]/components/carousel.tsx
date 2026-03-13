"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Info, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { properties } from "@/lib/data";

function PropertyCard({ property }: { property: (typeof properties)[0] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Image
          src={property?.images[currentImageIndex]}
          alt={property.name}
          width={400}
          height={300}
          className="w-full aspect-[4/3] object-cover rounded-lg"
        />
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-normal">
          Guest&apos;s fav
        </div>
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-normal">
          {property.rating}
          <span className="text-yellow-400">★</span>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {property?.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                currentImageIndex === index ? "bg-[#BEBDBD]" : "bg-white"
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{property.name}</h3>
            <p className="text-sm text-muted-foreground">{property.location}</p>
            <p className="text-sm text-muted-foreground">
              {property.availability}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="text-gray-600 hover:text-gray-900"
              aria-label="More information"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p>
          <span className="font-bold text-lg">
            ₹{property.price.toLocaleString()}
          </span>
          <span className="text-black ml-1">per night</span>
        </p>
      </div>
    </div>
  );
}

export default function Component() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleProperties = 4;

  const nextSlide = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % properties.length);
  };

  const prevSlide = () => {
    setStartIndex(
      (prevIndex) => (prevIndex - 1 + properties.length) % properties.length,
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">More Suggested Properties</h1>
      <p className="text-muted-foreground mb-6">
        Handpicked heritage homes and luxury villas across Goa&apos;s finest
        locations
      </p>

      <div className="relative flex items-center">
        <button
          onClick={prevSlide}
          className="flex items-center justify-center bg-white rounded-full p-2 shadow-md h-10 w-10 -mr-5 z-10 mb-20"
          aria-label="Previous properties"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[...properties, ...properties]
            .slice(startIndex, startIndex + visibleProperties)
            .map((property, index) => (
              <div
                key={`${property.id}-${index}`}
                className={`${index === 0 ? "block" : "hidden sm:block"}`}
              >
                <PropertyCard property={property} />
              </div>
            ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center justify-center bg-white rounded-full p-2 shadow-md h-10 w-10 -ml-5 z-10 mb-20"
          aria-label="Next properties"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
