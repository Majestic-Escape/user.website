"use client";
import Script from "next/script";
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
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1097797528726098');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1097797528726098&ev=PageView&noscript=1"
        />
      </noscript>
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
