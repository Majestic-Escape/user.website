"use client"

import { Skeleton } from "@/components/ui/skeleton"
import GoogleMap from "./google-map"

interface LocationProps {
  locationInfo: {
    lat: number
    long: number
    address: string
  }
  isLoading: boolean
}

export default function Location({ locationInfo, isLoading }: LocationProps) {
  if (isLoading) {
    return (
      <section className="mt-12 border-t pt-12">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Skeleton className="h-[400px] w-full mb-6 rounded-lg" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/4" />
      </section>
    )
  }

  return (
    <section className="mt-6 md:mt-12 border-t pt-6 md:pt-12">
      <h2 className="text-xl md:text-2xl font-medium font-bricolage mb-2">Where you'll be</h2>
      <h3 className="text-sm md:text-base  mb-4">{locationInfo.address}</h3>

      <div className="mb-3">
        
        <GoogleMap lat={locationInfo.lat} lng={locationInfo.long} />
      </div>
      <p className="text-xs md:text-sm text-gray-500 mb-6" data-testid="location-approximate">
        The map shows the general area. The exact location is shared after your booking is confirmed.
      </p>
      {/* <button className="font-normal underline">Show more</button> */}
    </section>
  )
}
