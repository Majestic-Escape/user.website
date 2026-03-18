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
    <section className="relative mt-24 md:mt-0 h-[500px] md:h-[85vh] w-full overflow-hidden">
      {/* Video Background */}

      <div className="absolute inset-0 z-0">
        {/* <div
          id="yt-player"
          className="absolute 
        top-1/2 left-1/2
        w-[320%] h-[280%] md:h-[200%] md:w-[280%] lg:h-[160%]
        -translate-x-1/2 -translate-y-1/2
        pointer-events-none"
        /> */}
        <div className="md:pt-46 w-screen -mx-[calc((100vw-100%)/2)] overflow-hidden">
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
              src="/images/hero/experience.jpg"
              alt="Full width image"
              width={1920} // Set your image dimensions
              height={1080}
              className="hidden md:block   w-full h-auto object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
            <Image
              src="/images/hero/Artboard_Mob.png"
              alt="Full width image"
              width={1920} // Set your image dimensions
              height={1920}
              className="block md:hidden pt-6 w-full h-auto object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
            {/* <ChatSimulator /> */}
          </div>
        </div>
      </div>
      {/* src="https://www.youtube.com/embed/T-kulebBnxg?autoplay=1&mute=1&loop=1&start=10&end=88&playlist=T-kulebBnxg&controls=0&modestbranding=1&rel=0"
          title="YouTube video player"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
     */}

      {/* Dark Overlay (optional but recommended) */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Text Content Overlay */}
      <div className="absolute inset-0 z-10  flex flex-col items-center justify-center px-4 sm:px-6 md:px-[72px] pt-16 md:pt-0  text-center">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bricolage font-bold text-white mb-3">
          Discover Thrilling Experiences in India
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 max-w-2xl">
          Explore exciting activities and create unforgettable memories
        </p>

        <Link
          href="#experiences"
          className="border bg-white/20 backdrop-blur-md text-white border-white/30 hover:ring-2 hover:ring-white px-4 py-2 rounded-3xl text-sm sm:text-base transition"
        >
          Book Your Experience
        </Link>
      </div>
    </section>
  );
}
