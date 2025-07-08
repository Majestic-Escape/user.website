import React from "react";
import Image from "next/image";
import Link from "next/link";
import Heading from "./ui/heading";
import SubHeading from "./ui/sub-heading";

const descriptions = [
  "Elevate your hospitality business with Majestic Escape, India's leading luxury stay platform. We bring together exceptional properties and discerning travelers, creating memorable experiences while driving growth for our partners. Our curated marketplace ensures your properties reach the right audience, while our expertise helps optimize your presence in the premium hospitality sector.",
  "Unlock new opportunities with Majestic Escape, where luxury meets seamless booking experiences. We connect premium property owners with high-value travelers, ensuring maximum visibility and profitability. Our platform provides expert insights, marketing tools, and a streamlined management system to help you stand out in the competitive hospitality landscape.",
];


const DescriptionBlock = ({ text, className }) => (
  <p className={`text-sm  text-stone text-balance ${className}`}>{text}</p>
);

const PartnerButton = () => (
  <div className="flex flex-col sm:flex sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
    <Link
      href={"/partners"}
      className="text-sm w-full sm:w-64 md:text-base text-center sm:mr-4  px-4 sm:px-6 md:px-6 py-4 sm:py-3 font-medium text-white bg-primaryGreen rounded-full  hover:bg-brightGreen transition-colors duration-300"
      aria-label="Partner with us"
    >
      Partner with us
    </Link>

    <Link
      href={"/partners#terms"}
      className="text-sm w-full sm:w-64 text-center md:text-base px-4 sm:px-6 md:px-6 py-4 sm:py-3 font-medium bg-white border-2 text-primaryGreen hover:bg-gray-100 border-primaryGreen rounded-full  hover:border-brightGreen transition-colors duration-300"
      aria-label="Partner with us"
    >
      Read Terms
    </Link>
  </div>
);



// sm:px-6 md:px-8 lg:px-[72px] py-16 sm:py-20 md:py-24 lg:py-[128px]
const BecomePartner = () => {
  return (
    <div className="flex justify-center w-full bg-white px-4 sm:px-6 lg:px-[72px]  py-10 ">
      <div className="w-full max-w-[1760px] mx-auto">
        <main className="flex overflow-hidden flex-col justify-center items-start  bg-white font-publicSans">
          <section className="w-full  mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <article className="flex flex-col w-full lg:w-[60%]">
                <div className="flex flex-col grow items-start">
                  <header className="flex flex-col max-w-full mb-8">
                    <Heading text=" Become a Hospitality Partner" />
                    <SubHeading text=" Join the Elite Network of Luxury Stay Providers" />
                  </header>
                  <div className="flex flex-col text-gray  max-w-full">
                    <div className="flex flex-col w-full text-gray">
                      {descriptions.map((text, index) => (
                        <DescriptionBlock
                          key={index}
                          text={text}
                          className={index > 0 ? "mt-5" : ""}
                        />
                      ))}
                    </div>
                    <PartnerButton />
                  </div>
                </div>
              </article>
              <aside className="flex flex-col w-full lg:w-[40%]">
                <div className="relative w-full pb-[120%] sm:pb-[100%] md:pb-[90%] lg:pb-[80%]">
                
      <Image
      src="/images/booking-chart.svg"
      alt="Bookings chart"
      width={320}
      height={304}
      objectFit="contain"
      className="absolute left-0 top-0 w-[250px] sm:w-[300px] md:w-[380px]  h-auto z-0"
      />

<Image
      src="/images/sales-chart.svg"
      alt="Sales chart"
      width={382}
      height={304}
      objectFit="contain"
      className="absolute top-[40%] sm:top-[35%] md:top-[30%] lg:top-[25%] left-[15%] sm:left-[20%] md:left-[25%] lg:left-[30%] w-[250px] sm:w-[300px] md:w-[380px]  h-auto z-10"
      />

                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BecomePartner;
