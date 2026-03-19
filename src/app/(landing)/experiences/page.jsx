"use client";
import Hero from "@/components/experience-hero";
import Block from "@/components/experience-block";
import Blogs from "@/components/blogs";
import Newsletter from "@/components/newsletter";
import { ExpHero } from "@/components/exp-hero";
import ExperienceSection from "@/components/experiences/experience-section";
import ExperienceSoulTraveling from "@/components/experiences/experience-soul-traveling";
import { useEffect } from "react";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
export default function Component() {
  return (
    <div>
      <MobileNavbar />
      <main>
        {/*className="pt-16"*/}
        <ExpHero />
        {/* <Hero /> */}
        <Block />
      </main>

      {/* <ExperienceSection /> */}
      {/* <ExperienceSoulTraveling /> */}
      {/* <Blogs /> */}
      {/* <Newsletter /> */}
    </div>
  );
}
