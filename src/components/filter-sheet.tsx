"use client";

import { useState } from "react";
import {
  ChevronDown,
  Wifi,
  UtensilsCrossed,
  Loader2,
  Wind,
  Zap,
  Key,
  Dog,
  Home,
  Building2,
  HomeIcon as House,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSheet } from "./providers/sheet-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FilterModal from "./ui/modal";
import { useAuth } from "@/contexts/AuthContext";

export function FilterSheet() {
  const { isOpen, setIsOpen } = useSheet();
  const [priceRange, setPriceRange] = useState([850, 12000]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    []
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState<
    string[]
  >([]);

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleBookingOption = (option: string) => {
    setSelectedBookingOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const clearAll = () => {
    setPriceRange([850, 12000]);
    setSelectedPropertyTypes([]);
    setSelectedAmenities([]);
    setSelectedBookingOptions([]);
  };

  return (
    <div>
      <FilterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
    // <Sheet open={isOpen} onOpenChange={setIsOpen}>
    //   <SheetContent side="bottom" className="h-[90vh] overflow-y-auto z-50">
    //     <SheetHeader className="border-b pb-4  sticky top-0 bg-white mx-auto inline-block z-10">
    //       <SheetTitle className="text-center">Filters</SheetTitle>
    //     </SheetHeader>

    //     <div className="space-y-6 py-6 pb-20">
    //       {/* Price range */}
    //       <Accordion type="single" collapsible className="w-full">
    //         <AccordionItem value="price-range">
    //           <AccordionTrigger className="text-lg font-semibold">
    //             Price range
    //           </AccordionTrigger>
    //           <AccordionContent>
    //             <p className="text-sm text-muted-foreground mb-4">
    //               Nightly prices before fees and taxes
    //             </p>
    //             <div className="px-2">
    //               <Slider
    //                 value={priceRange}
    //                 max={12000}
    //                 min={850}
    //                 step={100}
    //                 onValueChange={setPriceRange}
    //               />
    //             </div>
    //             <div className="flex justify-between mt-4">
    //               <div className="border rounded-lg p-3 flex-1 mr-2">
    //                 ₹{priceRange[0]}
    //               </div>
    //               <div className="border rounded-lg p-3 flex-1 ml-2">
    //                 ₹{priceRange[1]}+
    //               </div>
    //             </div>
    //           </AccordionContent>
    //         </AccordionItem>
    //       </Accordion>

    //       {/* Property type */}
    //       <Accordion type="single" collapsible className="w-full">
    //         <AccordionItem value="property-type">
    //           <AccordionTrigger className="text-lg font-semibold">
    //             Property type
    //           </AccordionTrigger>
    //           <AccordionContent>
    //             <div className="grid grid-cols-2 gap-4">
    //               <Button
    //                 variant={
    //                   selectedPropertyTypes.includes("House")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => togglePropertyType("House")}
    //               >
    //                 <Home className="h-6 w-6 mb-2" />
    //                 <span>House</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedPropertyTypes.includes("Flat")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => togglePropertyType("Flat")}
    //               >
    //                 <Building2 className="h-6 w-6 mb-2" />
    //                 <span>Flat</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedPropertyTypes.includes("Guest house")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => togglePropertyType("Guest house")}
    //               >
    //                 <House className="h-6 w-6 mb-2" />
    //                 <span>Guest house</span>
    //               </Button>
    //             </div>
    //           </AccordionContent>
    //         </AccordionItem>
    //       </Accordion>

    //       {/* Amenities */}
    //       <Accordion type="single" collapsible className="w-full">
    //         <AccordionItem value="amenities">
    //           <AccordionTrigger className="text-lg font-semibold">
    //             Amenities
    //           </AccordionTrigger>
    //           <AccordionContent>
    //             <div className="grid grid-cols-2 gap-4">
    //               <Button
    //                 variant={
    //                   selectedAmenities.includes("Wifi") ? "default" : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleAmenity("Wifi")}
    //               >
    //                 <Wifi className="h-6 w-6 mb-2" />
    //                 <span>Wifi</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedAmenities.includes("Kitchen")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleAmenity("Kitchen")}
    //               >
    //                 <UtensilsCrossed className="h-6 w-6 mb-2" />
    //                 <span>Kitchen</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedAmenities.includes("Washing machine")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleAmenity("Washing machine")}
    //               >
    //                 <Loader2 className="h-6 w-6 mb-2" />
    //                 <span>Washing machine</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedAmenities.includes("Air conditioning")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleAmenity("Air conditioning")}
    //               >
    //                 <Wind className="h-6 w-6 mb-2" />
    //                 <span>Air conditioning</span>
    //               </Button>
    //             </div>
    //             <Button variant="link" className="mt-4">
    //               Show more <ChevronDown className="h-4 w-4 ml-1" />
    //             </Button>
    //           </AccordionContent>
    //         </AccordionItem>
    //       </Accordion>

    //       {/* Booking Options */}
    //       <Accordion type="single" collapsible className="w-full">
    //         <AccordionItem value="booking-options">
    //           <AccordionTrigger className="text-lg font-semibold">
    //             Booking options
    //           </AccordionTrigger>
    //           <AccordionContent>
    //             <div className="grid grid-cols-2 gap-4">
    //               <Button
    //                 variant={
    //                   selectedBookingOptions.includes("Instant Book")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleBookingOption("Instant Book")}
    //               >
    //                 <Zap className="h-6 w-6 mb-2" />
    //                 <span>Instant Book</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedBookingOptions.includes("Self check-in")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleBookingOption("Self check-in")}
    //               >
    //                 <Key className="h-6 w-6 mb-2" />
    //                 <span>Self check-in</span>
    //               </Button>
    //               <Button
    //                 variant={
    //                   selectedBookingOptions.includes("Allows pets")
    //                     ? "default"
    //                     : "outline"
    //                 }
    //                 className="h-24 flex flex-col items-start p-4"
    //                 onClick={() => toggleBookingOption("Allows pets")}
    //               >
    //                 <Dog className="h-6 w-6 mb-2" />
    //                 <span>Allows pets</span>
    //               </Button>
    //             </div>
    //           </AccordionContent>
    //         </AccordionItem>
    //       </Accordion>

    //       {/* Footer Buttons */}
    //       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
    //         <div className="flex justify-between gap-4 max-w-[640px] mx-auto">
    //           <Button variant="outline" className="flex-1" onClick={clearAll}>
    //             Clear all
    //           </Button>
    //           <Button className="flex-1">Show results</Button>
    //         </div>
    //       </div>
    //     </div>
    //   </SheetContent>
    // </Sheet>
  );
}
