"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Zap, Bolt } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextReveal } from "@/components/text-reveal";

export function ReservationSettings({ updateFormData, formData }) {
  const [bookingType, setBookingType] = useState({
    manual: formData?.bookingType?.manual ?? true,
    instantBook: formData?.bookingType?.instantBook ?? false,
    flashBook: formData?.bookingType?.flashBook ?? false,
  });
  const [manual, setManual] = useState(false);
  const [openDialog, setOpenDialog] = useState({
    manual: false,
    instantBook: false,
    flashBook: false,
  });

  useEffect(() => {
    updateFormData({ bookingType });
  }, [bookingType]);

  const handleBookingTypeChange = (type) => {
    if (type === "manual") {
      setBookingType({
        manual: true,
        instantBook: false,
        flashBook: false,
      });
    } else if (type === "instantBook") {
      setBookingType({
        manual: false,
        instantBook: true,
        flashBook: false,
      });
    } else if (type === "flashBook") {
      setBookingType({
        manual: false,
        instantBook: false,
        flashBook: true,
      });
    }
  };

  const bookingInfo = {
    manual: {
      title: "Manual Booking",
      description: "Get complete control over who books your space",
      details: [
        "Review each booking request personally",
        "Screen guests before accepting",
        "Flexible cancellation policies",
        "24 hours to respond to requests",
        "Maintain direct communication with guests",
      ],
    },
    instantBook: {
      title: "Instant Book",
      description: "Let guests book immediately",
      details: [
        "Higher visibility in search results",
        "Automatic calendar updates",
        "Built-in guest screening",
        "Cancel penalty-free if uncomfortable",
        "More bookings on average",
      ],
    },
    flashBook: {
      title: "Flash Booking",
      description: "Premium instant booking experience",
      details: [
        "10 mins window to accept or cancel the booking",
        "Priority notifications and customer support",
        "Priority placement in search",
        "Advanced guest verification",
        "Higher earning potential",
      ],
    },
  };

  const InfoDialog = ({ type }) => (
    <Dialog
      open={openDialog[type]}
      onOpenChange={(isOpen) => {
        setOpenDialog((prev) => ({ ...prev, [type]: isOpen }));
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event from firing
          }}
        >
          Know more
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bookingInfo[type].title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {bookingInfo[type].description}
          </p>
          <ul className="space-y-2">
            {bookingInfo[type].details.map((detail, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl mx-auto py-12">
        <TextReveal>
          <h3 className="text-xl md:text-2xl mb-8 font-bricolage text-absoluteDark font-semibold">
            Decide how you'll confirm reservations
          </h3>
        </TextReveal>

        <TextReveal>
          <RadioGroup
            value={bookingType.manual ? "manual" : "instant"}
            onValueChange={(value) => handleBookingTypeChange(value)}
          >
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-colors ${
                  bookingType.manual
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "hover:border-primary"
                }`}
                onClick={() => handleBookingTypeChange("manual")}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      <h3 className="font-medium">
                        Approve or decline requests
                      </h3>
                      <InfoDialog type="manual" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guests must ask if they can book.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card
                  className={`cursor-pointer transition-colors ${
                    bookingType.instantBook
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "hover:border-primary"
                  }`}
                  onClick={() => handleBookingTypeChange("instantBook")}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <Checkbox
                      checked={bookingType.instantBook}
                      onCheckedChange={() =>
                        handleBookingTypeChange("instantBook")
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h3 className="font-medium">Use Instant Book</h3>
                        <InfoDialog type="instantBook" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Guests can book automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* <Card
                  className={`cursor-pointer transition-colors ${
                    bookingType.flashBook
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "hover:border-primary"
                  }`}
                  onClick={() => handleBookingTypeChange("flashBook")}
                > */}
                {/* <CardContent className="flex items-start gap-4 p-6">
                    <Checkbox
                      checked={bookingType.flashBook}
                      onCheckedChange={() =>
                        handleBookingTypeChange("flashBook")
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Bolt className="h-5 w-5" />
                        <h3 className="font-medium">Flash Booking</h3>
                        <InfoDialog type="flashBook" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Guests can book instantly with priority processing.
                      </p>
                    </div>
                  </CardContent> */}
                {/* </Card> */}
              </div>
            </div>
          </RadioGroup>
        </TextReveal>
      </main>
    </div>
  );
}
