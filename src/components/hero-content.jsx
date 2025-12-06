"use client";

import { TextReveal } from "@/components/text-reveal";
import Link from "next/link";

export function HeroContent() {
  return (
    <>
      <br />
      <br />
      <div className="w-full md:pt-12 text-center md:text-left max-w-[600px] lg:pr-8 align mb-8 lg:mb-0">
        <TextReveal>
          <h2 className="text-sm font-medium mb-4 text-primaryGreen inline-block rounded-2xl bg-green-50 ring-1 ring-green-300 px-2.5 py-1">
            {" "}
            Quick confirmation, lasting memories
          </h2>
        </TextReveal>

        <TextReveal>
          <h1
            className="text-3xl font-bricolage sm:text-4xl md:text-[42px] font-semibold mb-2 text-absoluteDark"
            style={{ lineHeight: "1.2" }}
          >
            {" "}
            <span className="text-black">
              Find Your{" "}
              <span className="font-extrabold text-brightGreen font-bricolage">
                Majestic Stay
              </span>{" "}
            </span>
            <span className="text-black ">Wherever You Go!</span>
          </h1>
        </TextReveal>

        <TextReveal>
          <p className="hidden md:inline-block text-gray-700 mb-8">
            From cozy hideaways to spacious retreats, your ideal escape is
            waiting. Browse a wide range of homes, compare your favorites, and
            choose the stay that feels just right. Start exploring and get ready
            for a trip to remember.{" "}
          </p>
        </TextReveal>
        <TextReveal>
          <Link
            href={"/stays"}
            className="bg-primaryGreen hover:bg-brightGreen text-white px-6 py-2.5 inline-block sm:px-8 md:px-10  font-bricolage rounded-full text-lg sm:text-lg sm:w-auto"
          >
            Book your stay
          </Link>
        </TextReveal>
      </div>
    </>
  );
}
