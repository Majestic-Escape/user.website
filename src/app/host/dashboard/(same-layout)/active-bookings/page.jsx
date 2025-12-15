"use client";

import React, { useEffect, useState } from "react";
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

import { cn } from "@/lib/utils";
import { addDays, format, subMonths } from "date-fns";
import { Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Mock data for reservations
const reservations = [];

export default function ReservationsPage() {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

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

    const from = getDate(date.from);
    const to = getDate(date.to);
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log(from, to);
    }
    if (data) {
      try {
        const response = await fetch(
          `${API_URL}/booking/filter-active-bookings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log(result);
        }
        const final = await result.data;
        setBookings(final);
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
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log(bookings);
  }
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold font-bricolage text-absoluteDark">
          Bookings
        </h1>
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

        {/* <div className="flex items-center space-x-4">
          <Select className="bg-white" onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>

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
        </div> */}
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
        {/* <Select value={status} onValueChange={setStatus}>
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
          </SelectContent>
        </Select> */}
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
                      ) : null
                    ) : booking?.propertyId?.bookingType?.instantBook &&
                      booking?.status == "confirmed" ? (
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
