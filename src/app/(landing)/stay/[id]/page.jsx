"use client";
import "../../../booking.css";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react"; // Added useMemo and useEffect
import Head from "next/head";
// Import your components
import ImageGallery from "./components/image-gallery";
import PropertyListing from "./components/property-listing";
import Location from "./components/location";
import ThingsToKnow from "./components/things-to-know";
import HostProfile from "./components/host-profile"; // Assuming this is the refactored component
import ReviewSection from "./components/review-section";
// Import the skeleton for HostProfile if you want a more granular loading state,
// but the refactored HostProfile handles its own skeleton.
// import { HostProfileSkeleton } from "./components/host-profile";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- API Fetching Functions ---

// Function to fetch property data
const fetchProperty = async (id) => {
  if (!id) throw new Error("Property ID is missing");
  const response = await fetch(`${API_URL}/properties/${id}`);
  if (!response.ok) {
    console.error(
      "Failed to fetch property:",
      response.status,
      await response.text(),
    );
    throw new Error(
      `Failed to fetch property data (status: ${response.status})`,
    );
  }
  const result = await response.json();

  return result.data;
};

// Function to fetch host data (moved here from HostProfile)
// const fetchHostData = async (hostIdStr) => {
//   if (!hostIdStr) {
//     throw new Error("Host ID is missing");
//   }
//   const getLocalData = await localStorage.getItem("token");
//   const data = JSON.parse(getLocalData);
//   // const response = await fetch(`${API_URL}/hostData/${hostIdStr}`);
//   const response = await fetch(`${API_URL}/hostData/${hostIdStr}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${data}`,
//     },
//   });
//   if (!response.ok) {
//     console.error(
//       "Failed to fetch host:",
//       response.status,
//       await response.text()
//     );
//     throw new Error(`Failed to fetch host data (status: ${response.status})`);
//   }
//   const result = await response.json();
//   return result.data;
// };

// --- The Main Page Component --
const fetchReview = async (propertyId, limit, skip) => {
  if (!propertyId) {
    throw new Error("Host ID is missing");
  }

  const response = await fetch(
    `${API_URL}/review/${propertyId}?limit=${limit}&skip=${skip}`,
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch host:",
      response.status,
      await response.text(),
    );
    throw new Error(`Failed to fetch host data (status: ${response.status})`);
  }
  const result = await response.json();

  return result;
};

