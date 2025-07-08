import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function BlogPost() {
  return (
    <div className="max-w-[85rem] py-24 font-publicSans px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="grid lg:grid-cols-3 gap-y-8 lg:gap-y-0 lg:gap-x-6">
        {/* Content */}
        <div className="lg:col-span-2">
          <div className="py-8 lg:pe-8">
            <div className="space-y-5 lg:space-y-8">
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
                Exploring Sada Fort: Goa&apos;s Overlooked Coastal Gem
              </h2>
              <div className="flex items-center gap-x-5">
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200   "
                  href="#"
                >
                  Travel Exploration
                </a>
                <p className="text-xs sm:text-sm text-gray-800 ">
                  November 21, 2024
                </p>
              </div>
              <p className="text-lg text-gray-800 ">
                Nestled along the northern coastline of Goa, Sada Fort stands as a hidden historical treasure, often overlooked by mainstream tourism. This remarkable fortress offers a unique glimpse into the region&apos;s complex colonial past and strategic maritime importance.
              </p>
              <p className="text-lg text-gray-800 ">
                Located in the Sawantwadi taluka of Sindhudurg district, Sada Fort represents a fascinating intersection of Portuguese colonial architecture and indigenous defensive strategies.
              </p>
              <div className="text-center">
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/1/sada-fort-3.jpg"
                        alt="Sada Fort Landscape"
                      />
                    </figure>
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/1/sada-fort-2.jpg"
                        alt="Coastal Fortification"
                      />
                    </figure>
                  </div>
                  <figure className="relative w-full h-72 sm:h-96 lg:h-full">
                    <Image
                      width={600}
                      height={600}
                      className="size-full absolute top-0 start-0 object-cover rounded-xl"
                      src="/images/blog/1/sada-fort-1.png"
                      alt="Historical Fort View"
                    />
                  </figure>
                </div>
                <span className="mt-3 block text-sm text-center text-gray-500 ">
                  Sada Fort&apos;s Architectural Panorama
                </span>
              </div>
              <p className="text-lg text-gray-800 ">
                The fort&apos;s strategic location allowed Portuguese colonizers to monitor maritime trade routes and defend against potential invasions. Its unique architectural design blends European defensive techniques with local building methods, creating a remarkable testament to cultural exchange.
              </p>
              <p className="text-lg text-gray-800 ">
                While many travelers focus on Goa&apos;s beaches and more famous Portuguese forts, Sada offers a more intimate and authentic historical experience. The surrounding landscape, with its lush vegetation and dramatic coastal views, adds to the fort&apos;s compelling narrative.
              </p>
              <blockquote className="text-center p-4 sm:px-7">
                <p className="text-xl font-medium text-gray-800 lg:text-2xl lg:leading-normal xl:text-2xl xl:leading-normal ">
                  Sada Fort whispers stories of colonial resilience, standing as a silent guardian of Goa&apos;s multilayered history.
                </p>
                <p className="mt-5 text-gray-800 ">
                  Local Historian, Maria Santos
                </p>
              </blockquote>
              <figure>
                <Image
                  width={600}
                  height={600}
                  className="w-full object-cover rounded-xl"
                  src="/images/blog/1/sada-fort-4.jpg"
                  alt="Sada Fort Archaeological Details"
                />
                <figcaption className="mt-3 text-sm text-center text-gray-500 ">
                  Intricate stonework at Sada Fort
                </figcaption>
              </figure>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold ">
                  Preserving a Hidden Heritage
                </h3>
                <p className="text-lg text-gray-800 ">
                  Conservation efforts are crucial for maintaining Sada Fort&apos;s structural integrity. Local archaeological departments and heritage organizations work diligently to protect this historical site, ensuring that future generations can appreciate its significance.
                </p>
              </div>
              <ul className="list-disc list-outside space-y-5 ps-5 text-lg text-gray-800 ">
                <li className="ps-2">
                  &quot;Sada Fort represents more than just stone and mortar; it&apos;s a living museum of cultural intersections,&quot; says Dr. Rajesh Patkar, Archaeological Survey of India.
                </li>
                <li className="ps-2">
                  The fort&apos;s unique positioning offers unparalleled views of the Arabian Sea, making it a photographer&apos;s and history enthusiast&apos;s dream destination.
                </li>
              </ul>
              <p className="text-lg text-gray-800 ">
                For travelers seeking to move beyond typical tourist experiences, Sada Fort offers an immersive journey into Goa&apos;s rich and complex historical tapestry. Its relatively untouched state provides an authentic glimpse into the region&apos;s colonial past.
              </p>
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
                  <button
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
                  </button>
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
                November Nooks: Hidden Gems to Explore in Goa Before Winter
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
                Waves and Wheels: Goa&apos;s Best Water Sports and Bike Tours
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
