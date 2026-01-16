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
// const propertyTypes = [
//   {
//     icon: "/images/property-icons/h.png",
//     label: "House",
//     route: "house",
//   },
//   {
//     icon: "/images/property-icons/guest.png",
//     label: "Guest House",
//     route: "guesthouse",
//   },
//   {
//     icon: "/images/property-icons/cottage.png",
//     label: "Cottage",
//     route: "cottage",
//   },
//   {
//     icon: "/images/property-icons/bungalow.png",
//     label: "Bungalow",
//     route: "bungalow",
//   },
//   {
//     icon: "/images/property-icons/flats.svg",
//     label: "Hotel",
//     route: "hotel",
//   },
//   {
//     icon: "/images/property-icons/farmhouse.svg",
//     label: "Farm House",
//     route: "farmhouse",
//   },
//   {
//     icon: "/images/property-icons/villa.svg",
//     label: "Villas",
//     route: "villa",
//   },

//   {
//     icon: "/images/property-icons/condo.png",
//     label: "Condo",
//     route: "condo",
//   },
//   {
//     icon: "/images/property-icons/houseboat.png",
//     label: "House Boat",
//     route: "houseboat",
//   },
//   {
//     icon: "/images/property-icons/yurt.png",
//     label: "Yurt",
//     route: "yurt",
//   },
//   {
//     icon: "/images/property-icons/apartment.svg",
//     label: "Apartments",
//     route: "apartment",
//   },
//   {
//     icon: "/images/property-icons/cabin.svg",
//     label: "Cabin",
//     route: "cabin",
//   },

//   // {
//   //   icon: "/images/property-icons/pool.svg",
//   //   label: "Pool",
//   //   route: "farm-house",
//   // },
//   {
//     icon: "/images/property-icons/trending.svg",
//     label: "Trending",
//     route: "farm-house",
//   },
//   // {
//   //   icon: "/images/property-icons/bed-and-breakfast.svg",
//   //   label: "Bed & Breakfast",
//   //   route: "farm-house",
//   // },
//   // {
//   //   icon: "/images/property-icons/rooms.svg",
//   //   label: "Rooms",
//   //   route: "farm-house",
//   // },
//   // {
//   //   icon: "/images/property-icons/beach.svg",
//   //   label: "Beach",
//   //   route: "farm-house",
//   // },
//   {
//     icon: "/images/property-icons/mansion.svg",
//     label: "Town House",
//     route: "townhouse",
//   },
//   {
//     icon: "/images/property-icons/historical-home.svg",
//     label: "Historical Home",
//     route: "farmhouse",
//   },
//   {
//     icon: "/images/property-icons/treehouse.svg",
//     label: "Tree House",
//     route: "treehouse",
//   },
// ];
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

  return (
    <div className="flex max-w-[1400px] xl:max-w-[1000px] bdesktop:max-w-[1920px] max-lg:mx-auto  flex-row items-start lg:items-center justify-between  gap-4 lg:gap-0 lg:pl-8">
      <div className="w-full md:w-auto relative flex gap-x-6 px-8">
        <div
          ref={scrollContainerRef}
          // className="flex space-x-8  md:space-x-8 flex-shrink-0 overflow-x-hidden   px-2 py-2  max-w-full md:max-w-[70vw] lg:[65vw] "
          className="hidden md:block desktop:overflow-x-hidden md:filter-scroll md:flex space-x-6 md:space-x-8 flex-shrink-0 overflow-x-auto px-2 py-2 max-w-full md:max-w-[70vw]"
        >
          {/* property-filter */}
          {propertyTypes.map((type, index) => (
            <div
              key={index}
              className={`rounded-md p-2 transition-colors 
              `}
            >
              <Link
                key={index}
                className="text-center  flex flex-col w-10 justify-center   items-center"
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
                  className="md:w-16  w-8 h-8  object-contain "
                  onClick={() => handleTypeSelect(type.label)}
                />
                <span className="text-xs font-normal text-[#333]">
                  {type.label}
                </span>
              </Link>
            </div>
          ))}
        </div>
        {propertyTypes.length > 6 && (
          <>
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="tab:invisible midtab:invisible absolute flex justify-center items-center -translate-y-1/2 -left-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="tab:invisible midtab:invisible absolute flex justify-center items-center -translate-y-1/2 -right-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                // scroll-icon
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="desktop:pl-[52px] tab:pt-6 hidden md:flex flex-row font-poppins items-center gap-4 filter-actions">
        {/* filter-icon */}
        {/* "hidden md:flex flex-row font-poppins items-center gap-4 xl:pl-12" */}
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
                })
              );
              // sessionStorage.setItem("reset", "true");
              sessionStorage.setItem("modalFilterReset", "true");
              clearAllFilters();
              sessionStorage.setItem("modalFilterReset", "false");
              setResetClicked(true);
              router.push(
                `/filter?propertyType=${""}&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}&priceMin=${""}&priceMax=${""}&placeType=${""}&amenities=${""}&bedrooms=${""}&beds=${""}&bathrooms=${""}&bookingType=${""}&checkinType=${""}&pets=${""}`
              );
              // router.push(
              //   `/filter?propertyType=${""}&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}`
              // );
            }}
          >
            <SearchX className="w-4 h-4" />
            <span className="tab:hidden">Reset</span>
            {/* reset-icon */}
          </button>
        ) : null}
        {/* <div
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
        </div> */}
      </div>
    </div>
  );
}
