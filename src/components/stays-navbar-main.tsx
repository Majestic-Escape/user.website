"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSheet } from "@/components/providers/sheet-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchSheet } from "@/components/search-sheet";

export function MobileNavbar() {
  const { setIsOpen } = useSheet();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="border-b">
      <div className="flex flex-col max-w-7xl mx-auto">
        <div className="flex items-center h-16 px-4">
          <div className="flex-1 flex items-center">
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="w-[300px] justify-start text-left font-normal"
            >
              <Search className="mr-2 h-4 w-4" />
              Start your search
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="px-4 pb-4">
          <Tabs defaultValue="rooms">
            <TabsList>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="icons">Icons</TabsTrigger>
              <TabsTrigger value="cabins">Cabins</TabsTrigger>
              <TabsTrigger value="countryside">Countryside</TabsTrigger>
              <TabsTrigger value="top-cities">Top cities</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <SearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
