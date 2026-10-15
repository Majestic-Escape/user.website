"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarX2, ChevronRight, Filter, Star, X } from "lucide-react";
import MediaImage, { PHOTO_PLACEHOLDER } from "@/components/ui/media-image";
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
import Portal from "@/components/portal";
import { formatDate, formatINR } from "@/lib/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { USER } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import { readStoredToken } from "@/lib/session";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const moderate = Number(process.env.NEXT_PUBLIC_MODERATE_POLICY_DAYS ?? 7);
const flexible = Number(process.env.NEXT_PUBLIC_FLEXIBLE_POLICY_DAYS ?? 24);

interface FilterState {
  location: string;
  minPrice: string;
  maxPrice: string;
}
interface Booking {
  _id: string;
  propertyId: {
    _id: string;
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
  hostId?: { firstName?: string };
  userId?: { firstName?: string; lastName?: string; email?: string };
  guests?: number; // ✅ added
  adults?: number; // ✅ added
  children?: number; // ✅ added
  infants?: number; // ✅ added
  nights?: number; // ✅ added
  paymentStatus?: "paid" | "unpaid" | "refunded";
  refundAmount?: number; // rupees, set once a refund went through
}

interface InvoiceData {
  _id: string;
  propertyId: {
    _id: string;
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
  hostId?: { firstName?: string };
  userId?: { firstName?: string; lastName?: string; email?: string };
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
  const queryClient = useQueryClient();
  // The stored user id is read after mount: reading localStorage during
  // render made the server (no id → empty state) and the first client
  // render (id → spinner) disagree, a hydration mismatch (React #418) that
  // re-rendered the whole page on the client. Until mounted both sides
  // render the spinner.
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    let stored: string | null = null;
    try {
      const raw = localStorage.getItem("userId");
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }
    setUserId(stored);
    setMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<Booking | null>(null);
  const [payment, setPayment] = useState();
  const printRef = useRef(null);
  const router = useRouter();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  // One cancel request at a time: a second tap must not send a second one.
  const [cancelling, setCancelling] = useState<boolean>(false);
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
  // Per-user cache keyed by userId (cleared on login/logout). Returning to
  // this page within a minute paints the list instantly; a tab refocus
  // revalidates it.
  const { data: bookings = [], isPending: bookingsPending } = useQuery({
    queryKey: queryKeys.userBookings(userId),
    queryFn: async (): Promise<Booking[]> => {
      const token = readStoredToken();
      if (!token) return [];
      const response = await fetch(
        `${API_URL}/booking/data?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings (status: ${response.status})`);
      }
      const result = await response.json();
      return Array.isArray(result?.data) ? result.data : [];
    },
    enabled: !!userId,
    ...USER,
  });
  // Logged out (no userId) the query never runs, so it stays "pending";
  // show the empty state instead of a skeleton forever.
  const isLoading = !mounted || (!!userId && bookingsPending);
  const fetchData = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.userBookingsAll });
  useEffect(() => {
    if (showInvoice) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      const scrollY = document.body.dataset.scrollY;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
    }
  }, [showInvoice]);

  const getPayment = async (bookingId: string): Promise<void> => {
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
          },
        );
        if (response.status != 200) {
          return;
        }
        const result = await response.json();

        setPayment(result.data);
      } catch (err) {
        console.error(err);
      }
    }
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("booking", payment);
  }
  const filteredBookings = useMemo(() => {
    return (bookings ?? [])?.filter((booking) => {
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log(booking.propertyId?.address?.city);
      }
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      // const isUpcoming =
      //   checkIn.toLocaleDateString() > new Date().toLocaleDateString();

      // const isPast =
      //   checkIn.toLocaleDateString() <= new Date().toLocaleDateString();
      const isConfirmed = booking?.status === "confirmed";
      const isCancelled = booking?.status === "cancelled";
      const isRejected = booking?.status === "rejected";
      // Upcoming / Past are stays that are still on; cancelled and declined
      // ones live under their own tabs (and All).
      const isLive = !isCancelled && !isRejected;
      const isUpcoming = isLive && checkIn.getTime() > new Date().getTime();
      const isPast = isLive && checkIn.getTime() <= new Date().getTime();

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
    //   return;
    // }
    // const canvas = await html2canvas(element);
    // const data = canvas.toDataURL("image/png");
    // const pdf = new jsPDF({
    //   orientation: "portrait",
    //   unit: "px",
    //   format: "a4",
    // });
    // const imgProperties = pdf.getImageProperties(data);
    // const pdfWidth = pdf.internal.pageSize.getWidth();
    // const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    // pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    // pdf.save("examplepdf.pdf");
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log(filteredBookings);
  }
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
    // The page's own shape while bookings load (no layout jump when they land).
    return (
      <main className="py-16 md:py-24" aria-busy="true">
        <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-bricolage text-absoluteDark font-bold">
            My Booking
          </h1>
          <span className="sr-only" role="status">Loading your bookings…</span>
          <div className="h-10 w-full max-w-lg rounded-md bg-gray-100 animate-pulse motion-reduce:animate-none" />
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3" aria-hidden="true">
              <div className="h-48 lg:h-24 lg:w-24 w-full rounded-lg bg-gray-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </main>
    );
  }
  // const today = new Date().toLocaleDateString();
  // const hour = new Date().getHours();

  // The backend derives the parties and their emails from the booking
  // itself; the request carries only the booking id.
  const cancelBooking = async (booking: Booking): Promise<void> => {
    const bookingId = booking._id;
    const propertyId = booking.propertyId?._id;
    try {
      if (typeof window === "undefined") return;
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
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          // REFUND_FAILED: the gateway refused the refund (e.g. not enough
          // balance on the merchant account). The server leaves the booking
          // untouched and alerts the team, so say exactly that.
          toast.error(
            body?.code === "REFUND_FAILED"
              ? "We couldn't cancel this booking because the refund didn't go through. Your booking is still active and nothing has changed. Our team has been alerted. Please try again later or email info@majesticescape.in."
              : body?.message || "We couldn't cancel this booking. Please try again.",
            { duration: 10000 },
          );
          // Closed or refunding elsewhere (another tab, the host, our team):
          // the card is out of date, show what the server has now.
          if (body?.code === "ALREADY_CLOSED" || body?.code === "REFUND_IN_PROGRESS") fetchData();
          return;
        }
        const result = await response.json().catch(() => null);
        // Say what actually happened to the money: the server decides the
        // refund (policy window), not this page.
        toast.success(
          result?.refunded
            ? `Your booking has been cancelled and a refund of ${formatINR(result?.data?.refundAmount ?? booking.price)} is on its way to your original payment method. Most banks show it within minutes; some take 5–7 working days. We've emailed you the details.`
            : booking.paymentStatus === "paid"
              ? "Your booking has been cancelled. Under this stay's cancellation policy no refund was due. We've emailed you the details."
              : "Your booking has been cancelled. We've emailed you the details.",
          { duration: 8000 },
        );
        // Only after the 2xx: the list, this booking, and the listing's
        // availability calendar are all stale now.
        fetchData();
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookingById(bookingId),
        });
        if (propertyId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.checkDates(propertyId),
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("We couldn't reach the server. Please check your connection and try again.");
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
  // process.env.ENV === 'dev' && console.log(
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

  // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

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
  // // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

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

  // function differenceInDays(
  //   checkinDate: string | number | Date,
  //   booking: Booking
  // ): number {
  //   if (!checkinDate) return 0;

  //   const checkinTime = Number(booking?.propertyId?.checkinTime || 11);

  //   // Convert check-in date to IST with checkin time applied
  //   const checkinIST = moment
  //     .tz(checkinDate, "Asia/Kolkata")
  //     .hour(checkinTime)
  //     .minute(0)
  //     .second(0);

  //   // Current time in IST
  //   const nowIST = moment().tz("Asia/Kolkata");

  //   // Find difference in hours
  //   const diffHours = checkinIST.diff(nowIST, "hours");

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Now IST:", nowIST.format());
  // }
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Diff in Hours:", diffHours);
  // }

  //   // If exactly 24 hours → return 1 day
  //   if (diffHours === 24) {
  //     process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Final days:", 1);
  // }
  //     return 1;
  //   }

  //   // If more than 24 hours → convert hours to full days
  //   if (diffHours > 24) {
  //     process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Final days:", Math.floor(diffHours / 24));
  // }
  //     return Math.floor(diffHours / 24);
  //   }

  //   // Otherwise → less than 24 hours → return 0
  //   return 0;
  // }

  // function diffHours(date: string | number | Date, time: number): number {
  // const futureDate = new Date(date);
  // const futureHours = new Date(futureDate).setHours(time, 0);

  // // const date2 = new Date();
  // const date1 = new Date();
  // const differenceInHours = (futureHours - date1.getTime()) / 3600000;
  // // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Flexible policy", futureDate, time, date1, differenceInHours);
  // }
  // return differenceInHours;
  // }
  // function differenceInHours(
  //   checkinDate: string | number | Date,
  //   booking: Booking
  // ): number {
  //   if (!checkinDate) return 0;
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("has entered the diff");
  // }
  //   const checkinTime = Number(booking?.propertyId?.checkinTime || 11);

  //   // Convert check-in date to IST with checkin time applied
  //   const checkinIST = moment
  //     .tz(checkinDate, "Asia/Kolkata")
  //     .hour(checkinTime)
  //     .minute(0)
  //     .second(0);

  //   // Current time in IST
  //   const nowIST = moment().tz("Asia/Kolkata");

  //   // Find difference in hours
  //   const diffHours = checkinIST.diff(nowIST, "hours");

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("🔎 DEBUG FLEXIBLE CHECK");
  // }
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Original CheckIn:", checkinDate);
  // }
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("CheckIn IST:", checkinIST.format());
  // }
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Checkin Time (24hr):", checkinTime);
  // }
  //   process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
  //   console.log("Diff in Hours:", diffHours);
  // }

  //   // If exactly 24 hours → return 1 day

  //   return diffHours;
  // }

  function canCancelModerate(booking: Booking): boolean {
    // checkin date + time converted to IST
    const checkinIST = moment
      .tz(booking.checkIn, "Asia/Kolkata")
      .hour(Number(booking?.propertyId?.checkinTime || 11))
      .minute(0)
      .second(0);

    const nowIST = moment().tz("Asia/Kolkata");
    const diffHours = checkinIST.diff(nowIST, "hours");
    const diffDays = diffHours / 24;
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("days", diffDays);
    }
    return diffDays >= 7;
  }

  function canCancelFlexible(booking: Booking): boolean {
    const checkinIST = moment
      .tz(booking.checkIn, "Asia/Kolkata")
      .hour(Number(booking?.propertyId?.checkinTime || 11))
      .minute(0)
      .second(0);

    const nowIST = moment().tz("Asia/Kolkata");
    const diffHours = checkinIST.diff(nowIST, "hours");
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("hours", diffHours);
    }
    return diffHours >= 24;
  }
  function canShowCancelButton(booking: Booking): boolean {
    if (booking?.status !== "confirmed" && booking?.status !== "pending")
      return false;

    if (!booking?.checkIn) return false;

    if (booking?.cancellationPolicy?.toLowerCase() === "flexible") {
      return canCancelFlexible(booking);
    }
    if (booking?.cancellationPolicy?.toLowerCase() === "moderate") {
      return canCancelModerate(booking);
    }
    return false; // default → no cancellation
  }

  // The published terms (cancellation-policy page, invoice), in the guest's
  // words. The server decides the refund; the result toast reports it.
  function cancellationTerms(booking: Booking): string | null {
    if (booking?.paymentStatus !== "paid") return null;
    const policy = booking?.cancellationPolicy?.toLowerCase();
    if (policy === "flexible")
      return "This stay has a flexible policy: cancelling at least 24 hours before check-in gets you a full refund of " + formatINR(booking.price) + " to your original payment method.";
    if (policy === "moderate")
      return "This stay has a moderate policy: cancelling at least 7 days before check-in gets you a full refund of " + formatINR(booking.price) + " to your original payment method.";
    return null;
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
          status,
        )}`}
      >
        {status === "processing"
          ? "Pending"
          : status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };
  // Stay dates are UTC-midnight instants; show the calendar day as booked.
  // Invalid/missing dates render "—" instead of throwing RangeError.
  const stayDate = (value: unknown) =>
    formatDate(
      value,
      { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
      "—",
      "en-US",
    );

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("Invoice Data", invoiceData, payment);
  }
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
            {/* one swipeable row on phones (it used to wrap "Rejected" onto a second line) */}
            <TabsList className="h-auto min-h-0 p-0 rounded-none bg-transparent border-b border-gray-200 w-full lg:w-auto flex flex-nowrap justify-start overflow-x-auto no-scrollbar">
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
                  className="relative h-9 shrink-0 rounded-none border-b-2 border-transparent px-2 sm:px-4 pb-3 pt-2 text-sm sm:text-base font-semibold text-muted-foreground data-[state=active]:border-primaryGreen data-[state=active]:text-primaryGreen data-[state=active]:shadow-none data-[state=active]:bg-transparent"
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
          <div className="hidden lg:grid grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1.4fr)] gap-4 px-4 py-2 bg-muted text-sm font-medium">
            <div>Property</div>
            <div>Date</div>
            <div>Status</div>
            <div>Price</div>
            <div></div>
          </div>

          {filteredBookings.length === 0 ? (
            <div
              role="status"
              className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center animate-in fade-in-0 duration-300 motion-reduce:animate-none"
            >
              <CalendarX2 className="h-10 w-10 text-gray-400" aria-hidden="true" />
              <h2 className="mt-3 font-bricolage text-lg font-semibold text-absoluteDark">
                {bookings.length === 0 ? "No bookings yet" : "No bookings match"}
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {bookings.length === 0
                  ? "When you book a stay, it shows up here with its invoice and details."
                  : "Try another tab or clear the filters."}
              </p>
              {bookings.length === 0 ? (
                <Link
                  href="/stays"
                  className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-primaryGreen px-6 text-sm font-medium text-white transition hover:bg-brightGreen active:scale-95 motion-reduce:active:scale-100"
                >
                  Explore stays
                </Link>
              ) : null}
            </div>
          ) : null}
          {filteredBookings.map((booking, index) => {
            const summaryParams = new URLSearchParams({
              hostFirstName: booking?.hostId?.firstName ?? "",
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
              <Card
                key={booking?._id}
                className="p-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
                style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1.4fr)] gap-4">
                  <div className="flex min-w-0 flex-col lg:flex-row gap-4">
                    <MediaImage
                      alt={booking?.propertyId?.title || "Stay photo"}
                      className="rounded-lg object-cover w-full h-48 lg:w-24 lg:h-24 shrink-0 bg-gray-100"
                      height={96}
                      src={booking?.propertyId?.photos?.[0] || PHOTO_PLACEHOLDER}
                      unoptimized={!booking?.propertyId?.photos?.[0]}
                      width={96}
                      sizes="(max-width: 1023px) 100vw, 96px"
                    />
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-medium text-absoluteDark line-clamp-2 break-words" title={booking?.propertyId?.title}>
                        {booking?.propertyId?.title || "Stay"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {[booking?.propertyId?.address?.city, booking?.propertyId?.address?.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                      <Link
                        href={`/booking-summary?${summaryParams.toString()}`}
                        className="inline-flex min-h-[44px] lg:min-h-[24px] items-center gap-1 rounded-sm text-sm font-medium text-primaryGreen underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryGreen"
                      >
                        View details
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-1 lg:gap-2">
                    <div>
                      <dt className="text-muted-foreground">Check in</dt>
                      <dd>{stayDate(booking?.checkIn)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Check out</dt>
                      <dd>{stayDate(booking?.checkOut)}</dd>
                    </div>
                  </dl>

                  <div>
                    <StatusPill status={booking?.status} />
                  </div>

                  <div>
                    <div className="font-medium tabular-nums">
                      {formatINR(booking?.price)}
                    </div>
                    {booking?.paymentStatus === "refunded" ? (
                      <div className="mt-0.5 text-sm text-green-700 tabular-nums">
                        Refunded{" "}
                        {booking?.refundAmount != null ? formatINR(booking.refundAmount) : ""}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    <Button
                      size="sm"
                      className="min-h-[44px] px-4 bg-primaryGreen text-white hover:bg-brightGreen lg:min-h-[32px]"
                      onClick={() => {
                        setShowInvoice(true);
                        getPayment(booking?._id);
                        setInvoiceData(booking);
                      }}
                    >
                      Invoice
                    </Button>
                    {booking?.status == "confirmed" &&
                    booking?.reviewed == false &&
                    canShowReview(booking) ? (
                      <Button
                        size="sm"
                        className="min-h-[44px] px-4 bg-primaryGreen text-white hover:bg-brightGreen lg:min-h-[32px]"
                        onClick={() => {
                          router.push(
                            `/rating?booking=${
                              booking._id
                            }&${summaryParams.toString()}&active=${true}`,
                          );
                          setShowDialog(true);
                        }}
                      >
                        Review Now
                      </Button>
                    ) : null}
                    {canShowCancelButton(booking) && (
                      <>
                        {/* Destructive: red outline, never the same green as
                            the safe actions next to it. */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-4 border-red-600 text-red-700 hover:bg-red-50 hover:text-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 lg:min-h-[32px]"
                          onClick={() => {
                            setBookingToCancel(booking); // store selected booking
                            setCancelDialogOpen(true); // open the dialog
                          }}
                        >
                          Cancel booking
                        </Button>
                        {/* One dialog for the selected card only: rendering it
                            inside every card stacked N identical open dialogs. */}
                        {bookingToCancel && bookingToCancel._id === booking._id && (
                          <ConfirmCancelDialog
                            choice={"Cancel"}
                            tone="danger"
                            title="Cancel this booking?"
                            description={
                              <div className="space-y-2">
                                <p>
                                  <span className="font-medium text-absoluteDark">
                                    {booking?.propertyId?.title || "This stay"}
                                  </span>
                                  {" · "}
                                  {stayDate(booking?.checkIn)} – {stayDate(booking?.checkOut)}
                                </p>
                                {cancellationTerms(booking) ? <p>{cancellationTerms(booking)}</p> : null}
                                <p>
                                  This can&apos;t be undone.{" "}
                                  <Link
                                    href="/cancellation-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primaryGreen underline underline-offset-2"
                                  >
                                    Cancellation policy
                                    <span className="sr-only"> (opens in a new tab)</span>
                                  </Link>
                                </p>
                              </div>
                            }
                            confirmLabel="Yes, cancel booking"
                            cancelLabel="Keep booking"
                            pending={cancelling}
                            pendingLabel="Cancelling…"
                            open={cancelDialogOpen}
                            onClose={() => {
                              if (cancelling) return;
                              setCancelDialogOpen(false);
                              setBookingToCancel(null);
                            }}
                            onConfirm={async () => {
                              if (!bookingToCancel || cancelling) return;
                              setCancelling(true);
                              try {
                                await cancelBooking(bookingToCancel);
                              } finally {
                                setCancelling(false);
                                setCancelDialogOpen(false);
                                setBookingToCancel(null);
                              }
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {showInvoice && (
            <Portal>
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                {/* <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-3000 p-4"> */}
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
                    className="flex-1 overflow-y-auto px-6 py-4 z-3001"
                  >
                    <Invoice payment={payment} invoiceData={invoiceData} />
                  </div>

                  {/* Footer (fixed bottom) */}
                  <div className="sticky  rounded-b-2xl  bottom-0 bg-gray-50 border-t flex justify-end px-4 py-3 z-10">
                    <Button onClick={() => downloadPdf()}>Download PDF</Button>
                  </div>
                </div>
              </div>
            </Portal>
          )}
        </div>
      </div>
    </main>
  );
};

export default ManageBookings;
