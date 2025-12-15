import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextReveal } from "@/components/text-reveal";

const propertyTypes = [
  { id: "house", label: "House", icon: "🏠" },
  { id: "apartment", label: "Apartment", icon: "🏢" },
  { id: "guesthouse", label: "Guesthouse", icon: "🏡" },
  { id: "hotel", label: "Hotel", icon: "🏨" },
  { id: "cabin", label: "Cabin", icon: "🌳" },
  { id: "villa", label: "Villa", icon: "🏛️" },
  { id: "cottage", label: "Cottage", icon: "🏚️" },
  { id: "bungalow", label: "Bungalow", icon: "🏘️" },
  { id: "townhouse", label: "Townhouse", icon: "🏪" },
  { id: "condo", label: "Condo", icon: "🏙️" },
  { id: "treehouse", label: "Treehouse", icon: "🌴" },
  { id: "farmhouse", label: "Farmhouse", icon: "🚜" },
  { id: "houseboat", label: "Houseboat", icon: "⛵" },
  { id: "yurt", label: "Yurt", icon: "⛺" },
  { id: "dome", label: "Dome house", icon: "🏠" },
  { id: "castle", label: "Castle", icon: "🏰" },
  { id: "lighthouse", label: "Lighthouse", icon: "🗼" },
  { id: "windmill", label: "Windmill", icon: "🏔️" },
  { id: "cave", label: "Cave", icon: "🕳️" },
  { id: "container", label: "Container", icon: "📦" },
  { id: "camper", label: "Camper/RV", icon: "🚐" },
  { id: "barn", label: "Barn", icon: "🏚️" },
  { id: "boat", label: "Boat", icon: "🚤" },
  { id: "tiny_house", label: "Tiny house", icon: "🏠" },
  { id: "wedding", label: "Wedding Stay", icon: "💒" },
  { id: "tent", label: "Tent", icon: "⛺" },
  { id: "woman", label: "Woman Stay", icon: "👩🏻" },
];

export function PropertyType({ updateFormData, formData, error }) {
  const [propertyType, setPropertyType] = useState(
    formData?.propertyType || ""
  );

  const handleChange = (value) => {
    setPropertyType(value);
    updateFormData({ propertyType: value });
    if (process.env.NEXT_PUBLIC_ENV === "dev") {
      console.log("Selected Property Type:", value);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <TextReveal>
        <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
          What kind of place will you host?
        </h3>
      </TextReveal>
      <TextReveal>
        <ScrollArea className="w-full rounded-md border p-4">
          <RadioGroup
            value={propertyType}
            onValueChange={handleChange}
            className="grid md:grid-cols-3 m-2 grid-cols-2 gap-4"
          >
            {propertyTypes.map((type) => (
              <div key={type.id} className="relative">
                <RadioGroupItem
                  value={type.id}
                  id={type.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type.id}
                  className={`${
                    type.id === propertyType ? "ring-primaryGreen ring-2" : ""
                  } flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:border-brightGreen peer-checked:border-brightGreen peer-checked:bg-brightGreen/10`}
                >
                  <span className="text-4xl mb-2">{type.icon}</span>
                  <span className="font-medium font-bricolage text-absoluteDark text-center">
                    {type.label}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      </TextReveal>
    </div>
  );
}
