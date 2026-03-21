import Link from "next/link";
import VideoBackground from "./experiences/video-bg";
import { useRef } from "react";
import { useEffect } from "react";
import Image from "next/image";
export function ExpHero() {
  // return (
  //   <section className="relative h-[500px] md:h-[80vh]  w-full">
  //     {/* <VideoBackground /> */}
  //     <div className="relative w-full overflow-hidden rounded-xl pt-20">
  //       <iframe
  //         className="absolute top-0 left-0 h-full w-full"
  //         src="https://www.youtube.com/embed/T-kulebBnxg?autoplay=1&mute=1&loop=1&playlist=T-kulebBnxg&controls=0&showinfo=0&modestbranding=1&rel=0"
  //         title="YouTube video player"
  //         frameborder="0"
  //         allow="autoplay; encrypted-media; picture-in-picture"
  //         referrerpolicy="strict-origin-when-cross-origin"
  //         allowfullscreen
  //       ></iframe>
  //     </div>
  //     <div className="mobile:mt-20 relative h-full px-4 sm:px-6 md:px-[72px] py-8 sm:py-12 md:py-[128px] flex flex-col items-center justify-center">
  //       <h1 className="text-2xl font-bricolage sm:text-3xl md:text-5xl font-bold text-white text-center mb-2 sm:mb-4">
  //         Discover Thrilling Experiences in India
  //       </h1>
  //       <p className="text-sm sm:text-base md:text-lg text-white/90 text-center mb-4 sm:mb-8">
  //         Explore exciting activities and create unforgettable memories
  //       </p>

  //       <Link
  //         href={"#experiences"}
  //         className="border bg-[#444]/30 backdrop-blur-md text-white border-[#eee]/30 hover:ring-2 hover:ring-white mb-6 sm:mb-8 md:mb-12 px-3 sm:px-4 py-1.5 sm:py-2 rounded-3xl text-sm sm:text-base"
  //         onClick={() => {}}
  //       >
  //         Book Your Experience
  //       </Link>
  //     </div>
  //   </section>
  // );
  const playerRef = useRef(null);

  // useEffect(() => {
  //   let player;

  //   const initPlayer = () => {
  //     if (playerRef.current) {
  //       playerRef.current.destroy();
  //     }

  //     playerRef.current = new window.YT.Player("yt-player", {
  //       videoId: "T-kulebBnxg",
  //       playerVars: {
  //         autoplay: 1,
  //         mute: 1,
  //         controls: 0,
  //         modestbranding: 1,
  //         rel: 0,
  //         playsinline: 1,
  //         start: 10,
  //         end: 88,
  //       },
  //       events: {
  //         onReady: (e) => {
  //           e.target.mute();
  //           e.target.seekTo(10);
  //           e.target.playVideo();
  //         },
  //         onStateChange: (e) => {
  //           if (e.data === window.YT.PlayerState.ENDED) {
  //             e.target.seekTo(10);
  //             e.target.playVideo();
  //           }
  //         },
  //       },
  //     });
  //   };

  //   // ✅ If YT already loaded → init immediately
  //   if (window.YT && window.YT.Player) {
  //     initPlayer();
  //   } else {
  //     // Load API once
  //     const tag = document.createElement("script");
  //     tag.src = "https://www.youtube.com/iframe_api";
  //     document.body.appendChild(tag);

  //     window.onYouTubeIframeAPIReady = initPlayer;
  //   }

  //   // ✅ Cleanup on route change
  //   return () => {
  //     if (playerRef.current) {
  //       playerRef.current.destroy();
  //       playerRef.current = null;
  //     }
  //   };
  // }, []);

  return (
    <section className="relative mt-24 md:mt-0 w-full overflow-hidden">
      <div className="w-full">

        {/* Desktop Image */}
        <Image
          src="/images/hero/Majestic Escape Web Banner.jpg.jpeg"
          alt="banner"
          width={1920}
          height={1080}
          className="hidden md:block w-full h-auto object-cover"
          sizes="100vw"
          priority
          unoptimized
        />

        {/* MobileImage */}
        <Image
          src="/images/hero/Majestic Escape Mobile Banner Final.jpg.jpeg"
          alt="banner"
          width={1920}
          height={1920}
          className="block md:hidden w-full h-auto object-cover"
          sizes="100vw"
          priority
          unoptimized
        />

      </div>
    </section>
  );
}
