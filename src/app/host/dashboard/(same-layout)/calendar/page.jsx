"use client";

import { useEffect, useState } from "react";
import {
  addMonths,
  format,
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
} from "date-fns";

import axios from "axios";
import { ChevronLeft, ChevronRight, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import ConfirmCancelDialog from "@/components/dialog-modal";
import moment from "moment-timezone";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FullCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  const [blockReason, setBlockReason] = useState("");
  const [syncPlatform, setSyncPlatform] = useState("");
  const [iCalUrl, setICalUrl] = useState("");
  const [offers, setOffers] = useState([]);
  const [hostBlock, setHostBlock] = useState([]);
  const [pricing, setPricing] = useState({});
  const [reservedDates, setReservedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [allowBlock, setAllowBlock] = useState(true);
  const [exportUrl, setExportUrl] = useState("");
  const [tab, setTab] = useState("block");
  const arr = [];
  const handlePrevMonth = () => {
    if (currentDate > new Date()) {
      setCurrentDate(addMonths(currentDate, -1));
    }
  };
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("nik", unavailableDates, hostBlock);
  }

  const toIST = (date) => {
    return moment(date).tz("Asia/Kolkata").startOf("day");
  };
  useEffect(() => {
    setSyncPlatform("ical");
  }, []);
  const todayIST = () => {
    return moment().tz("Asia/Kolkata").startOf("day");
  };
  async function fetchDates() {
    try {
      const response = await axios.get(
        `${API_URL}/booking/blocked-dates/${propertyId}`
      );

      if (response.status != 200) {
        throw new Error(
          `Failed to fetch host data (status: ${response.status})`
        );
      }

      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("aaaa", response.data.data, response.data.blocked);
      }
      setUnavailableDates(response.data.data);
      setHostBlock(response.data.blocked);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchDates();
  }, [propertyId]);
  const createSecret = async () => {
    try {
      const kind = "export";
      const res = await axios.post(`${API_URL}/calendarSync/saveCalendar`, {
        propertyId,
        kind,
      });

      // ✅ Axios automatically throws on error, so no need for res.ok
      const final = res.data;
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("sss", final);
      }

      if (final.success) {
        setExportUrl(final.url);
      } else {
        console.error("API error:", final.message);
      }
    } catch (error) {
      console.error("Request failed:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    let didRun = false;
    if (propertyId && !didRun) {
      didRun = true;
      createSecret();
    }
  }, [propertyId]);
  const saveBlockedDates = async (
    propertyId,

    checkin,
    checkout
  ) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const newCheckin = checkout
        ? addDays(new Date(checkin), 1)
        : addDays(new Date(checkin), 1);

      const newCheckout = checkout
        ? addDays(new Date(checkout), 2)
        : addDays(new Date(checkin), 2);

      const response = await fetch(`${API_URL}/booking/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          userId: userId,
          action: "host",
          guests: 1,
          adults: 1,
          children: 0,
          infants: 0,
          propertyId: propertyId,
          hostId: userId,
          status: "confirmed",
          paymentStatus: "paid",
          checkIn: newCheckin,
          subTotal: 0,
          checkOut: newCheckout,
          price: 0,
          currency: "INR",
          guestData: {
            adults: [{ name: "host", age: 18 }],
            children: [],
          },
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        toast.error(result.message);
        return;
      }
      const result = await response.json();
      await fetchDates();
      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const unblockDates = async (selectedDate) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);

      const response = await fetch(
        `${API_URL}/booking/unblock-dates/${propertyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data}`,
          },
          body: JSON.stringify({
            selectedDate: moment(selectedDate)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD"),
            userId: userId,
          }),
        }
      );
      if (!response.ok) {
        return;
      }
      toast.success("You have successfully unblocked date");
      await fetchDates();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateClick = (date) => {
    const clickedIST = toIST(date);

    // FORMAT as YYYY-MM-DD using IST
    const clickedDateString = clickedIST.format("YYYY-MM-DD");

    if (unavailableDates.includes(clickedDateString)) {
      toast.error("Date already reserved.");
      return;
    }

    if (arr.includes(clickedDateString)) {
      toast.error("Past date cannot be reserved.");
      return;
    }

    if (hostBlock.includes(clickedDateString)) {
      setSelectedDate(date);
      setConfirmDialogOpen(true);
      return;
    }

    setSelectedDate(date);
    setDateRange({ from: date, to: null });
    setIsDialogOpen(true);
  };

  const handleBlockDates = () => {
    if (dateRange.from && dateRange.to) {
      const dates = eachDayOfInterval({
        start: dateRange.from,
        end: addDays(dateRange.to, -2),
      });

      setBlockedDates((prev) => [...prev, ...dates]);
      saveBlockedDates(propertyId, dateRange.from, dateRange.to);
    } else if (dateRange.from) {
      setBlockedDates((prev) => [...prev, dateRange.from]);
      saveBlockedDates(propertyId, dateRange.from, dateRange.to);
    }
    setIsDialogOpen(false);
    setBlockReason("");
  };

  const handleReserveDates = () => {
    if (dateRange.from && dateRange.to) {
      const dates = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      });

      setReservedDates([...reservedDates, ...dates]);
    } else if (dateRange.from) {
      setReservedDates([...reservedDates, dateRange.from]);
    }
    setIsDialogOpen(false);
  };

  const syncWithUrl = async (kind) => {
    const url = iCalUrl;

    try {
      const res = await axios.post(`${API_URL}/calendarSync/saveCalendar`, {
        propertyId,
        url,
        kind,
      });
      if (!res.data.success) {
        toast.error(
          res.data.message ||
            "Calendar sync has started. Please wait a few minutes and refresh the page."
        );
        return;
      }

      toast.success(
        res.data.message ||
          "Calendar sync has started. Please wait a few minutes and refresh the page."
      );
    } catch (error) {
      console.error(error);
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Calendar sync failed due to network issue.");
        return;
      }

      // OTHER FAILURES
      toast.error("Failed to sync calendar, try again.");
    }
  };

  const handleSyncCalendar = (kind) => {
    // if (syncPlatform === "google") {
    // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

    // // Implement Google Calendar sync logic here
    // } else
    if (syncPlatform === "ical") {
      syncWithUrl(kind);

      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log("Syncing with iCal URL:", iCalUrl);
      }
      // Implement iCal sync logic here
    }
  };

  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("what th", arr);
  }
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const startDayIndex = monthStart.getDay();
    const emptyDays = Array.from({ length: startDayIndex });
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("supss", currentDate, monthStart);
    }
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}

        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {monthDays.map((day) => {
          const isReserved = unavailableDates.some((date) =>
            isSameDay(date.toString(), day)
          );
          const isBlocked = hostBlock.some((date) => isSameDay(date, day));
          const dayPrice = pricing[format(day, "yyyy-MM-dd")] || "";
          const today = todayIST();
          const isUnable = toIST(day).isBefore(today);

          if (new Date().getMonth() == new Date(day).getMonth()) {
            if (day > monthStart && day < currentDate) {
              arr.push(day.toISOString().split("T")[0]);
            }
          }
          return (
            <Button
              key={day.toString()}
              variant="outline"
              className={`h-16 relative ${
                !isSameMonth(day, currentDate) ? "opacity-50" : ""
              } ${
                isReserved
                  ? "!bg-green-500 hover:!bg-green-600 !text-white"
                  : ""
              } ${
                isBlocked ? "!bg-red-400 hover:!bg-red-500 !text-white" : ""
              } ${
                isUnable ? "!bg-gray-200 hover:!bg-gray-500 !text-black" : ""
              }`}
              onClick={() => handleDateClick(day)}
            >
              <span className="absolute top-1 left-1 text-sm font-semibold">
                {format(day, "d")}
              </span>
              <span className="absolute bottom-1 right-1 text-xs font-medium">
                ${dayPrice}
              </span>
              {isReserved && (
                <span className="absolute bottom-1 left-1 text-xs font-medium">
                  Reserved
                </span>
              )}
              {isBlocked && (
                <span className="absolute bottom-1 left-1 text-xs font-medium">
                  Blocked
                </span>
              )}
            </Button>
          );
        })}
      </div>
    );
  };

  const handleAddOffer = (offer) => {
    setOffers([...offers, offer]);
  };

  const handleRemoveOffer = (offerId) => {
    setOffers(offers.filter((offer) => offer.id !== offerId));
  };

  const handleSetPricing = (date, price) => {
    setPricing({ ...pricing, [format(date, "yyyy-MM-dd")]: price });
  };

  const handleDialogSubmit = () => {
    const selectedTab = tab;

    if (selectedTab === "block") {
      // const dateDays = eachDayOfInterval({
      //   start: dateRange.from,
      //   end: dateRange.to,
      // });
      // process.env.ENV === 'dev' && if (process.env.NEXT_PUBLIC_ENV === "dev") {

      // let hasOverlap = false; // use local variable

      // for (let i = 1; i < dateDays.length; i++) {
      //   const dateStr = dateDays[i].toISOString().split("T")[0];

      //   if (hostBlock.includes(dateStr) || unavailableDates.includes(dateStr)) {
      //     toast.error("Selected dates overlap with existing reserved date");
      //     hasOverlap = true;
      //     break;
      //   }
      // }

      // if (!hasOverlap) {

      const dateDays = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      });
      const formatRevDate = (date) => {
        return date ? format(date, "yyyy-MM-dd") : "";
      };
      // Convert selected range to "yyyy-mm-dd"
      const selectedRange = dateDays.map((d) => formatRevDate(d));

      // Check overlap with existing reserved or host-blocked dates
      const hasOverlap = selectedRange.some((d) =>
        unavailableDates.includes(d)
      );

      console.log(
        "what is this",
        selectedRange,
        unavailableDates,
        dateRange.from,
        dateRange.to
      );
      if (hasOverlap) {
        toast.error(
          "Selected dates overlap with existing reserved/blocked dates."
        );
        return; // ❌ Stop processing
      }
      handleBlockDates();
      // }
    } else if (selectedTab === "reserve") {
      handleReserveDates();
    } else if (selectedTab === "offer") {
      const offerName = document.getElementById("offerName").value;
      const offerDiscount = document.getElementById("offerDiscount").value;
      handleAddOffer({
        id: Date.now(),
        name: offerName,
        discount: offerDiscount,
      });
    } else if (selectedTab === "pricing") {
      const price = document.getElementById("price").value;
      if (dateRange.from && dateRange.to) {
        const dates = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        });
        dates.forEach((date) => handleSetPricing(date, price));
      } else if (dateRange.from) {
        handleSetPricing(dateRange.from, price);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <ConfirmCancelDialog
        choice={"Unblock"}
        open={confirmDialogOpen}
        onConfirm={() => {
          unblockDates(
            moment(selectedDate).tz("Asia/Kolkata").format("YYYY-MM-DD")
          );
          setConfirmDialogOpen(false);
        }}
        onClose={() => {
          setConfirmDialogOpen(false);
          setBookingToCancel(null);
        }}
      />
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
          <div>
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="ml-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderCalendar()}</CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>
              <span className="text-sm font-medium">Reserved</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-red-400 mr-2"></span>
              <span className="text-sm font-medium">Blocked</span>
            </div>
          </div>
          <Button onClick={() => setCurrentDate(new Date())}>Today</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Calendar</TabsTrigger>
              <TabsTrigger value="export">Export Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="import">
              <div className="space-y-4">
                <Select value={syncPlatform} onValueChange={setSyncPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform to sync from" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="google">Google Calendar</SelectItem> */}
                    <SelectItem value="ical">iCal URL</SelectItem>
                  </SelectContent>
                </Select>
                {syncPlatform === "ical" && (
                  <Input
                    placeholder="Enter iCal URL"
                    value={iCalUrl}
                    onChange={(e) => setICalUrl(e.target.value)}
                  />
                )}
                <Button
                  className="bg-primaryGreen hover:bg-brightGreen"
                  onClick={() => handleSyncCalendar("import")}
                  disabled={
                    !syncPlatform || (syncPlatform === "ical" && !iCalUrl)
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Calendar
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="export">
              <div className="space-y-4">
                <p>Export your calendar to use on other platforms:</p>
                <Button
                  onClick={() => {
                    if (!exportUrl) {
                      toast.error("No export link available");
                      return;
                    }
                    window.open(exportUrl, "_blank"); // open in new tab / downloads
                  }}
                  className="bg-primaryGreen hover:bg-brightGreen"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download iCal
                </Button>
                {exportUrl && (
                  <div className="text-sm mt-2">
                    <p className="font-medium">
                      Copy this link into Airbnb/Google Calendar:
                    </p>
                    <code className="block p-2 bg-gray-100 rounded break-all">
                      {exportUrl}
                    </code>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Offers</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <p>No current offers</p>
          ) : (
            <ul>
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>
                    {offer.name} - {offer.discount}% off
                  </span>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveOffer(offer.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Date</DialogTitle>
            <DialogDescription>
              Block, reserve dates, add offers, or set pricing for the selected
              date range.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              disabled={[
                { before: new Date() }, // disable past dates
                ...unavailableDates.map((d) => new Date(d)), // disable specific unavailable dates
                ...hostBlock.map((d) => new Date(d)),
              ]}
              className="rounded-md border"
            />
            <Tabs defaultValue="block" onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="block">Block</TabsTrigger>
                {/* <TabsTrigger value="reserve">Reserve</TabsTrigger> */}
                {/* <TabsTrigger value="offer">Offer</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger> */}
              </TabsList>
              <TabsContent value="block">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Input
                    id="reason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </TabsContent>
              <TabsContent value="reserve">
                <p>Click submit to reserve the selected date range.</p>
              </TabsContent>
              {/* <TabsContent value="offer">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="offerName" className="text-right">
                    Offer Name
                  </Label>
                  <Input id="offerName" className="col-span-3" />
                  <Label htmlFor="offerDiscount" className="text-right">
                    Discount %
                  </Label>
                  <Input
                    id="offerDiscount"
                    type="number"
                    className="col-span-3"
                  />
                </div>
              </TabsContent>
              <TabsContent value="pricing">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input id="price" type="number" className="col-span-3" />
                </div>
              </TabsContent> */}
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleDialogSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullCalendarPage;
