import { Button } from "@/components/ui/button";
import {
  Wifi,
  Tv,
  AirVent,
  ShowerHead,
  Shirt,
  BrushIcon as Toothbrush,
  Droplets,
  Fan,
  CookingPot,
  ParkingMeter,
  HardDriveDownload,
  LeafyGreen,
  CloudFogIcon,
  // Import more icons as needed
} from "lucide-react";
import { PublicSans } from "next/font/google";
import { cn } from "@/lib/utils";

const iconMap = {
  Wifi: Wifi,
  tv: Tv,
  "Air Conditioning": AirVent,
  "shower-head": ShowerHead,
  shirt: Shirt,
  toothbrush: Toothbrush,
  droplets: Droplets,
  fan: Fan,
  Parking: ParkingMeter,
  "Power Backup": Fan,
  Security: HardDriveDownload,
  "Private Pool": Droplets,
  Garden: LeafyGreen,
  Kitchen: CookingPot,
  BBQ: CloudFogIcon,
};

const font = PublicSans({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Facility({ amenities }: { amenities: string[] }) {
  return (
    <div className="pt-4">
      <div className="max-w-2xl p-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Amenities</h2>
          <p className={cn("text-[#4B5563]", font.className)}>
            About the property's amenities and services
          </p>
        </div>
        <div className="h-px sm:w-[400px] w-[200px] bg-gray-200 my-4" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {amenities.map((amenity) => {
            const Icon = iconMap[amenity as keyof typeof iconMap] || Wifi;
            return (
              <div key={amenity} className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Icon
                    className={cn("w-6 h-6 text-[#4B5563]", font.className)}
                  />
                </div>
                <span className={cn("text-[#4B5563]", font.className)}>
                  {amenity}
                </span>
              </div>
            );
          })}
        </div>
        <div className="pt-6">
          <Button
            variant="outline"
            className="bg-white text-[#46921E] px-[25px] py-[20px] rounded-full green-border"
          >
            View more {amenities.length} amenities
          </Button>
        </div>
      </div>
    </div>
  );
}
