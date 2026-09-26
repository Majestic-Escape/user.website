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
import { formatINR, parseFiniteNumber } from "@/lib/format";
import { goToLogin, checkoutPathFor } from "@/lib/auth-return";

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
  const router = useRouter();
  const pathname = usePathname();
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
      options,
    )} – ${to.toLocaleDateString("en-IN", options)}`;
  }
  // Listings without a basePrice show "Price on request" and cannot be
  // reserved from this bar (never ₹NaN / ₹0).
  const perNight = parseFiniteNumber(perNightPrice);
  const nights =
    modalCheckDate?.from && modalCheckDate?.to
      ? Math.ceil(
          (modalCheckDate.to.getTime() - modalCheckDate.from.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  useEffect(() => {
    if (modalCheckDate?.from && modalCheckDate?.to) {
      const nights = Math.ceil(
        (modalCheckDate.to.getTime() - modalCheckDate.from.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const perNight = Number(perNightPrice);
      const total = perNight * nights;
      setModalMobilePrice(total);
    }
  }, []);
  // Same look as before; the Reserve link is rendered BY the button (asChild)
  // instead of a <button> nested inside an <a>.
  const reserveCls =
    "w-full flex justify-center items-center text-center py-8 px-2 bg-primaryGreen text-2xl font-bricolage hover:bg-brightGreen text-white h-10 rounded-[42px] font-medium";
  const hasDates = nights > 0;
  return (
    <div className="md:hidden font-poppins fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid h-24 max-w-lg grid-cols-2 mx-auto px-4 py-2 items-center">
        {/* Opens the price / dates sheet */}
        <button
          type="button"
          onClick={() => setOpenPriceModal(true)}
          aria-haspopup="dialog"
          className="min-w-0 rounded-xl text-left underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
        >
          <span className="block truncate text-xl font-semibold text-gray-900">
            {perNight === null
              ? "Price on request"
              : hasDates
                ? formatINR(nights == 1 ? perNight : nights * perNight)
                : `${formatINR(perNight)} / night`}
          </span>
          <span className="block truncate text-base text-gray-600 underline">
            {hasDates
              ? `${nights} night${nights > 1 ? "s" : ""} · ${formatDateRange(modalCheckDate?.from, modalCheckDate?.to)}`
              : "Add dates"}
          </span>
        </button>
        {perNight === null ? (
          <Button
            disabled
            className="w-full flex justify-center items-center text-center py-8 px-2 bg-gray-300 text-xl font-bricolage text-gray-600 h-10 rounded-[42px] font-medium"
          >
            Price on request
          </Button>
        ) : isAuth ? (
          <Button asChild className={reserveCls}>
            <Link
              href={{
                pathname: `/book/stay/${bookingQuery?.propertyId}`,
                query: bookingQuery,
              }}
            >
              Reserve
            </Link>
          </Button>
        ) : (
          <Button
            className={reserveCls}
            onClick={() => {
              goToLogin(router, checkoutPathFor(bookingQuery?.propertyId, bookingQuery));
            }}
          >
            Reserve
          </Button>
        )}
      </div>
    </div>
  );
}
