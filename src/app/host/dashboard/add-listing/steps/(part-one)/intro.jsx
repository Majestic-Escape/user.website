/* eslint-disable @next/next/no-img-element */

import { TextReveal } from "@/components/text-reveal";

export function StepOneIntro() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-y-8 md:gap-y-0 md:gap-x-12  md:flex-row container mx-auto max-w-7xl">
        <div className="my-auto ">
          <TextReveal>
            <span className="text-sm py-2 px-6 bg-gray-100 mb-1 inline-block rounded-md text-absoluteDark">
              Step 1
            </span>
            <h1 className="text-2xl md:text-3xl mb-2 font-bricolage font-medium">
              Share details about your space.
            </h1>
            <p className="text-stone text-sm md:text-base">
              In this step, we'll gather details about your property, including
              its type and whether guests can book the entire space or just a
              room. We'll also ask for the location and the maximum number of
              guests it can accommodate.
            </p>
          </TextReveal>
        </div>
        <div>
          <img
            src="/step-one-illustration.webp"
            className="rounded-md"
            alt="Step one"
          />
          {/* <img
            width={1200}
            height={500}
            src="/images/gemi.png"
            className="rounded-md"
            alt="Step one"
          /> */}
        </div>
      </section>
    </div>
  );
}
