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
import ConfirmCancelDialog from "@/components/dialog-modal";
import { cn } from "@/lib/utils";
import { addDays, format, subMonths } from "date-fns";
import { Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
setDate({ from: today, to: today });
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
const [bookings, setBookings] = useState();
const [localState, setLocalState] = useState();
const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
const [bookingToCancel, setBookingToCancel] = useState(null);
const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
const [bookingToAccept, setBookingToAccept] = useState(null);
const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
const [bookingToReject, setBookingToReject] = useState(null);
const fetchData = async () => {
const getLocalData = await localStorage.getItem("token");
const data = JSON.parse(getLocalData);
process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
console.log(data);
}
if (data) {
try {
const response = await fetch(`${API_URL}/booking/`, {
method: "GET",
headers: {
Authorization: `Bearer ${data}`,
"Content-Type": "application/json",
},
});
const result = await response.json();
process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
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
}, []);

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

process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {
console.log(bookings);
}
return (

<div className=" space-y-6">
<div className="flex justify-between items-center flex-wrap gap-4">
<h1 className="text-2xl font-semibold font-bricolage text-absoluteDark">
Bookings
</h1>

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
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
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
                {booking?.userId?.firstName} {booking?.userId?.lastName}
              </TableCell>
              <TableCell>{booking?.propertyId?.title}</TableCell>
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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    {booking?.propertyId?.bookingType?.manual ? (
                      booking?.status != "confirmed" &&
                      booking?.status != "cancelled" &&
                      booking?.status != "rejected" ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setBookingToAccept(booking); // store selected booking
                              setAcceptDialogOpen(true); // open the dialog
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
                          {bookingToAccept && (
                            <ConfirmCancelDialog
                              open={acceptDialogOpen}
                              onClose={() => {
                                setAcceptDialogOpen(false);
                                setBookingToAccept(null);
                              }}
                              onConfirm={async () => {
                                await sendConfirmationToUser(
                                  bookingToAccept._id,
                                  bookingToAccept.userId.email,
                                  bookingToAccept.hostId.email,
                                  `${bookingToAccept.userId.firstName} ${bookingToAccept.userId.lastName}`,
                                  `${bookingToAccept.hostId.firstName} ${bookingToAccept.hostId.lastName}`
                                );
                                setAcceptDialogOpen(false);
                                setBookingToAccept(null);
                              }}
                            />
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setBookingToReject(booking); // store selected booking
                              setRejectDialogOpen(true); // open the dialog
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
                          {bookingToReject && (
                            <ConfirmCancelDialog
                              open={rejectDialogOpen}
                              onClose={() => {
                                setRejectDialogOpen(false);
                                setBookingToReject(null);
                              }}
                              onConfirm={async () => {
                                await sendRejectionToUser(
                                  bookingToReject._id,
                                  bookingToReject.userId.email,
                                  bookingToReject.hostId.email,
                                  `${bookingToReject.userId.firstName} ${bookingToReject.userId.lastName}`,
                                  `${bookingToReject.hostId.firstName} ${bookingToReject.hostId.lastName}`
                                );
                                setRejectDialogOpen(false);
                                setBookingToReject(null);
                              }}
                            />
                          )}
                        </>
                      ) : booking?.status == "confirmed" &&
                        booking?.status != "rejected" ? (
                        <>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setBookingToCancel(booking); // store selected booking
                              setCancelDialogOpen(true); // open the dialog
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
                          {bookingToCancel && (
                            <ConfirmCancelDialog
                              open={cancelDialogOpen}
                              onClose={() => {
                                setCancelDialogOpen(false);
                                setBookingToCancel(null);
                              }}
                              onConfirm={async () => {
                                await sendCancelToUser(
                                  bookingToCancel._id,
                                  bookingToCancel.userId.email,
                                  bookingToCancel.hostId.email,
                                  `${bookingToCancel.userId.firstName} ${bookingToCancel.userId.lastName}`,
                                  `${bookingToCancel.hostId.firstName} ${bookingToCancel.hostId.lastName}`
                                );
                                setCancelDialogOpen(false);
                                setBookingToCancel(null);
                              }}
                            />
                          )}
                        </>
                      ) : null
                    ) : booking?.propertyId?.bookingType?.instantBook &&
                      booking?.status == "confirmed" ? (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          sendCancelToUser(
                            booking?._id,
                            booking?.userId?.email,
                            booking?.hostId?.email,
                            booking?.userId?.firstName +
                              " " +
                              booking?.userId?.lastName,
                            booking?.hostId?.firstName +
                              " " +
                              booking?.hostId?.lastName
                          );
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
