"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface PhotoGalleryModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoGalleryModal({
  images,
  isOpen,
  onClose,
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal opens
  // useEffect(() => {
  //   if (isOpen) {
  //     setCurrentIndex(0);
  //     // Prevent scrolling when modal is open
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }

  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);

      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      // Store scroll position for later restoration
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      // Restore scroll position
      const scrollY = document.body.dataset.scrollY || "0";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "auto";

      // Scroll back to original position
      window.scrollTo(0, parseInt(scrollY, 10));

      // Clean up
      delete document.body.dataset.scrollY;
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "auto";
      delete document.body.dataset.scrollY;
    };
  }, [isOpen]);
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowLeft") {
        navigateToPrevious();
      } else if (e.key === "ArrowRight") {
        navigateToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  const navigateToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const navigateToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const navigateToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0  z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-medium text-black">
            {currentIndex + 1} / {images.length}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Main image */}
          <div className="relative flex-1 flex items-center justify-center bg-black">
            <div className="relative w-full h-full max-h-[70vh]">
              <Image
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`Property image ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
              />
            </div>

            {/* Navigation arrows */}
            <button
              onClick={navigateToPrevious}
              className="absolute left-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-black" />
            </button>

            <button
              onClick={navigateToNext}
              className="absolute right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-black" />
            </button>
          </div>

          {/* Thumbnails - visible on larger screens */}
          <div className="hidden md:block w-24 lg:w-32 border-l overflow-y-auto max-h-[70vh] bg-white">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square cursor-pointer p-1 ${
                  currentIndex === index ? "border-2 border-black" : ""
                }`}
                onClick={() => navigateToImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile thumbnails - horizontal scroll */}
        <div className="md:hidden flex overflow-x-auto p-2 gap-2 border-t bg-white">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative h-16 w-16 flex-shrink-0 cursor-pointer rounded ${
                currentIndex === index ? "ring-2 ring-black" : ""
              }`}
              onClick={() => navigateToImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
