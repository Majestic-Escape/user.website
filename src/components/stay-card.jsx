/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "./wishlist-context";
import Image from "next/image";
import { WishlistDialog } from "./WishlistDialog";
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import InfoDialog from "./stay-info-card";
import ShareDialog from "./stay-share-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function StayCard({ property, includeTaxes }) {
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("Property form stay card", property);
  }
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isInWishlist, wishlists } = useWishlist();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const isLiked =
    isInWishlist(property?.id, "stays") ||
    isInWishlist(property?.id, "experiences") ||
    Object.keys(wishlists.folders).some((folderId) =>
      isInWishlist(property?.id, folderId)
    );

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlistDialogOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === `#property-${property?.id}`) {
        const element = document.getElementById(`property-${property?.id}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setIsHighlighted(true);
          setTimeout(() => {
            setIsHighlighted(false);
          }, 2000);
        }
      }
    }
  }, [property?.id]);

  return (
    <div
      id={`property-${property?.id}`}
      className={`w-full font-poppins mt-8 transition-all duration-300 ease-in-out
        ${
          isHighlighted
            ? "scale-[1.02] shadow-lg shadow-brightGreen ring-2 ring-brightGreen-500 ring-opacity-50"
            : ""
        }
      `}
    >
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {property?.images.map((image, idx) => (
              <CarouselItem key={idx}>
                <Image
                  src={image}
                  width={400}
                  height={400}
                  alt={`${property?.title} - Image ${idx + 1}`}
                  className="aspect-square w-full h-auto object-cover object-center rounded-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </Carousel>

        <div className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded-md font-medium">
          {property?.badge}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {property?.images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full ${
                currentImageIndex === idx ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-1 sm:mt-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg mt-1 font-semibold font-bricolage text-graphite">
              {property?.title}
            </h3>
            <p className="text-sm text-solidGray">
              <span className="inline-block align-middle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 inline h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {property?.location}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center h-8 w-8 right-4 hover:text-solidGray"
              onClick={() => setIsInfoDialogOpen(true)}
            >
              <Image
                width={24}
                height={24}
                src="/icons/info-icon.svg"
                alt="Info Icon"
                className="w-6 h-6 justify-center"
              />
            </button>

            <button
              onClick={handleWishlist}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-opacity-60 border-[#A7A7A7] bg-white hover:bg-accent hover:text-accent-foreground ${
                isLiked ? "text-red-500" : "text-solidGray"
              }`}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4 transition-colors duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>

            <button
              className="text-solidGray inline-flex h-8 w-8 items-center justify-center rounded-md hover:text-gray-600"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Image
                src="/icons/share-icon.svg"
                width={6}
                height={6}
                alt="Share Icon"
                className="w-6 h-6 justify-center"
              />
            </button>
          </div>
        </div>
      </div>

      <InfoDialog
        isOpen={isInfoDialogOpen}
        onClose={() => setIsInfoDialogOpen(false)}
        property={property}
      />
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        property={property}
      />
      <WishlistDialog
        isOpen={isWishlistDialogOpen}
        onClose={() => setIsWishlistDialogOpen(false)}
        property={property}
      />
    </div>
  );
}
