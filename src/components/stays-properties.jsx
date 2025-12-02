/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import PropertyCard from "./stay-property-card";
import StayCardSkeleton from "./stay-card-skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService } from "../services/propertyService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
// import { useCheckToken } from "@/services/useCheckToken";
export default function StaysProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  // const { checkToken } = useCheckToken();

  // useEffect(() => {
  //   const verify = async () => {
  //     await checkToken();
  //   };
  //   verify();
  // }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getAllStays(selectedType);
        setProperties(data.properties);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedType]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 max-w-[1760px]  px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[128px]  bg-white mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <StayCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  const displayedProperties = showMore ? properties : properties.slice(0, 8);

  return (
    <div className="font-poppins flex justify-center w-full bg-white">
      <div className="w-full max-w-[1760px]">
        <div className="mx-auto px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[128px] font-poppins bg-white text-absoluteDark">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-absoluteDark font-bricolage font-semibold mb-2">
            Discover Our Finest Stays
          </h2>
          <p className="text-sm sm:text-base text-stone mb-4 sm:mb-8">
            Explore through featured properties available on Majestic Escape
          </p>

          <div className="w-full  md:hidden rounded-md border  px-4 flex items-center justify-between  border-gray-400 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="price-toggle" className="text-sm font-medium">
                Display total price
              </Label>
              <p className="text-xs text-muted-foreground">
                Includes all fees, before taxes
              </p>
            </div>
            <Switch
              id="price-toggle"
              checked={isChecked}
              onCheckedChange={setIsChecked}
              className="data-[state=checked]:bg-primaryGreen"
            />
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
              <div className="text-gray-500 text-lg mb-2">
                No properties to show
              </div>
              <p className="text-gray-400 text-sm">
                {selectedType
                  ? `No properties found for type "${selectedType}"`
                  : "Check back later for new properties"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedProperties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    includeTaxes={includeTaxes}
                  />
                ))}
              </div>

              {!showMore && properties.length > 8 && (
                <div className="flex justify-center mt-12">
                  <button
                    className="bg-primaryGreen hover:bg-brightGreen text-white px-16 py-4 rounded-full transition-colors duration-300"
                    onClick={() => setShowMore(true)}
                  >
                    View More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
