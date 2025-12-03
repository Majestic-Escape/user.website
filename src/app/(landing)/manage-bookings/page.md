"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Filter, Star, X } from "lucide-react";
import Image from "next/image";
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DialogModal from "@/components/dialog-modal";
import AccountInfo from "@/components/account-info";
import ConfirmCancelDialog from "@/components/dialog-modal";
import Link from "next/link";
import Invoice from "@/components/invoice";
import moment from "moment-timezone";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const moderate = Number(process.env.NEXT_PUBLIC_MODERATE_POLICY_DAYS ?? 7);
const flexible = Number(process.env.NEXT_PUBLIC_FLEXIBLE_POLICY_DAYS ?? 24);

interface FilterState {
location: string;
minPrice: string;
maxPrice: string;
}
interface Booking {
\_id: string;
propertyId: {
\_id: string;
title: string;
address: {
city: string;
state: string;
country: string;
street: string;
};
photos?: string[];
checkinTime?: number;
checkoutTime?: number;
propertyType?: string; // ✅ added
placeType?: string; // ✅ added
};
status: string;
price: number;
checkIn: string;
checkOut: string;
cancellationPolicy?: string;
reviewed?: boolean;
hostId?: { firstName: string; lastName: string; email: string };
userId?: { firstName: string; lastName: string; email: string };
guests?: number; // ✅ added
adults?: number; // ✅ added
children?: number; // ✅ added
infants?: number; // ✅ added
nights?: number; // ✅ added
}

