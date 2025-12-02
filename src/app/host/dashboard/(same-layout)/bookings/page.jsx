"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ConfirmationModal from "@/components/dialog-modal"; // adjust path as needed
import InvoicePage from "@/components/invoice";
import { cn } from "@/lib/utils";
import { addDays, format, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Invoice from "../../../../../components/invoice";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Mock data for reservations
const reservations = [];

export default function ReservationsPage() {
  const [date, setDate] = useState({
    from: addMonths(new Date(), -1),
    to: new Date(),
  });
  const printRef = useRef(null);
  const [invoiceData, setInvoiceData] = useState();
  const [showInvoice, setShowInvoice] = useState(false);
  const [payment, setPayment] = useState();

  console.log("cl", payment);
  const handleDateRangeChange = (range) => {
    const today = new Date();
    switch (range) {
      case "1d":
        setDate({ from: today, to: addDays(today, 1) });
        break;
      case "1w":
        setDate({ from: today, to: addDays(today, 7) });
        break;
      case "1m":
        setDate({ from: today, to: addDays(today, 30) });
        break;
      case "3m":
        setDate({ from: subMonths(today, 3), to: today });
        break;
      case "6m":
        setDate({ from: subMonths(today, 6), to: today });
        break;
      default:
        break;
    }
  };
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
  const router = useRouter();
  const [bookings, setBookings] = useState();
  const [localState, setLocalState] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("all");
  const getDate = (item) => {
    const month = new Date(item).getMonth();
    const year = new Date(item).getFullYear();
    const day = new Date(item).getDate();
    const newDate = new Date(Date.UTC(year, month, day));
    return newDate.toISOString();
  };
  const fetchData = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    const hostData = await localStorage.getItem("userId");
    const hostId = JSON.parse(hostData);
    const from = date.from ? date.from.toLocaleDateString() : null;
    const to = date.to ? date.to.toLocaleDateString() : null;
    console.log(from, to);
    if (data) {
      try {
        const response = await fetch(
          `${API_URL}/booking/analytics-filter?search=${searchValue}&status=${status}&from=${from}&to=${to}&hostId=${hostId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 401) {
          // Token expired or missing
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          router.push("/"); // redirect to login
          return;
        }
        const result = await response.json();
        console.log(result);
        const final = await result.data;
        setBookings(final);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const getPayment = async (bookingId) => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
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

  useEffect(() => {
    fetchData();
  }, [searchValue, status, date]);

  const sendConfirmationToUser = async (
    bookingId,
    userEmail,
    hostEmail,
    userName,
    hostName
  ) => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);

      if (data) {
        const response = await fetch(`${API_URL}/booking/host/confirm`, {
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
          toast.error("Failed to send approval email");
          return;
        }
        toast.success("Successfully send the approval email");
        fetchData();
        return response;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendRejectionToUser = async (
    bookingId,
    userEmail,
    hostEmail,
    userName,
    hostName
  ) => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);

      if (data) {
        const response = await fetch(`${API_URL}/booking/host/cancel`, {
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
          toast.error("Failed to send rejection email");
          return;
        }
        toast.success("Successfully send the rejection email");
        fetchData();
        return response;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const sendCancelToUser = async (
    bookingId,
    userEmail,
    hostEmail,
    userName,
    hostName
  ) => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      console.log("term", bookingId, userEmail, hostEmail, userName, hostName);
      if (data) {
        const response = await fetch(`${API_URL}/booking/host/terminate`, {
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
          toast.error("Failed to send cancellation email");
          return;
        }
        toast.success("Successfully send the cancellation email");
        fetchData();
        return response;
      }
    } catch (err) {
      console.error(err);
    }
  };
  const openModal = (action, booking) => {
    setModalAction(action);
    setSelectedBooking(booking);

    setTimeout(() => setModalOpen(true), 50);
  };

  const handleModalConfirm = () => {
    const booking = selectedBooking;
    const { _id, userId, hostId } = booking;

    const params = [
      _id,
      userId?.email,
      hostId?.email,
      userId?.firstName + " " + userId?.lastName,
      hostId?.firstName + " " + hostId?.lastName,
    ];

    if (modalAction === "accept") sendConfirmationToUser(...params);
    if (modalAction === "reject") sendRejectionToUser(...params);
    if (modalAction === "cancel") sendCancelToUser(...params);

    setModalOpen(false);
  };
  function checkLength(value) {
    if (value?.length > 15) {
      return value.substring(0, 15) + "…";
    }
    return value;
  }
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function canShowReview(booking) {
    if (!booking?.checkOut || !booking?.propertyId?.checkoutTime) return false;

    const checkoutDate = new Date(booking?.checkOut);
    const today = new Date();

    const differenceInDays = (today - checkoutDate) / (1000 * 60 * 60 * 24);

    if (today > checkoutDate && differenceInDays <= 14) {
      const isSameDay = today.toDateString() === checkoutDate.toDateString();
      if (!isSameDay) {
        return true;
      } else {
        const checkoutWithTime = new Date(checkoutDate);
        checkoutWithTime.setHours(booking?.propertyId?.checkoutTime, 0, 0, 0);

        const fiveHoursLater = new Date(
          checkoutWithTime.getTime() + 5 * 60 * 60 * 1000
        );

        if (today >= fiveHoursLater) {
          return true;
        }
      }
    }
    // console.log("dta", today.toDateString(), checkoutDate.toDateString());

    // const isSameDay = today.toDateString() === checkoutDate.toDateString();

    // if (isSameDay) {
    //   const checkoutWithTime = new Date(checkoutDate);
    //   checkoutWithTime.setHours(booking?.propertyId?.checkoutTime, 0, 0, 0);

    //   const fiveHoursLater = new Date(
    //     checkoutWithTime.getTime() + 5 * 60 * 60 * 1000
    //   );

    //   if (today >= fiveHoursLater) {
    //     return true;
    //   }
    // }

    return false;
  }
  console.log("dddddddd", payment);
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold font-bricolage text-absoluteDark">
          Bookings
        </h1>
        {showInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Outer container — center modal */}
            <div className="bg-white w-full rounded-2xl max-w-2xl max-h-[90vh] flex flex-col relative">
              {/* Header (fixed top) */}
              <div className="sticky rounded-t-2xl top-0 bg-white  border-b flex justify-between items-center px-4 py-3 z-10">
                <h2 className="text-lg font-semibold text-gray-800">Invoice</h2>
                <button
                  onClick={() => {
                    setShowInvoice(false);
                    setInvoiceData();
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
              <div ref={printRef} className="flex-1 overflow-y-auto px-6 py-4">
                <Invoice payment={payment} invoiceData={invoiceData} />
              </div>

              {/* Footer (fixed bottom) */}
              <div className="sticky  rounded-b-2xl  bottom-0 bg-gray-50 border-t flex justify-end px-4 py-3 z-10">
                <Button onClick={() => downloadPdf()}>Download PDF</Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleModalConfirm}
          title={`Are you sure you want to ${
            modalAction === "accept"
              ? "accept"
              : modalAction === "reject"
              ? "reject"
              : "cancel"
          } this reservation?`}
          choice={
            modalAction === "accept"
              ? "Accept"
              : modalAction === "reject"
              ? "Reject"
              : "cancel"
          }
        />
        <div className="flex items-center space-x-4">
          <Select className="bg-white" onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="1w">Next 7 days</SelectItem>
              <SelectItem value="1m">Next 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search reservations
          </Label>
          <Input
            id="search"
            className="bg-white"
            placeholder="Search by guest name or property..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" selected>
              All Status
            </SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="pl-2 text-gray-500 text-xs font-medium-500">
        <>Note: If booking isn't visible try changing date from calendar</>
      </div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Guest Name</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            {/* <TableHead>Guests</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings?.map((booking) => (
            <TableRow key={booking?._id}>
              <TableCell>
                <span
                  title={
                    booking?.userId?.firstName + " " + booking?.userId?.lastName
                  }
                >
                  {checkLength(
                    booking?.userId?.firstName + " " + booking?.userId?.lastName
                  )}
                </span>
              </TableCell>
              <TableCell>
                <span title={booking?.propertyId?.title}>
                  {checkLength(booking?.propertyId?.title)}
                </span>
              </TableCell>
              <TableCell>
                {new Date(booking?.checkIn).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                {new Date(booking?.checkOut).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    booking.status === "pending"
                      ? "outline"
                      : booking.status === "confirmed"
                      ? "default"
                      : booking.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {booking?.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(
                          `/host/dashboard/booking-details?booking=${booking?._id}`
                        );
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setShowInvoice(true);
                        getPayment(booking._id);
                        setInvoiceData(booking);
                      }}
                    >
                      Invoice
                    </DropdownMenuItem>
                    {booking?.propertyId?.bookingType?.manual ? (
                      booking?.status != "confirmed" &&
                      booking?.status != "cancelled" &&
                      booking?.status != "rejected" ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              openModal("accept", booking);
                              // sendConfirmationToUser(
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
                            Accept Reservation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              openModal("reject", booking);
                              // sendRejectionToUser(
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
                            Reject Reservation
                          </DropdownMenuItem>
                        </>
                      ) : booking?.status == "confirmed" &&
                        booking?.status != "rejected" ? (
                        <>
                          {!booking?.hostReviewed ? (
                            canShowReview(booking) ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/host/dashboard/bookings/review-guest?booking=${booking?._id}`
                                  )
                                }
                              >
                                Review
                              </DropdownMenuItem>
                            ) : null
                          ) : null}
                          {new Date().setHours(0, 0, 0, 0) <
                          new Date(booking?.checkIn).setHours(0, 0, 0, 0) ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                openModal("cancel", booking);
                                // sendCancelToUser(
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
                              Cancel Reservation
                            </DropdownMenuItem>
                          ) : null}
                        </>
                      ) : null
                    ) : booking?.propertyId?.bookingType?.instantBook &&
                      booking?.status == "confirmed" ? (
                      <>
                        {canShowReview(booking) ? (
                          <DropdownMenuItem>Review</DropdownMenuItem>
                        ) : null}
                        {new Date().setHours(0, 0, 0, 0) <
                        new Date(booking?.checkIn).setHours(0, 0, 0, 0) ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              openModal("cancel", booking);
                              // sendCancelToUser(
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
                            Cancel Reservation
                          </DropdownMenuItem>
                        ) : null}
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
