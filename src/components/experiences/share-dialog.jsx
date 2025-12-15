"use client";

import Image from "next/image";
import ShareButton from "./share-button";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ShareDialog({ isOpen, onClose, property }) {
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

            if (process.env.NEXT_PUBLIC_ENV === "dev") {
              console.log(
                "Link copied! You can paste it in your messaging app"
              );
            }
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
              if (process.env.NEXT_PUBLIC_ENV === "dev") {
                console.log(error.message);
              }
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
