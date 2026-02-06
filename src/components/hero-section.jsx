"use client";
import { HeroContent } from "@/components/hero-content";
import ChatSimulator from "@/components/chat-simulator";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import Image from "next/image";
export default function HeroSection() {
  const successConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval); // Stop the interval
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return interval; // Return interval ID for cleanup
  };

  // useEffect(() => {
  //   const interval = successConfetti() // Start confetti

  //   return () => {
  //     clearInterval(interval) // Cleanup when component unmounts
  //   }
  // }, [])

  return (
    <div className="pt-32 md:pt-46 w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden">
      <div className="w-full">
        {/* <img src={"/images/govt/kuno_web.png"}/> */}
        {/* <Image
          src="/images/govt/kuno_web_1.png"
          alt="Full width image"
          width={1920} // Set your image dimensions
          height={1080}
          className="-pt-2 md:pt-12 lg:-pt-2 w-full pt-2 h-auto object-contain"
          sizes="100vw"
          priority
        /> */}
        <Image
          src="/images/hero/KUNO-WEB-DESKTOP-1.png"
          alt="Full width image"
          width={1920} // Set your image dimensions
          height={1080}
          className="hidden md:block -pt-2 md:pt-8 lg:-pt-2 w-full h-auto object-contain"
          sizes="100vw"
          priority
        />
        <Image
          src="/images/hero/KUNO-MBL-FIN.png"
          alt="Full width image"
          width={1920} // Set your image dimensions
          height={1920}
          className="block md:hidden pt-6 w-full h-auto object-contain"
          sizes="100vw"
          priority
        />
        {/* <ChatSimulator /> */}
      </div>
    </div>
    // <div className="mobile:pt-[140px] mobile:pb-10 tab:pt-[170px] tab:pb-5 midtab:pt-[210px] midtab:pb-10 relative border-b border-b-gray-100 bg-white justify-center w-full min-h-screen font-poppins md:pt-48 md:pb-0 px-2 sm:px-6 overflow-hidden pt-24 sm:pt-24 pb-8">
    //   <div className="tab:min-h-[calc(100vh-80px)] tab:items-center tab:justify-center desktop:pb-0 smtab:mt-[50px] mtab:mt-[10px] midtab:mt-5 w-full max-w-6xl mx-auto py-5 relative z-10">
    //     <main className="tab:items-center  flex flex-end midtab:items-center midtab:gap-8  container w-full  justify-between items-center md:items-start font-poppins">
    //       {/* hero-root hero-inner outer-mid-tab-margin hero-margin hero-main */}
    //       {/* <HeroContent />
    //       <ChatSimulator /> */}
    //       <Image
    //         src="/images/govt/kuno_web.png"
    //         alt="Full width image"
    //         width={1920} // Set your image dimensions
    //         height={1080}
    //         className="w-full h-auto object-contain"
    //         sizes="100vw"
    //         priority
    //       />
    //     </main>
    //   </div>
    // </div>
  );
}
