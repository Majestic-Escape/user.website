import React from "react";
import Image from "next/image";
import Link from "next/link";

import { getCurrentYear } from "@/lib/date-utils";

const footerData = {
  company: {
    title: "Navigation",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Blogs", href: "/blogs" },
      { label: "Book a Home Stay", href: "/stays" },
      // { label: "Book an Experience", href: "/experiences" },
    ],
  },
  host: {
    title: "For Host",
    links: [
      { label: "Host your property", href: "/hosting" },
      { label: "Benefits", href: "/hosting/#features" },
      { label: "FAQ", href: "/host-faq" },
      // { label: "Rules for Goa", href: "/rules-for-goa" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
      // { label: "Cookies Policy", href: "/cookies-policy" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Help Center", href: "/help-center" },
      // { label: "Complaints", href: "/complaints" },
    ],
  },
};

const FooterColumn = ({ data }) => (
  <div className="flex flex-col">
    <h3 className="text-base font-bricolage font-semibold text-graphite mb-4">
      {data.title}
    </h3>
    <nav className="flex flex-col space-y-3">
      {data.links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="text-sm text-stone hover:text-absoluteDark hover:underline transition-all"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  </div>
);

export default function Footer() {
  const currentYear = getCurrentYear();

  return (
    <div className="flex justify-center w-full border-t border-t-gray-100 bg-offWhite">
      <div className="w-full max-w-[1400px] mx-auto">
        <footer className="bg-offWhite px-5 md:px-16 py-12 relative font-poppins text-absolute-dark">
          <div className="mx-auto relative">
            <div className="xl:grid xl:grid-cols-5 xl:gap-8">
              <div className="xl:col-span-1">
                <Link href="/">
                  <img
                    src="/images/logo-footer.svg"
                    width="165"
                    height="88"
                    alt="Majestic Escape Logo"
                  />
                </Link>
              </div>
              <div className="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-4 xl:grid-cols-4">
                <FooterColumn data={footerData.company} />
                <FooterColumn data={footerData.host} />
                <FooterColumn data={footerData.legal} />
                <FooterColumn data={footerData.support} />
              </div>
              <div className="absolute top-16 right-4 lg:-top-0.5 lg:right-18"></div>
            </div>
            <hr className="mt-12" />

            <div className="md:hidden desktop:block flex desktop:flex flex-col sm:flex-row justify-between items-center py-8">
              <p className="text-sm text-stone">
                &copy; {currentYear} Majestic Escape. All rights reserved
              </p>
              <div className="flex mt-6 mb-4 gap-8">
                <div>
                  <div className="">
                    {/*Desktop*/}{" "}
                    <div className="hidden desktop:block desktop:flex items-center  pt-38">
                      {" "}
                      <Link href={"https://evokeexperiences.in/"}>
                        <Image
                          src="/images/govt/evoke.png"
                          width={150}
                          height={150}
                          alt="mail icon"
                          className="lg:pl-1 hover:scale-105"
                        />
                      </Link>
                      <Link href={"https://nidhi.tourism.gov.in/"}>
                        <Image
                          src="/images/govt/nidhi.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 lg:pl-1 hover:scale-105"
                        />
                      </Link>{" "}
                      <Link href={"https://goa-tourism.com/"}>
                        <Image
                          src="/images/govt/goa-tourism.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 lg:pl-1 hover:scale-105"
                        />
                      </Link>
                      <Link href={"https://forest.goa.gov.in/"}>
                        <Image
                          src="/images/govt/goa-forest-dept.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 lg:pl-1 hover:scale-105"
                        />
                      </Link>
                      <Image
                        src="/images/govt/rann_utsav.png"
                        width={150}
                        height={150}
                        alt="mail icon"
                        className="lg:pl-1 lg:pr-1"
                      />
                    </div>
                  </div>
                  {/*Mobile*/}
                  <div className="flex md:flex-start desktop:hidden md:items-center pt-38 ">
                    <Link href={"https://forest.goa.gov.in/"}>
                      <Image
                        src="/images/govt/goa-forest-dept.png"
                        width={100}
                        height={100}
                        alt="mail icon"
                        className="h-16 w-16 lg:h-24 lg:w-24 hover:scale-105"
                      />
                    </Link>{" "}
                    <Link href={"https://goa-tourism.com/"}>
                      <Image
                        src="/images/govt/goa-tourism.png"
                        width={100}
                        height={100}
                        alt="mail icon"
                        className="h-16 w-16 lg:h-24 lg:w-24 hover:scale-105"
                      />
                    </Link>
                    <Link href={"https://nidhi.tourism.gov.in/"}>
                      <Image
                        src="/images/govt/nidhi.png"
                        width={100}
                        height={100}
                        alt="mail icon"
                        className="h-16 w-16 lg:h-24 lg:w-24 hover:scale-105"
                      />
                    </Link>{" "}
                  </div>
                  <div className="desktop:hidden flex justify-center">
                    {" "}
                    <Image
                      src="/images/govt/rann_utsav.png"
                      width={100}
                      height={100}
                      alt="mail icon"
                      className=""
                    />
                    <Link href={"https://evokeexperiences.in/"}>
                      <Image
                        src="/images/govt/evoke.png"
                        width={100}
                        height={100}
                        alt="mail icon"
                        className=""
                      />
                    </Link>{" "}
                  </div>
                  <div className="flex justify-center"> </div>
                </div>
              </div>
              {/*Desktop*/}{" "}
              <div className="md:hidden desktop:block flex desktop:flex space-x-6 mt-4 sm:my-16 mb-16 md:pb-0">
                <Link href="mailto:support@majesticescape.in" target="_blank">
                  <Image
                    src="/icons/mail.png"
                    width={24}
                    height={24}
                    alt="mail icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link
                  href="https://www.instagram.com/themajesticescape"
                  target="_blank"
                >
                  <Image
                    src="/icons/instagram.png"
                    width={24}
                    height={24}
                    alt="instagram icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link
                  href="https://www.facebook.com/profile.php?id=61567800352990"
                  target="_blank"
                >
                  <Image
                    src="/icons/facebook.png"
                    width={24}
                    height={24}
                    alt="facebook icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link href="https://wa.me/917219666822" target="_blank">
                  <Image
                    src="/icons/whatsapp.png"
                    width={24}
                    height={24}
                    alt="whatsapp icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>
              </div>
            </div>
            <div className="hidden md:block desktop:hidden md:flex md:flex-col md:justify-between md:items-center py-8">
              <p className="text-sm text-stone">
                &copy; {currentYear} Majestic Escape. All rights reserved
              </p>
              <div className="flex  mb-4 gap-8">
                <div>
                  <div className="">
                    <div className="flex items-center  pt-38">
                      <Link href={"https://goa-tourism.com/"}>
                        <Image
                          src="/images/govt/goa-tourism.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 md:mx-2 hover:scale-105"
                        />
                      </Link>{" "}
                      <Link href={"https://nidhi.tourism.gov.in/"}>
                        <Image
                          src="/images/govt/nidhi.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 md:mx-2 hover:scale-105"
                        />
                      </Link>{" "}
                      <Link href={"https://evokeexperiences.in/"}>
                        <Image
                          src="/images/govt/evoke.png"
                          width={150}
                          height={150}
                          alt="mail icon"
                          className="md:mx-2"
                        />
                      </Link>
                      <Link href={"https://forest.goa.gov.in/"}>
                        <Image
                          src="/images/govt/goa-forest-dept.png"
                          width={100}
                          height={100}
                          alt="mail icon"
                          className="h-16 w-16 lg:h-24 lg:w-24 md:mx-2 hover:scale-105"
                        />
                      </Link>
                      <Image
                        src="/images/govt/rann_utsav.png"
                        width={150}
                        height={150}
                        alt="mail icon"
                        className="md:mx-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center"> </div>
                </div>
              </div>
              <div className="flex desktop:flex space-x-6 mt-4 sm:mt-0">
                <Link href="mailto:support@majesticescape.in" target="_blank">
                  <Image
                    src="/icons/mail.png"
                    width={24}
                    height={24}
                    alt="mail icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link
                  href="https://www.instagram.com/themajesticescape"
                  target="_blank"
                >
                  <Image
                    src="/icons/instagram.png"
                    width={24}
                    height={24}
                    alt="instagram icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link
                  href="https://www.facebook.com/profile.php?id=61567800352990"
                  target="_blank"
                >
                  <Image
                    src="/icons/facebook.png"
                    width={24}
                    height={24}
                    alt="facebook icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>

                <Link href="https://wa.me/917219666822" target="_blank">
                  <Image
                    src="/icons/whatsapp.png"
                    width={24}
                    height={24}
                    alt="whatsapp icon"
                    className="h-7 w-7 hover:scale-105"
                  />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
