"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Check, Dot, X } from "lucide-react";
import Heading from "@/components/ui/heading";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

type ImageTextSectionProps = {
  images: string[];
  items: string[];

  disabled: boolean;
  title: string;
  content: string;
};

// Modal Component
type BookingModalProps = {
  isOpen: boolean;
  source: string;
  data: string;
  onClose: () => void;
};

type ActivityModalProps = {
  data: string[];

  isOpen: boolean;
  onClose: () => void;
};
const charDham = {
  images: [
    "/images/tour/CHARDHAM_1.jpg",
    // "/images/tour/CHARDHAM_2.jpg"
  ],
  items: [
    "5 Nights/6 Days",
    "Ex-Haridwar",
    "Explore Yamunotri, Gangotri, Kedarnath & Badrinath",
    "All-inclusive package (transport, accommodation, meals)",
    "Guided temple tours",
  ],
  title: "Char Dham Yatra Package",
  content: `Embark on a divine pilgrimage with our Char Dham Yatra package
            starting from Haridwar. In 5 nights and 6 days, you'll visit the
            sacred shrines of Yamunotri, Gangotri, Badrinath. `,
  disabled: false,
};
const doDham = {
  images: ["/images/tour/do_dhaam.jpg"],
  items: [
    "5 Nights/6 Days",
    "Visit Haridwar - Guptkashi/Sitapur",
    "Explore Kedarnath & Badrinath",
    "All-inclusive package (transport, accommodation, meals)",
    "Guided temple tours",
  ],
  title: "Do Dham Yatra Package - Kedarnath & Badrinath",
  content: `Embark on a divine pilgrimage with our Do Dham Yatra package starting from Haridwar. In 5 nights and 6 days, you'll visit the sacred shrines of Kedarnath and Badrinath`,
  disabled: false,
};
const goa = {
  images: ["/images/tour/goa.jpg"],
  items: [
    "Pick and drop",
    "All-inclusive package (transport, accommodation, meals)",
    "Guided tours",
  ],
  title: "Goa Coastal Escape Package - Beaches & Sightseeing",
  content: `Discover Goa, India's top holiday destination that offers a vibrant mix of beaches, heritage sites, adventure sports, and nightlife.`,
  disabled: false,
};
const unity = {
  images: ["/images/tour/statue_of_unity.jpg"],
  items: [
    "Statue of Unity tour",
    "Visit Valley of flowers and unity glow garden",
    "Stay in royal cottage/premium villa",
    "Enjoy jungle safari.",
  ],
  title: "Statue of Unity Tour Package - Gujarat",
  content: `Visit Statue of Unity dedicated to Sardar Vallabhbhai Patel, one of the most important leaders in Indian history.`,
  disabled: false,
};
const dwarka = {
  images: ["/images/tour/dwarka.jpg"],
  items: [
    "Darshan at the sacred Jyotirlingas of Somnath and Nageshwar",
    "Explore Dwarka",
    "All-inclusive package (transport, accommodation, meals)",
    "Visit to key spiritual and historical sites",
  ],
  title: "Dwarka Somnath Nageshwar Jyotirlinga Tour Package – Gujarat",
  content: `Experience a divine journey through the sacred lands of Dwarka, Somnath, and Nageshwar—where faith meets timeless heritage.`,
  disabled: false,
};
const ram_mandir = {
  images: ["/images/tour/ram_mandir.jpg"],
  items: [
    "Divine darshan at Shri Ram Mandir in Ayodhya and the sacred Kashi Vishwanath Temple",
    "Spiritual walk through the ancient lanes and heritage",
    "Comfortable travel, guided sightseeing, and seamless transfers for a hassle-free pilgrimage",
  ],
  title:
    "Ayodhya Varanasi Spiritual Tour Package – Ram Mandir & Kashi Vishwanath",
  content: `Embark on a soulful journey to Ayodhya and Varanasi, witnessing the divine aura of Shri Ram Mandir and Kashi Vishwanath.`,
  disabled: false,
};
const rannUtsav = {
  images: [
    "/images/tour/rann_utsav_1.jpg",
    // "/images/tour/rann_utsav_2.jpg",
    // "/images/tour/rann_utsav_3.jpg",
  ],
  items: [
    "White Desert experience at the Great Rann of Kutch",
    "Cultural festival with folk music, dance & craft exhibitions",
    "Stay in luxury desert tents at Dhordo Tent City",
    "Camel rides, ATV rides & desert safaris",
    "Visit craft villages & traditional Kutchi markets",
  ],
  title: "Rann Utsav White Desert Experience - Kutch",
  content: `Experience the magical charm of the White Desert with our specially curated Rann Utsav journey 
  in Gujarat’s Kutch region. Held in Dhordo near the Great Rann of Kutch.`,
  disabled: true,
};