interface InvoiceData {
\_id: string;
propertyId: {
\_id: string;
title: string;
address: {
city: string;
state: string;
country: string;
street: string;
};
photos?: string[];
checkinTime?: number;
checkoutTime?: number;
propertyType?: string; // ✅ added
placeType?: string; // ✅ added
};
status: string;
price: number;
checkIn: string;
checkOut: string;
cancellationPolicy?: string;
reviewed?: boolean;
hostId?: { firstName: string; lastName: string; email: string };
userId?: { firstName: string; lastName: string; email: string };
guests?: number; // ✅ added
adults?: number; // ✅ added
children?: number; // ✅ added
infants?: number; // ✅ added
nights?: number; // ✅ added
}
const FilterDialog = ({
open,
onOpenChange,
filters,
onFilterChange,
onApply,
onClear,
}: {
open: boolean;
onOpenChange: (open: boolean) => void;
filters: { location: string; minPrice: string; maxPrice: string };
onFilterChange: (field: keyof FilterState, value: string) => void;
onApply: () => void;
onClear: () => void;
}) => {
return (
<Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent>
<DialogHeader>
<DialogTitle>Filter Bookings</DialogTitle>
<DialogDescription>
Apply filters to find specific bookings
</DialogDescription>
</DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
              className="col-span-3"
              placeholder="Enter location"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minPrice" className="text-right">
              Min Price
            </Label>
            <Input
              id="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              className="col-span-3"
              placeholder="Minimum price"
              min="0"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxPrice" className="text-right">
              Max Price
            </Label>
            <Input
              id="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              className="col-span-3"
              placeholder="Maximum price"
              min="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClear}>
            Clear Filters
          </Button>
          <Button onClick={onApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

);
};

const ManageBookings: React.FC = () => {
const [bookings, setBookings] = useState<Booking[]>([]);
const [activeTab, setActiveTab] = useState<string>("all");
const [showFilters, setShowFilters] = useState<boolean>(false);
const [showInvoice, setShowInvoice] = useState<boolean>(false);
const [invoiceData, setInvoiceData] = useState<Booking | null>(null);
const [payment, setPayment] = useState();
const printRef = useRef(null);
const router = useRouter();
const [showDialog, setShowDialog] = useState<boolean>(false);
const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
null
);
const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
const [tempFilters, setTempFilters] = useState<FilterState>({
location: "",
minPrice: "",
maxPrice: "",
});
const [appliedFilters, setAppliedFilters] = useState<FilterState>({
location: "",
minPrice: "",
maxPrice: "",
});
const [isLoading, setIsLoading] = useState<boolean>(true);

const fetchData = async (): Promise<void> => {
if (typeof window === "undefined") return;

    const getLocalData = await localStorage.getItem("token");
    const data = getLocalData ? JSON.parse(getLocalData) : null;
    const userData = await localStorage.getItem("userId");
    const userId = userData ? JSON.parse(userData) : null;
    if (data) {
      try {
        const response = await fetch(
          `${API_URL}/booking/data?userId=${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        setBookings(result.data);
      } catch (err) {
        console.error(err);
      }
    }

};
useEffect(() => {
fetchData();
setIsLoading(false);
}, []);
const getPayment = async (bookingId: string): Promise<void> => {
console.log("booking now", bookingId);
const data = JSON.parse(localStorage.getItem("token") || "null");
if (data) {
try {
const response = await fetch(
`${API_URL}/payment/booking?id=${bookingId}`,
{
method: "GET",
headers: {
Authorization: `Bearer ${data}`,
"Content-Type": "application/json",
},
}
);
if (response.status != 200) {
return;
}
const result = await response.json();
console.log("enll", result);
setPayment(result.data);
} catch (err) {
console.error(err);
}
}
};
console.log("booking", payment);
const filteredBookings = useMemo(() => {
return (bookings ?? [])?.filter((booking) => {
console.log(booking.propertyId?.address?.city);
const checkIn = new Date(booking.checkIn);
const checkOut = new Date(booking.checkOut);

      const isUpcoming =
        checkIn.toLocaleDateString() > new Date().toLocaleDateString();

      const isPast =
        checkIn.toLocaleDateString() <= new Date().toLocaleDateString();
      const isConfirmed = booking?.status === "confirmed";
      const isCancelled = booking?.status === "cancelled";
      const isRejected = booking?.status === "rejected";

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "upcoming" && isUpcoming) ||
        (activeTab === "past" && isPast) ||
        (activeTab === "confirmed" && isConfirmed) ||
        (activeTab === "cancelled" && isCancelled) ||
        (activeTab == "rejected" && isRejected);

      const matchesLocation =
        !appliedFilters.location ||
        booking?.propertyId?.address?.city
          .toLowerCase()
          .includes(appliedFilters.location.toLowerCase());

      const matchesMinPrice =
        !appliedFilters.minPrice ||
        booking.price >= parseInt(appliedFilters.minPrice);

      const matchesMaxPrice =
        !appliedFilters.maxPrice ||
        booking.price <= parseInt(appliedFilters.maxPrice);

      return (
        matchesTab && matchesLocation && matchesMinPrice && matchesMaxPrice
      );
    });

}, [bookings, activeTab, appliedFilters]);
const downloadPdf = async () => {
const res = await fetch(`${API_URL}/booking/generate-pdf`);
const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "test.pdf";
a.click();
window.URL.revokeObjectURL(url);
// const element = printRef.current;
// if (!element) {
// return;
// }
// const canvas = await html2canvas(element);
// const data = canvas.toDataURL("image/png");
// const pdf = new jsPDF({
// orientation: "portrait",
// unit: "px",
// format: "a4",
// });
// const imgProperties = pdf.getImageProperties(data);
// const pdfWidth = pdf.internal.pageSize.getWidth();
// const pdfHeight = (imgProperties.height \* pdfWidth) / imgProperties.width;
// pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
// pdf.save("examplepdf.pdf");
};
console.log(filteredBookings);
const handleClearFilters = () => {
const emptyFilters = { location: "", minPrice: "", maxPrice: "" };
setTempFilters(emptyFilters);
setAppliedFilters(emptyFilters);
setShowFilters(false);
};

const handleApplyFilters = () => {
setAppliedFilters(tempFilters);
setShowFilters(false);
};

const handleFilterChange = (field: keyof FilterState, value: string) => {
setTempFilters((prev) => ({ ...prev, [field]: value }));
};

const removeFilter = (field: keyof FilterState) => {
setAppliedFilters((prev) => ({ ...prev, [field]: "" }));
setTempFilters((prev) => ({ ...prev, [field]: "" }));
};

if (isLoading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
</div>
);
}
// const today = new Date().toLocaleDateString();
// const hour = new Date().getHours();

const cancelBooking = async (
bookingId: string,
userEmail: string,
hostEmail: string,
userName: string,
hostName: string
): Promise<void> => {
try {
if (typeof window === "undefined") return;
const getLocalData = await localStorage.getItem("token");
const data = JSON.parse(localStorage.getItem("token") || "null");

      if (data) {
        const response = await fetch(`${API_URL}/booking/user/terminate`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${data}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingId,
            userEmail: userEmail,
            hostEmail: hostEmail,
            userName: userName,
            hostName: hostName,
          }),
        });
        if (!response.ok) {
          toast.error("Failed Refund Payment");
          return;
        }
        toast.success("Successfully send the cancellation email");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }

};

// function diff(date: string | number | Date): number {
// const futureDate = new Date(date).setHours(12, 0, 0, 0);

// // const date2 = new Date().toLocaleDateString();
// const date1 = new Date();
// const future=moment.tz(,'Asia/kolkata')
// const futureDateObj = new Date(futureDate);
// const differenceInDays =
// (futureDateObj.getTime() - date1.getTime()) / 86400000;
// console.log(
// "Moderate Policy",
// date,
// "future",
// futureDate,
// "today",
// date1,
// "diff in days",
// differenceInDays
// );
// return differenceInDays;
// }

function differenceInDays(
checkinDate: string | number | Date,
booking: Booking
): number {
if (!checkinDate) return 0;

    const checkinTime = Number(booking?.propertyId?.checkinTime || 11);

    // Convert check-in date to IST with checkin time applied
    const checkinIST = moment
      .tz(checkinDate, "Asia/Kolkata")
      .hour(checkinTime)
      .minute(0)
      .second(0);

    // Current time in IST
    const nowIST = moment().tz("Asia/Kolkata");

    // Find difference in hours
    const diffHours = checkinIST.diff(nowIST, "hours");

    console.log("🔎 DEBUG MODERATE CHECK");
    console.log("Original CheckIn:", checkinDate);
    console.log("CheckIn IST:", checkinIST.format());
    console.log("Now IST:", nowIST.format());
    console.log("Checkin Time (24hr):", checkinTime);
    console.log("Diff in Hours:", diffHours);

    // If exactly 24 hours → return 1 day
    if (diffHours === 24) {
      console.log("Final days:", 1);
      return 1;
    }

    // If more than 24 hours → convert hours to full days
    if (diffHours > 24) {
      console.log("Final days:", Math.floor(diffHours / 24));
      return Math.floor(diffHours / 24);
    }

    // Otherwise → less than 24 hours → return 0
    return 0;

}

// console.log("blackpa", new Date());
// function canShowReview(booking: Booking): boolean {
// if (!booking?.checkOut || !booking?.propertyId?.checkoutTime) return false;

// const checkoutDate = new Date(booking?.checkOut);
// const today = new Date();

// const differenceInDays =
// (today.getTime() - checkoutDate.getTime()) / (1000 _ 60 _ 60 \* 24);

// if (today > checkoutDate && differenceInDays <= 14) {
// const isSameDay = today.toDateString() === checkoutDate.toDateString();
// if (!isSameDay) {
// return true;
// } else {
// const checkoutWithTime = new Date(checkoutDate);
// checkoutWithTime.setHours(booking?.propertyId?.checkoutTime, 0, 0, 0);

// const fiveHoursLater = new Date(
// checkoutWithTime.getTime() + 5 _ 60 _ 60 \* 1000
// );

// if (today >= fiveHoursLater) {
// return true;
// }
// }
// }
// // console.log("dta", today.toDateString(), checkoutDate.toDateString());

// // const isSameDay = today.toDateString() === checkoutDate.toDateString();

// // if (isSameDay) {
// // const checkoutWithTime = new Date(checkoutDate);
// // checkoutWithTime.setHours(booking?.propertyId?.checkoutTime, 0, 0, 0);

// // const fiveHoursLater = new Date(
// // checkoutWithTime.getTime() + 5 _ 60 _ 60 \* 1000
// // );

// // if (today >= fiveHoursLater) {
// // return true;
// // }
// // }

// return false;
// }

function canShowReview(booking: Booking): boolean {
if (!booking?.checkOut || !booking?.propertyId?.checkoutTime) return false;

    // Convert both to India timezone
    const checkoutIST = moment.tz(booking.checkOut, "Asia/Kolkata");
    const todayIST = moment().tz("Asia/Kolkata");

    // Difference in full days (today - checkout)
    const differenceInDays = todayIST.diff(checkoutIST, "days");

    // Example: If checkout happened already
    if (todayIST.isAfter(checkoutIST) && differenceInDays <= 14) {
      // Check if it is the same date (regardless of time)
      const isSameDay =
        todayIST.format("YYYY-MM-DD") === checkoutIST.format("YYYY-MM-DD");

      if (!isSameDay) {
        return true;
      } else {
        // Same day → apply checkout time + 5 hour rule

        // Create checkout date with checkout time
        const checkoutWithTimeIST = moment
          .tz(checkoutIST.format("YYYY-MM-DD"), "Asia/Kolkata")
          .hour(booking.propertyId.checkoutTime)
          .minute(0)
          .second(0)
          .millisecond(0);

        // Add 5 hours waiting buffer
        const thresholdTimeIST = checkoutWithTimeIST.clone().add(5, "hours");

        if (todayIST.isSameOrAfter(thresholdTimeIST)) {
          return true;
        }
      }
    }

    return false;

}

// function diffHours(date: string | number | Date, time: number): number {
// const futureDate = new Date(date);
// const futureHours = new Date(futureDate).setHours(time, 0);

// // const date2 = new Date();
// const date1 = new Date();
// const differenceInHours = (futureHours - date1.getTime()) / 3600000;
// // console.log("Flexible policy", futureDate, time, date1, differenceInHours);
// return differenceInHours;
// }
function differenceInHours(
checkinDate: string | number | Date,
booking: Booking
): number {
if (!checkinDate) return 0;
console.log("has entered the diff");
const checkinTime = Number(booking?.propertyId?.checkinTime || 11);

    // Convert check-in date to IST with checkin time applied
    const checkinIST = moment
      .tz(checkinDate, "Asia/Kolkata")
      .hour(checkinTime)
      .minute(0)
      .second(0);

    // Current time in IST
    const nowIST = moment().tz("Asia/Kolkata");

    // Find difference in hours
    const diffHours = checkinIST.diff(nowIST, "hours");

    console.log("🔎 DEBUG FLEXIBLE CHECK");
    console.log("Original CheckIn:", checkinDate);
    console.log("CheckIn IST:", checkinIST.format());
    console.log("Now IST:", nowIST.format());
    console.log("Checkin Time (24hr):", checkinTime);
    console.log("Diff in Hours:", diffHours);

    // If exactly 24 hours → return 1 day

    return diffHours;

}

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
const getStatusColor = (status: string): string => {
switch (status) {
case "confirmed":
return "bg-green-100 text-green-800";
case "rejected":
return "bg-red-100 text-red-800";
case "cancelled":
return "bg-orange-100 text-orange-800";

        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
          status
        )}`}
      >
        {status === "processing"
          ? "Pending"
          : status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );

};
const fmt = new Intl.DateTimeFormat("en-US", {
month: "short",
day: "numeric",
year: "numeric",
});

console.log("Invoice Data", invoiceData, payment);
return (
<main className="py-16 md:py-24">
<div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
<h1 className="text-2xl font-bricolage text-absoluteDark font-bold">
My Booking
</h1>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="h-auto p-0 bg-transparent border-b border-gray-200 w-full lg:w-auto flex flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "upcoming", label: "Upcoming" },
                { value: "past", label: "Past" },
                { value: "confirmed", label: "Confirmed" },
                { value: "cancelled", label: "Cancelled" },
                { value: "rejected", label: "Rejected" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative h-9 rounded-none border-b-2 border-transparent px-2 sm:px-4 pb-3 pt-2 text-sm sm:text-base font-semibold text-muted-foreground data-[state=active]:border-primaryGreen data-[state=active]:text-primaryGreen "
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <FilterDialog
            open={showFilters}
            onOpenChange={setShowFilters}
            filters={tempFilters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Active Filters Display */}
        {(appliedFilters.location ||
          appliedFilters.minPrice ||
          appliedFilters.maxPrice) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {appliedFilters.location && (
              <Badge variant="secondary" className="gap-1">
                Location: {appliedFilters.location}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFilter("location")}
                />
              </Badge>
            )}
            {appliedFilters.minPrice && (
              <Badge variant="secondary" className="gap-1">
                Min Price: ₹{appliedFilters.minPrice}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFilter("minPrice")}
                />
              </Badge>
            )}
            {appliedFilters.maxPrice && (
              <Badge variant="secondary" className="gap-1">
                Max Price: ₹{appliedFilters.maxPrice}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFilter("maxPrice")}
                />
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="hidden lg:grid grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 px-4 py-2 bg-muted text-sm font-medium">
            <div>Property</div>
            <div>Date</div>
            <div>Status</div>
            <div>Price</div>
            <div></div>
          </div>

          {filteredBookings.map((booking) => {
            const summaryParams = new URLSearchParams({
              hostFirstName: booking?.hostId?.firstName ?? "",
              hostLastName: booking?.hostId?.lastName ?? "",
              bookingId: booking?._id ?? "",
              propertyId: booking?.propertyId?._id ?? "",
              propertyType: booking?.propertyId?.propertyType ?? "",
              placeType: booking?.propertyId?.placeType ?? "",
              propertyName: booking?.propertyId?.title || "Property",
              street: booking?.propertyId?.address?.street ?? "",
              city: booking?.propertyId?.address?.city ?? "",
              state: booking?.propertyId?.address?.state ?? "",
              country: booking?.propertyId?.address?.country ?? "",
              propertyImage: booking?.propertyId?.photos?.[0] ?? "",
              checkin: String(new Date(booking?.checkIn).getTime()),
              checkout: String(new Date(booking?.checkOut).getTime()),
              numberOfGuests: String(booking?.guests ?? ""),
              adults: String(booking?.adults ?? ""),
              children: String(booking?.children ?? ""),
              infants: String(booking?.infants ?? ""),
              totalAmount: String(booking?.price ?? ""),
              nights: String(booking?.nights ?? ""),
              checkinTime: String(booking?.propertyId?.checkinTime ?? ""),
              checkoutTime: String(booking?.propertyId?.checkoutTime ?? ""),
              bookingHistory: "true",
            });

            return (
              <Card key={booking?._id} className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <Image
                      alt="Property"
                      className="rounded-lg object-cover w-full lg:w-24 h-48 lg:h-24"
                      height={96}
                      src={
                        booking?.propertyId?.photos?.[0] ?? "/placeholder.jpg"
                      }
                      width={96}
                    />
                    {}
                    <div className="space-y-2">
                      <h3 className="font-medium">
                        {booking?.propertyId?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Located at {booking?.propertyId?.address?.city},{" "}
                        {booking?.propertyId?.address?.state}
                        <Link
                          href={`/booking-summary?${summaryParams.toString()}`}
                        >
                          <div className="text-red-500 pointer">
                            View Details
                          </div>
                        </Link>
                      </p>
                      {/* <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage alt="Host" src="/placeholder.svg" />
                        <AvatarFallback>H</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Hosted by</span>{" "}
                        {booking.host}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primaryGreen text-primaryGreen" />
                          <span className="font-medium">{booking.rating}</span>
                          <span className="text-muted-foreground">
                            ({booking.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div> */}
                    </div>
                  </div>

                  <div className="space-y-4 lg:space-y-2">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="w-4 h-4 text-muted-foreground" /> */}
                      <div className="text-sm">
                        <div className="text-muted-foreground">Check in</div>
                        <div>
                          {fmt.format(new Date(booking?.checkIn).getTime())}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="w-4 h-4 text-muted-foreground" /> */}
                      <div className="text-sm">
                        <div className="text-muted-foreground">Check out</div>
                        <div>
                          {fmt.format(new Date(booking?.checkOut).getTime())}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 lg:space-y-2 ">
                    {/* agent        <Badge
                      variant="secondary"
                      className={`
                      ${
                        booking?.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        booking?.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }
                      ${
                        booking?.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                      hover:bg-opacity-80
                    `}
                    >
                      {booking?.status}
                    </Badge> */}
                    <StatusPill status={booking?.status} />
                  </div>

                  <div>
                    <div className="font-medium">₹{booking?.price}</div>
                    {/* <div className="text-sm text-muted-foreground">
                    Total {booking.nights} nights
                  </div> */}
                  </div>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-primaryGreen text-white py-3 rounded-md w-half mr-2"
                      onClick={() => {
                        setShowInvoice(true);
                        getPayment(booking?._id);
                        setInvoiceData(booking);
                      }}
                    >
                      Invoice
                    </Button>

                    {booking?.status == "confirmed" &&
                    booking?.reviewed == false ? (
                      canShowReview(booking) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-primaryGreen text-white py-3 rounded-md w-half mr-2"
                            onClick={() => {
                              router.push(
                                `/rating?booking=${
                                  booking._id
                                }&${summaryParams.toString()}&active=${true}`
                              );
                              setShowDialog(true);
                            }}
                          >
                            Review Now
                          </Button>
                        </>
                      ) : null
                    ) : null}
                    {booking?.status != "cancelled" &&
                    booking?.status != "rejected" ? (
                      booking?.cancellationPolicy != "strict" ? (
                        differenceInDays(booking?.checkIn, booking) >
                          moderate &&
                        booking?.cancellationPolicy == "moderate" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-primaryGreen text-white py-3 rounded-md w-half"
                              onClick={() => {
                                setBookingToCancel(booking); // store selected booking
                                setCancelDialogOpen(true); // open the dialog
                                // cancelBooking(
                                //   booking?._id,
                                //   booking?.userId?.email,
                                //   booking?.hostId?.email,
                                //   booking?.userId?.firstName +
                                //     " " +
                                //     booking?.userId?.lastName,
                                //   booking?.hostId?.firstName +
                                //     " " +
                                //     booking?.hostId?.lastName
                                // );
                              }}
                            >
                              Cancel
                            </Button>
                            {bookingToCancel && (
                              <ConfirmCancelDialog
                                choice={"Cancel"}
                                open={cancelDialogOpen}
                                onClose={() => {
                                  setCancelDialogOpen(false);
                                  setBookingToCancel(null);
                                }}
                                onConfirm={async () => {
                                  if (!bookingToCancel) return null;
                                  await cancelBooking(
                                    bookingToCancel._id,
                                    bookingToCancel.userId!.email,
                                    bookingToCancel.hostId!.email,
                                    `${bookingToCancel.userId!.firstName} ${
                                      bookingToCancel.userId!.lastName
                                    }`,
                                    `${bookingToCancel.hostId!.firstName} ${
                                      bookingToCancel.hostId!.lastName
                                    }`
                                  );
                                  setCancelDialogOpen(false);
                                  setBookingToCancel(null);
                                }}
                              />
                            )}
                          </>
                        ) : differenceInHours(booking?.checkIn, booking) >
                            flexible &&
                          booking?.cancellationPolicy == "flexible" ? (
                          <>
                            {console.log("Cancel Policies")}
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-primaryGreen text-white py-3 rounded-md w-half"
                              onClick={() => {
                                setBookingToCancel(booking); // store selected booking
                                setCancelDialogOpen(true); // open the dialog
                              }}
                            >
                              Cancel
                            </Button>
                            {bookingToCancel && (
                              <ConfirmCancelDialog
                                choice={"Cancel"}
                                open={cancelDialogOpen}
                                onClose={() => {
                                  setCancelDialogOpen(false);
                                  setBookingToCancel(null);
                                }}
                                onConfirm={async () => {
                                  if (!bookingToCancel) return null;
                                  await cancelBooking(
                                    bookingToCancel._id,
                                    bookingToCancel.userId!.email,
                                    bookingToCancel.hostId!.email,
                                    `${bookingToCancel.userId!.firstName} ${
                                      bookingToCancel.userId!.lastName
                                    }`,
                                    `${bookingToCancel.hostId!.firstName} ${
                                      bookingToCancel.hostId!.lastName
                                    }`
                                  );
                                  setCancelDialogOpen(false);
                                  setBookingToCancel(null);
                                }}
                              />
                            )}
                          </>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {showInvoice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              {/* Outer container — center modal */}
              <div className="bg-white w-full rounded-2xl max-w-2xl max-h-[90vh] flex flex-col relative">
                {/* Header (fixed top) */}
                <div className="sticky rounded-t-2xl top-0 bg-white  border-b flex justify-between items-center px-4 py-3 z-10">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Invoice
                  </h2>
                  <button
                    onClick={() => {
                      setShowInvoice(false);
                      setInvoiceData(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div
                  ref={printRef}
                  className="flex-1 overflow-y-auto px-6 py-4"
                >
                  <Invoice payment={payment} invoiceData={invoiceData} />
                </div>

                {/* Footer (fixed bottom) */}
                <div className="sticky  rounded-b-2xl  bottom-0 bg-gray-50 border-t flex justify-end px-4 py-3 z-10">
                  <Button onClick={() => downloadPdf()}>Download PDF</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>

);
};

export default ManageBookings;
