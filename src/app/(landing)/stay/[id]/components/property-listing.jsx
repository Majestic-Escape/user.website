"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingWidget from "./booking-widget";
import PropertyHighlights from "./property-highlights";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import PropertyDescription from "./property-description";
import PropertyAmenities from "./property-amenities";
import PropertySleepingArrangements from "./property-sleeping-arrangements";
import { toast } from "sonner";

export default function PropertyListing({
  propertyDetails,
  isLoading,
  unavailableDates,
  loading,
}) {
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("propertyDetails data", propertyDetails);
  }
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("isLoading ", isLoading);
  }
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [guests, setGuests] = useState({
    adults: Math.min(propertyDetails.guests, 2),
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showAmenitiesDialog, setShowAmenitiesDialog] = useState(false);
  const [activation, setActivation] = useState(false);
  const handleDateSelect = (range) => {
    setDate(range);
    setActivation(true);

    if (range?.from && range?.to) {
      setShowCalendar(false);
    }
  };
  const {
    modalCheckDate,
    setModalCheckDate,
    modalMobilePrice,
    setModalMobilePrice,
    setPerNightPrice,
  } = useAuth();

  setModalCheckDate(date);

  setPerNightPrice(propertyDetails?.basePrice);
  const handleGuestChange = (type, value) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, value),
    }));
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
    if (showGuestsDropdown) setShowGuestsDropdown(false);
  };

  const toggleGuestsDropdown = () => {
    setShowGuestsDropdown(!showGuestsDropdown);
    if (showCalendar) setShowCalendar(false);
  };
  const obj = propertyDetails.bookingType;
  const manual = Object.keys(obj).filter((key) => obj[key]);
  return (
    <div className="max-w-7xl  mx-auto relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 px-4 md:px-0">
        <div className="md:col-span-2">
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center gap-4 mt-6">
              {propertyDetails?.placeType[0].toUpperCase() +
                propertyDetails?.placeType.slice(1)}{" "}
              {propertyDetails?.propertyType[0].toUpperCase() +
                propertyDetails?.propertyType.slice(1)}{" "}
              in {propertyDetails?.address?.city},{" "}
              {propertyDetails?.address?.state}
            </div>
            <div className="flex items-center gap-4 mt-6">
              {propertyDetails?.guests} Guests | {propertyDetails?.beds} Beds |{" "}
              {propertyDetails?.bedrooms} Bedroom | {propertyDetails?.bathrooms}{" "}
              Bathroom
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Avatar className="h-8 w-8 md:h-12 md:w-12">
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="Host"
                />
                <AvatarFallback>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base md:text-lg font-medium text-stone">
                  Hosted by{" "}
                  <span className="text-absoluteDark font-semibold">
                    {propertyDetails?.host?.firstName}{" "}
                    {propertyDetails?.host?.lastName}
                  </span>
                </h2>
                {/* <p className="text-gray-600">2 years hosting</p> */}
              </div>
            </div>
          </div>
          {/* <PropertyHighlights /> */}
          <PropertyDescription
            description={propertyDetails?.description}
            property={propertyDetails}
          />
          <PropertyAmenities
            manual={manual}
            amenities={propertyDetails?.amenities}
            showAmenitiesDialog={showAmenitiesDialog}
            setShowAmenitiesDialog={setShowAmenitiesDialog}
            safety={propertyDetails?.safetyFeatures}
            rules={propertyDetails?.selectedRules}
            custom={propertyDetails?.customRules}
          />

          {/* <PropertySleepingArrangements  
          bedRoom = {propertyDetails?.bedRooms}
          beds = {propertyDetails?.beds}
          /> */}
        </div>

        <div className="fixed bottom-0 z-[10] w-[92vw] right-4 md:right-0 md:w-auto  md:sticky md:top-48 md:self-start">
          <BookingWidget
            propertyId={propertyDetails?._id}
            manual={manual}
            propertyImages={propertyDetails?.photos}
            pricePerNight={propertyDetails?.basePrice}
            checkinTime={propertyDetails?.checkinTime}
            checkoutTime={propertyDetails?.checkoutTime}
            date={date}
            guests={guests}
            showCalendar={showCalendar}
            showGuestsDropdown={showGuestsDropdown}
            onDateSelect={handleDateSelect}
            onGuestChange={handleGuestChange}
            toggleCalendar={toggleCalendar}
            toggleGuestsDropdown={toggleGuestsDropdown}
            unavailableDates={unavailableDates}
            activation={activation}
            allowedGuests={propertyDetails?.guests}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
