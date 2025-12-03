/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "./wishlist-context";
import Image from "next/image";
import { WishlistDialog } from "./WishlistDialog";
import ShareDialog from "./stay-share-dialog";
import { PropertyBookingDialog } from "./booking-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Heart, MapPin, Share } from "lucide-react";
import { BookingPopup } from "@/components/booking-popup";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StayCard({ property, includeTaxes }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isInWishlist, wishlists } = useWishlist();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const calculatePrice = (basePrice) => {
    const serviceFee = Math.round((basePrice * 14) / 100);
    const priceWithServiceFee = basePrice + serviceFee;

    let gstRate = 0;
    if (priceWithServiceFee >= 7500) {
      gstRate = 18;
    } else if (priceWithServiceFee >= 1000) {
      gstRate = 12;
    }

    const gstAmount = Math.round((priceWithServiceFee * gstRate) / 100);
    const totalPrice = priceWithServiceFee + gstAmount;

    // Format number in Indian style
    return totalPrice.toLocaleString("en-IN");
  };

  const openBookingDialog = () => {
    if (user) {
      setIsBookingDialogOpen(true);
    } else {
      setIsPopupOpen(true);

      // toast.error("Login to your account to book the stay")
    }
  };

  const isLiked =
    isInWishlist(property?._id, "stays") ||
    isInWishlist(property?._id, "experiences") ||
    Object.keys(wishlists.folders).some((folderId) =>
      isInWishlist(property?._id, folderId)
    );

  const handleWishlist = (e) => {
    setIsWishlistDialogOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === `#property-${property?._id}`) {
        const element = document.getElementById(`property-${property?._id}`);
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
  }, [property?._id]);
  console.log(property);
  return (
    <div
      id={`property-${property?._id}`}
      className={`w-full font-poppins mt-8 transition-all duration-300 ease-in-out
        ${
          isHighlighted
            ? "scale-[1.02] shadow-lg shadow-brightGreen ring-2 ring-brightGreen-500 ring-opacity-50"
            : ""
        }
      `}
      onClick={() => router.push(`/stay/${property?._id}`)}
    >
      <div
        className="relative cursor-pointer"
        // Disable booking
      >
        <Carousel className="w-full">
          <CarouselContent>
            {property?.photos.map((image, idx) => (
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

        <div className="absolute top-2 left-2 bg-white rounded-3xl text-absoluteDark text-sm px-3  shadow-lg py-1.5 font-medium">
          {"New"}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {property?.photos.map((_, idx) => (
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
      <div className="mt-1 sm:mt-2 cursor-pointer">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className=" mt-1 font-medium  text-graphite">
              {property?.title}
            </h3>
            <p className="text-sm mb-0.5 flex justify-start gap-x-1 items-center text-stone">
              <MapPin className="w-4 h-auto  inline-block mr-1 align-middle hover:text-stone text-stone" />
              <span className="text-stone text-sm">
                {property?.address?.district}
              </span>
            </p>
            <p className="text-gray-600">
              <span className="text-absoluteDark text-base font-semibold">
                ₹{property?.basePrice}&nbsp;
              </span>
              {/* <Link href={`/stay/${property?._id}`}> */}
              per night
              {/* </Link> */}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleWishlist();
              }}
              className={`${
                isLiked ? "text-red-500" : "text-solidGray"
              } hover:text-absoluteDark`}
            >
              <Heart className="w-4 h-4" />
            </button>

            <button
              className="text-solidGray inline-flex h-8 w-8 items-center justify-center rounded-md hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareDialogOpen(true);
              }}
            >
              <Share
                width={6}
                height={6}
                alt="Share Icon"
                className="w-4 h-4 text-stone hover:text-absoluteDark font-normal justify-center"
              />
            </button>
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={(e) => {
          setIsShareDialogOpen(false);
        }}
        property={property}
      />

      <WishlistDialog
        isOpen={isWishlistDialogOpen}
        onClose={(e) => setIsWishlistDialogOpen(false)}
        property={property}
      />
      <PropertyBookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
        property={property}
      />
      <BookingPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}
