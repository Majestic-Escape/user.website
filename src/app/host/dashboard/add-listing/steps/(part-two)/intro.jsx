/* eslint-disable @next/next/no-img-element */
import { TextReveal } from "@/components/text-reveal";

export function StepTwoIntro() {

    return (
      <div className="space-y-6">
       <TextReveal>

      
     
     <section className="flex flex-col gap-y-8 md:gap-y-0 md:gap-x-12  md:flex-row container mx-auto max-w-7xl">
        <div className="my-auto ">
          <span className="text-sm py-2 px-6 bg-gray-100 mb-1 inline-block rounded-md text-absoluteDark">Step 2</span>
  <h1 className="text-2xl md:text-3xl mb-2 font-bricolage font-medium">Set your space apart.</h1>
  <p className="text-stone text-sm md:text-base">In this step, you'll list the amenities your place provides, upload at least 5 photos, and craft a title and description.</p>
       </div>
       <div>
  <img src="/step-two-illustration.png" className="rounded-md max-w-[400px]" alt="Step one" />
       </div>
       </section>
       </TextReveal>
       
      </div>
    );
  }
  