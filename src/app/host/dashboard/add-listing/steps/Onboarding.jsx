/* eslint-disable @next/next/no-img-element */
"use client";

import { Bed, ImageIcon, DoorOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TextReveal } from "@/components/text-reveal";

export default function Onboarding() {
  const steps = [
    {
      number: 1,
      title: "Describe your property",
      description:
        "Tell us about your unique space - from location and amenities to special features that make it stand out.",
      icon: Bed,
    },
    // {
    //   number: 2,
    //   title: "Showcase your space",
    //   description:
    //     "Upload high-quality photos and create an engaging description that captures the essence of your property.",
    //   icon: ImageIcon,
    // },
    {
      number: 2,
      title: "Set your terms",
      description:
        "Define your availability, house rules, and pricing strategy to attract your ideal guests.",
      icon: DoorOpen,
    },
  ];

  return (
    <div className="flex flex-col relative ">
      <main className="flex-grow container mx-auto  p-4">
        <div className=" ">
          <div className=" bg-gray-50">
            <TextReveal>
              <div className="container max-w-7xl mx-auto px-4 py-8 md:py-16">
                <div className="flex flex-col lg:gap-x-8 lg:flex-row items-center ">
                  <div className="lg:w-1/2 mx-auto">
                    <h1 className="text-2xl md:text-4xl font-bricolage text-absoluteDark font-semibold mb-4 md:mb-4 ">
                      Begin your hosting journey with Majestic Escape
                    </h1>
                    <img
                      className="w-3/4 p-4 md:p-8  h-auto mx-auto"
                      src="/images/home-stay.png"
                      alt="Home stay"
                    />
                    {/* <img
                      className="w-full p-4 md:p-8  h-auto"
                      src="/images/gem.png"
                      alt="Home stay"
                    /> */}
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
            </TextReveal>
          </div>
        </div>
      </main>
    </div>
  );
}
