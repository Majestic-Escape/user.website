/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { WishlistDialog } from "./WishlistDialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useWishlist } from "./wishlist-context";

const propertyTypes = [
  { icon: "/images/beachfront.svg", label: "Beachfront" },
  { icon: "/images/spots/flats.svg", label: "Flats" },
  { icon: "/images/spots/farmhouse.svg", label: "Farm House" },
  { icon: "/images/spots/villas.svg", label: "Villas" },
  { icon: "/images/spots/apartments.svg", label: "Apartments" },
  { icon: "/images/spots/cabin.svg", label: "Cabin" },
  { icon: "/images/spots/pool.svg", label: "Pool" },
  { icon: "/images/spots/adventures.svg", label: "Adventure" },
];
const properties = [
  {
    id: 1,
    type: "Villas",
    images: [
      "/images/properties/luxe-villa/luxe1.jpeg",
      "/images/properties/luxe-villa/luxe2.webp",
      "/images/properties/luxe-villa/luxe3.jpeg",
      "/images/properties/luxe-villa/luxe4.webp",
      "/images/properties/luxe-villa/luxe5.webp",
      "/images/properties/luxe-villa/luxe1.jpeg",
    ],
    title: "Luxe Villa",
    location: "Arpora, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 2,
    type: "Villas",
    images: [
      "/images/properties/casa-caisua/casa1.webp",
      "/images/properties/casa-caisua/casa2.webp",
      "/images/properties/casa-caisua/casa3.webp",
      "/images/properties/casa-caisua/casa4.webp",
      "/images/properties/casa-caisua/casa5.webp",
      "/images/properties/casa-caisua/casa1.webp",
    ],
    title: "Casa Caisua- Luxury Goan Loft Style Villa",
    location: "Vagator, Anjuna, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 3,
    type: "Farm House",
    images: [
      "/images/properties/fig/fig1.jpg",
      "/images/properties/fig/fig2.jpg",
      "/images/properties/fig/fig3.jpg",
      "/images/properties/fig/fig4.jpg",
      "/images/properties/fig/fig5.jpg",
    ],
    title: "The Figueiredo House - Lotoulim",
    location: "Goa, Goa",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 4,
    type: "Villas",
    images: [
      "/images/properties/villa-de-festa/villa-de-festa1.webp",
      "/images/properties/villa-de-festa/villa-de-festa2.webp",
      "/images/properties/villa-de-festa/villa-de-festa3.webp",
      "/images/properties/villa-de-festa/villa-de-festa4.webp",
      "/images/properties/villa-de-festa/villa-de-festa5.webp",
    ],
    title: "Villa De Festa",
    location: "Anjuna, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 5,
    type: "Pool",
    images: [
      "/images/properties/stellar/stellar1.webp",
      "/images/properties/stellar/stellar2.webp",
      "/images/properties/stellar/stellar3.webp",
      "/images/properties/stellar/stellar4.webp",
      "/images/properties/stellar/stellar5.webp",
    ],
    title: "Stellar Kamalaya Assagao",
    location: "Assagao, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 6,
    type: "Apartments",
    images: [
      "/images/properties/colva/colva1.webp",
      "/images/properties/colva/colva2.webp",
      "/images/properties/colva/colva3.webp",
      "/images/properties/colva/colva4.jpeg",
      "/images/properties/colva/colva4.webp",
    ],
    title: "A plush 2 Bedroom",
    location: "Colva, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 7,
    type: "Farm House",
    images: [
      "/images/properties/menons/menons1.webp",
      "/images/properties/menons/menons2.webp",
      "/images/properties/menons/menons3.webp",
      "/images/properties/menons/menons4.webp",
      "/images/properties/menons/menons5.webp",
    ],
    title: "Menons",
    location: "Benaulim, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 8,
    type: "Farm House",
    images: [
      "/images/properties/ov4/ov4_1.webp",
      "/images/properties/ov4/ov4_2.webp",
      "/images/properties/ov4/ov4_3.webp",
      "/images/properties/ov4/ov4_4.webp",
      "/images/properties/ov4/ov4_5.webp",
    ],
    title: "OV4 - 4BHK",
    location: "Calangute, India",
    price: 4907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 9,
    type: "Villas",
    images: [
      "/images/properties/lotus/lotus1.webp",
      "/images/properties/lotus/lotus2.webp",
      "/images/properties/lotus/lotus3.webp",
      "/images/properties/lotus/lotus4.webp",
      "/images/properties/lotus/lotus5.webp",
    ],
    title: "Lotus Villa",
    location: "Mandrem, India",
    price: 5907,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 10,
    type: "Villas",
    images: [
      "/images/properties/q/q1.webp",
      "/images/properties/q/q2.webp",
      "/images/properties/q/q3.webp",
      "/images/properties/q/q4.webp",
      "/images/properties/q/q5.webp",
    ],
    title: "The Q Heritage Prvt Pool Villa",
    location: "Parra, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 11,
    type: "Farm House",
    images: [
      "/images/properties/island-house-goa/island-house-goa1.jpg",
      "/images/properties/island-house-goa/island-house-goa2.jpg",
      "/images/properties/island-house-goa/island-house-goa3.jpg",
      "/images/properties/island-house-goa/island-house-goa4.jpg",
      "/images/properties/island-house-goa/island-house-goa5.jpg",
    ],
    title: "Island House Goa",
    location: "Divar, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },

  {
    id: 12,
    type: "Villas",
    images: [
      "/images/properties/island-pool-villa/island-pool-villa1.webp",
      "/images/properties/island-pool-villa/island-pool-villa1.webp",
      "/images/properties/island-pool-villa/island-pool-villa1.webp",
      "/images/properties/island-pool-villa/island-pool-villa1.webp",
      "/images/properties/island-pool-villa/island-pool-villa1.webp",
    ],
    title: "Island Pool Villa",
    location: "Tiswadi, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 13,
    type: "Beachfront",
    images: [
      "/images/properties/cabo-serai/cabo-serai1.jpg",
      "/images/properties/cabo-serai/cabo-serai2.jpg",
      "/images/properties/cabo-serai/cabo-serai3.jpg",
      "/images/properties/cabo-serai/cabo-serai4.jpg",
      "/images/properties/cabo-serai/cabo-serai5.jpg",
    ],
    title: "Cabo Serai",
    location: "Canacona, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 14,
    type: "Villas",
    images: [
      "/images/properties/3bhk-luxury-villa/3bhk-luxury-villa1.jpg",
      "/images/properties/3bhk-luxury-villa/3bhk-luxury-villa2.jpg",
      "/images/properties/3bhk-luxury-villa/3bhk-luxury-villa3.jpg",
      "/images/properties/3bhk-luxury-villa/3bhk-luxury-villa4.jpg",
      "/images/properties/3bhk-luxury-villa/3bhk-luxury-villa5.jpg",
    ],
    title: "3 BHK Luxury Villa",
    location: "Dabolim, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 15,
    type: "Villas",
    images: [
      "/images/properties/4bhk-heritage-villa/4bhk-heritage-villa1.webp",
      "/images/properties/4bhk-heritage-villa/4bhk-heritage-villa2.webp",
      "/images/properties/4bhk-heritage-villa/4bhk-heritage-villa3.webp",
      "/images/properties/4bhk-heritage-villa/4bhk-heritage-villa4.webp",
      "/images/properties/4bhk-heritage-villa/4bhk-heritage-villa5.webp",
    ],
    title: "4BHK Heritage Villa",
    location: "Candolim, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
  {
    id: 16,
    type: "Villas",
    images: [
      "/images/properties/the-white-villa/the-white-villa1.webp",
      "/images/properties/the-white-villa/the-white-villa2.webp",
      "/images/properties/the-white-villa/the-white-villa3.webp",
      "/images/properties/the-white-villa/the-white-villa4.webp",
      "/images/properties/the-white-villa/the-white-villa5.webp",
    ],
    title: "The White Villa",
    location: "Colva, India",
    price: 6299,
    badge: "Guest's fav",
    dateRange: "10 - 15 Nov",
  },
];
const calculatePriceWithTax = (price) => {
  return Math.round(price * 1.18); // 18% tax
};
function FilterSheet() {
  const [open, setOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([84, 8411]);
  const [showMoreActivity, setShowMoreActivity] = useState(false);
  const [showMoreLanguage, setShowMoreLanguage] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* <Dialog.Trigger asChild> */}
      <button className="h-14  px-8 border-2 ring-1 ring-brightGreen bg-gray-50 text-[#4E7B39] rounded-full hover:bg-primaryGreen hover:text-white transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
      </button>
      {/* </Dialog.Trigger> */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed font-poppins inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-0 m-auto bottom-0 z-50 bg-white rounded-t-[10px] h-[90vh] w-full max-w-md justify-center overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Close className="p-2">
              <X className="w-5 h-5" />
            </Dialog.Close>
            <Dialog.Title className="font-semibold">Filters</Dialog.Title>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-8">
              {/* Activity type */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Activity type</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <Checkbox id="art" />
                    <span>Art and culture</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="entertainment" />
                    <span>Entertainment</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="food" />
                    <span>Food and drink</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="sports" />
                    <span>Sports</span>
                  </label>
                  {showMoreActivity && (
                    <>
                      <label className="flex items-center gap-3">
                        <Checkbox id="nature" />
                        <span>Nature and outdoors</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="shopping" />
                        <span>Shopping</span>
                      </label>
                    </>
                  )}
                  <button
                    onClick={() => setShowMoreActivity(!showMoreActivity)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    Show {showMoreActivity ? "less" : "more"}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showMoreActivity ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Price range</h3>
                {/* <p className="text-gray-600 mb-4">The average price of an experience is ₹3,39,980.</p> */}
                <div className="px-2">
                  <Slider
                    defaultValue={[84, 8411]}
                    max={8411}
                    min={84}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-4"
                  />
                  <div className="flex justify-between">
                    <div className="rounded-full border px-4 py-2">
                      ₹{priceRange[0]}
                    </div>
                    <div className="rounded-full border px-4 py-2">
                      ₹{priceRange[1]}+
                    </div>
                  </div>
                </div>
              </div>

              {/* Language offered */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Language offered</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3">
                    <Checkbox id="english" />
                    <span>English</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="french" />
                    <span>French</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="german" />
                    <span>German</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="japanese" />
                    <span>Japanese</span>
                  </label>
                  {showMoreLanguage && (
                    <>
                      <label className="flex items-center gap-3">
                        <Checkbox id="spanish" />
                        <span>Spanish</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="italian" />
                        <span>Italian</span>
                      </label>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowMoreLanguage(!showMoreLanguage)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4"
                >
                  Show {showMoreLanguage ? "less" : "more"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showMoreLanguage ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Time of day */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Time of day</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <Checkbox id="morning" />
                    <div>
                      <div>Morning</div>
                      <div className="text-sm text-gray-500">
                        Starts before 12pm
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="afternoon" />
                    <div>
                      <div>Afternoon</div>
                      <div className="text-sm text-gray-500">
                        Starts after noon
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox id="evening" />
                    <div>
                      <div>Evening</div>
                      <div className="text-sm text-gray-500">
                        Starts after 5pm
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Accessibility features */}
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Accessibility features
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Mobility</h4>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <Checkbox id="no-stairs" />
                        <span>No stairs or steps</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="accessible-bathroom" />
                        <span>Accessible bathroom</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="accessible-parking" />
                        <span>Accessible parking spot</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="flat-ground" />
                        <span>Mainly flat or levelled ground</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Communication</h4>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <Checkbox id="audio-info" />
                        <span>Detailed audio or verbal information</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="sign-language" />
                        <span>Sign language</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="deaf-aware" />
                        <span>Deaf aware techniques</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <Checkbox id="sighted-guide" />
                        <span>Designated sighted guide</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex items-center justify-between">
            <button
              onClick={() => setOpen(false)}
              className="font-medium hover:underline"
            >
              Clear all
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-primaryGreen text-white rounded-lg px-6 py-3 font-medium"
            >
              Show 273 results
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ShareDialog({ isOpen, onClose, property }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getShareUrl = () => {
    const currentUrl = window.location.href.split("#")[0]; // Remove any existing hash
    return `${currentUrl}#property-${property.id}`;
  };

  const handleShare = async (platform) => {
    const shareUrl = getShareUrl();
    const shareText = `Check out ${property.title} in ${property.location} `;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(shareUrl);
          if (process.env.NEXT_PUBLIC_ENV === "dev") {
            console.log("Link copied to clipboard!");
          }
          break;

        case "email":
          const emailSubject = encodeURIComponent(
            `Amazing Property in Goa: ${property.title}`,
          );
          const emailBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
          window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
          break;

        case "whatsapp":
          const isMobile = /iPhone|iPad|iPod|Android/i.test(
            navigator.userAgent,
          );
          const whatsappText = encodeURIComponent(
            `${shareText}\n\n${shareUrl}`,
          );
          const whatsappUrl = isMobile
            ? `whatsapp://send?text=${whatsappText}`
            : `https://web.whatsapp.com/send?text=${whatsappText}`;
          window.open(whatsappUrl);
          break;

        case "twitter":
          const tweetText = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
          break;

        case "messages":
          const smsBody = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.open(`sms:?&body=${smsBody}`);
          } else {
            await navigator.clipboard.writeText(shareUrl);

            if (process.env.NEXT_PUBLIC_ENV === "dev") {
              console.log(
                "Link copied! You can paste it in your messaging app",
              );
            }
          }
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);

        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("Link copied to clipboard as fallback!");
        }
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  const dialog = (
    <div className="fixed inset-0 bg-black text-absoluteDark font-poppins bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-white text-absoluteDark rounded-lg shadow-xl max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-4 pb-2">
          <h2 className="text-lg font-semibold">Share this experience</h2>
        </div>

        <div className="p-4 pt-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={property?.images[0]}
              width={48}
              height={48}
              alt={property.title}
              className="w-12 h-12 rounded-md object-cover"
            />
            <span className="text-sm bg-white text-absoluteDark">
              {property.title}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-full ">
            <ShareButton
              onClick={() => handleShare("copy")}
              icon="/icons/copy-link.svg"
              text="Copy Link"
            />
            <ShareButton
              onClick={() => handleShare("email")}
              icon="/icons/mail.svg"
              text="Email"
            />
            <ShareButton
              onClick={() => handleShare("messages")}
              icon="/icons/message.svg"
              text="Messages"
            />
            <ShareButton
              onClick={() => handleShare("whatsapp")}
              icon="/icons/whatsapp.svg"
              text="WhatsApp"
            />
            <ShareButton
              onClick={() => handleShare("messenger")}
              icon="/icons/messenger.svg"
              text="Messenger"
            />
            <ShareButton
              onClick={() => handleShare("instagram")}
              icon="/icons/instagram.svg"
              text="Instagram"
            />
            <ShareButton
              onClick={() => handleShare("twitter")}
              icon="/icons/twitter.svg"
              text="Twitter"
            />
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(dialog, document.body);
}

function ShareButton({ icon, text, onClick }) {
  const [buttonText, setButtonText] = useState(text);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = async () => {
    onClick();
    if (text === "Copy Link") {
      setButtonText("Copied!");
      setIsSuccess(true);
      setTimeout(() => {
        setButtonText(text);
        setIsSuccess(false);
      }, 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-start gap-2 p-2 border-2 border-[#F1F3F4] rounded-md hover:bg-gray-100 transition-colors duration-200 w-full ${
        isSuccess ? "bg-green-50 border-green-200" : ""
      }`}
    >
      <Image src={icon} width={5} height={5} alt="Icon" className="w-5 h-5" />
      <span className="text-sm">{buttonText}</span>
    </button>
  );
}

function InfoDialog({ isOpen, onClose, property }) {
  const dialogRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property?.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property?.images.length - 1 : prev - 1,
    );
  };

  const dialog = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-poppins">
      <div
        ref={dialogRef}
        className="bg-white text-absoluteDark rounded-lg shadow-xl w-full max-w-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="grid gap-4">
            <div>
              <h2 className="text-2xl font-semibold font-bricolage mb-1">
                {property.title}
              </h2>
              <p className="text-stone text-sm">{property.location}</p>
            </div>

            <div className="grid gap-2">
              {/* <div className="flex justify-between py-2 ">
                <span className="text-absoluteDark">Price per night</span>
                <span className="font-medium">₹{property.price}</span>
              </div> */}
              {/* <div className="flex hidden justify-between py-2 ">
                <span className="text-gray-600">Available dates</span>
                <span className="font-medium">{property.dateRange}</span>
              </div> */}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Property Images</h3>
              <div className="grid grid-cols-4 gap-2">
                {property?.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative rounded-md overflow-hidden ${
                      currentImageIndex === idx ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Image
                      width={600}
                      height={600}
                      src={image}
                      alt={`${property.title} thumbnail ${idx + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function PropertyCard({ property, includeTaxes }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isInWishlist, wishlists } = useWishlist();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const isLiked =
    isInWishlist(property.id, "stays") || // Check stays
    isInWishlist(property.id, "experiences") || // Check experiences
    Object.keys(wishlists.folders).some(
      (
        folderId, // Check custom folders
      ) => isInWishlist(property.id, folderId),
    );

  const showPrevButton = currentImageIndex > 0;
  const showNextButton = currentImageIndex < property?.images.length - 1;

  const nextImage = (e) => {
    e.stopPropagation();

    setCurrentImageIndex((prev) =>
      Math.min(property?.images.length - 1, prev + 1),
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();

    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlistDialogOpen(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === `#property-${property.id}`) {
        const element = document.getElementById(`property-${property.id}`);
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
  }, [property.id]);

  const displayPrice = includeTaxes
    ? calculatePriceWithTax(property.price)
    : property.price;

  return (
    <div
      id={`property-${property.id}`}
      className={`w-full font-poppins mt-8 transition-all duration-300 ease-in-out
        ${
          isHighlighted
            ? "scale-[1.02] shadow-lg shadow-brightGreen ring-2 ring-brightGreen-500 ring-opacity-50"
            : ""
        }
      `}
    >
      <div className="bg-white overflow-hidden">
        <div className="relative">
          <div className="group relative w-full overflow-hidden transition-transform duration-500 ease-in-out rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {property?.images.map((image, idx) => (
                <Image
                  key={idx}
                  src={image}
                  width={361}
                  height={350}
                  alt={`${property.title} - Image ${idx + 1}`}
                  className="w-[361px] h-[350px] object-cover flex-shrink-0"
                />
              ))}
            </div>

            <div className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded-md font-medium">
              {property.badge}
            </div>
            {/* 
            <div className="absolute top-2 right-2 bg-white/90 text-black text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span className="text-black font-medium">5</span>
              <span className="text-orange-500 flex items-center w-[16px] h-[16px] text-base">★</span>
            </div> */}

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

            {showPrevButton && (
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}

            {showNextButton && (
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          <div className="mt-1 sm:mt-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-lg mt-1 font-semibold font-bricolage text-graphite">
                  {property.title}
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
                  {property.location}
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
                  aria-label={
                    isLiked ? "Remove from wishlist" : "Add to wishlist"
                  }
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

            {/* <p className="text-xs text-solidGray">{property.dateRange}</p> */}
            {/* <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-absoluteDark">
                <span className="text-sm font-bold">₹{displayPrice}</span> per night
                {includeTaxes && <span className="text-xs ml-1">(incl. taxes)</span>}
              </p>
            </div> */}
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

export default function Properties() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const filteredProperties = selectedType
    ? properties.filter((property) => property.type === selectedType)
    : properties;

  // const displayedProperties = showMore ? properties : properties.slice(0, 8);
  const displayedProperties = showMore
    ? filteredProperties
    : filteredProperties.slice(0, 8);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      // Check initial scroll state
      checkScroll();

      // Check again after content loads (for images)
      window.addEventListener("load", checkScroll);

      return () => {
        scrollContainer.removeEventListener("scroll", checkScroll);
        window.removeEventListener("load", checkScroll);
      };
    }
  }, []);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };
  const handleTypeSelect = (type) => {
    setSelectedType(selectedType === type ? null : type);
    setShowMore(false);
  };

  return (
    <div className="font-poppins flex justify-center w-full bg-white">
      <div className="w-full max-w-[1760px]">
        <div className="mx-auto px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[128px] font-poppins bg-white text-absoluteDark">
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] text-absoluteDark font-bricolage font-semibold mb-2">
            Discover Our Finest Stays
          </h2>
          <p className="text-sm sm:text-base text-solidGray mb-4 sm:mb-8">
            Explore through featured properties available on Majestic Escape
          </p>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-8 gap-4 lg:gap-0">
            <div className="w-full relative max-w-[850px]">
              <div
                ref={scrollContainerRef}
                className="flex space-x-6 overflow-x-hidden  px-2 py-2 max-w-[850px]"
              >
                {propertyTypes.map((type, index) => (
                  <button key={index} className="text-center flex-shrink-0">
                    <div className="w-[78px] h-[68px] bg-[#F7F7F7] rounded-lg flex items-center justify-center mb-2">
                      <Image
                        width={78}
                        height={68}
                        src={type.icon}
                        alt={type.label}
                        className="w-[78px] h-[68px] object-contain opacity-75"
                        onClick={() => handleTypeSelect(type.label)}
                      />
                    </div>
                  </button>
                ))}
              </div>
              {propertyTypes.length > 6 && (
                <>
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute flex justify-center items-center -translate-y-1/2 -left-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray" />
                    </button>
                  )}
                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute flex justify-center items-center -translate-y-1/2 -right-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                      aria-label="Next"
                    >
                      <ChevronRight className="w-5 h-5 text-gray" />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-row font-poppins items-center gap-4">
              <FilterSheet>
                <button className="h-11 px-8 border-2 border-[#4E7B39] text-[#4E7B39] rounded-full hover:bg-[#4E7B39] hover:text-white transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </FilterSheet>
              {/* <div
                className={`${
                  includeTaxes
                    ? "ring-brightGreen ring-1 transition-all"
                    : "ring-gray-300 transition-all"
                } flex items-center px-6 h-14 gap-x-2 w-48  bg-gray-50 ring-1 rounded-full`}
              >
                <button
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                    includeTaxes
                      ? "bg-brightGreen justify-end"
                      : "bg-solidGray justify-start border-brightGreen"
                  }`}
                  onClick={() => setIncludeTaxes(!includeTaxes)}
                  aria-label={includeTaxes ? "Exclude taxes" : "Include taxes"}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
                <span className="text-sm text-[#666666] font-medium whitespace-nowrap">
                  {includeTaxes ? "Include Taxes" : "Exclude Taxes"}
                </span>
              </div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                includeTaxes={includeTaxes}
              />
            ))}
          </div>

          {!showMore && filteredProperties.length > 8 && (
            <div className="flex justify-center mt-12">
              <button
                className="bg-primaryGreen hover:bg-brightGreen text-white px-16 py-4 rounded-full transition-colors duration-300"
                onClick={() => setShowMore(true)}
              >
                View More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