const sections = [charDham, doDham, unity, dwarka, goa, ram_mandir, rannUtsav];
function BookingModal({ isOpen, source, onClose, data }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    traveller_type: "",
    experience: data || "",
    source: source,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    traveller_type: "",
  });
  // console.log(formData.source);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<null | string>(null);
  // Use a ref to store the scroll position
  const scrollPositionRef = useRef(0);

  const locations = ["Solo", "Couple", "Family", "Group", "Corporate"];

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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Form submitted:", formData);
  //   // Add your form submission logic here
  //   // alert(
  //   //   `Booking submitted for ${formData.name} at ${formData.location}`,
  //   // );
  //   onClose();
  // };
  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      traveller_type: "",
      experience: "",
    };

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Name should contain only letters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.traveller_type) {
      newErrors.traveller_type = "Select tour type";
    }

    setErrors(newErrors);

    return !newErrors.name && !newErrors.email && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      const res = await fetch(
        "https://live-am.coderelix.com/webhook/6ddb7f90-fb17-4209-8f0d-685bf79a4659",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const json = await res.json();
      if (res.status == 200) {
        if (json.status != "success") {
          // console.log(res.status);
          // console.log(json);
          if (json?.status == "duplicate") {
            toast.error("You have already submitted the details.");
            return;
          } else {
            // console.log(res);
            toast.error("Make sure that all fields are filled.");
            return;
          }
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      // console.log(json);
      toast.success(
        "Thank you for requesting your itinerary! Our travel experts are crafting the perfect experience for you. Magic is on its way!",
      );
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
      onClose();
    }
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

  useEffect(() => {
    setFormData((prev) => ({ ...prev, experience: data || "" }));
  }, [data]);

  // Clear submission status and reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSubmissionStatus(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        traveller_type: "",
        experience: data || "",
        source: source || "direct",
      });
    }
  }, [isOpen, data]);

  // Auto-hide submission popup after a few seconds
  useEffect(() => {
    if (!submissionStatus) return;
    const t = setTimeout(() => setSubmissionStatus(null), 3500);
    return () => clearTimeout(t);
  }, [submissionStatus]);

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
              Curate Your Experience
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details to proceed
            </p>
          </div>

          {/* Form */}
          <form
            id="experience-inquiry-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
                  placeholder="Enter your email id"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number
                </label>
                <input
                  type="text"
                  id="phone"
                  required
                  value={formData.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
                  placeholder="Enter your WhatsApp number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Traveller Type
              </label>
              <select
                id="location"
                required
                value={formData.traveller_type}
                onChange={(e) =>
                  setFormData({ ...formData, traveller_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent"
              >
                <option value="">Traveller Type</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.traveller_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.traveller_type}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Experience
              </label>
              <input
                id="experience"
                value={data}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:border-transparent cursor-default"
                readOnly
              />
            </div>

            <button
              id="experience-submit-button"
              type="submit"
              disabled={loading}
              className={
                loading
                  ? "w-full mt-6 px-4 py-3 font-medium text-white bg-lightGreen rounded-lg  transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-offset-2"
                  : "w-full mt-6 px-4 py-3 font-medium text-white bg-primaryGreen rounded-lg hover:bg-brightGreen transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primaryGreen focus:ring-offset-2"
              }
            >
              {loading ? "Submitting..." : "Get Itinerary"}
            </button>
          </form>

          {/* Submission status popup */}
          {/* {submissionStatus && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="pointer-events-auto max-w-xs w-full mx-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {submissionStatus === "success" ? (
                    <Check className="h-6 w-6 text-green-600" />
                  ) : submissionStatus === "duplicate" ? (
                    <Dot className="h-6 w-6 text-orange-500" />
                  ) : (
                    <X className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {submissionStatus === "success" && "Submitted successfully."}
                  {submissionStatus === "duplicate" &&
                    "Duplicate enquiry detected."}
                  {submissionStatus !== "success" &&
                    submissionStatus !== "duplicate" &&
                    "Submission failed. Please try again."}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setSubmissionStatus(null);
                      if (submissionStatus === "success") onClose();
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-md text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
function ActivityModal({ data, isOpen, onClose }: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  // Use a ref to store the scroll position
  const scrollPositionRef = useRef(0);

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
              Things to Experience
            </h3>
            <p className="text-sm text-gray-500 mt-1">List of activities</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {data.map((item: string, i: number) => (
                <div
                  key={i}
                  className="flex  gap-1 md:gap-3 text-sm md:text-base lg:text-base text-gray-800 font-medium"
                >
                  <Check className="h-6 w-6 md:h-6 md:w-6 mr-1 md:mr-2 text-black shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ImageTextSection(data: ImageTextSectionProps) {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalActivityOpen, setIsModalActivityOpen] = useState(false);
  const [experienceType, setExperienceType] = useState("");
  const searchParams = useSearchParams();
  const utm_source = searchParams.get("utm_source");
  const next = () => {
    setIndex((prev) => (prev + 1) % data.images.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + data.images.length) % data.images.length);
  };

  return (
    <>
      <div className="w-full lg:flex lg:items-stretch border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* LEFT SECTION */}
        {/* LEFT SECTION */}
        <div className="w-full lg:w-[50%] relative border-r border-gray-200 bg-gray-50 flex  h-[220px] md:h-[420px] lg:h-auto">
          <img
            src={data.images[index]}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Navigation */}
          {data.images.length > 1 && (
            <>
              {index !== 0 && (
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl z-10"
                >
                  ‹
                </button>
              )}

              {index < data.images.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-10 h-10 flex items-center justify-center text-xl z-10"
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full lg:w-[50%] p-6 md:p-10">
          <div className="text-lg md:text-xl pb-4 md:pb-8 font-semibold">
            {data?.title}
          </div>
          <div className="text-base md:text-base text-justify lg:text-base pb-6 md:pb-8 text-gray-600">
            {data?.content}
            {data?.disabled ? (
              <>
                <br></br>
                <br></br>
                <b>(Note: Booking starts this June)</b>
              </>
            ) : null}
          </div>
          <div className="pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-y-2 md:gap-y-1 gap-x-6 md:gap-x-10">
            {/* {data?.items.map((item, i) => (
              <div
                key={i}
                className="flex  gap-1 md:gap-3 text-sm md:text-base lg:text-base text-gray-800 font-medium"
              >
                <Check className="h-6 w-6 md:h-6 md:w-6 mr-1 md:mr-2 text-black shrink-0" />
                <span>{item}</span>
              </div>
            ))} */}
          </div>
          <div className="lg:flex md:space-x-5 lg:justify-end">
            <button
              onClick={() => setIsModalActivityOpen(true)}
              className={
                "text-sm mb-6 md:mb-0 w-full sm:w-64 md:text-base text-center sm:mr-4 px-2 sm:px-6 md:px-6 py-2 sm:py-3 md:mr-0 font-medium text-white bg-primaryGreen rounded-full hover:bg-brightGreen transition-colors duration-300 cursor-pointer"
              }
            >
              Activities
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setExperienceType(data.title);
              }}
              className={
                data?.disabled
                  ? "text-sm w-full sm:w-64 md:text-base text-center sm:mr-4 px-2 sm:px-6 md:px-6 py-2 sm:py-3 md:mr-0 font-medium text-black bg-white border-2 border-primaryGreen rounded-full  transition-colors duration-300 "
                  : "text-sm w-full sm:w-64 md:text-base text-center sm:mr-4 px-2 sm:px-6 md:px-6 py-2 sm:py-3 md:mr-0 font-medium text-white bg-primaryGreen rounded-full hover:bg-brightGreen transition-colors duration-300 cursor-pointer"
              }
              disabled={data?.disabled}
            >
              {data?.disabled ? "Coming Soon" : "Get Itinerary"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        data={experienceType}
        source={utm_source || "direct"}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
      <ActivityModal
        data={data.items}
        isOpen={isModalActivityOpen}
        onClose={() => setIsModalActivityOpen(false)}
      />
    </>
  );
}

export default function Component() {
  return (
    <div className="w-full font-poppins bg-white text-absolute-dark">
      <section id="experiences" className="px-4 sm:px-6 md:px-[72px] py-16">
        <Heading text="Exciting Experiences in India" />
        {sections.map((section, i) => (
          <div key={i} className="mt-16">
            <ImageTextSection {...section} />
          </div>
        ))}
        {/* <div className="mt-12">
          <ImageTextSection {...data} />
          <div className="mt-16">
            <ImageTextSection {...data2} />
          </div>
        </div> */}
      </section>
    </div>
  );
}
