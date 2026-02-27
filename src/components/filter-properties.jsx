/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import PropertyCard from "./stay-property-card";
import StayCardSkeleton from "./stay-card-skeleton";
import { propertyService } from "../services/propertyService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SearchFilter from "./search-filter";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
import { SheetProvider } from "@/components/providers/sheet-provider";

export default function FilterProperties({
  properties,
  from,
  to,
  guests,
  location,
  senior,
  child,
  infants,
  property,
}) {
  const [loading, setLoading] = useState(false);

  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("new pr", properties);
  }
  if (!properties) {
    setLoading(true);
  }
  if (loading) {
    return (
      <div className="grid grid-cols-1 max-w-[1760px]  px-4 sm:px-6 lg:px-[72px] py-8 sm:py-16 lg:py-[128px]  bg-white mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <StayCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[400px]">
  //       <div className="text-center py-8 text-red-500">{error}</div>
  //     </div>
  //   );
  // }

  const displayedProperties = properties; //showMore ? properties : properties.slice(0, 8);

  return (
    <>
      <header className="pt-16">
        <SheetProvider>
          {/* <div className="fixed pt-6 top-16 z-40 bg-white shadow-sm"> */}
          {/* <SearchFilter
            className="relative -z-10"
            fromDate={from}
            toDate={to}
            guest={guests}
            location={location}
            active={true}
            grownup={senior}
            child={child}
            baby={infants}
            property={property}
          /> */}
          {/* </div> */}
          <MobileNavbar />
        </SheetProvider>
      </header>
      <main className="pt-16 md:pt-32 lg:pt-0">
        <div className="font-poppins flex justify-center w-full bg-white">
          <div className="w-full max-w-[1760px]">
            <div className="mx-auto px-2 lg:px-[62px] py-8 sm:py-16 lg:py-[8px] font-poppins bg-white text-absoluteDark">
              <h1 className="text-3xl sm:text-2xl lg:text-4xl font-bricolage font-semibold mb-2 text-absoluteDark lg:mt-40 sm:pt-10 md:pt-0">
                Discover Our Finest Stays
              </h1>
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
                  <p className="text-gray-400 text-sm"></p>
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

                  {/* {!showMore && properties.length > 8 && (
                    <div className="flex justify-center mt-12">
                      <button
                        className="bg-primaryGreen hover:bg-brightGreen text-white px-16 py-4 rounded-full transition-colors duration-300"
                        onClick={() => setShowMore(true)}
                      >
                        View More
                      </button>
                    </div>
                  )} */}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
