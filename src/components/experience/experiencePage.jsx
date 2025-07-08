"use client";

import React from "react";
import Image from "next/image";
import { experienceData, priceData } from "../../lib/experience/data";
import { PublicSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Rating from "./Rating";
import Description from "./description";
import Price from "./Price";
import Include from "./include";
import HostInformation from "./information";
import Review from "./Review";

const font = PublicSans({
  subsets: ["latin"],
  weight: ["400"],
});

const fonts = PublicSans({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Experience() {
  return (
    <div className="max-w-7xl mx-auto pt-4">
      <div className="p-4 space-y-4">
        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Large Image */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src={experienceData.images[0].url}
              alt={experienceData.images[0].alt}
              fill
              className="object-cover"
            />
          </div>
          {/* Small Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            {experienceData.images
              .slice(1)
              .map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
          </div>
        </div>
        {/* Title and Actions Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4">
          {/* Title and Location */}
          <div>
            <h1
              className={cn(
                "text-xl sm:text-2xl font-semibold text-gray-900",
                fonts.className
              )}
            >
              {experienceData.title}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Image
                src="/location.png"
                width={13}
                height={16}
                alt="Location icon"
              />
              <p className="text-sm text-gray-500">{experienceData.location}</p>
            </div>
          </div>
          {/* Share and Wishlist Buttons */}
          <div className="flex items-center gap-8 mt-4 sm:mt-2">
            <button className="flex items-center gap-2">
              <Image src="/share.png" width={16} height={16} alt="Share icon" />
              <span className={cn("text-xs sm:text-sm", font.className)}>
                Share
              </span>
            </button>
            <button className="flex items-center gap-2">
              <Image
                src="/heart.png"
                width={18}
                height={18}
                alt="Wishlist icon"
              />
              <span className={cn("text-xs sm:text-sm", font.className)}>
                Wishlist
              </span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-4">
          <div className="p-4 space-y-6">
            {/* Image Grid and Title sections remain unchanged */}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left side content */}
              <div className="md:col-span-2 space-y-6">
                <Rating />
                <Description />
              </div>
              {/* Right side content */}
              <div className="md:col-span-1 space-y-6">
                <Price data={priceData} />
                <div className="relative">
                <div className="absolute right-0 sm:w-[155%] sm:pt-[230px] pt-[950px]">
                  <Review />
                </div>
                </div>
              </div>
          
            </div>

            {/* Include Component - Full width */}
            <div className="w-full">
              <Include />
            </div>

            {/* Host Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <HostInformation />
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
