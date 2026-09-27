/* eslint-disable @next/next/no-img-element */
'use client'

import { Bed, ImageIcon, DoorOpen } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { HOST_ILLUSTRATIONS } from "@/lib/host-illustrations"

export default function Page (){

    const steps = [
        {
          number: 1,
          title: "Describe your property",
          description: "Tell us about your unique space - from location and amenities to special features that make it stand out.",
          icon: Bed
        },
        {
          number: 2,
          title: "Showcase your space",
          description: "Upload high-quality photos and create an engaging description that captures the essence of your property.",
          icon: ImageIcon
        },
        {
          number: 3,
          title: "Set your terms",
          description: "Define your availability, house rules, and pricing strategy to attract your ideal guests.",
          icon: DoorOpen
        }
      ]

    return (

        <div className="flex flex-col relative h-full">
  
        <main className="flex-grow container mx-auto  p-4">
          <div className=" ">

          <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col lg:gap-x-8 lg:flex-row items-center ">
          <div className="lg:w-1/2 mx-auto">
            <h1 className="text-2xl md:text-4xl font-bricolage text-absoluteDark font-semibold mb-4 md:mb-8 ">
            Begin your hosting journey with Majestic Escape
            </h1>
            <img className='w-full p-4 md:p-8  h-auto' {...HOST_ILLUSTRATIONS.homeStay} sizes="(min-width: 1280px) 560px, (min-width: 1024px) 50vw, 100vw" decoding="async" alt="Home stay" />

          
          </div>

          <div className="lg:w-1/2 mx-auto">
          <div className="space-y-6 pb-24 md:pb-6">
              {steps.map((step) => (
                <Card key={step.number}>
                  <CardContent className="flex items-start gap-4 p-4 md:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <step.icon className="h-5 w-5 text-absoluteDark" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold md:text-xl font-bricolage text-absoluteDark ">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-xs md:text-base text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
          
     
        </div>
      </div>
    </div>
          </div>
        </main>
        <footer className="bg-white w-screen z-10 bottom-0 fixed right-0 left-0 border-t-4 border-t-gray-200 p-6">
      
      <div className='flex justify-between  mx-auto container max-w-7xl'>

   
      
        <Link
          
          href={"/host/dashboard/"}
          className='bg-gray-100 hover:bg-gray-200 text-sm text-absoluteDark border-absoluteDark border py-2.5 px-6 rounded-3xl'
          >
       Exit
          </Link>
        <Link href={'/host/dashboard/add-listing'} className="text-sm bg-primaryGreen rounded-full hover:bg-brightGreen py-2.5 px-6 text-white">
                Get started
              </Link>
              </div>
 </footer>
      </div>
    )
}