"use client";

import { useState } from "react";
import { Home, DoorOpenIcon as Door } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TextReveal } from "@/components/text-reveal";

const placeTypes = [
  {
    id: "entire",
    title: "An entire place",
    description: "Guests have the whole place to themselves.",
    icon: <Home className="h-6 w-6" />,
  },
  {
    id: "room",
    title: "A room",
    description:
      "Guests have their own room in a home, plus access to shared spaces.",
    icon: <Door className="h-6 w-6" />,
  },
];

export function PlaceTypeSelector({ updateFormData, formData }) {
  const [selectedType, setSelectedType] = useState(
    formData.placeType || "entire"
  );

  const handlePlaceTypeChange = (value) => {
    setSelectedType(value);
    updateFormData({ placeType: value });

    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("placeType updated to:", value);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <TextReveal>
        <h1 className="mb-8 text-xl md:text-2xl font-bricolage font-medium">
          What type of place will guests have?
        </h1>
      </TextReveal>
      <TextReveal>
        <RadioGroup
          value={selectedType}
          onValueChange={handlePlaceTypeChange}
          className="space-y-4"
        >
          {placeTypes.map((type) => (
            <div
              key={type.id}
              className={`cursor-pointer rounded-lg border p-4 md:h-24 transition-colors hover:border-gray-400 ${
                selectedType === type.id
                  ? "border-2 border-primaryGreen bg-gray-50"
                  : "border-gray-200"
              }`}
              onClick={() => handlePlaceTypeChange(type.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={type.id}
                      className="text-lg font-bricolage leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type.title}
                    </Label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {type.description}
                  </p>
                </div>
                <div className="text-gray-500">{type.icon}</div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </TextReveal>
    </div>
  );
}