export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.id;
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);
  // --- Query 1: Fetch Property Data ---
  const [next, setNext] = useState(2);
  const [prev, setPrev] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);

  const handleNext = () => {
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("ggg", propertyData.reviewCount);
    }
    if (next != limit && next < propertyData.reviewCount) {
      setPrev(next);
      setNext(next + 2);
    } else {
      const nextSkip = skip + limit;
      if (nextSkip < propertyData.reviewCount) {
        setSkip(nextSkip);
        refetchReview();
      }
    }
  };
  const handlePrevious = () => {
    if (prev >= 2) {
      setPrev(prev - 2);
      setNext(prev);
    } else {
      setSkip((prev) => Math.max(prev - limit, 0));
      refetchReview();
    }
  };
  useEffect(() => {
    async function fetchDates() {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/booking/check-dates/${propertyId}`,
        );

        if (response.status != 200) {
          throw new Error(
            `Failed to fetch host data (status: ${response.status})`,
          );
        }
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("bbbbbbb", response);
        }
        setUnavailableDates(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDates();
  }, [propertyId]);

  const {
    data: propertyData,
    isLoading: isPropertyLoading, // Renamed for clarity
    error: propertyError, // Renamed for clarity
    isFetching: isPropertyFetching,
    isError: isPropertyError,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => fetchProperty(propertyId),
    enabled: !!propertyId, // Only run if propertyId exists
    // Optional: Add staleTime, cacheTime etc.
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Derive Host ID and Normalize ---
  const hostId = propertyData?.host; // Get host ID from property data

  const hostIdStr = useMemo(() => {
    if (!hostId) return null;
    return typeof hostId === "object"
      ? hostId._id
        ? hostId._id.toString()
        : JSON.stringify(hostId) // Less ideal fallback
      : typeof hostId === "string"
        ? hostId
        : String(hostId);
  }, [hostId]); // Recalculate only if hostId changes

  // --- Query 2: Fetch Host Data ---
  // const {
  //   data: hostData,
  //   isLoading: isHostLoading, // Renamed for clarity
  //   error: hostError, // Renamed for clarity
  //   isFetching: isHostFetching,
  //   isError: isHostError,
  // } = useQuery({
  //   queryKey: ["hostProfile", hostIdStr], // Use normalized hostIdStr in key
  //   queryFn: () => fetchHostData(hostIdStr),
  //   // Enable only when we have a valid, non-empty string hostIdStr
  //   enabled:
  //     !!hostIdStr && typeof hostIdStr === "string" && hostIdStr.length > 0,
  //   // Optional: Configure caching/retries differently for host data if needed
  //   // staleTime: 15 * 60 * 1000, // 15 minutes
  // });

  const {
    data: reviewData,
    isLoading: isReviewLoading, // Renamed for clarity
    error: reviewError, // Renamed for clarity
    isFetching: isReviewFetching,
    isError: isReviewError,
    refetch: refetchReview,
  } = useQuery({
    queryKey: ["review", propertyId, limit, skip],
    queryFn: () => fetchReview(propertyId, limit, skip),
    enabled: !!propertyId, // Only run if propertyId exists
    // Optional: Add staleTime, cacheTime etc.
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("rev", unavailableDates);
  }
  // --- Log states for debugging ---
  // useEffect(() => {
  //   // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Property Query:", { propertyId, isPropertyLoading, isPropertyFetching, isPropertyError, propertyError: propertyError?.message });
  // }
  // }, [
  //   propertyId,
  //   isPropertyLoading,
  //   isPropertyFetching,
  //   isPropertyError,
  //   propertyError,
  // ]);

  // useEffect(() => {
  //   // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Host Query:", { hostIdStr, isHostLoading, isHostFetching, isHostError, hostError: hostError?.message });
  // }
  // }, [hostIdStr, isHostLoading, isHostFetching, isHostError, hostError]);

  // --- Handle Main Property Loading/Error State ---
  // Show loading indicator if the main property data is loading
  if (isPropertyLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
        <p className="pt-8 text-xl text-gray-600">
          Loading Property Details...
        </p>
      </div>
    );

    // return (
    //   <div className="min-h-screen flex items-center justify-center pt-32">
    //     {/* You might want a more sophisticated page-level skeleton here */}

    //   </div>
    // );
  }

  // Show error message if the main property fetch failed
  if (propertyError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Error loading property
          </h2>
          <p className="text-red-600">Try refreshing</p>
          <button
            onClick={() => window.location.reload()} // Simple refresh action
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If property data exists, derive necessary values
  // Note: Put this *after* the loading/error checks for propertyData
  const hostFirstName = propertyData?.host?.name?.split(" ")[0] || "Host";
  const locationInfo = {
    lat: propertyData?.address?.latitude,
    long: propertyData?.address?.longitude,
    address:
      propertyData?.address?.city &&
      propertyData?.address?.state &&
      propertyData?.address?.country
        ? `${propertyData.address.city}, ${propertyData.address.state}, ${propertyData.address.country}`
        : "Location not fully specified",
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("new prop", propertyData?.host);
  }
  const getMetaTags = () => {
    if (!propertyData) return null;

    const siteUrl = `https://user.me.coderelix.in/`;
    const propertyUrl = `${siteUrl}/properties/${propertyId}`;
    const propertyImage = propertyData?.photos?.[0] || "/default-property.jpg";
    const absoluteImageUrl = propertyImage.startsWith("http")
      ? propertyImage
      : `${siteUrl}${propertyImage}`;

    const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(propertyData.title)}&description=${encodeURIComponent(propertyData.description?.substring(0, 200) || "")}&price=${propertyData.basePrice}&location=${encodeURIComponent(propertyData.address?.city || "Goa")}&image=${encodeURIComponent(absoluteImageUrl)}`;

    return {
      title: `${propertyData.title} | Majestic Escape`,
      description:
        propertyData.description ||
        `Book ${propertyData.title} in ${propertyData.address?.city || "Goa"}. ${propertyData.basePrice ? `₹${propertyData.basePrice} per night` : ""}`,
      ogImageUrl,
      propertyUrl,
    };
  };
  const metaTags = getMetaTags();
  // --- Render the Page Content ---
  return (
    <>
      <Head>
        <title>{metaTags?.title || "Property | Majestic Escape"}</title>
        <meta
          name="description"
          content={
            metaTags?.description ||
            "Discover amazing properties on Majestic Escape"
          }
        />

        {metaTags && (
          <>
            {/* Open Graph Tags */}
            <meta property="og:title" content={metaTags.title} />
            <meta property="og:description" content={metaTags.description} />
            <meta property="og:image" content={metaTags.ogImageUrl} />
            <meta property="og:url" content={metaTags.propertyUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Majestic Escape" />
            <meta property="og:locale" content="en_IN" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTags.title} />
            <meta name="twitter:description" content={metaTags.description} />
            <meta name="twitter:image" content={metaTags.ogImageUrl} />

            {/* Additional OG Properties */}
            <meta
              property="og:price:amount"
              content={propertyData?.basePrice?.toString() || ""}
            />
            <meta property="og:price:currency" content="INR" />
          </>
        )}
      </Head>
      <main className="min-h-screen pt-[80px] md:pt-52 desktop:pt-56 bg-white booking-widget">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Property Title */}
          <h1 className="text-xl lg:mt-4 md:text-2xl font-bricolage font-semibold mb-4 md:mb-6">
            {propertyData?.title || "Property Title"}
          </h1>

          {/* Image Gallery */}
          {/* Pass isPropertyLoading here as images depend on property data */}
          <ImageGallery
            images={propertyData?.photos || []}
            isLoading={isPropertyLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-0 md:mt-8">
            {" "}
            {/* Added grid layout */}
            {/* Left Column (Listing Details) */}
            <div className="lg:col-span-2 space-y-8">
              {" "}
              {/* Takes 2/3 width on large screens */}
              {/* Property Listing Details */}
              {/* Pass isPropertyLoading if PropertyListing needs it */}
              <PropertyListing
                propertyDetails={propertyData}
                isLoading={isPropertyLoading}
                unavailableDates={unavailableDates}
                loading={loading}
              />
              {/* Review Section */}
              {/* Pass relevant review data and potentially property ID */}
              <ReviewSection
                reviews={reviewData}
                property={propertyData}
                isLoading={isReviewLoading}
                error={isReviewError}
                handleNext={handleNext}
                handleBack={handlePrevious}
                prev={prev}
                next={next}
              />
            </div>
          </div>

          {/* Sections below the main grid */}
          <div className="mt-12 space-y-12">
            {" "}
            {/* Add spacing */}
            {/* Location Map */}
            <Location
              locationInfo={locationInfo}
              isLoading={isPropertyLoading} // Map depends on property location data
            />
            {/* Host Profile */}
            {/* Pass data/loading/error states from the *host* query */}
            <HostProfile
              propertyData={propertyData}
              // isLoading={isPropertyLoading}
              // error={propertyError}
            />
            {/* Things To Know */}
            {/* Pass isPropertyLoading if ThingsToKnow depends on it */}
            {/* <ThingsToKnow thingsToKnow={propertyData?.thingsToKnow || {}} isLoading={isPropertyLoading} /> */}
          </div>
        </div>
      </main>
    </>
  );
}
