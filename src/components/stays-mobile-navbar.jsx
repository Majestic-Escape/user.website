"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSheet } from "@/components/providers/sheet-provider";
import { SearchSheet } from "@/components/search-sheet";

import Image from "next/image";
import { FilterSheet } from "./filter-sheet";
import Link from "next/link";
export function MobileNavbar({ openModal }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="lg:hidden fixed w-screen top-0 left-0 right-0 z-50 bg-white">
      <div className="border-b">
        <div className="flex flex-col max-w-7xl mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/">
              <Image
                width={20}
                height={20}
                className="h-5 w-auto mr-3"
                src="/logo.png"
                alt="Logo"
              />
            </Link>
            <div className="flex-1 flex items-center">
              <Button
                variant="outline"
                onClick={() => setIsSearchOpen(true)}
                className="w-full mr-3 py-5 rounded-3xl justify-start text-left font-normal"
              >
                <Search className="mr-3 h-4 w-4" />
                Start your search
              </Button>
            </div>
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

        <SearchSheet
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>

      <div className="px-6 py-2 bg-white">
        <FilterSheet />
        {/* <FilterStaysBar /> */}
        <SearchSheet
          isOpen={false}
          onClose={function () {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
    </div>
  );
}
