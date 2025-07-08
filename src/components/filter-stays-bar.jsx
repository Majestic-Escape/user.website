"use client"

import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const propertyTypes = [
  { icon: '/images/property-icons/beachfront.svg', label: 'Beachfront' },
  { icon: '/images/property-icons/flats.svg', label: 'Flats' },
  { icon: '/images/property-icons/farmhouse.svg', label: 'Farm House' },
  { icon: '/images/property-icons/villa.svg', label: 'Villas' },
  { icon: '/images/property-icons/apartment.svg', label: 'Apartments' },
  { icon: '/images/property-icons/cabin.svg', label: 'Cabin' },
  { icon: '/images/property-icons/pool.svg', label: 'Pool' },
  { icon: '/images/property-icons/trending.svg', label: 'Trending' },
  { icon: '/images/property-icons/bed-and-breakfast.svg', label: 'Bed & Breakfast' },
  { icon: '/images/property-icons/rooms.svg', label: 'Rooms' },
  { icon: '/images/property-icons/beach.svg', label: 'Beach' },
  { icon: '/images/property-icons/mansion.svg', label: 'Mansion' },
  { icon: '/images/property-icons/historical-home.svg', label: 'Historical Home' },
  { icon: '/images/property-icons/treehouse.svg', label: 'Tree House' },
];

export default function FilterStaysBar (){

  
const scrollContainerRef = useRef(null);
 const [includeTaxes, setIncludeTaxes] = useState(true);
const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      // Check initial scroll state
      checkScroll();
      
      // Check again after content loads (for images)
      window.addEventListener('load', checkScroll);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('load', checkScroll);
      };
    }
  }, []);const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  const handleTypeSelect = (type) => {
    setSelectedType(selectedType === type ? null : type);
  };


    return(
        <div className="flex max-w-[1400px] mx-auto flex-row items-start lg:items-center justify-between  gap-4 lg:gap-0">
        <div className="w-full md:w-auto relative flex gap-x-6">
          <div
            ref={scrollContainerRef}
            className="flex space-x-8  md:space-x-8 flex-shrink-0 overflow-x-hidden   px-2 py-2  max-w-full md:max-w-[70vw] lg:[65vw] "
            
          >
          
            {propertyTypes.map((type, index) => (
              <button key={index} className="text-center  flex flex-col w-32 justify-center   items-center">
                  <Image
                  width={48}
                  height={48}
                    src={type.icon}
                    alt={type.label}
                    className="md:w-16  w-8 h-8  object-contain "
                    onClick={() => handleTypeSelect(type.label)}
                  />
                  <span className="text-xs font-normal text-[#333]">{type.label}</span>
              </button>
            ))}
          </div>
          {propertyTypes.length > 6 && (
            <>
              {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute flex justify-center items-center -translate-y-1/2 -left-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray" />
              </button>
              )}
              {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute flex justify-center items-center -translate-y-1/2 -right-6 top-1/2 bg-white h-9 rounded-full shadow w-9 border border-gray "
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray" />
              </button>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex flex-row font-publicSans items-center gap-4">
         
          <button className=" py-2.5 px-8 ring-1 ring-lightGray text-absoluteDark rounded-full hover:ring-absoluteDark transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
         
          <div className={`${includeTaxes ? 'ring-lightGray ring-1 transition-all':'ring-gray-300 transition-all'} flex items-center px-3 py-3 gap-x-2   bg-gray-50 ring-1 rounded-full`}>
            <button
              className={`w-12 h-5 hover:ring-absoluteDark transition-all  flex items-center rounded-full p-1  duration-300 ${includeTaxes ? 'bg-primaryGreen justify-end' : 'bg-solidGray justify-start border-primaryGreen'
                }`}
              onClick={() => setIncludeTaxes(!includeTaxes)}
              aria-label={includeTaxes ? "Exclude taxes" : "Include taxes"}
            >
              <div className="bg-white w-3 h-3 rounded-full shadow-md" />
            </button>
            <span className="text-sm text-absoluteDark font-medium whitespace-nowrap">
              {includeTaxes ? "Include Taxes" : "Exclude Taxes"}
            </span>
          </div>
        </div>
      </div>

    )
}