"use client";

import { useState, useEffect } from "react";
import { eachDayOfInterval, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Flag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { toast } from "sonner";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface BookingWidgetProps {
  propertyId: string;
  propertyImages: Array<string>;
  pricePerNight: number;
  date: DateRange | undefined;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  unavailableDates: Array<string>;
  checkinTime: string;
  checkoutTime: string;
  showCalendar: boolean;
  showGuestsDropdown: boolean;
  onDateSelect: (range: DateRange | undefined) => void;
  onGuestChange: (
    type: "adults" | "children" | "infants" | "pets",
    value: number
  ) => void;
  toggleCalendar: () => void;
  toggleGuestsDropdown: () => void;
  activation: boolean;
  allowedGuests: number;
  loading: boolean;
}

export default function BookingWidget({
  propertyId,
  propertyImages,
  pricePerNight,
  date,
  guests,
  showCalendar,
  showGuestsDropdown,
  checkinTime,
  checkoutTime,
  onDateSelect,
  onGuestChange,
  toggleCalendar,
  toggleGuestsDropdown,
  unavailableDates,
  activation,
  allowedGuests,
  loading,
}: BookingWidgetProps) {
  const [totalPrice, setTotalPrice] = useState<number>(pricePerNight);
  const [nightsCount, setNightsCount] = useState<number>(1);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (date?.from && date?.to) {
      const nights = Math.ceil(
        (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)
      );
      setNightsCount(nights);
      setTotalPrice(pricePerNight * nights);
    }
  }, [date, pricePerNight]);

  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = getLocalData ? JSON.parse(getLocalData) : null;
    if (data) {
      setIsAuth(true);
    }
  };
  console.log("nonssssssss", isAuth, isValid);
  useEffect(() => {
    auth();
  }, []);
  console.log("logite", propertyImages[0]);
  const calculatePriceWithTax = (basePrice: number) => {
    const serviceFee = Math.round((basePrice * 14) / 100);
    const priceWithServiceFee = basePrice + serviceFee;

    let gstRate = 0;
    if (priceWithServiceFee >= 7500) {
      gstRate = 18;
    } else if (priceWithServiceFee >= 1000) {
      gstRate = 12;
    }

    const gstAmount = Math.round((priceWithServiceFee * gstRate) / 100);
    const totalPrice = priceWithServiceFee + gstAmount;

    // Format number in Indian style
    return totalPrice.toLocaleString("en-IN");
  };

  const calculatePriceWithoutTax = (basePrice: number) => {
    const serviceFee = Math.round((basePrice * 14) / 100);
    const priceWithServiceFee = basePrice + serviceFee;

    // Format number in Indian style
    return priceWithServiceFee.toLocaleString("en-IN");
  };

  const calculateServicFee = (basePrice: number) => {
    const serviceFee = Math.round((basePrice * 12) / 100);
    // const priceWithServiceFee = basePrice + serviceFee;

    // Format number in Indian style
    return serviceFee.toLocaleString("en-IN");
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "dd/MM/yyyy") : "";
  };
  const formatRevDate = (date: Date | undefined) => {
    return date ? format(date, "yyyy-MM-dd") : "";
  };
  console.log("not what", formatRevDate(new Date()));
  const getTotalGuests = () => {
    return guests.adults + guests.children;
  };

  const getGuestsText = () => {
    const totalGuests = getTotalGuests();
    return `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
  };
  const createReserveRecord = async (): Promise<void> => {
    try {
      const getLocalData = await localStorage.getItem("token");

      const data = getLocalData ? JSON.parse(getLocalData) : null;
      const getUserId = await localStorage.getItem("userId");
      const userId = getUserId ? JSON.parse(getUserId) : null;
      console.log("this is user log", userId);
      if (!data) {
        toast.error("You need to signup or login to reserve.");
        return;
      }

      const response = await fetch(`${API_URL}/booking-interest/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          propertyId: propertyId,
          dateFrom: date?.from,
          dateTo: date?.to,
          guests: getTotalGuests(),
        }),
      });
      if (!response.ok) {
        return;
      }
      setIsValid(true);
    } catch (err) {
      console.error(err);
    }
  };
  function getDateRange(start: Date, end: Date) {
    const dates = [];
    const current = new Date(start);
    const final = new Date(end);

    while (current < final) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Remove checkout date

    return dates;
  }

  // Check for overlap
  function hasDateOverlap() {
    if (!date?.from || !date?.to) return false;

    const range = getDateRange(date.from, date.to).map((d) => formatRevDate(d)); // You already have formatRevDate()

    return range.some((d) => unavailableDates.includes(d));
  }
  const filename = propertyImages[0].split("/").pop();
  console.log("bailan", filename);
  console.log("get tyep", Object.prototype.toString.call(date?.from));
  console.log("we have got this date", date?.from);
  return (
    <Card className="border rounded-xl sticky shadow-lg">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-2xl font-semibold font-bricolage">
                ₹{pricePerNight.toLocaleString()}
              </span>
              <span className="text-gray-600"> night</span>
            </div>
          </div>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <div className="border border-gray-300 rounded-lg mb-4">
              <div className="grid grid-cols-2 divide-x divide-gray-300">
                <PopoverTrigger asChild>
                  <div className="p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-tl-lg">
                    <div className="text-xs font-semibold uppercase">
                      CHECK-IN
                    </div>
                    <div className="mt-1 text-base">
                      {activation
                        ? date?.from
                          ? formatDate(date.from)
                          : "Add date"
                        : "Add Date"}
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverTrigger asChild>
                  <div className="p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-tr-lg">
                    <div className="text-xs font-semibold uppercase">
                      CHECK-OUT
                    </div>
                    <div className="mt-1 text-base">
                      {activation
                        ? date?.to
                          ? formatDate(date.to)
                          : "Add date"
                        : "Add date"}
                    </div>
                  </div>
                </PopoverTrigger>
              </div>

              <div
                className="border-t border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-b-lg flex justify-between items-center"
                onClick={toggleGuestsDropdown}
              >
                <div>
                  <div className="text-xs font-semibold uppercase">GUESTS</div>
                  <div className="mt-1 text-base">{getGuestsText()}</div>
                </div>
                <div>
                  {showGuestsDropdown ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>
            </div>

            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 border-b">
                <h3 className="text-base font-semibold">Select dates</h3>
                <div className="text-sm text-gray-600 mt-1">
                  Add your travel dates for exact pricing
                </div>
              </div>
              <div className="p-4">
                {loading ? (
                  // ---- LOADING SPINNER UI ----
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="h-8 w-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    <p className="text-sm mt-2 text-gray-600">
                      Loading dates...
                    </p>
                  </div>
                ) : (
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={activation ? date : undefined}
                    onSelect={onDateSelect}
                    numberOfMonths={2}
                    disabled={[
                      { before: new Date() }, // disable past dates
                      ...unavailableDates.map((d) => new Date(d)), // disable specific unavailable dates
                      // ...(date?.from
                      //   ? [
                      //       (d: Date) =>
                      //         d.toDateString() === date.from!.toDateString(),
                      //     ]
                      //   : []),
                    ]}
                    classNames={{
                      day_selected:
                        "bg-black text-white hover:bg-black hover:text-white",
                      day_range_middle:
                        "aria-selected:bg-gray-100 aria-selected:text-black",
                      day_range_end:
                        "bg-black text-white hover:bg-black hover:text-white",
                      day_range_start:
                        "bg-black text-white hover:bg-black hover:text-white",
                    }}
                  />
                )}
              </div>
              <div className="p-4 flex justify-between border-t">
                <Button variant="ghost" onClick={() => onDateSelect(undefined)}>
                  Clear dates
                </Button>
                <Button
                  className="bg-primaryGreen hover:bg-brightGreen text-white"
                  onClick={() => setCalendarOpen(false)}
                >
                  Close
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {showGuestsDropdown && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 left-0 right-0 mt-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Adults</div>
                    <div className="text-sm text-gray-600">Age 18+</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("adults", guests.adults - 1)}
                      disabled={guests.adults <= 1}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("adults", guests.adults + 1)}
                      disabled={getTotalGuests() >= allowedGuests}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-gray-600">Ages 2-12</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() =>
                        onGuestChange("children", guests.children - 1)
                      }
                      disabled={guests.children <= 0}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.children}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() =>
                        onGuestChange("children", guests.children + 1)
                      }
                      disabled={getTotalGuests() >= allowedGuests}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Infants</div>
                    <div className="text-sm text-gray-600">Under 2</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() =>
                        onGuestChange("infants", guests.infants - 1)
                      }
                      disabled={guests.infants <= 0}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.infants}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        if (guests.infants < 5) {
                          onGuestChange("infants", guests.infants + 1);
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Pets</div>
                    <div className="text-sm text-gray-600">
                      Bringing a service animal?
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets - 1)}
                      disabled={guests.pets <= 0}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests.pets}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onGuestChange("pets", guests.pets + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div> */}

                <div className="text-sm text-gray-600 pt-2 border-t">
                  {/* This place has a maximum of 2 guests, not including infants.
                  Pets aren't allowed. */}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="default"
                    className="bg-primaryGreen hover:brightGreen"
                    onClick={toggleGuestsDropdown}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div onClick={() => createReserveRecord()}>
            {isAuth || isValid ? (
              activation ? (
                date?.from && date?.to ? (
                  hasDateOverlap() ? (
                    <Button
                      className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                      onClick={() =>
                        toast.error(
                          "Selected date overlaps with other bookings"
                        )
                      }
                    >
                      Reserve
                    </Button>
                  ) : formatRevDate(new Date(date?.from)) ==
                    formatRevDate(new Date(date?.to)) ? (
                    <Button
                      className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                      onClick={() =>
                        toast.error("Checkin and Checkout date cannot be same")
                      }
                    >
                      Reserve
                    </Button>
                  ) : (
                    <Link
                      href={{
                        pathname: `/book/stay/${propertyId}`,
                        query: {
                          checkin: date?.from
                            ? format(date.from, "yyyy-MM-dd")
                            : undefined,
                          checkout: date?.to
                            ? format(date.to, "yyyy-MM-dd")
                            : undefined,
                          guests: getTotalGuests(),
                          nights: nightsCount,
                          adults: guests.adults,
                          children: guests.children,
                          infants: guests.infants,
                          checkinTime: checkinTime,
                          checkoutTime: checkoutTime,
                          propertyImage: filename,
                        },
                      }}
                      className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                    >
                      Reserve
                    </Link>
                  )
                ) : (
                  <Button
                    className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                    onClick={() => {
                      toast.error("Select both dates");
                    }}
                  >
                    {"Check availability"}
                  </Button>
                )
              ) : (
                <Button
                  className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                  onClick={() => {
                    toast.error("Select dates");
                  }}
                >
                  Check availability
                </Button>
              )
            ) : (
              <Button
                className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
                // onClick={() => toast.error("Check if you are logged in")}
              >
                Check availability
              </Button>
            )}
          </div>
          {(date?.from || date?.to) && (
            <>
              <div className="text-center text-sm text-gray-600 mt-2">
                You won't be charged yet
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <div className="underline text-sm">
                    ₹{pricePerNight.toLocaleString()} x {nightsCount} night
                    {nightsCount !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm">₹{totalPrice.toLocaleString()}</div>
                </div>

                <div className="flex justify-between">
                  <div className="underline text-sm">
                    Majestic Escape Service Fee
                  </div>
                  <div className="text-sm">
                    ₹{calculateServicFee(pricePerNight * nightsCount)}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t ">
                  <div>Total before taxes</div>
                  <div>
                    ₹{calculatePriceWithoutTax(pricePerNight * nightsCount)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className=" justify-center hidden p-4 border-t">
          <Button variant="ghost" className="text-sm flex items-center gap-1">
            <Flag className="h-4 w-4" />
            Report this listing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
