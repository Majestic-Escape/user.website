"use client";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { propertyService } from "@/services/propertyService";
import Rating from "./components/ratings";
import PriceCard from "./components/price";
import StayInformation from "./components/information";
import Facility from "./components/facility";
import HostInformation from "./components/hostDetails";
import Review from "./components/reviews";
import Carousel from "./components/carousel";
import Last from "./components/last";
import ImageGrid from "./components/image-grid";
import Suggestion from "./components/suggestions";
import dynamic from "next/dynamic";

const Location = dynamic(() => import("./components/Location"), { ssr: false });
export default function Page({ params }) {
  const { ["property-uid"]: propertyUid } = use(params);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        // Use the correct parameter name that matches your route
        const data = await propertyService.getPropertyById(propertyUid);
        setProperty(data);
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("Data showing:", data);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyUid]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!property) return <div>No property found</div>;

  return (
    <div className="w-screen flex justify-center py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="p-4 space-y-4">
          {/* <ImageGrid images={property?.photos} /> */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side content */}
            {/* <div className="md:col-span-2">
              <div className="space-y-6">
                <Rating property={property} />
                <StayInformation description={property.description.detailed} />
                <Facility amenities={property.amenities} />
                <HostInformation hostData={property.host} />
                <Location property={property} />
              </div>
            </div> */}

            {/* Right side content */}
            {/* <div className="md:col-span-1">
              <div className="space-y-6">
                <PriceCard property={property} />
                <div className="relative">
                  <div className="absolute right-0 sm:w-[155%]">
                    <Review property={property} />
                  </div>
                  <div className="absolute right-0 sm:w-[155%]">
                    <Suggestion />
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Carousel Component */}
          {/* <div>
            <Carousel images={property?.images} />
            <Last property={property} />
          </div> */}
        </div>
      </div>
    </div>
  );
}
