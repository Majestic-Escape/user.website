import Link from "next/link";
import VideoBackground from "@/coponents/experiences/video-bg";

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[80vh]  w-full">
      <VideoBackground />
      <div className="relative h-full px-4 sm:px-6 md:px-[72px] py-8 sm:py-12 md:py-[128px] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bricolage sm:text-3xl md:text-5xl font-bold text-white text-center mb-2 sm:mb-4">
          Discover Thrilling Experiences in India
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-white/90 text-center mb-4 sm:mb-8">
          Explore exciting activities and create unforgettable memories
        </p>

        <Link
          href={"#experiences"}
          className="border bg-[#444]/30 backdrop-blur-md text-white border-[#eee]/30 hover:ring-2 hover:ring-white mb-6 sm:mb-8 md:mb-12 px-3 sm:px-4 py-1.5 sm:py-2 rounded-3xl text-sm sm:text-base"
          onClick={() => {}}
        >
          Book Your Experience
        </Link>
      </div>
    </section>
  );
}
