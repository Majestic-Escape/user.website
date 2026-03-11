"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dot, X } from "lucide-react";
import Heading from "@/components/ui/heading";

type ImageTextSectionProps = {
  images: string[];
  items: string[];
};

// Modal Component
type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
  });

  // Use a ref to store the scroll position
  const scrollPositionRef = useRef(0);

  const locations = [
    "Rann Utsav - White Desert",
    "Kerala Backwaters",
    "Goa Beaches",
    "Rajasthan Palaces",
    "Himalayan Treks",
    "Andaman Islands",
  ];

  // Lock scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position in the ref
      scrollPositionRef.current = window.scrollY;

      // Get the current width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Lock the scroll on both body and html
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

      // Don't set position relative and top on body - this causes the jumping
      // Instead, just prevent scrolling and let the modal handle positioning
    } else {
      // Restore scroll position
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.paddingRight = "";

      // Scroll back to the saved position instantly
      window.scrollTo(0, scrollPositionRef.current);
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
    alert(
      `Booking submitted for ${formData.firstName} ${formData.lastName} at ${formData.location}`,
    );
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Center it properly */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Book Your Experience
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details to proceed with booking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Location
              </label>
              <select
                id="location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
              >
                <option value="">Choose a location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 font-medium text-white bg-primaryGreen rounded-lg hover:bg-brightGreen transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-offset-2"
            >
              Submit Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ImageTextSection({ images, items }: ImageTextSectionProps) {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="w-full md:flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* LEFT SECTION */}
        <div className="w-full md:w-[30%] relative border-r border-gray-200 bg-gray-50">
          {/* This div will take the full height of its parent */}
          <div className="relative w-full h-full ">
            <Image
              src={images[index]}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover "
              sizes="(max-width: 768px) 100vw, 30vw"
              // priority
              unoptimized
            />
          </div>

          {/* Navigation - only show if there's more than one image */}
          {images.length > 1 && (
            <>
              {index !== 0 && (
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl z-10"
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              {index < images.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl z-10"
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full md:w-[70%] p-6 md:p-10">
          <div className="text-xl md:text-2xl pb-4 md:pb-8 font-semibold">
            Rann Utsav
          </div>
          <div className="text-base md:text-lg pb-6 md:pb-8 text-gray-600">
            Nestled within the surreal serenity of the White Rann, every stay
            here is a sensory escape. If you're searching for the best tent in
            the Rann of Kutch, you've arrived at the right place. At Rann
            Utsav-The Tent City, accommodations range from tastefully furnished
            premium tents with wooden interiors and soft linens to regal rajwadi
            suites, which exude royal charm with spacious living areas and
            curated artefacts. Each option is designed for comfort, privacy, and
            a unique experience.
          </div>
          <div className="pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 md:gap-y-1 gap-x-6 md:gap-x-10">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-1 md:gap-3 text-sm md:text-base text-gray-800 font-medium"
              >
                <Dot className="h-6 w-6 md:h-9 md:w-9 mr-1 md:mr-2 text-black shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm w-full sm:w-64 md:text-base text-center sm:mr-4 px-4 sm:px-6 md:px-6 py-4 sm:py-3 font-medium text-white bg-primaryGreen rounded-full hover:bg-brightGreen transition-colors duration-300 cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function Component() {
  return (
    <div className="w-full font-poppins bg-white text-absolute-dark">
      <section id="experiences" className="px-4 sm:px-6 md:px-[72px] py-16">
        <Heading text="Exciting Experiences in India" />

        <div className="mt-12">
          <ImageTextSection
            images={[
              "/images/hero/Artboard_Mob.png",
              "/images/govt/rann_utsav.png",
              "/images/govt/evoke.png",
            ]}
            items={[
              "Adventure Sports",
              "River Rafting",
              "Trekking",
              "Wildlife Safari",
              "Camping",
              "Cultural Tours",
            ]}
          />
          <div className="mt-16">
            <ImageTextSection
              images={[
                "/images/govt/evoke.png",
                "/images/govt/rann_utsav.png",
                "/images/govt/evoke.png",
              ]}
              items={[
                "Adventure Sports",
                "River Rafting",
                "Trekking",
                "Wildlife Safari",
                "Camping",
                "Cultural Tours",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
