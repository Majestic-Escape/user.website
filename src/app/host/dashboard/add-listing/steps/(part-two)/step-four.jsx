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

export function CancellationSettings({ updateFormData, formData }) {
  const [cancellationType, setCancellationType] = useState({
    moderate: formData?.cancellationType?.moderate ?? true,
    flexible: formData?.cancellationType?.flexible ?? false,
    strict: formData?.cancellationType?.strict ?? false,
  });
  const [manual, setManual] = useState(false);
  const [openDialog, setOpenDialog] = useState({
    moderate: false,
    flexible: false,
    strict: false,
  });

  useEffect(() => {
    updateFormData({ cancellationType });
  }, [cancellationType]);

  const handleCancellationTypeChange = (type) => {
    if (type === "moderate") {
      setCancellationType({
        moderate: true,
        flexible: false,
        strict: false,
      });
    } else if (type === "flexible") {
      setCancellationType({
        moderate: false,
        flexible: true,
        strict: false,
      });
    } else if (type === "strict") {
      setCancellationType({
        moderate: false,
        flexible: false,
        strict: true,
      });
    }
  };

  const bookingInfo = {
    manual: {
      title: "Manual Booking",
      description: "Get complete control over who books your space",
      // details: [
      //   "Review each booking request personally",
      //   "Screen guests before accepting",
      //   "Flexible cancellation policies",
      //   "24 hours to respond to requests",
      //   "Maintain direct communication with guests",
      // ],
    },
    instantBook: {
      title: "Instant Book",
      description: "Let guests book immediately",
      // details: [
      //   "Higher visibility in search results",
      //   "Automatic calendar updates",
      //   "Built-in guest screening",
      //   "Cancel penalty-free if uncomfortable",
      //   "More bookings on average",
      // ],
    },
    flashBook: {
      title: "Flash Booking",
      description: "Premium instant booking experience",
      // details: [
      //   "10 mins window to accept or cancel the booking",
      //   "Priority notifications and customer support",
      //   "Priority placement in search",
      //   "Advanced guest verification",
      //   "Higher earning potential",
      // ],
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
        {/* <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event from firing
          }}
        >
          Know more
        </Button> */}
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
            {/* {bookingInfo[type].details.map((detail, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {detail}
              </li>
            ))} */}
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
            Decide Cancellation Policy
          </h3>
        </TextReveal>

        <TextReveal>
          <RadioGroup
            value={cancellationType.moderate ? "manual" : "instant"}
            onValueChange={(value) => handleCancellationTypeChange(value)}
          >
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-colors ${
                  cancellationType.moderate
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "hover:border-primary"
                }`}
                onClick={() => handleCancellationTypeChange("moderate")}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      <h3 className="font-medium">
                        Set Moderate Cancellation Policy
                      </h3>
                      <InfoDialog type="manual" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guests must cancel booking 7 days before check-in date.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card
                  className={`cursor-pointer transition-colors ${
                    cancellationType.flexible
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "hover:border-primary"
                  }`}
                  onClick={() => handleCancellationTypeChange("flexible")}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <Checkbox
                      checked={cancellationType.flexible}
                      onCheckedChange={() =>
                        handleCancellationTypeChange("flexible")
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <h3 className="font-medium">
                          Set Flexible Cancellation Policy
                        </h3>
                        <InfoDialog type="instantBook" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Guests can cancel booking 24 hours before check-in date.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-colors ${
                    cancellationType.strict
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "hover:border-primary"
                  }`}
                  onClick={() => handleCancellationTypeChange("strict")}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <Checkbox
                      checked={cancellationType.strict}
                      onCheckedChange={() =>
                        handleCancellationTypeChange("strict")
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Bolt className="h-5 w-5" />
                        <h3 className="font-medium">
                          {" "}
                          Set Strict Cancellation Policy
                        </h3>
                        <InfoDialog type="flashBook" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Guests cannot cancel booking once confirmed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </RadioGroup>
        </TextReveal>
      </main>
    </div>
  );
}
