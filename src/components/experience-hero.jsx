/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useRef, useEffect, createRef, useCallback } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  SlidersHorizontal,
  Play,
  Pause,
  X,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { useWishlist } from "./wishlist-context";
import { createPortal } from "react-dom";
import { WishlistDialog } from "./WishlistDialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";

import { MainTab } from "./ui/main-tab";
// import { ExperiencePartnerSection } from './experience-partner-section';

const activities = [
  {
    icon: "/images/activities/paragliding1.svg",
    label: "Paragliding",
  },
  {
    icon: "/images/activities/parasailing1.svg",
    label: "Parasailing",
  },
  {
    icon: "/images/activities/riverrafting1.svg",
    label: "River Rafting",
  },
  {
    icon: "/images/activities/cycling1.svg",
    label: "Cycling",
  },
  {
    icon: "/images/activities/hotairballoon1.svg",
    label: "Hot air balloon",
  },
  {
    icon: "/images/activities/paragliding1.svg",
    label: "Paragliding",
  },
  {
    icon: "/images/activities/parasailing1.svg",
    label: "Parasailing",
  },
  {
    icon: "/images/activities/cycling1.svg",
    label: "Cycling",
  },
  {
    icon: "/images/activities/hot air balloon.svg",
    label: "Hot air balloon",
  },

  {
    icon: "/images/activities/paragliding1.svg",
    label: "Paragliding",
  },
  {
    icon: "/images/activities/parasailing1.svg",
    label: "Parasailing",
  },
];

const experiences = [
  {
    id: 1,
    title: "Cruise Experience",
    location: "Panaji, North Goa, Goa",
    price: "1800",
    images: [
      "/images/activities/nirvana-cruise.jpg",
      "/images/activities/nirvana-cruise1.jpeg",
    ],
  },
  {
    id: 2,
    title: "3-Deck Dine Cruise",
    location: "Malvan Lake, Goa",
    price: "1200",
    images: [
      "/images/activities/swastik1.jpg",
      "/images/activities/swastik2.jpeg",
      "/images/activities/swastik3.jpg",
    ],
  },
  {
    id: 3,
    title: "VIP Luxury Dinner Cruise Goa",
    location: "Mhadei River, Goa",
    price: "2500",
    images: [
      "/images/activities/vip-luxury1.jpeg",
      "/images/activities/vip-luxury2.jpg",
      "/images/activities/vip-luxury3.jpg",
    ],
  },
  {
    id: 4,
    title: "Dinner & Party Boat Cruise",
    location: "Calangute Beach, Goa",
    price: "1099",
    images: [
      "/images/activities/lexicon1.jpg",
      "/images/activities/lexicon2.jpg",
      "/images/activities/lexicon3.jpg",
    ],
  },
  {
    id: 5,
    title: "Dolphin Trip",
    location: "Spike's River, Goa",
    price: "300",
    images: ["/images/activities/dolphin-trip.png"],
  },
  {
    id: 6,
    title: "The Island Exploration at Divar",
    location: "Ribandar, Goa",
    price: "1499",
    images: [
      "/images/activities/island-exp-divar1.jpg",
      "/images/activities/island-exp-divar2.jpg",
      "/images/activities/island-exp-divar3.jpg",
    ],
  },
  {
    id: 7,
    title: "A Nature Trail at Chorao Island",
    location: "Ribandar, Goa",
    price: "1799",
    images: [
      "/images/activities/chorao1.jpg",
      "/images/activities/chorao2.jpg",
      "/images/activities/chorao3.jpg",
    ],
  },
  {
    id: 8,
    title: "The Latin Quarter Walk at Panjim",
    location: "Panaji, Goa",
    price: "2800",
    images: [
      "/images/activities/latin1.jpg",
      "/images/activities/latin2.jpg",
      "/images/activities/latin3.jpg",
    ],
  },
  {
    id: 9,
    title: "A Saligao Paasai (Village Trail)",
    location: "Saligao Church",
    price: "2800",
    images: [
      "/images/activities/saligao1.jpg",
      "/images/activities/saligao2.jpg",
      "/images/activities/saligao3.jpeg",
    ],
  },
  {
    id: 10,
    title: "The Island Culinary Experience at Chorao",
    location: "Chodna Ferry Terminal, Goa",
    price: "2800",
    images: [
      "/images/activities/culinary1.jpg",
      "/images/activities/culinary2.jpg",
      "/images/activities/culinary3.jpg",
    ],
  },
  {
    id: 11,
    title: "Old Goa Christian Art and Heritage Trail",
    location: "Bainguinim, Goa",
    price: "2800",
    images: [
      "/images/activities/old-goa1.jpg",
      "/images/activities/old-goa2.jpg",
      "/images/activities/old-goa3.jpg",
    ],
  },
  {
    id: 12,
    title: "Temple Trail At Marcel",
    location: "Devki Krishna Ravalnath Saunsthan Ground",
    price: "999",
    images: [
      "/images/activities/temple-trail1.jpeg",
      "/images/activities/temple-trail2.jpeg",
      "/images/activities/temple-trail3.jpeg",
    ],
  },
  {
    id: 13,
    title: "Velha Goa to Nova Goa",
    location: "Velha Goa, Goa",
    price: "999",
    images: [
      "/images/activities/velha1.jpg",
      "/images/activities/velha2.jpg",
      "/images/activities/velha3.jpg",
    ],
  },
  {
    id: 14,
    title: "Fishing and Crab Cooking",
    location: "Chimbel, Goa",
    price: "999",
    images: [
      "/images/activities/fishing1.jpg",
      "/images/activities/fishing2.jpg",
      "/images/activities/fishing3.jpg",
    ],
  },
  {
    id: 15,
    title: "Houses Of Goa - Chandor",
    location: "Villa Formosa, Goa",
    price: "999",
    images: [
      "/images/activities/houses-of-goa1.jpg",
      "/images/activities/houses-of-goa2.jpg",
      "/images/activities/houses-of-goa3.jpg",
    ],
  },
  {
    id: 16,
    title: "The Goan Hinterland Experience",
    location: "Quepem, Goa",
    price: "999",
    images: [
      "/images/activities/goan1.jpg",
      "/images/activities/goan2.jpg",
      "/images/activities/goan3.jpg",
    ],
  },
  {
    id: 17,
    title: "Margao Cultural Walk",
    location: "Borda, Goa",
    price: "999",
    images: [
      "/images/activities/margao1.jpg",
      "/images/activities/margao2.jpg",
      "/images/activities/margao3.jpg",
    ],
  },
];

