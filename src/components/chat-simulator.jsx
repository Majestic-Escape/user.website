"use client";

import React, { useState, useEffect } from "react";
import { Info, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatSimulator() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [messages, setMessages] = useState([]);

  const chatTemplates = [
    [
      {
        sender: "Rohan",
        text: "Guys, ready for that Rann Utsav trip? White desert calling! 🤍",
        reactions: ["🤍", "🔥"],
        typingDuration: 800,
      },
      {
        sender: "Rishi",
        text: "Bro I just hope we find a good tent stay this late 😭",
        reactions: ["⛺"],
        typingDuration: 1000,
      },
      {
        sender: "Rohan",
        text: "Majestic Escape has killer luxury tents, chill—we’re sorted!",
        reactions: ["🎉", "👌"],
        typingDuration: 1200,
      },
    ],

    [
      {
        sender: "Sneha",
        text: "Can’t believe we’re finally doing Rann Utsav! Full moon vibes incoming ✨",
        reactions: ["🌕", "🔥"],
        typingDuration: 900,
      },
      {
        sender: "Rohan",
        text: "Sameee! I’ve been manifesting this white desert view for months 😍",
        reactions: ["😍"],
        typingDuration: 1100,
      },
      {
        sender: "Sneha",
        text: "Majestic Escape said booking the tent stay barely takes 10 mins 🙌",
        reactions: ["⛺"],
        typingDuration: 1300,
      },
    ],

    [
      {
        sender: "Rohan",
        text: "Who’s hyped for our Rann adventure?",
        reactions: ["🏜️", "🔥"],
        typingDuration: 900,
      },
      {
        sender: "Gaurav",
        text: "Let’s gooo! Heard Majestic Escape has insane White Rann view tents.",
        reactions: ["🤍"],
        typingDuration: 1100,
      },
      {
        sender: "Rohan",
        text: "Yep, looks super cozy and perfect for night photography!",
        reactions: ["📸"],
        typingDuration: 1300,
      },
    ],

    [
      {
        sender: "Rohan",
        text: "Rann Utsav road trip loading… 🚗✨",
        reactions: ["🚗", "🏜️"],
        typingDuration: 900,
      },
      {
        sender: "Virat",
        text: "Got my camera ready for all those moonlit White Rann shots!",
        reactions: ["📸"],
        typingDuration: 1100,
      },
      {
        sender: "Rohan",
        text: "Majestic Escape even offers local Kutchi experiences. We’re gonna love it!",
        reactions: ["🎪"],
        typingDuration: 1300,
      },
    ],
    [
      {
        sender: "Aman",
        text: "Rann Utsav night under the full moon? Anyone?",
        reactions: ["🔥", "🌌"],
        typingDuration: 900,
      },
      {
        sender: "Rohan",
        text: "Say less! I'm in😎 Majestic Escape can hook us up with those cool Kutchi tents!",
        reactions: ["🍫"],
        typingDuration: 1100,
      },
      {
        sender: "Aman",
        text: "Perfect! This trip is gonna be insane!",
        reactions: ["✨"],
        typingDuration: 1300,
      },
    ],
    [
      {
        sender: "Rohan",
        text: "Weekend Rann plan? Let’s just do it 🤍",
        reactions: ["🌕", "🏜️"],
        typingDuration: 900,
      },
      {
        sender: "Kunal",
        text: "White desert, folk music, and bonfire nights? I'm in already 🔥",
        reactions: ["🪘"],
        typingDuration: 1100,
      },
      {
        sender: "Rohan",
        text: "Majestic Escape tents book super quick—two taps and done!",
        reactions: ["⛺"],
        typingDuration: 1300,
      },
    ],
  ];

  const emojiMap = {
    "👍": "👍🏼",
    "😍": "🎉",
    "🤔": "😅",
    "🎉": "👋🏼",
    "👌": "❤️",
    "🌴": "🌊",
    "🔥": "💥",
    "✈️": "🛫",
    "❄️": "☃️",
    "🌌": "✨",
    "🛀": "💧",
    "🚗": "🛣️",
    "🇮🇹": "🍕",
    "📸": "📷",
    "🍦": "🍨",
    "🌆": "🏙️",
    "🗽": "🗽",
    "🍕": "🍕",
    "🌃": "🌉",
  };

  useEffect(() => {
    // Randomly pick one chat template on initial render
    const randomTemplate =
      chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
    setMessages(randomTemplate);
  }, []);

  useEffect(() => {
    let timeoutId;

    const showNextMessage = () => {
      if (visibleMessages < messages.length) {
        const currentMessage = messages[visibleMessages];
        setTypingSender(currentMessage.sender);
        setIsTyping(true);

        timeoutId = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => prev + 1);
        }, currentMessage.typingDuration || 800);
      }
    };

    if (visibleMessages === 0) {
      timeoutId = setTimeout(showNextMessage, 100);
    } else if (visibleMessages < messages.length) {
      timeoutId = setTimeout(showNextMessage, 600);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visibleMessages, messages]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    //chat-simulator mid-tab-margin tab-margin
    <div className="mobile:mt-6 desktop:mt-[60px] midtab:mt-[60px] tab:mt-[70px] midtab:mt-10 w-full max-w-[300px] mx-auto ">
      {/* inner-mid-tab-margin */}
      <div className="inner-mid-tab-margin relative w-full aspect-[9/16] bg-gradient-to-br from-[#6e6e6e] via-[#ccc] to-[#D1D5DB] rounded-[2rem] shadow-xl overflow-hidden">
        <div className="absolute inset-1 bg-white text-absolute-dark rounded-[1.75rem] flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-4 py-1 text-xs bg-white">
            <span>{currentTime}</span>
            <div className="absolute right-[50%] translate-x-[50%] w-16 h-4 bg-black rounded-full"></div>
            <div className="flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
                />
              </svg>
              <span className="text-[8px] font-semibold">98%</span>
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-gray-100 p-2 flex items-center justify-between border-b border-[#ccc]">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 borders border-yellow-600 flex justify-center items-center">
                🏝️
              </div>
              <div className="flex flex-col items-starts">
                <div className="text-sm font-medium">
                  Your Majestic Escape 🌊
                </div>
                <span className="flex gap-x-2 items-center justify-between">
                  <span className="text-xs text-[#888]">3 online</span>
                  <div className="w-1.5 h-1.5 bg-primaryGreen rounded-full"></div>
                </span>
              </div>
            </div>
            <Info className="w-3 h-3 text-gray" />
          </div>

          <div className="flex-grow p-3 space-y-1 bg-white overflow-y-auto">
            {messages.slice(0, visibleMessages).map((message, index) => (
              <div
                key={index}
                className={`flex flex-col relative ${
                  message.sender === "Rohan" ? "items-end" : "items-start"
                }`}
              >
                <span className="font-medium text-[13px] text-gray block mb-0.5">
                  {message.sender}
                </span>
                <div
                  className={`max-w-[70%] text-sm break-words p-2 relative ${
                    message.sender === "Rohan"
                      ? "bg-primaryGreen text-white rounded-tl-2xl rounded-tr-md rounded-br-md rounded-bl-2xl"
                      : "bg-[#EDEBEB] text-graphite rounded-tr-2xl rounded-tl-md rounded-bl-md rounded-br-2xl"
                  }`}
                >
                  {message.text}
                  <span className="text-[11px] float-right mt-1 ml-2">
                    12:34
                  </span>
                  <div
                    className={`absolute w-0 h-0 ${
                      message.sender === "Rohan"
                        ? "-right-[5px] border-l-[6px] border-l-green-600"
                        : "-left-[6px] border-r-[6px] border-r-[#EDEBEB]"
                    } border-t-[6px] border-b-[6px] border-transparent bottom-[6px]`}
                  ></div>
                </div>
                {message.reactions.length > 0 && (
                  <div
                    className={`absolute flex -space-x-1 ${
                      message.sender === "Rohan"
                        ? "right-2 -bottom-4"
                        : "left-2 -bottom-4"
                    }`}
                  >
                    {message.reactions.map((reaction, i) => (
                      <motion.span
                        key={i}
                        className="text-sm bg-[#EDEBEB] shadow-lg rounded-full px-1 py-0.5 border border-[#00A884]/10"
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: i * 0.1,
                        }}
                        whileHover={{
                          scale: 1.2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        {emojiMap[reaction] || reaction}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div
                className={`flex flex-col ${
                  typingSender === "Rohan" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[70%] text-sm break-words p-2 ${
                    typingSender === "Rohan"
                      ? "bg-primaryGreen text-white rounded-tl-2xl rounded-tr-md rounded-br-md rounded-bl-2xl"
                      : "bg-[#f2f2f2] text-green-900 rounded-tr-2xl rounded-tl-md rounded-bl-md rounded-br-2xl"
                  }`}
                >
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-current rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-current rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.1,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-current rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="flex-grow border-none rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                Type a message
              </div>
              <button className="bg-primaryGreen text-white rounded-full p-1.5 hover:bg-primaryGreen focus:outline-none focus:ring-1 focus:ring-blue-500">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
