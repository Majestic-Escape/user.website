/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import Image from "next/image";
import NavTabLayout from "@/components/nav-tab-layout";
import { useWishlist } from "@/components/wishlist-context";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import WishlistPopup from "../wishlist-popup";
import HeaderActions from "@/components/nav/header-actions";
import { Skeleton } from "@/components/ui/skeleton";

import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { user, logout, returnUrl, authReady } = useAuth();
  const { unreadCount } = useUnreadCount();

  const router = useRouter();

  const switchToHosting = () => {
    router.push("/host/dashboard");
  };

  const totalWishlistItems =
    staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders).reduce(
      (sum, folder) => sum + folder.items.length,
      0,
    );
  const pathname = usePathname();
  const isSearchVisible =
    pathname === "/experiences" || pathname === "/services";
  //hidden md:block
  return (
    <header
      className={
        isSearchVisible
          ? "hidden md:block w-full bg-white z-[1002] font-poppins border-b px-4 md:px-6"
          : "fixed inset-x-0 top-0 bg-white z-[1002] font-poppins border-b px-4 md:px-6"
      }
    >
      <div className=" container max-w-[1400px] flex  h-12 md:h-[76px] w-full items-center mx-auto">
        <div></div>{" "}
        <Link className="flex min-h-[44px] items-center gap-2 rounded-lg text-[#3B5D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen" href="/" aria-label="Majestic Escape home">
          {/* <Image
            className="h-6 md:h-6 w-auto"
            width={200}
            height={40}
            src="/images/logo.svg"
            alt=""
          /> */}
          <Image
            className="hidden lg:block h-6 w-auto"
            width={200}
            height={40}
            src="/images/logo.svg"
            alt=""
          />
          {/* ✅ MEDIUM SCREENS ONLY */}
          <Image
            className=" lg:hidden h-6 w-auto"
            width={200}
            height={40}
            src="/logo.png" // <-- medium-specific image
            alt=""
          />
        </Link>
        <div className="z-50 absolute hidden md:block right-[50%] translate-x-1/2">
          <NavTabLayout />
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}
