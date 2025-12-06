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
    <div className="relative border-b border-b-gray-100 bg-white flex justify-center w-full min-h-screen font-poppins md:pt-48 md:pb-0 px-2 sm:px-6 overflow-hidden pt-36 pb-8">
      <div className="w-full max-w-6xl mx-auto py-5 md:py-12 relative z-10">
        <main className="container w-full flex flex-col justify-between items-center md:items-start lg:flex-row font-poppins">
          <HeroContent />
          <ChatSimulator />
        </main>
      </div>
    </div>
  );
}
