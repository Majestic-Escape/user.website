'use client'

import * as React from "react"
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Search, Minus, Plus, HomeIcon } from 'lucide-react'

interface SearchFilterProps {
  isScrolled: boolean;
}

export default function SearchFilter({ isScrolled }: SearchFilterProps) {
  const [destination, setDestination] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [openDestination, setOpenDestination] = React.useState(false)
  const [openDatePicker, setOpenDatePicker] = React.useState(false)
  const [openGuests, setOpenGuests] = React.useState(false)
  const [guests, setGuests] = React.useState({
    adults: 0,
    children: 0,
    infants: 0
    })

  const handleGuestChange = (type: 'adults' | 'children' | 'infants' , operation: 'increment' | 'decrement') => {
    setGuests(prev => ({
      ...prev,
      [type]: operation === 'increment' ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }))
  }

  const totalGuests = guests.adults + guests.children + guests.infants

  const destinations = React.useMemo(() => [
    { value: "south-goa", label: "South Goa, Goa", image: "/calangute.jpg", description: "Beautiful beach in Goa" },
    { value: "baga", label: "Baga Beach, Goa", image: "/baga.jpg", description: " Lively beach in Goa" },
    { value: "panjim", label: "Panjim City, Goa", image: "/panjim.jpg", description: "Capital city of Goa" },
    { value: "anjuna", label: "Anjuna Beach, Goa", image: "/anjuna.jpg", description: "Famous for its flea market" },
    { value: "vagator", label: "Vagator Beach, Goa", image: "/vagator.jpg", description: "Scenic beach in Goa" },
    { value: "candolim", label: "Candolim Beach, Goa", image: "/candolim.jpg", description: "Relaxing beach in Goa" },
    { value: "arambol", label: "Arambol Beach, Goa", image: "/arambol.jpg", description: "Beach known for its bohemian vibe" },
    { value: "colva", label: "Colva Beach, Goa", image: "/colva.jpg", description: "Long and popular beach in Goa" },
  ], [])

  const filteredDestinations = React.useMemo(() => {
    if (!searchTerm) return destinations;
    return destinations.filter((dest) =>
      dest.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, destinations]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, 'MMM d');
  }

  return (
    <div className={`transition-all duration-300 ${isScrolled ? 'opacity-100 -translate-y-full' : 'opacity-100 translate-y-0 '} hidden md:flex font-publicSans items-center gap-1 relative bg-white rounded-full border-[1px] z-50 border-gray-200 shadow-md max-w-full ${isScrolled? "md:w-[500px]":"md:w-[850px]"}  pl-2 py-1  mx-auto`}>
      {/* Destination Search */}
      <Popover open={openDestination} onOpenChange={setOpenDestination}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={openDestination}
            className={`w-full ${isScrolled? "sm:w-[100px]":"sm:w-[250px]"} justify-start px-4 h-14 transition-all duration-200 ease-in-out`}
          >
            <div className="flex flex-col justify-start items-start">
              <span className="text-sm font-bricolage font-medium">Anywhere</span>
              <span className={`text-sm ${isScrolled? 'hidden':"inline-block"} text-muted-foreground font-normal`}>
                {destination ? filteredDestinations.find(d => d.value === destination)?.label || "Search destinations" : "Search destinations"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] font-publicSans mt-2 transition-all duration-200 ease-in-out" align="start">
          <Command className="bg-white">
            <CommandInput placeholder="Search Goa destinations..." onValueChange={(value) => setSearchTerm(value)}/>
            <CommandEmpty className="hidden">No destination found.</CommandEmpty>
            <CommandGroup>
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.value}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setDestination(dest.value)
                    setOpenDestination(false)
                    setSearchTerm("")
                  }}
                >
                  <div className="p-3 flex justify-center items-center rounded-sm bg-lightGreen/20">
                    <HomeIcon className="size-4 text-primaryGreen"/>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{dest.label}</div>
                    <div className="text-sm text-gray-500">{dest.description}</div>
                  </div>
                </button>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="h-8 bg-border md:block" />

      {/* Date Range Picker */}
      <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
        <PopoverTrigger asChild>
          <div className="flex">
            <Button
              variant="ghost"
              className="w-[125px] justify-start px-4 h-14 transition-all duration-200 ease-in-out"
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-bricolage font-medium">Check in</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {dateRange?.from ? formatDate(dateRange.from) : "Add dates"}
                </span>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-[125px] justify-start px-4 h-14 transition-all duration-200 ease-in-out"
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-bricolage font-medium">Check out</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {dateRange?.to ? formatDate(dateRange.to) : "Add dates"}
                </span>
              </div>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="bg-white mt-2 font-publicSans w-auto p-0 transition-all duration-200 ease-in-out" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(newDateRange) => {
              setDateRange({
                from: newDateRange?.from,
                to: newDateRange?.to ?? undefined
              })
              if (newDateRange?.from && newDateRange?.to) {
                setOpenDatePicker(false)
              }
            }}
            numberOfMonths={2}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="w-px h-8 bg-border md:block" />

      {/* Guests Selection */}
      <Popover open={openGuests} onOpenChange={setOpenGuests}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`${isScrolled? "w-[100px]":"w-[250px] "} justify-start px-4 h-14 transition-all duration-200 ease-in-out`}
          >
            <div className="flex flex-col items-start">
              <span className="text-sm font-bricolage font-medium">{isScrolled? "Guests":"Who"}</span>
              <span className={`${isScrolled? "hidden":"inline-block"} text-sm font-normal text-muted-foreground`}>
                {totalGuests > 0 ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}` : "Add guests"}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-6 transition-all duration-200 ease-in-out" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-absoluteDark">Adults</div>
                <div className="text-sm text-muted-foreground">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('adults', 'decrement')}
                  disabled={guests.adults === 0}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{guests.adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('adults', 'increment')}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Children</div>
                <div className="text-sm text-muted-foreground">Ages 2-12</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('children', 'decrement')}
                  disabled={guests.children === 0}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{guests.children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('children', 'increment')}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Infants</div>
                <div className="text-sm text-muted-foreground">Under 2</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('infants', 'decrement')}
                  disabled={guests.infants === 0}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{guests.infants}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleGuestChange('infants', 'increment')}
                  className="transition-all h-8 w-8 bg-[#eee] rounded-full duration-200 ease-in-out"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </PopoverContent>
      </Popover>

      {/* Search Button */}
      <Button size="icon" className="h-12 w-12 absolute right-2 shrink-0 bg-primaryGreen hover:bg-brightGreen text-white rounded-full transition-all duration-200 ease-in-out">
        <Search className="h-6 w-6" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  )
}

