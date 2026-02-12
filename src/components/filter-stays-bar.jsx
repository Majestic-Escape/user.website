"use client";

import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  SearchX,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { properties as propertyTypes } from "../lib/property-type";
import { AuthContext } from "@/contexts/AuthContext";
export default function FilterStaysBar({
  selectProperty,
  setSelectProperty,
  location,
  from,
  to,
  adults,
  senior,
  childrens,
  infants,
}) {
  const scrollContainerRef = useRef(null);
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [mainFilter, setMainFilter] = useState(false);
  const [sideFilter, setSideFilter] = useState(false);
  const { modalFilter, setModalFilter, resetClicked, setResetClicked } =
    useAuth();

  const pathname = usePathname();
  const { clearAllFilters } = useAuth();
  const showFilterIcon = pathname == "/";
  // console.log("paath", pathname, showFilterIcon);
  const router = useRouter();
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };
  // useEffect(() => {
  //   const checkSessionStorage = sessionStorage.getItem("searchFilters");
  //   const checkLocalStorage = localStorage.getItem("modalFilterReset");
  //   checkLocalStorage ? setMainFilter(true) : setMainFilter(false);
  //   checkSessionStorage ? setSideFilter(true) : setSideFilter(false);
  // }, []);
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
  const handleTypeSelect = (type) => {
    setSelectedType(selectedType === type ? null : type);
  };

  const FilterButtonSection = () => {
    return (
      <>
        {" "}
        <button
          className=" py-2.5 px-4 ring-1 ring-lightGray text-absoluteDark rounded-full hover:ring-absoluteDark transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
          onClick={() => {
            setModalFilter(true);
          }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {/* reset-icon */}
          <span className=" tab:hidden">Filter</span>
        </button>
        {!showFilterIcon && !resetClicked ? (
          <button
            title="Reset Filter"
            className=" py-2.5 px-4 ring-1 ring-lightGray text-absoluteDark rounded-full hover:ring-absoluteDark transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
            onClick={() => {
              sessionStorage.setItem(
                "searchFilters",
                JSON.stringify({
                  dateRange: {
                    from: null,
                    to: null,
                  },
                  searchTerm: "",
                  guests: {
                    adults: 0,
                    children: 0,
                    infants: 0,
                  },
                }),
              );
              // sessionStorage.setItem("reset", "true");
              sessionStorage.setItem("modalFilterReset", "true");
              clearAllFilters();
              sessionStorage.setItem("modalFilterReset", "false");
              setResetClicked(true);
              router.push(
                `/filter?propertyType=${""}&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}&priceMin=${""}&priceMax=${""}&placeType=${""}&amenities=${""}&bedrooms=${""}&beds=${""}&bathrooms=${""}&bookingType=${""}&checkinType=${""}&pets=${""}`,
              );
              // router.push(
              // `/filter?propertyType=${""}&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}`
              // );
            }}
          >
            <SearchX className="w-4 h-4" />
            {/* <span className="tab:hidden">Reset</span> */}
            {/* reset-icon */}
          </button>
        ) : null}
      </>
    );
  };

  const PropertyScroll = () => {
    return (
      <>
        <div className="relative w-full md:w-auto overflow-hidden">
          <div className="relative">
            {/* Gradient overlays for better UX */}
            {/* <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" /> */}

            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto px-4 py-3
md:scrollbar-thin md:scrollbar-thumb-gray-300 ml-16 mr-16 md:scrollbar-track-transparent
lg:no-scrollbar"
            >
              {propertyTypes.map((type, index) => (
                <div key={index} className="flex-shrink-0 w-[80px]">
                  <Link
                    key={index}
                    className="text-center flex flex-col w-10 justify-center items-center"
                    href={`/filter?propertyType=${
                      type?.route ? type?.route : ""
                    }&location=${location ? location : ""}&from=${
                      from ? from : ""
                    }&to=${to ? to : ""}&adults=${adults ? adults : ""}&senior=${
                      senior ? senior : ""
                    }&children=${childrens ? childrens : ""}&infants=${
                      infants ? infants : ""
                    }`}
                  >
                    <Image
                      width={30}
                      height={30}
                      src={type.icon}
                      alt={type.label}
                      className="md:w-16 w-8 h-8 object-contain "
                      onClick={() => handleTypeSelect(type.label)}
                    />
                    <span className="text-xs font-normal text-[#333]">
                      {type.label}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Scroll buttons */}
            {propertyTypes.length > 6 && (
              <>
                {
                  // canScrollLeft &&
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white h-10 w-10 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                }
                {
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white h-10 w-10 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                }
              </>
            )}
          </div>
        </div>{" "}
        {pathname == "/" ? (
          <div className="ml-[32px] pr-1 hidden md:flex flex-row font-poppins md:items-center md:justify-center gap-4 filter-actions">
            <FilterButtonSection />
          </div>
        ) : (
          <div className=" hidden md:flex flex-row font-poppins md:items-center md:justify-center gap-4 filter-actions">
            {/* filter-icon */}
            {/* "hidden md:flex flex-row font-poppins items-center gap-4 xl:pl-12" */}
            <FilterButtonSection />
          </div>
        )}
      </>
    );
  };
  return pathname == "/" ? (
    <div className="flex">
      <PropertyScroll />
    </div>
  ) : (
    <div className="grid grid-cols-[75%_25%]">
      <PropertyScroll />
    </div>
  );
}

{
  /* <div
          className={`${
            includeTaxes
              ? "ring-lightGray ring-1 transition-all"
              : "ring-gray-300 transition-all"
          } flex items-center px-3 py-3 gap-x-2   bg-gray-50 ring-1 rounded-full`}
        >
          <button
            className={`w-12 h-5 hover:ring-absoluteDark transition-all  flex items-center rounded-full p-1  duration-300 ${
              includeTaxes
                ? "bg-primaryGreen justify-end"
                : "bg-solidGray justify-start border-primaryGreen"
            }`}
            onClick={() => setIncludeTaxes(!includeTaxes)}
            aria-label={includeTaxes ? "Exclude taxes" : "Include taxes"}
          >
            <div className="bg-white w-3 h-3 rounded-full shadow-md" />
          </button>
          <span className="text-sm text-absoluteDark font-medium whitespace-nowrap">
            {includeTaxes ? "Include Tax" : "Exclude Tax"}
          </span>
        </div> */
}
