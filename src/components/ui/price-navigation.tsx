"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calendar,
  User,
  MenuIcon,
  HomeIcon,
  Heart,
  Building2Icon,
  HandHelping,
  SquareUser,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function PriceNavigation() {
  const {
    openPriceModal,
    setOpenPriceModal,
    perNightPrice,
    setPerNightPrice,
    modalCheckDate,
    setModalMobilePrice,
    modalMobilePrice,
    bookingQuery,
    setBookingQuery,
  } = useAuth();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = getLocalData ? JSON.parse(getLocalData) : null;
    if (data) {
      setIsAuth(true);
    }
  };
  useEffect(() => {
    auth();
  }, []);

  function formatDateRange(from?: Date, to?: Date) {
    if (!from || !to) return "";

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };

    return `${from.toLocaleDateString(
      "en-IN",
      options
    )} – ${to.toLocaleDateString("en-IN", options)}`;
  }
  const nights =
    modalCheckDate?.from && modalCheckDate?.to
      ? Math.ceil(
          (modalCheckDate.to.getTime() - modalCheckDate.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  useEffect(() => {
    if (modalCheckDate?.from && modalCheckDate?.to) {
      const nights = Math.ceil(
        (modalCheckDate.to.getTime() - modalCheckDate.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const perNight = Number(perNightPrice);
      const total = perNight * nights;
      setModalMobilePrice(total);
    }
  }, []);
  return (
    <div className="md:hidden  font-poppins fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto px-4 py-2 items-center">
        <div
          className=" underline"
          onClick={() => {
            setOpenPriceModal(true);
          }}
        >
          <div className="text-base font-semibold text-gray-900">
            ₹
            {nights == 1
              ? perNightPrice
              : (nights * Number(perNightPrice))?.toLocaleString("en-IN")}
          </div>

          <div className="text-xs text-gray-600 underline">
            {nights} night{nights > 1 ? "s" : ""} ·{" "}
            {formatDateRange(modalCheckDate?.from, modalCheckDate?.to)}
          </div>
        </div>
        {isAuth ? (
          <Link
            href={{
              pathname: `/book/stay/${bookingQuery?.propertyId}`,
              query: bookingQuery,
            }}
          >
            <Button
              className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
              // onClick={() => {
              //   setOpenPriceModal(true);
              // }}
            >
              Reserve
            </Button>
          </Link>
        ) : (
          <Button
            className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
            onClick={() => {
              toast.error("You need to signup or login to reserve");
            }}
          >
            Reserve
          </Button>
        )}
      </div>
    </div>
  );
}
