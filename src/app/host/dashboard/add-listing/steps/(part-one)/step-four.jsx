/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { TextReveal } from "@/components/text-reveal";
export function DescribeYourPlace({ updateFormData, formData }) {
  // If formData is not provided, we default to 1.
  const [title, setTitle] = useState(formData?.title || "");
  const [description, setDescription] = useState(formData?.description || "");
  const [guests, setGuests] = useState(
    formData?.guests !== undefined ? formData.guests : 1
  );
  const [bedrooms, setBedrooms] = useState(
    formData?.bedrooms !== undefined ? formData.bedrooms : 1
  );
  const [beds, setBeds] = useState(
    formData?.beds !== undefined ? formData.beds : 1
  );
  const [bathrooms, setBathrooms] = useState(
    formData?.bathrooms !== undefined ? formData.bathrooms : 1
  );

  DescribeYourPlace.validate = (formData) => {
    const { title, description, guests, bedrooms, beds, bathrooms } = formData;
    // If any field is null or less than 1, consider the data invalid.
    if (
      !guests ||
      !bedrooms ||
      !beds ||
      !bathrooms ||
      guests < 1 ||
      bedrooms < 1 ||
      beds < 1 ||
      bathrooms < 1
    ) {
      return false;
    }
    return true;
  };

  // const handleChange = () => {
  //   updateFormData({ title, description, guests, bedrooms, beds, bathrooms });
  // };
  useEffect(() => {
    updateFormData({ title, description, guests, bedrooms, beds, bathrooms });
  }, [title, description, guests, bedrooms, beds, bathrooms]);

  const handleIncrement = (setter, key) => {
    setter((prev) => {
      // If previous value is null, start at 1; otherwise, increment.
      const newValue = prev === null ? 1 : prev + 1;
      // handleChange();
      return newValue;
    });
  };

  const handleDecrement = (setter) => {
    setter((prev) => {
      // If previous value is null, set to 1, or ensure it doesn't drop below 1.
      const newValue = prev === null ? 1 : Math.max(1, prev - 1);
      // handleChange();
      return newValue;
    });
  };

  // A helper to handle numeric input changes: if empty, set to null; otherwise convert to number.
  const handleNumericChange = (e, setter) => {
    const val = e.target.value;
    if (val === "") {
      setter(null);
    } else {
      // Only update if the value is a valid number.
      const num = Number(val);
      if (!isNaN(num)) {
        setter(num);
      }
    }
    // handleChange();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <TextReveal>
        <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
          Let's begin with the fundamentals
        </h3>
      </TextReveal>

      <TextReveal>
        <div className="grid grid-cols-1 gap-4">
          {/* Guests Input */}
          <div className="flex justify-between items-center">
            <Label htmlFor="guests" className="text-lg text-absoluteDark">
              Max guests
            </Label>
            <div className="flex items-center mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setGuests)}
                disabled={guests === null || guests <= 1}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <Input
                id="guests"
                type="number"
                // If the state is null, show an empty string
                value={guests === null ? "" : guests}
                onChange={(e) => handleNumericChange(e, setGuests)}
                className="w-16 mx-2 no-spinner border-absoluteDark text-center"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setGuests)}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <hr className="my-1 md:my-2" />

          {/* Bedrooms Input */}
          <div className="flex justify-between items-center">
            <Label htmlFor="bedrooms" className="text-lg text-absoluteDark">
              Bedrooms
            </Label>
            <div className="flex items-center mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setBedrooms)}
                disabled={bedrooms === null || bedrooms <= 1}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <Input
                id="bedrooms"
                type="number"
                value={bedrooms === null ? "" : bedrooms}
                onChange={(e) => handleNumericChange(e, setBedrooms)}
                className="w-16 mx-2 no-spinner border-absoluteDark text-center"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setBedrooms)}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <hr className="my-1 md:my-2" />

          {/* Beds Input */}
          <div className="flex justify-between items-center">
            <Label htmlFor="beds" className="text-lg text-absoluteDark">
              Beds
            </Label>
            <div className="flex items-center mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setBeds)}
                disabled={beds === null || beds <= 1}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <Input
                id="beds"
                type="number"
                value={beds === null ? "" : beds}
                onChange={(e) => handleNumericChange(e, setBeds)}
                className="w-16 mx-2 no-spinner border-absoluteDark text-center"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setBeds)}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <hr className="my-1 md:my-2" />

          {/* Bathrooms Input */}
          <div className="flex justify-between items-center">
            <Label htmlFor="bathrooms" className="text-lg text-absoluteDark">
              Bathroom
            </Label>
            <div className="flex items-center mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(setBathrooms)}
                disabled={bathrooms === null || bathrooms <= 1}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <Input
                id="bathrooms"
                type="number"
                value={bathrooms === null ? "" : bathrooms}
                onChange={(e) => handleNumericChange(e, setBathrooms)}
                className="w-16 mx-2 no-spinner border-absoluteDark text-center"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(setBathrooms)}
                className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </TextReveal>
    </div>
  );
}
