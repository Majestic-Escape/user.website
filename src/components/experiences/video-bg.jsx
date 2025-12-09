"use client";

import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState, createRef, useCallback } from "react";

export default function VideoBackground() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const videos = [
    "https://cdn.pixabay.com/video/2024/02/13/200427-912684284_large.mp4",
    "https://cdn.pixabay.com/video/2024/02/21/201308-915375262_large.mp4",
  ];

  const videoRefs = useRef(videos.map(() => createRef()));

  const nextVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(nextVideo, 10000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextVideo]);

  useEffect(() => {
    videoRefs.current.forEach((ref, index) => {
      if (ref.current) {
        if (index === currentVideoIndex && isPlaying) {
          ref.current.play();
        } else {
          ref.current.pause();
        }
      }
    });
  }, [currentVideoIndex, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleProgressBarClick = (index) => {
    setCurrentVideoIndex(index);
  };

  return (
    <>
      {videos.map((video, index) => (
        <video
          key={index}
          ref={videoRefs.current[index]}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            currentVideoIndex === index ? "opacity-100" : "opacity-0"
          }`}
          src={video}
          autoPlay={index === currentVideoIndex && isPlaying}
          muted
          loop
          playsInline
        />
      ))}
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => handleProgressBarClick(index)}
            className="group relative"
          >
            <div className="w-12 sm:w-16 h-1 bg-white/40 rounded overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                  currentVideoIndex === index
                    ? "w-full bg-white"
                    : currentVideoIndex < index
                    ? "w-0 bg-white"
                    : "w-full bg-white"
                }`}
              />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={togglePlayPause}
        className="absolute bottom-8 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors z-20"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </button>
    </>
  );
}
