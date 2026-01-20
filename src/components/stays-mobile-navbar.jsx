"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { SearchSheet } from "@/components/search-sheet";
import MobileNavTabLayout from "@/components/nav-tab-layout-mobile";
import { FilterSheet } from "./filter-sheet";
import {
  Compass,
  Calendar,
  User,
  MenuIcon,
  HomeIcon,
  Heart,
  Building2Icon,
  ConciergeBell,
  CableCar,
  HandHelping,
} from "lucide-react";
import FilterModal from "./ui/modal";
import { useAuth } from "@/contexts/AuthContext";
export function MobileNavbar() {
  const {
    modalFilter,
    setModalFilter,
    openModal,
    closeModal,
    toggleModal,
    setActiveTab,
  } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [hideTabs, setHideTabs] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // scrolling DOWN
        setHideTabs(true);
      } else {
        // scrolling UP
        setHideTabs(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  return (
    <div className="md:hidden fixed w-screen top-0 left-0 right-0 z-50 bg-white">
      <div className="bg-white">
        {/* TOP HEADER */}
        <div className="flex flex-col max-w-7xl mx-auto">
          <div className="flex items-center h-16 px-4">
            {/* Logo */}
            <Link href="/">
              <Image
                width={20}
                height={20}
                className="h-5 w-auto mr-3"
                src="/logo.png"
                alt="Logo"
              />
            </Link>

            {/* Search bar */}
            <div className="flex-1 flex items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setModalFilter(true);
                  setActiveTab("search");
                  console.log("ada");
                }}
                className="w-full mr-3 py-6 rounded-3xl justify-start text-left font-normal"
              >
                <Search className="mr-3 h-4 w-4" />
                Start your search
              </Button>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center border rounded-full gap-2 h-10 w-10"
              onClick={openModal}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Sheet */}
        <SearchSheet
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
        <MobileNavTabLayout hideTabs={hideTabs} />
        {/* <div className="pb-2" />
        <hr /> */}
        {/* ⭐ CATEGORY TABS (Homes | Experiences | Services) */}
        {/* <div
          className={`w-full justify-center overflow-x-auto flex items-center gap-8 px-6 pb-2 border-t border-gray-200
          transition-all duration-300 ease-in-out 
       
        `}
        >
      
          <Link href="/stays" className="flex flex-col items-center min-w-fit">
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`${
                  hideTabs
                    ? "-translate-y-full opacity-0 h-0 py-2"
                    : "translate-y-0 opacity-100 py-3 h-auto"
                }`}
              >
                {" "}
                <Image src="/icons/home.png" width={32} height={32} alt="Homes" />
                <Building2Icon className="w-6 h-6 mx-auto" />{" "}
                <span className="text-4xl mb-2 ">🏠</span>
              </div>
              <div>
                <span
                  className={
                    hideTabs
                      ? "text-base font-medium text-black"
                      : "text-sm mt-1 font-medium text-black"
                  }
                >
                  Stays
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/experiences"
            className="flex flex-col items-center min-w-fit"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`${
                  hideTabs
                    ? "-translate-y-full opacity-0 h-0 py-2"
                    : "translate-y-0 opacity-100 py-3 h-auto"
                }`}
              >
                {" "}
                <Image src="/icons/home.png" width={32} height={32} alt="Homes" />
                <CableCar className="w-6 h-6 mx-auto" />{" "}
                <span className="text-4xl mb-2">🧗</span>
              </div>

              <div>
                <span
                  className={
                    hideTabs
                      ? "text-base font-medium text-black"
                      : "text-sm mt-1 font-medium text-black"
                  }
                >
                  Experiences
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/services"
            className="flex flex-col items-center min-w-fit"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`${
                  hideTabs
                    ? "-translate-y-full opacity-0 h-0 py-2"
                    : "translate-y-0 opacity-100 py-3 h-auto"
                }`}
              >
                {" "}
                <Image src="/icons/home.png" width={32} height={32} alt="Homes" />
                <ConciergeBell className="w-6 h-6 mx-auto" />
                <span className="text-4xl mb-2 ">🛎️</span>
              </div>
              <div>
                <span
                  className={
                    hideTabs
                      ? "text-base font-medium text-black"
                      : "text-sm mt-1 font-medium text-black"
                  }
                >
                  Services
                </span>
              </div>
            </div>
          </Link>
        </div> */}
      </div>

      {/* FILTER BAR BELOW TABS */}
      {/* <div className="px-6 py-2 bg-white">
        <FilterSheet />
      </div> */}
      {/* <FilterModal isOpen={modalFilter} onClose={closeModal} /> */}
    </div>
  );
}
