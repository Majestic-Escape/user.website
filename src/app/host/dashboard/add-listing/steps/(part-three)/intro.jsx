/* eslint-disable @next/next/no-img-element */
import { TextReveal } from "@/components/text-reveal";
export function StepThreeIntro() {

    return (
      <div className="space-y-6">
       
     
     <section className="flex flex-col gap-y-8 md:gap-y-0 md:gap-x-12  md:flex-row container mx-auto max-w-7xl">
        <div className="my-auto ">
          <TextReveal> 

        
          <span className="text-sm py-2 px-6 bg-gray-100 mb-1 inline-block rounded-md text-absoluteDark">Step 3</span>
  <h1 className="text-2xl md:text-3xl mb-2 font-bricolage font-medium">Complete and go live</h1>
  <p className="text-stone text-sm md:text-base">Lastly, you'll configure booking preferences, establish pricing, and publish your listing.</p>
  </TextReveal>
      </div>
       <div>
  <img src="/step-three-illustration.png" className="rounded-md max-w-[400px]" alt="Step one" />
       </div>
       </section>
       
      </div>
    );
  }
  