function ShareDialog({ isOpen, onClose, property }) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Generate sharing URL for the property using hash
  const getShareUrl = () => {
    // Get base URL without hash
    const baseUrl = window.location.href.split("#")[0];
    // Create the hash based on the ID
    const hash = `experience-${property.id}`;
    // Return the full URL
    return `${baseUrl}#${hash}`;
  };

  // Handle sharing functionality
  const handleShare = async (platform) => {
    const shareUrl = getShareUrl();
    const shareText = `Check out ${property.title || property.name} in ${
      property.location
    }`;
    const priceText = property.price ? ` - ₹${property.price} per person` : "";
    const fullShareText = `${shareText}${priceText}`;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(shareUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          break;

        case "email":
          const emailSubject = encodeURIComponent(
            `Amazing Experience in Goa: ${property.title || property.name}`
          );
          const emailBody = encodeURIComponent(
            `${fullShareText}\n\n${shareUrl}`
          );
          window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
          break;

        case "whatsapp":
          const isMobile = /iPhone|iPad|iPod|Android/i.test(
            navigator.userAgent
          );
          const whatsappText = encodeURIComponent(
            `${fullShareText}\n\n${shareUrl}`
          );
          const whatsappUrl = isMobile
            ? `whatsapp://send?text=${whatsappText}`
            : `https://web.whatsapp.com/send?text=${whatsappText}`;
          window.open(whatsappUrl);
          break;

        case "twitter":
          const tweetText = encodeURIComponent(
            `${fullShareText}\n\n${shareUrl}`
          );
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
          break;

        case "messages":
          const smsBody = encodeURIComponent(`${fullShareText}\n\n${shareUrl}`);
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.open(`sms:?&body=${smsBody}`);
          } else {
            await navigator.clipboard.writeText(shareUrl);
            console.log("Link copied! You can paste it in your messaging app");
          }
          break;

        case "messenger":
          const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(
            navigator.userAgent
          );
          if (isMobileDevice) {
            // For mobile devices, try to open the Messenger app
            window.open(
              `fb-messenger://share/?link=${encodeURIComponent(
                shareUrl
              )}&app_id=YOUR_FACEBOOK_APP_ID`
            );
          } else {
            // For desktop, open Facebook Messenger web
            window.open(
              `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
                shareUrl
              )}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(
                window.location.origin
              )}`
            );
          }
          break;
        case "instagram":
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Try to open Instagram app with the story share feature
            try {
              // First copy the link to clipboard
              await navigator.clipboard.writeText(shareUrl);

              // Try to open Instagram app
              window.open("instagram://story-camera");

              // Show instruction modal
              setModalText(
                "Link copied! Open Instagram and paste in your story or message"
              );
              setTimeout(() => setModalText(""), 3000);
            } catch (error) {
              // Fallback to copying link
              console.log(error.message);
              await navigator.clipboard.writeText(shareUrl);
              setModalText("Link copied! You can paste it in Instagram");
              setTimeout(() => setModalText(""), 2000);
            }
          } else {
            // For desktop, just copy the link
            await navigator.clipboard.writeText(shareUrl);
            setModalText("Link copied! You can paste it in Instagram");
            setTimeout(() => setModalText(""), 2000);
          }
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
      }
    }

    if (platform !== "copy") {
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  const dialog = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center font-poppins justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-white text-absolute-dark rounded-lg shadow-xl max-w-md w-full relative"
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
              width={48}
              height={48}
              src={property?.images[0]}
              alt={property.title || property.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <span className="text-sm bg-white text-absolute-dark">
              {property.title || property.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ShareButton
              onClick={() => handleShare("copy")}
              icon="/icons/copy-link.svg"
              text="Copy Link"
              isSuccess={copySuccess}
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

function ShareButton({ icon, text, onClick, isSuccess }) {
  const [buttonText, setButtonText] = useState(text);

  useEffect(() => {
    if (text === "Copy Link" && isSuccess) {
      setButtonText("Copied!");
      const timer = setTimeout(() => {
        setButtonText(text);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, text]);

  return (
    <button
      onClick={onClick}
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

  const dialog = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-white text-absolute-dark rounded-lg shadow-xl w-full max-w-2xl relative"
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
              <h2 className="text-2xl font-semibold mb-1">{property.title}</h2>
              <p className="text-gray-600">{property.location}</p>
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between py-2 ">
                <span className="text-gray-600">Price per night</span>
                <span className="font-medium">₹{property.price}</span>
              </div>
              <div className="flex justify-between py-2 ">
                <span className="text-gray-600">Available dates</span>
                <span className="font-medium">{property.dateRange}</span>
              </div>
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
                      width={500}
                      height={500}
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

const calculatePriceWithTax = (price) => {
  return Math.round(price * 1.18); // 18% tax
};

const ExperienceCard = ({ experience, includeTaxes }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isInWishlist, wishlists } = useWishlist();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const cardRef = useRef(null);

  const isWishlisted =
    isInWishlist(experience.id, "stays") ||
    isInWishlist(experience.id, "experiences") ||
    Object.keys(wishlists.folders).some((folderId) =>
      isInWishlist(experience.id, folderId)
    );

  const formatPrice = (price) => {
    return typeof price === "string"
      ? Number(price.replace(/,/g, ""))
      : Number(price);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistDialogOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === experience.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? experience.images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === `#experience-${experience.id}`) {
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 2000);
          }
        }, 500); // Delay to ensure content is loaded
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [experience.id]);

  // Add scroll and highlight effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === `#experience-${experience.id}`) {
        const element = document.getElementById(`experience-${experience.id}`);
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
  }, [experience.id]);

  const displayPrice = includeTaxes
    ? calculatePriceWithTax(experience.price)
    : experience.price;

  return (
    <div>
      {/* <MainTab /> */}
      <div
        ref={cardRef}
        id={`experience-${experience.id}`}
        className={`overflow-hidden w-full font-poppins mt-8 group
        transition-all duration-300 ease-in-out
        ${
          isHighlighted
            ? "scale-[1.02] shadow-lg shadow-blue-200 ring-2 ring-blue-500 ring-opacity-50"
            : ""
        }
      `}
      >
        <div className="relative aspect-[4/3] rounded-2xl">
          <div
            className="absolute rounded-2xl inset-0 flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {experience.images.map((image, index) => (
              <Image
                width={600}
                height={600}
                key={index}
                src={image}
                alt={`${experience.title} view ${index + 1}`}
                className="w-full h-full rounded-xl object-cover flex-shrink-0"
              />
            ))}
          </div>

          <div
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            onClick={prevImage}
            aria-label="Previous image"
          />

          <div
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            onClick={nextImage}
            aria-label="Next image"
          />

          <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
            <div className="bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              Guest&apos;s fav
            </div>
            <div className="bg-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
              <span>5</span>
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-yellow-400" />
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {experience.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  currentImageIndex === index ? "bg-white" : "bg-white/60"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base sm:text-lg font-semibold">
              {experience.title}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="inline-flex items-center justify-center h-8 w-8 right-4 hover:text-gray"
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
                  isWishlisted ? "text-red-500" : "text-gray"
                }`}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isWishlisted ? "currentColor" : "none"}
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
                className="text-gray inline-flex h-8 w-8 items-center justify-center rounded-md hover:text-gray-600"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Image
                  width={24}
                  height={24}
                  src="/icons/share-icon.svg"
                  alt="Share Icon"
                  className="w-6 h-6 justify-center"
                />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-xs sm:text-sm">{experience.location}</span>
          </div>
          {/* <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-base sm:text-lg font-semibold">₹{displayPrice}</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">per person</span>
            {includeTaxes && <span className="text-xs ml-1">(incl. taxes)</span>}
          </div>
          {isWishlisted && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Saved
            </span>
          )}
        </div> */}
        </div>

        <InfoDialog
          isOpen={isInfoDialogOpen}
          onClose={() => setIsInfoDialogOpen(false)}
          property={experience}
        />
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          property={experience}
        />
        <WishlistDialog
          isOpen={isWishlistDialogOpen}
          onClose={() => setIsWishlistDialogOpen(false)}
          property={{
            id: experience.id,
            name: experience.title,
            location: experience.location,
            price: formatPrice(experience.price),
            dates: experience.dateRange,
            images: experience.images,
            itemType: "experiences",
          }}
        />
      </div>
    </div>
  );
};

export default function Component() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activitiesStart, setActivitiesStart] = useState(0);

  const [searchAdventure, setSearchAdventure] = useState("");
  const [searchDates, setSearchDates] = useState(null);
  const [searchGuests, setSearchGuests] = useState("");
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const displayedExperiences = showAll ? experiences : experiences.slice(0, 8);

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

  function FilterSheet() {
    const [open, setOpen] = useState(false);
    const [priceRange, setPriceRange] = useState([84, 8411]);
    const [showMoreActivity, setShowMoreActivity] = useState(false);
    const [showMoreLanguage, setShowMoreLanguage] = useState(false);

    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="h-11 px-8 border-2 border-[#4E7B39] text-[#4E7B39] rounded-full hover:bg-[#4E7B39] hover:text-white transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
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
                  <p className="text-gray-600 mb-4">
                    The average price of an experience is ₹3,39,980.
                  </p>
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
                  <h3 className="text-xl font-semibold mb-4">
                    Language offered
                  </h3>
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
                className="bg-mughal-green text-white rounded-lg px-6 py-3 font-medium"
              >
                Show 273 results
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <div className="w-full font-poppins bg-white text-absolute-dark md:pt-16 ">
      {/* <ExperiencePartnerSection/> */}

      <section
        id="experiences"
        className="px-4 md:px-[72px] sm:px-6 lg:px-[72px] py-12 sm:py-16 lg:py-[128px]"
      >
        <Heading text="Exciting Experiences in Goa" />
        <SubHeading className="text-left" text="Live Goa, not just visit" />

        <div className="flex flex-col rounded-full sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8">
          <div className="w-full relative max-w-[850px]">
            <div
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-hidden  px-2 py-2 max-w-[850px]"
            >
              {activities.map((type, index) => (
                <div key={index} className="text-center flex-shrink-0">
                  <div className="w-[78px] h-[68px] bg-[#F7F7F7] rounded-lg flex items-center justify-center mb-2">
                    <Image
                      width={78}
                      height={78}
                      src={type.icon}
                      alt={type.label}
                      className="w-[78px] h-[68px] rounded-full object-contain opacity-75"
                    />
                  </div>
                </div>
              ))}
            </div>
            {activities.length > 6 && (
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

          {/* <div className="flex flex-row items-center gap-4">
            <FilterSheet>
              <button className="h-11 px-8 border-2 border-[#4E7B39] text-[#4E7B39] rounded-full hover:bg-[#4E7B39] hover:text-white transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </FilterSheet>
            <div className="h-11 flex items-center px-6 gap-4 border-2 border-brightGreen rounded-full">
              <button
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${includeTaxes ? 'bg-brightGreen justify-end' : 'bg-solidGray justify-start border-brightGreen'
                  }`}
                onClick={() => setIncludeTaxes(!includeTaxes)}
                aria-label={includeTaxes ? "Exclude taxes" : "Include taxes"}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
              <span className="text-sm text-[#666666] font-medium whitespace-nowrap">
                {includeTaxes ? "Including Taxes" : "Excluding Taxes"}
              </span>
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedExperiences.map((experience, index) => (
            <ExperienceCard
              key={index}
              experience={experience}
              includeTaxes={includeTaxes}
            />
          ))}
        </div>
        {!showAll && experiences.length > 8 && (
          <div className="flex justify-center mt-12">
            <button
              className="bg-[#4E7B39] hover:bg-[#3d612d] text-white px-12 py-3 rounded-full transition-colors duration-300"
              onClick={() => setShowAll(true)}
            >
              View More
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
