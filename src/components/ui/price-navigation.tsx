"use client";

import { useState } from "react";
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

export function PriceNavigation() {
  const { openPriceModal, setOpenPriceModal } = useAuth();

  return (
    <div className="md:hidden  font-poppins fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto px-4 py-2 items-center">
        <div
          className=" underline"
          onClick={() => {
            setOpenPriceModal(true);
          }}
        >
          Select Dates
        </div>
        <Button
          className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium"
          onClick={() => {
            setOpenPriceModal(true);
          }}
        >
          Reserve
        </Button>
      </div>
    </div>
  );
}
