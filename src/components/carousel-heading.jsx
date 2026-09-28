"use client"


import { Card, CardContent } from "@/components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

export function CarouselSpacing() {
  return (
    <Carousel 
     plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="w-full ">
      <CarouselContent className="-ml-1">
        {Array.from({ length: 7 }).map((_, index) => (
          <CarouselItem key={index} className={`pl-1 md:basis-1/2 lg:basis-1/3 py-6 px-6 ${index%2==0 ? "rotate-12":"-rotate-12"} `}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-2">
<Image
src={`/carousel/image-${index+1}.png`}
alt="Images"
height={250}
width={250}

className={`object-cover aspect-square w-[250px]`}/>  
              </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

