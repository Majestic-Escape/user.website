"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Zap, Bolt } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextReveal } from "@/components/text-reveal";

export function PropertyTiming({ updateFormData, formData }) {
  const [checkinTime, setCheckinTime] = useState(formData?.checkinTime ?? "11");
  const [checkoutTime, setCheckoutTime] = useState(
    formData?.checkoutTime ?? "14"
  );

  useEffect(() => {
    updateFormData({ checkinTime, checkoutTime });
  }, [checkinTime, checkoutTime]);
  const numbersList = Array.from({ length: 11 }, (_, i) => i + 1);
  return (
    <div className=" max-w-4xl mx-auto p-6 md:min-h-screen md:bg-background">
      <main className="container max-w-3xl mx-auto py-12">
        <TextReveal>
          <h3 className="text-xl md:text-2xl mb-8 font-bricolage text-absoluteDark font-semibold">
            Decide Check-in and Check-out time
          </h3>
        </TextReveal>

        <TextReveal>
          {" "}
          <Card className="p-6 space-y-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between space-y-2">
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">
                    Check-In Time
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    What time should the guest arrive
                  </p>
                </div>{" "}
                <div>
                  {" "}
                  <div className="mt-2 flex gap-2">
                    <select
                      className="w-full mt-2 border border-gray-300 rounded-md p-2"
                      value={checkinTime}
                      onChange={(e) => {
                        setCheckinTime(e.target.value);
                      }}
                    >
                      <option value="">Select time</option>
                      <option value="0">12 am</option>
                      {numbersList.map((item, index) => (
                        <option key={item || index} value={item}>
                          {item} am
                        </option>
                      ))}
                      <option key={12} value="12">
                        12 pm
                      </option>
                      {numbersList.map((item, index) => (
                        <option key={item || index} value={Number(item) + 12}>
                          {item} pm
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between space-y-2">
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">
                    Check-Out Time
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    What time should the guest leave
                  </p>
                </div>{" "}
                <div>
                  {" "}
                  <div className="mt-2 flex gap-2">
                    <select
                      className="w-full mt-2 border border-gray-300 rounded-md p-2"
                      value={checkoutTime}
                      onChange={(e) => {
                        setCheckoutTime(e.target.value);
                      }}
                    >
                      <option value="">Select time</option>
                      <option value="0">12 am</option>
                      {numbersList.map((item, index) => (
                        <option key={item || index} value={item}>
                          {item} am
                        </option>
                      ))}
                      <option key={12} value="12">
                        12 pm
                      </option>
                      {numbersList.map((item, index) => (
                        <option key={item || index} value={Number(item) + 12}>
                          {item} pm
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TextReveal>
      </main>
    </div>
  );
}
