"use client";

import Hero from "@/components/host/hero";
import Features from "@/components/host/features";
import Newsletter from "@/components/newsletter";
import Faq from "@/components/host/faq";
import Blogs from "@/components/blogs";
import { useAuth } from "@/contexts/AuthContext";
export default function Component() {
  const userId = localStorage.getItem("userId");

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
