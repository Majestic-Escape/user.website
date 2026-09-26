/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import Image from "next/image";
import NavTabLayout from "@/components/nav-tab-layout";
import { useWishlist } from "@/components/wishlist-context";
import React, { useState } from "react";
import { useScrolled } from "@/hooks/use-scrolled";
import HeaderActions from "@/components/nav/header-actions";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import SearchFilter from "../search-filter";
import FilterStaysBar from "../filter-stays-bar";
import WishlistPopup from "../wishlist-popup";
import { usePathname, useRouter } from "next/navigation";

import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
export default function Navbar() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const isScrolled = useScrolled(0);
  const router = useRouter();

  const pathname = usePathname();
  const isStayDetailPage =
    pathname.startsWith("/stay/") && pathname !== "/stay";
  const mainPage = pathname == "/";
  const filter = pathname.startsWith("/stay/");
  const { user, logout, returnUrl, authReady } = useAuth();
  const { unreadCount } = useUnreadCount();
  const [propertyType, setPropertyType] = useState("");

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


  return (
    <div
      className={`fixed inset-x-0 top-0 bg-white z-50 font-poppins border-b transition-[padding,height] hidden md:block duration-300 ${
        isScrolled ? "pt-2  h-20" : "pt-3"
      }`}
    >
      <header className="px-4  md:px-6 z-[2000] md:pb-4 desktop:pb-4">
        <div className="container max-w-[1400px] flex h-12 md:h-16 w-full items-center mx-auto ">
          <div></div>{" "}
          <Link className="flex min-h-[44px] items-center gap-2 rounded-lg text-[#3B5D2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen" href="/" aria-label="Majestic Escape home">
            {/* <Image
              className="hidden md:inline-block h-4 md:h-7 w-auto"
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
              className="hidden md:block lg:hidden h-6 w-auto"
              width={200}
              height={40}
              src="/logo.png" // <-- medium-specific image
              alt=""
            />
          </Link>
          <div></div>
          <div
            className={`inline-block z-50 absolute  mb-4 right-[50%] translate-x-1/2 
            transition-all duration-300 ${
              isScrolled
                ? "opacity-0 hidden md:hidden"
                : filter
                  ? "opacity-0 hidden md:hidden"
                  : "opacity-100 hidden md:block"
            }`}
          >
            <NavTabLayout />
          </div>
          <HeaderActions showBecomeHost />
        </div>
        {/* <div className={`transition-all duration-300 ${isScrolled ? 'opacity-100 -translate-y-full' : 'opacity-100 translate-y-0 '}`}> */}

        <SearchFilter isScrolled={isScrolled} propertyType={propertyType} />
      </header>
      {/* <div
        className={` px-6 py-2 bg-white transition-all duration-300 ${
          isScrolled
            ? "md:opacity-100 md:-translate-y-3/4 border-b border-gray-100 shadow-sm"
            : "opacity-100 translate-y-0 "
        }`}
      >
        <FilterStaysBar property={propertyType} setProperty={setPropertyType} />
      </div> */}
    </div>
  );
}
