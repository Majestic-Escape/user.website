/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { addDays, format } from "date-fns";
import { submitBooking } from "@/services/submitBookingService";
import { toast } from "sonner";

export function PropertyBookingDialog({ isOpen, onClose, property }) {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [guests, setGuests] = useState(1);
  const [specialOffers, setSpecialOffers] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const bookingInfo = {
        dateFrom: format(date.from, "yyyy-MM-dd"),
        dateTo: date.to ? format(date.to, "yyyy-MM-dd") : undefined,
        guests,
        specialOffers,
      };
      await submitBooking(property.id, bookingInfo);
      onClose();
    } catch (err) {
      if (process.env.NEXT_PUBLIC_ENV === "dev") {
        console.log(err);
      }
      toast.success("Booking enquiry submitted. We will get back to you");
      onClose();
      // setError('Failed to submit booking. Please try again.')
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="py-3 space-y-4">
      <div>
        <Label htmlFor="date-range">Select Dates</Label>
        <Calendar
          id="date-range"
          mode="range"
          selected={date}
          onSelect={(newDate) =>
            setDate(newDate || { from: new Date(), to: undefined })
          }
          className="rounded-md border"
        />
      </div>
      <div>
        <Label htmlFor="guests">Number of Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={15}
          value={guests}
          className="h-12 no-spinner"
          onChange={(e) => setGuests(parseInt(e.target.value))}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="special-offers"
          checked={specialOffers}
          onCheckedChange={(checked) => setSpecialOffers(checked)}
        />
        <Label htmlFor="special-offers">
          Would you like to receive special offers?
        </Label>
      </div>
      <Button
        type="submit"
        className="w-full h-12 rounded-3xl bg-primaryGreen hover:bg-brightGreen"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-left">
            <h1 className="text-xl font-medium font-bricolage text-absoluteDark">
              {property.title}
            </h1>
            <p className="text-sm text-stone">
              Book your stay at {property.location}
            </p>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>{property.title}</SheetTitle>
          <SheetDescription>
            Book your stay at {property.location}
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
