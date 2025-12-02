"use client";

import {
  X,
  Minus,
  Plus,
  Zap,
  KeyRound,
  PawPrint,
  HomeIcon,
  CalendarIcon,
  UserIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import {
  PocketIcon as Pool,
  Bath,
  Umbrella,
  Flame,
  UtensilsCrossed,
  Table,
  FlameIcon as Fireplace,
  Piano,
  Dumbbell,
  Waves,
  BeanIcon as Beach,
  MountainSnowIcon as Ski,
  ShowerHeadIcon as Shower,
  AlertOctagon,
  AmbulanceIcon as FirstAid,
  FireExtinguisher,
  AlertCircle,
  Wifi,
  Tv,
  UtensilsIcon,
  WashingMachineIcon as Washing,
  Car,
  CarTaxiFront,
  Snowflake,
  Briefcase,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext"; // Import your auth context
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeviceType } from "./device";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { properties } from "../../lib/property-type";
import { DateRange } from "react-day-picker";
export default function FilterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Get all states and functions from context

  // const deviceType = useDeviceType();

  interface UseAuthReturn {
    priceRange: [number, number];
    setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    rooms: number;
    showAllAmenities: boolean;
    setShowAllAmenities: React.Dispatch<React.SetStateAction<boolean>>;
    showAllProperties: boolean;
    setShowAllProperties: React.Dispatch<React.SetStateAction<boolean>>;
    addAmenities: string[];
    addPlaceType: string[];
    setAddPlaceType: React.Dispatch<React.SetStateAction<string[]>>;
    addPropertyType: string[];
    setAddPropertyType: React.Dispatch<React.SetStateAction<string[]>>;
    bookingType: string;
    setBookingType: React.Dispatch<React.SetStateAction<string>>;
    petAllowed: boolean;
    setPetAllowed: React.Dispatch<React.SetStateAction<boolean>>;
    checkinType: string;
    setCheckinType: React.Dispatch<React.SetStateAction<string>>;
    clearAllFilters: () => void;
    addAmenitiesList: string[];
    addPropertiesList: string[];
    handleRoomChange: (type: "increment" | "decrement") => void;
  }
  const {
    priceRange,
    setPriceRange,
    rooms,
    showAllAmenities,
    setShowAllAmenities,
    showAllProperties,
    setShowAllProperties,
    addAmenities,
    addPlaceType,
    setAddPlaceType,
    addPropertyType,
    bookingType,
    setBookingType,
    petAllowed,
    setPetAllowed,
    checkinType,
    setCheckinType,
    clearAllFilters,
    addAmenitiesList,
    addPropertiesList,
    setAddPropertyType,

    handleRoomChange,
  } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  type FilterRooms = {
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 1025); // <md breakpoint
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const [activeTab, setActiveTab] = useState("filters");
  // interface DateRange {
  //   from?: Date;
  //   to?: Date;
  // }
  type Guests = {
    adults: number;
    children: number;
    infants: number;
  };

  type FilterGuest = {
    adults: number;
    children: number;
    infants: number;
  };

  // Search state
  const [destination, setDestination] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<Guests>({
    adults: 0,
    children: 0,
    infants: 0,
  });
  const [openDestination, setOpenDestination] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [openGuests, setOpenGuests] = useState(false);

  const min = 501;
  const max = 83000;

  useEffect(() => {
    const saved = sessionStorage.getItem("mobileFilters");
    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.dateRange) {
        setDateRange({
          from: parsed.dateRange.from
            ? new Date(parsed.dateRange.from)
            : undefined,
          to: parsed.dateRange.to ? new Date(parsed.dateRange.to) : undefined,
        });
      }
      if (parsed.searchTerm) setSearchTerm(parsed.searchTerm);
      if (parsed.guests) setGuests(parsed.guests);
    }
    setHydrated(true); // mark as hydrated after first load
  }, []);

  // Save to localStorage ONLY after hydration
  useEffect(() => {
    if (!hydrated) return; // skip first run until state is restored

    sessionStorage.setItem(
      "mobileFilters",
      JSON.stringify({
        dateRange: {
          from: dateRange?.from ? dateRange.from.toISOString() : null,
          to: dateRange?.to ? dateRange.to.toISOString() : null,
        },
        searchTerm,
        guests,
      })
    );
  }, [dateRange, searchTerm, guests, hydrated]);
  //Guest change
  const handleGuestChange = (
    type: keyof Guests,
    operation: "increment" | "decrement"
  ) => {
    setGuests((prev) => ({
      ...prev,
      [type]:
        operation === "increment"
          ? prev[type] + 1
          : Math.max(0, prev[type] - 1),
    }));
  };

  const totalGuests = guests.adults + guests.children;

  const formatDate = (date: Date) => {
    if (!date) return "";
    return format(date, "MMM d");
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1000); // keep gap
    setPriceRange([value, priceRange[1]]);
  };
  const destinations = [
    {
      value: "north-goa",
      label: "North Goa",
      description: "Popular beaches and nightlife",
    },
    {
      value: "south-goa",
      label: "South Goa",
      description: "Quiet and serene beaches",
    },
    {
      value: "panaji",
      label: "Panaji",
      description: "Capital city with Portuguese heritage",
    },
    {
      value: "calangute",
      label: "Calangute",
      description: "Famous beach with water sports",
    },
    {
      value: "baga",
      label: "Baga",

      description: "Known for its nightlife and shacks",
    },
    {
      value: "anjuna",
      label: "Anjuna",
      description: "Flea market and trance parties",
    },
    {
      value: "candolim",
      label: "Candolim",
      description: "Long stretch of sandy beach",
    },
  ];

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1000);
    setPriceRange([priceRange[0], value]);
  };
  const amenities = [
    {
      id: "pool",
      title: "Pool",
      icon: Pool,
    },
    {
      id: "hot-tub",
      title: "Hot tub",
      icon: Bath,
    },

    {
      id: "bbq",
      title: "BBQ grill",
      icon: Flame,
    },

    {
      id: "indoor-fireplace",
      title: "Indoor fireplace",
      icon: Fireplace,
    },

    {
      id: "exercise",
      title: "Exercise equipment",
      icon: Dumbbell,
    },

    {
      id: "beach",
      title: "Beach access",
      icon: Beach,
    },

    // Safety Items
    {
      id: "smoke-alarm",
      title: "Smoke alarm",
      icon: AlertOctagon,
    },

    {
      id: "carbon-monoxide",
      title: "Carbon monoxide alarm",
      icon: AlertCircle,
    },

    // Guest Favorites
    {
      id: "wifi",
      title: "Wifi",
      icon: Wifi,
    },
    { id: "tv", title: "TV", icon: Tv },
    {
      id: "kitchen",
      title: "Kitchen",
      icon: UtensilsIcon,
    },
    {
      id: "washing",
      title: "Washing machine",
      icon: Washing,
    },
    {
      id: "free-parking",
      title: "Free parking on premises",
      icon: Car,
    },

    {
      id: "air-conditioning",
      title: "Air conditioning",
      icon: Snowflake,
    },
    {
      id: "workspace",
      title: "Dedicated workspace",
      icon: Briefcase,
    },
  ];

  // const properties = [
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
  //     icon: "/images/property-icons/flats.svg",
  //     label: "Hotel",
  //     route: "hotel",
  //   },
  //   {
  //     icon: "/images/property-icons/bungalow.png",
  //     label: "Bungalow",
  //     route: "bungalow",
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

  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 4);
  const visibleProperties = showAllProperties
    ? properties
    : properties.slice(0, 4);

  if (!isOpen) return null;
  console.log("pri", addPropertyType);
  const newAmenities = addAmenities.map((x) =>
    x.toLowerCase().replaceAll(" ", "_")
  );

  const small = ["tablet", "mobile"];
  if (!isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
          {/* Header - Fixed at top */}
          <div className="flex justify-between items-center border-b px-4 py-3 sticky top-0 bg-white z-10 rounded-t-3xl">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Type of Place */}
            <div>
              <h3 className="text-md font-medium mb-3">Type of place</h3>
              <div className="flex gap-2">
                {["Any type", "Room", "Entire Place"].map((type) => (
                  <button
                    key={type}
                    className={
                      addPlaceType === type
                        ? "flex-1 border-2 border-black rounded-lg py-2 px-3 text-sm bg-gray-100"
                        : "flex-1 border rounded-lg py-2 px-3 text-sm hover:bg-gray-100"
                    }
                    onClick={() => {
                      setAddPlaceType(type);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-md font-medium mb-3">Price range</h3>
              <div className="flex justify-between mt-4">
                <span className="text-sm">₹{priceRange[0]}</span>
                <span className="text-sm">₹{priceRange[1]}+</span>
              </div>
              {/* Slider container */}
              <div className="relative w-full">
                {/* Track background */}

                <div className="absolute top-1/2 h-1 w-full bg-gray-300 rounded-full transform -translate-y-1/2" />

                {/* Track filled part */}

                <div
                  className="absolute top-1/2 h-1 bg-black rounded-full transform -translate-y-1/2"
                  style={{
                    left: `${((priceRange[0] - min) / (max - min)) * 100}%`,
                    right: `${
                      100 - ((priceRange[1] - min) / (max - min)) * 100
                    }%`,
                  }}
                />

                {/* Min thumb */}
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={priceRange[0]}
                  onChange={handleMinChange}
                  className="absolute w-full pointer-events-none appearance-none bg-transparent"
                />

                {/* Max thumb */}
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={priceRange[1]}
                  onChange={handleMaxChange}
                  className="absolute w-full pointer-events-none appearance-none bg-transparent"
                />

                {/* Tailwind override styles for thumbs */}
                <style jsx>
                  {`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      height: 18px;
                      width: 18px;
                      border-radius: 9999px;
                      background: white;
                      border: 2px solid black;
                      cursor: pointer;
                      pointer-events: auto;
                    }
                    input[type="range"]::-moz-range-thumb {
                      height: 18px;
                      width: 18px;
                      border-radius: 9999px;
                      background: white;
                      border: 2px solid black;
                      cursor: pointer;
                      pointer-events: auto;
                    }
                  `}
                </style>
              </div>

              {/* Labels */}
            </div>

            {/* Rooms & Beds */}
            <div>
              <h3 className="text-md font-medium mb-3">Rooms and beds</h3>
              {(["bedrooms", "beds", "bathrooms"] as (keyof FilterRooms)[]).map(
                (field) => (
                  <div
                    key={field}
                    className="flex justify-between items-center py-2 border-b last:border-none"
                  >
                    <span className="capitalize">{field}</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="p-2 border rounded-full disabled:opacity-50"
                        onClick={() => handleRoomChange(field, -1)}
                        disabled={rooms[field] === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span>{rooms[field] || "Any"}</span>
                      <button
                        className="p-2 border rounded-full"
                        onClick={() => handleRoomChange(field, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-md font-medium mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {visibleAmenities.map((amenity) => (
                  <span
                    key={amenity?.id}
                    className={
                      addAmenities.includes(amenity?.id)
                        ? "flex px-3 py-2 border-2 border-black items-center rounded-full text-sm cursor-pointer bg-gray-100"
                        : "flex px-3 py-2 border items-center rounded-full text-sm cursor-pointer hover:bg-gray-100"
                    }
                    onClick={() => {
                      addAmenitiesList(amenity?.id);
                    }}
                  >
                    <></>
                    <span className="pr-2">
                      <amenity.icon />
                    </span>
                    <span className="pr-2 py-2">{amenity?.title}</span>
                  </span>
                ))}
              </div>
              <button
                className="mt-3 text-sm text-blue-600 underline"
                onClick={() => setShowAllAmenities((prev) => !prev)}
              >
                {showAllAmenities ? "Show less" : "Show more"}
              </button>
            </div>

            {/* Booking Options */}
            <div>
              <h3 className="text-md font-medium mb-3">Booking Options</h3>
              <div className="flex gap-2 ">
                <div
                  className={
                    bookingType === "instant"
                      ? "flex px-3 py-3 border-2 border-black items-center rounded-full text-sm cursor-pointer bg-gray-100"
                      : "flex px-3 py-3 border   items-center rounded-full text-sm cursor-pointer hover:bg-gray-100"
                  }
                  onClick={() => {
                    if (bookingType == "") {
                      setBookingType("instant");
                    } else {
                      setBookingType("");
                    }
                  }}
                >
                  <span className="pr-2">
                    <Zap className=" h-6 w-6 text-gray-600" />
                  </span>
                  <span className="pr-2">Instant</span>
                </div>
                <div
                  className={
                    checkinType === "self-check-in"
                      ? "flex px-3 py-2 border-2 border-black items-center rounded-full text-sm cursor-pointer bg-gray-100"
                      : "flex px-3 py-2 border   items-center rounded-full text-sm cursor-pointer hover:bg-gray-100"
                  }
                  onClick={() => {
                    if (checkinType == "") {
                      setCheckinType("self-check-in");
                    } else {
                      setCheckinType("");
                    }
                  }}
                >
                  <span className="pr-2">
                    <KeyRound className=" h-6 w-6 text-gray-600" />
                  </span>
                  <span className="pr-2">Self Checkin</span>
                </div>
                <div
                  className={
                    petAllowed === "no_pets"
                      ? "flex px-3 py-2 border-2 border-black items-center rounded-full text-sm cursor-pointer bg-gray-100"
                      : "flex px-3 py-2 border   items-center rounded-full text-sm cursor-pointer hover:bg-gray-100"
                  }
                  onClick={() => {
                    if (petAllowed == "") {
                      setPetAllowed("no_pets");
                    } else {
                      setPetAllowed("");
                    }
                  }}
                >
                  <span className="pr-2">
                    <PawPrint className=" h-6 w-6 text-gray-600" />
                  </span>
                  <span className="pr-2">No Pets</span>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className="text-md font-medium mb-3">Property Type</h3>
              <div className="flex flex-wrap gap-2">
                {visibleProperties.map((property, index) => (
                  <>
                    <div
                      className={
                        addPropertyType == property?.route
                          ? "flex px-3 py-2 border-2 border-black items-center rounded-full text-sm cursor-pointer bg-gray-100"
                          : "flex px-3 py-2 border   items-center rounded-full text-sm cursor-pointer hover:bg-gray-100"
                      }
                      onClick={() => {
                        setAddPropertyType(property?.route);
                      }}
                    >
                      <Image
                        width={30}
                        height={30}
                        src={property.icon}
                        alt={property.label}
                        className="md:w-16  w-8 h-8  object-contain "
                      />
                      <span key={index}>{property?.label}</span>
                    </div>
                  </>
                ))}
              </div>
              <button
                className="mt-3 text-sm text-blue-600 underline"
                onClick={() => setShowAllProperties((prev) => !prev)}
              >
                {showAllProperties ? "Show less" : "Show more"}
              </button>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t px-4 py-3 flex justify-between items-center sticky bottom-0 bg-white z-10 rounded-b-3xl">
            <button
              className="text-sm underline text-gray-600 hover:text-gray-800"
              onClick={clearAllFilters}
            >
              Clear all
            </button>

            <button
              onClick={() => {
                router.push(
                  `/filter?propertyType=${
                    addPropertyType ? addPropertyType : ""
                  }&location=${""}&from=${""}&to=${""}&adults=${""}&senior=${""}&children=${""}&infants=${""}&priceMin=${
                    priceRange[0] ? priceRange[0] : ""
                  }&priceMax=${priceRange[1] ? priceRange[1] : ""}&placeType=${
                    addPlaceType ? addPlaceType.replaceAll(" ", "_") : ""
                  }&amenities=${
                    addAmenities.length != 0 ? newAmenities : ""
                  }&bedrooms=${rooms?.bedrooms ? rooms?.bedrooms : ""}&beds=${
                    rooms?.beds ? rooms?.beds : ""
                  }&bathrooms=${
                    rooms?.bathrooms ? rooms?.bathrooms : ""
                  }&bookingType=${bookingType ? bookingType : ""}&checkinType=${
                    checkinType ? checkinType : ""
                  }&pets=${petAllowed}`
                );
                onClose();
              }}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 md:p-4">
        <div className="bg-white rounded-lg w-full max-w-lg max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-xl">
          {/* Header - Fixed at top */}
          <div className="flex justify-between items-center border-b px-4 py-3 sticky top-0 bg-white z-10 rounded-t-lg md:rounded-t-3xl">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("search")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTab === "search" ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab("filters")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTab === "filters"
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                Filters
              </button>
            </div>
            <button onClick={onClose} className="p-1">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 md:space-y-8">
            {activeTab === "search" ? (
              /* SEARCH TAB CONTENT */
              <div className="space-y-4">
                {/* Destination Search */}
                <div>
                  <h3 className="text-md font-medium mb-2">Where to?</h3>
                  <Popover
                    open={openDestination}
                    onOpenChange={setOpenDestination}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start px-4 h-12 border-gray-300"
                      >
                        <HomeIcon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-sm">
                            {destination
                              ? filteredDestinations.find(
                                  (d) => d.value === destination
                                )?.label
                              : "Anywhere"}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] font-poppins mt-2 p-0"
                      align="start"
                    >
                      <Command className="bg-white">
                        <Input
                          placeholder="Search Goa destinations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-0 border-b rounded-none focus-visible:ring-0"
                        />
                        <CommandEmpty className="p-2 text-sm text-center">
                          No destination found.
                        </CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                          {filteredDestinations.map((dest) => (
                            <button
                              key={dest.value}
                              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setDestination(dest.value);
                                setOpenDestination(false);
                                setSearchTerm("");
                              }}
                            >
                              <div className="p-2 flex justify-center items-center rounded-sm bg-lightGreen/20">
                                <HomeIcon className="size-4 text-primaryGreen" />
                              </div>
                              <div className="flex-1 ml-2 text-left">
                                <div className="font-medium text-sm mb-1">
                                  {dest.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dest.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date Range Picker */}
                <div>
                  <h3 className="text-md font-medium mb-2">When?</h3>
                  <Popover
                    open={openDatePicker}
                    onOpenChange={setOpenDatePicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start px-4 h-12 border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">
                            {dateRange?.from && dateRange?.to
                              ? `${formatDate(dateRange.from)} - ${formatDate(
                                  dateRange.to
                                )}`
                              : "Check in - Check out"}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="bg-white mt-2 font-poppins w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests Selection */}
                <div>
                  <h3 className="text-md font-medium mb-2">Who's coming?</h3>
                  <Popover open={openGuests} onOpenChange={setOpenGuests}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start px-4 h-12 border-gray-300"
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm">
                            {totalGuests > 0
                              ? `${totalGuests} guest${
                                  totalGuests !== 1 ? "s" : ""
                                }`
                              : "Add guests"}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full max-w-xs p-4"
                      align="start"
                    >
                      <div className="space-y-4">
                        {(
                          [
                            "adults",
                            "children",
                            "infants",
                          ] as (keyof FilterGuest)[]
                        ).map((type) => (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium capitalize">
                                {type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {type === "adults"
                                  ? "Ages 13 or above"
                                  : type === "children"
                                  ? "Ages 2-12"
                                  : "Under 2"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleGuestChange(type, "decrement")
                                }
                                disabled={guests[type] === 0}
                                className="h-8 w-8 rounded-full"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">
                                {guests[type]}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleGuestChange(type, "increment")
                                }
                                className="h-8 w-8 rounded-full"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search Button */}
                {/* <Button
                  className="w-full h-12 bg-black text-white hover:bg-gray-800"
                  onClick={() => {
                    // Handle search navigation
                    router.push(
                      `/filter?location=${destination || ""}&from=${
                        dateRange.from || ""
                      }&to=${dateRange.to || ""}&adults=${
                        guests.adults || ""
                      }&children=${guests.children || ""}&infants=${
                        guests.infants || ""
                      }`
                    );
                    onClose();
                  }}
                >
                  Search
                </Button> */}
              </div>
            ) : (
              /* FILTERS TAB CONTENT */
              <>
                {/* Type of Place */}
                <div>
                  <h3 className="text-md font-medium mb-3">Type of place</h3>
                  <div className="flex flex-col xs:flex-row gap-2">
                    {["Any type", "Room", "Entire Place"].map((type) => (
                      <button
                        key={type}
                        className={
                          addPlaceType === type
                            ? "border-2 border-black rounded-lg py-2 px-3 text-sm bg-gray-100"
                            : "border rounded-lg py-2 px-3 text-sm hover:bg-gray-100"
                        }
                        onClick={() => {
                          setAddPlaceType(type);
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-md font-medium mb-3">Price range</h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">₹{priceRange[0]}</span>
                    <span className="text-sm">₹{priceRange[1]}+</span>
                  </div>

                  {/* Slider container */}
                  <div className="relative w-full mb-2">
                    {/* Track background */}
                    <div className="absolute top-1/2 h-1.5 w-full bg-gray-300 rounded-full transform -translate-y-1/2" />

                    {/* Track filled part */}
                    <div
                      className="absolute top-1/2 h-1.5 bg-black rounded-full transform -translate-y-1/2"
                      style={{
                        left: `${((priceRange[0] - min) / (max - min)) * 100}%`,
                        right: `${
                          100 - ((priceRange[1] - min) / (max - min)) * 100
                        }%`,
                      }}
                    />

                    {/* Min thumb */}
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={priceRange[0]}
                      onChange={handleMinChange}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent"
                    />

                    {/* Max thumb */}
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={priceRange[1]}
                      onChange={handleMaxChange}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent"
                    />

                    {/* Tailwind override styles for thumbs */}
                    <style jsx>
                      {`
                        input[type="range"]::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          height: 20px;
                          width: 20px;
                          border-radius: 9999px;
                          background: white;
                          border: 2px solid black;
                          cursor: pointer;
                          pointer-events: auto;
                        }
                        input[type="range"]::-moz-range-thumb {
                          height: 20px;
                          width: 20px;
                          border-radius: 9999px;
                          background: white;
                          border: 2px solid black;
                          cursor: pointer;
                          pointer-events: auto;
                        }
                      `}
                    </style>
                  </div>
                </div>

                {/* Rooms & Beds */}
                <div>
                  <h3 className="text-md font-medium mb-3">Rooms and beds</h3>
                  {(
                    ["bedrooms", "beds", "bathrooms"] as (keyof FilterRooms)[]
                  ).map((field) => (
                    <div
                      key={field}
                      className="flex justify-between items-center py-3 border-b last:border-none"
                    >
                      <span className="capitalize text-sm md:text-base">
                        {field}
                      </span>
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          className="p-1 md:p-2 border rounded-full disabled:opacity-50"
                          onClick={() => handleRoomChange(field, -1)}
                          disabled={rooms[field] === 0}
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <span className="text-sm md:text-base w-6 text-center">
                          {rooms[field] || "Any"}
                        </span>
                        <button
                          className="p-1 md:p-2 border rounded-full"
                          onClick={() => handleRoomChange(field, 1)}
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-md font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {visibleAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={
                          addAmenities.includes(amenity.id)
                            ? "flex items-center p-2 border-2 border-black rounded-lg text-sm cursor-pointer bg-gray-100"
                            : "flex items-center p-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                        }
                        onClick={() => {
                          addAmenitiesList(amenity.id);
                        }}
                      >
                        <amenity.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{amenity.title}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-3 text-sm text-blue-600 underline"
                    onClick={() => setShowAllAmenities((prev) => !prev)}
                  >
                    {showAllAmenities ? "Show less" : "Show more"}
                  </button>
                </div>

                {/* Booking Options */}
                <div>
                  <h3 className="text-md font-medium mb-3">Booking Options</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                    <div
                      className={
                        bookingType === "instant"
                          ? "flex flex-col items-center justify-center p-2 border-2 border-black rounded-lg text-sm cursor-pointer bg-gray-100"
                          : "flex flex-col items-center justify-center p-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                      }
                      onClick={() => {
                        setBookingType(
                          bookingType === "instant" ? "" : "instant"
                        );
                      }}
                    >
                      <Zap className="w-5 h-5 mb-1 text-gray-600" />
                      <span className="text-xs text-center">Instant</span>
                    </div>
                    <div
                      className={
                        checkinType === "self-check-in"
                          ? "flex flex-col items-center justify-center p-2 border-2 border-black rounded-lg text-sm cursor-pointer bg-gray-100"
                          : "flex flex-col items-center justify-center p-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                      }
                      onClick={() => {
                        setCheckinType(
                          checkinType === "self-check-in" ? "" : "self-check-in"
                        );
                      }}
                    >
                      <KeyRound className="w-5 h-5 mb-1 text-gray-600" />
                      <span className="text-xs text-center">Self Checkin</span>
                    </div>
                    <div
                      className={
                        petAllowed === "no_pets"
                          ? "flex flex-col items-center justify-center p-2 border-2 border-black rounded-lg text-sm cursor-pointer bg-gray-100"
                          : "flex flex-col items-center justify-center p-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                      }
                      onClick={() => {
                        setPetAllowed(
                          petAllowed === "no_pets" ? "" : "no_pets"
                        );
                      }}
                    >
                      <PawPrint className="w-5 h-5 mb-1 text-gray-600" />
                      <span className="text-xs text-center">No Pets</span>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <h3 className="text-md font-medium mb-3">Property Type</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {visibleProperties.map((property, index) => (
                      <div
                        key={index}
                        className={
                          addPropertyType === property.route
                            ? "flex flex-col items-center justify-center p-2 border-2 border-black rounded-lg text-sm cursor-pointer bg-gray-100"
                            : "flex flex-col items-center justify-center p-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                        }
                        onClick={() => {
                          setAddPropertyType(
                            addPropertyType === property.route
                              ? ""
                              : property.route
                          );
                        }}
                      >
                        <Image
                          width={24}
                          height={24}
                          src={property.icon}
                          alt={property.label}
                          className="w-6 h-6 mb-1 object-contain"
                        />
                        <span className="text-xs text-center">
                          {property.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-3 text-sm text-blue-600 underline"
                    onClick={() => setShowAllProperties((prev) => !prev)}
                  >
                    {showAllProperties ? "Show less" : "Show more"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t px-4 py-3 flex flex-col xs:flex-row justify-between items-center gap-3 sticky bottom-0 bg-white z-10 rounded-b-lg md:rounded-b-3xl">
            <button
              className="text-sm underline text-gray-600 hover:text-gray-800 order-2 xs:order-1"
              onClick={() => {
                clearAllFilters();
                setSearchTerm("");
                setGuests({ adults: 0, children: 0, infants: 0 });
                setDateRange({ from: undefined, to: undefined });
                sessionStorage.setItem(
                  "mobileFilters",
                  JSON.stringify({
                    dateRange: {
                      from: dateRange?.from,
                      to: dateRange?.to,
                    },
                    searchTerm,
                    guests,
                  })
                );
              }}
            >
              Clear all
            </button>

            <button
              onClick={() => {
                router.push(
                  `/filter?propertyType=${
                    addPropertyType ? addPropertyType : ""
                  }&location=${searchTerm ? searchTerm : ""}&from=${
                    dateRange?.from ? dateRange?.from.toLocaleDateString() : ""
                  }&to=${
                    dateRange?.to ? dateRange?.to.toLocaleDateString() : ""
                  }&adults=${totalGuests ? totalGuests : ""}&senior=${
                    guests.adults ? guests.adults : ""
                  }&children=${
                    guests.children ? guests.children : ""
                  }&infants=${guests.infants ? guests.infants : ""}&priceMin=${
                    priceRange[0] || ""
                  }&priceMax=${priceRange[1] || ""}&placeType=${
                    addPlaceType ? addPlaceType.replaceAll(" ", "_") : ""
                  }&amenities=${
                    addAmenities.length !== 0 ? newAmenities : ""
                  }&bedrooms=${rooms?.bedrooms || ""}&beds=${
                    rooms?.beds || ""
                  }&bathrooms=${rooms?.bathrooms || ""}&bookingType=${
                    bookingType || ""
                  }&checkinType=${checkinType || ""}&pets=${petAllowed}`
                );
                onClose();
              }}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full xs:w-auto order-1 xs:order-2"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    );
  }
}
