import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function BlogPost() {
  return (
    <div className="max-w-[85rem] py-24 font-poppins px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-6">
        {/* Content */}
        <div className="lg:col-span-2">
          <div className="py-8 lg:pe-8">
            <div className="space-y-5 pt-8 md:pt-0 lg:space-y-8">
              <Link
                className="inline-flex items-center gap-x-1.5 text-sm text-gray-600 decoration-2 hover:underline focus:outline-none focus:underline "
                href="/blogs"
              >
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Blog
              </Link>
              <h2 className="text-3xl font-semibold lg:text-5xl text-absoluteDark font-bricolage">
                Top 5 Reasons Why Homestays Are Better Than Hotels
              </h2>
              <div className="flex items-center gap-x-5">
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200   "
                  href="#"
                >
                  Stays
                </a>
                <p className="text-xs sm:text-sm text-gray-800 ">
                  November 21, 2024
                </p>
              </div>
              <p className="text-lg text-gray-800 ">
                Homestays have become a popular choice for travellers who want
                comfort, space, and a local touch—all at a better price. If
                you’re debating between a hotel and a homestay for your next
                trip, here are five clear reasons why homestays often win.
              </p>
              <p className="text-lg text-gray-800 ">
                <p className="font-medium"> More Space for the Same Price </p>
                Hotels usually offer compact rooms, while homestays provide full
                homes with bedrooms, living areas, kitchens, and balconies.
                Families, groups, and long-stay travellers get far more space
                without paying premium rates.
              </p>
              <div className="text-center">
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/1/homestay.jpg"
                        alt="Sada Fort Landscape"
                      />
                    </figure>
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/1/homestay4.jpg"
                        alt="Coastal Fortification"
                      />
                    </figure>
                  </div>
                  <figure className="relative w-full h-72 sm:h-96 lg:h-full">
                    <Image
                      width={600}
                      height={600}
                      className="size-full absolute top-0 start-0 object-cover rounded-xl"
                      src="/images/blog/1/homestay2.jpg"
                      alt="Historical Fort View"
                    />
                  </figure>
                </div>
                <span className="mt-3 block text-sm text-center text-gray-500 ">
                  {/* Sada Fort&apos;s Architectural Panorama */}
                </span>
              </div>
              <p className="text-lg text-gray-800 ">
                <p className="font-medium">
                  A More Local and Authentic Experience
                </p>{" "}
                Homestays let you experience a destination like a local. You
                stay in real neighbourhoods, interact with hosts, and get access
                to insider recommendations—something hotels rarely offer.
              </p>
              <p className="text-lg text-gray-800 ">
                <p className="font-medium">
                  Better Amenities and Home-Like Comfort
                </p>{" "}
                Most homestays include kitchens, washing machines, private
                parking, workspaces, and outdoor areas. You get the flexibility
                to cook, relax, and enjoy a comfortable stay without the
                limitations of a hotel room.
              </p>
              <blockquote className="text-center p-4 sm:px-7">
                {/* <p className="text-xl font-medium text-gray-800 lg:text-2xl lg:leading-normal xl:text-2xl xl:leading-normal ">
                  Sada Fort whispers stories of colonial resilience, standing as
                  a silent guardian of Goa&apos;s multilayered history.
                </p>
                <p className="mt-5 text-gray-800 ">
                  Local Historian, Maria Santos
                </p> */}
              </blockquote>
              <figure>
                <Image
                  width={600}
                  height={600}
                  className="w-full object-cover rounded-xl"
                  src="/images/blog/1/homestay3.jpg"
                  alt="Sada Fort Archaeological Details"
                />
                <figcaption className="mt-3 text-sm text-center text-gray-500 ">
                  Intricate stonework at Sada Fort
                </figcaption>
              </figure>
              <div className="space-y-3">
                <p className="font-medium">
                  Ideal for Longer Stays and Workations
                </p>{" "}
                <p className="text-lg text-gray-800 ">
                  For long trips, homestays are more practical. They provide
                  WiFi, kitchens, and comfortable setups for remote work, all at
                  affordable rates. Hotels rarely match this level of
                  convenience for extended stays.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-medium">More Value for Money</p>{" "}
                <p className="text-lg text-gray-800 ">
                  Homestays usually cost less than hotels while offering more
                  space, privacy, and amenities. For groups or families, the
                  cost per person becomes even better, making homestays a
                  budget-friendly yet comfortable choice. If you want space,
                  flexibility, and a stay that feels like home, homestays offer
                  clear advantages over traditional hotels.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-y-5 lg:gap-y-0">
                {/* Badges/Tags */}
                <div>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200    "
                    href="#"
                  >
                    Goa
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200    "
                    href="#"
                  >
                    Historical Sites
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200    "
                    href="#"
                  >
                    Travel
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200    "
                    href="#"
                  >
                    Heritage
                  </a>
                </div>
                {/* End Badges/Tags */}
              </div>
            </div>
          </div>
        </div>
        {/* End Content */}
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:w-full lg:h-full lg:bg-gradient-to-r lg:from-gray-50 lg:via-transparent lg:to-transparent ">
          <div className="sticky top-0 start-0 py-8 lg:ps-8">
            {/* Avatar Media */}
            <div className="group flex items-center gap-x-3 border-b border-gray-200 pb-8 mb-8 ">
              <a className="block shrink-0 focus:outline-none" href="#">
                <Image
                  width={600}
                  height={600}
                  className="size-10 rounded-full"
                  src="/logo.svg"
                  alt="Avatar"
                />
              </a>
              <a className="group grow block focus:outline-none" href="">
                <h5 className="group-hover:text-gray-600 group-focus:text-gray-600 text-sm font-semibold text-gray-800  ">
                  Majestic Escape
                </h5>
              </a>
              <div className="grow">
                <div className="flex justify-end">
                  {/* <button
                    type="button"
                    className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-transparent bg-primaryGreen text-white hover:bg-brightGreen focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx={9} cy={7} r={4} />
                      <line x1={19} x2={19} y1={8} y2={14} />
                      <line x1={22} x2={16} y1={11} y2={11} />
                    </svg>
                    Subscribe
                  </button> */}
                </div>
              </div>
            </div>
            {/* End Avatar Media */}
            <div className="space-y-6">
              {/* Media */}
              <Link
                className="group flex items-center gap-x-6 focus:outline-none"
                href="/blog/2"
              >
                <div className="grow">
                  <span className="text-base font-medium text-absluteDark font-bricolage group-hover:text-brightGreen group-focus:text-brightGreen ">
                    How to Plan a Budget Trip Without Compromising Comfort
                  </span>
                </div>
                <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                  <Image
                    width={600}
                    height={600}
                    className="size-full absolute top-0 start-0 object-cover rounded-lg"
                    src="/images/img1.png?height=220&width=320"
                    alt="Blog Image"
                  />
                </div>
              </Link>
              {/* End Media */}
              {/* Media */}
              <Link
                className="group flex items-center gap-x-6 focus:outline-none"
                href="/blog/3"
              >
                <div className="grow">
                  <span className="text-base font-medium text-absluteDark font-bricolage group-hover:text-brightGreen group-focus:text-brightGreen ">
                    How to Choose the Perfect Homestay for Your Family Trip
                  </span>
                </div>
                <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                  <Image
                    width={600}
                    height={600}
                    className="size-full absolute top-0 start-0 object-cover rounded-lg"
                    src="/images/white_water_rafting.png?height=220&width=320"
                    alt="Blog Image"
                  />
                </div>
              </Link>
              {/* End Media */}
              {/* Media */}
              <Link
                className="group flex items-center gap-x-6 focus:outline-none"
                href="/blog/4"
              >
                <div className="grow">
                  <span className="text-base font-medium text-absluteDark font-bricolage group-hover:text-brightGreen group-focus:text-brightGreen ">
                    Spice of Life: A Culinary Journey Through Goan Cuisine
                  </span>
                </div>
                <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                  <Image
                    width={600}
                    height={600}
                    className="size-full absolute top-0 start-0 object-cover rounded-lg"
                    src="/images/Fish-curry.jpg?height=220&width=320"
                    alt="Blog Image"
                  />
                </div>
              </Link>
              {/* End Media */}
            </div>
          </div>
        </div>
        {/* End Sidebar */}
      </div>
    </div>
  );
}
