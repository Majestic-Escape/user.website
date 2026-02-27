"use client";

import Hero from "@/components/host/hero";
import Features from "@/components/host/features";
import Newsletter from "@/components/newsletter";
import Faq from "@/components/host/faq";
import Blogs from "@/components/blogs";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
export default function Component() {
  // const userId = localStorage.getItem("userId");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);
  return (
    <div>
      <Hero user={userId} />
      <Features />
      <Faq />
      <Blogs />
      {/* <Newsletter /> */}
    </div>
  );
}
