"use client";
import { HeroContent } from "@/components/hero-content";
import ChatSimulator from "@/components/chat-simulator";
import confetti from "canvas-confetti";
import { useEffect } from "react";

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
    <div className="mobile:pt-[140px] mobile:pb-10 tab:pt-[170px] tab:pb-5 midtab:pt-[210px] midtab:pb-10 relative border-b border-b-gray-100 bg-white flex justify-center w-full min-h-screen font-poppins md:pt-48 md:pb-0 px-2 sm:px-6 overflow-hidden pt-24 sm:pt-24 pb-8">
      <div className="tab:min-h-[calc(100vh-80px)] tab:flex tab:items-center tab:justify-center desktop:pb-0 smtab:mt-[50px] mtab:mt-[10px] midtab:mt-5 w-full max-w-6xl mx-auto py-5 relative z-10">
        <main className="mobile:flex-col tab:flex tab:flex-col tab:items-center midtab:flex-col midtab:items-center midtab:gap-8 desktop:flex-row container w-full flex flex-col justify-between items-center md:items-start font-poppins">
          {/* hero-root hero-inner outer-mid-tab-margin hero-margin hero-main */}
          <HeroContent />
          <ChatSimulator />
        </main>
      </div>
    </div>
  );
}
