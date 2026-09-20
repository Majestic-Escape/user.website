/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import PropertyCard from "./stay-property-card";
import StayCardSkeleton from "./stay-card-skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService } from "../services/propertyService";
import { normalizeFrontStays } from "@/lib/catalogue";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import {
  Bell,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  RotateCw,
} from "lucide-react";
// import { useCheckToken } from "@/services/useCheckToken";
export default function StaysProperties() {
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  // Cached across navigations (home → stay → home paints instantly from the
  // shared QueryClient instead of showing 8 skeletons and refetching).
  // Batch P: the home/stays pages hydrate this key from a server snapshot,
  // so on a fresh load the cards are already in the HTML and this only
  // refetches once the snapshot is older than staleTime.
  const {
    data: properties = [],
    isPending: loading,
    isError: error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.frontStays(selectedType),
    queryFn: async () => {
      const data = await propertyService.getFrontPageAllStays(selectedType);
      return normalizeFrontStays(data);
    },
    ...PUBLIC,
  });
  const handleRefresh = () => {
    refetch();
  };
  // const { checkToken } = useCheckToken();

  // useEffect(() => {
  //   const verify = async () => {
  //     await checkToken();
  //   };
  //   verify();
  // }, []);

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
      // <div className="flex justify-center items-center min-h-[400px]">
      //   <div className="text-center py-8 text-gray-500">Refresh</div>
      // </div>
      <div className="font-poppins flex justify-center w-full bg-white">
        <div className="w-full max-w-[1760px]">
          <div className="mx-auto px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[128px] font-poppins bg-white text-absoluteDark">
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
              <div className="flex cursor-pointer" onClick={handleRefresh}>
                <div className="text-gray-500 text-lg mb-2 pr-2">
                  Refresh Now
                </div>
                <RotateCw color="gray" />
              </div>
              <p className="text-gray-400 text-sm">
                The page loaded, but the properties missed the memo. Give it
                another go.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedProperties = showMore ? properties : properties.slice(0, 8);

  return (
    <div className="font-poppins flex justify-center w-full bg-white">
      <div className="w-full max-w-[1760px]">
        <div className="mx-auto px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[68px] font-poppins bg-white text-absoluteDark">
          <h2 className="text-3xl sm:text-2xl lg:text-4xl text-absoluteDark font-bricolage font-semibold mb-2">
            Discover Our Finest Stays
          </h2>
          <p className="text-lg sm:text-base text-stone mb-4 sm:mb-8">
            Explore through featured properties available on Majestic Escape
          </p>

          {/* <div className="w-full  md:hidden rounded-md border  px-4 flex items-center justify-between  border-gray-400 py-3">
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
          </div> */}

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
                {displayedProperties.map((property, index) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    includeTaxes={includeTaxes}
                    priority={index === 0}
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
              {showMore && properties.length == 16 ? (
                <div className="flex justify-center mt-12">
                  <button
                    className="bg-primaryGreen hover:bg-brightGreen text-white px-16 py-4 rounded-full transition-colors duration-300"
                    onClick={() =>
                      router.push(
                        `/filter?propertyType=${""}&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}`,
                      )
                    }
                  >
                    View More
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
