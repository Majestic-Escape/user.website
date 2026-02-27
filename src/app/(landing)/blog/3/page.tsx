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
              <h1 className="text-3xl font-semibold lg:text-5xl text-absoluteDark font-bricolage">
                How to Choose the Perfect Homestay for Your Family Trip
              </h1>
              <div className="flex items-center gap-x-5">
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 "
                  href="#"
                >
                  Adventure Awaits
                </a>
                <p className="text-xs sm:text-sm text-gray-800 ">
                  November 21, 2024
                </p>
              </div>
              <p className="text-lg text-gray-800 ">
                Choosing the right homestay can define the comfort, safety, and
                overall experience of your family vacation. With so many options
                available, it’s important to focus on factors that ensure
                convenience, space, and a stress-free stay. Here’s a clear,
                practical guide to help you pick the perfect homestay for your
                next family trip.
              </p>
              <p className="text-lg text-gray-800 ">
                <b>Check the Space and Room Layout :</b> Families need more than
                just beds. Look for homestays with multiple rooms, larger common
                areas, and enough space for kids to move comfortably. Ensure the
                photos match the listed room sizes and layout.
              </p>
              <div className="text-center">
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/3/water-sports-1.jpg"
                        alt="Parasailing adventure in Goa"
                      />
                    </figure>
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/3/water-sports-2.jpg"
                        alt="Scenic coastal bike trail"
                      />
                    </figure>
                  </div>
                  <figure className="relative w-full h-72 sm:h-96 lg:h-full">
                    <Image
                      width={600}
                      height={600}
                      className="size-full absolute top-0 start-0 object-cover rounded-xl"
                      src="/images/blog/3/water-sports-3.jpg"
                      alt="Jet skiing in Goa"
                    />
                  </figure>
                </div>
                <span className="mt-3 block text-sm text-center text-gray-500 ">
                  {/* Thrill-seekers’ paradise: Water sports and bike tours in Goa */}
                </span>
              </div>
              {/* <h3 className="text-2xl font-semibold">
                Water Sports Highlights
              </h3> */}
              <p className="text-lg text-gray-800 ">
                <b>Prioritize Safety :</b>
                Features Safety should be non-negotiable. Choose properties with
                secure entrances, proper lighting, child-friendly furniture, and
                reliable neighbourhoods. Read recent reviews to confirm the host
                maintains safety standards.
              </p>
              <p className="text-lg text-gray-800 ">
                <b>Look for Family-Friendly Amenities :</b> Essential amenities
                make a big difference. Prioritize WiFi, clean bathrooms, AC or
                heating, kitchens, washing machines, and parking. If you’re
                travelling with infants or seniors, check for extra features
                like ground-floor rooms, cribs, or easy access.
              </p>

              {/* <ul className="list-disc list-outside space-y-5 ps-5 text-lg text-gray-800 ">
                <li className="ps-2">
                  **Jet Skiing**: Zoom across the waves on a high-speed jet ski,
                  a must-try for adrenaline junkies.
                </li>
                <li className="ps-2">
                  **Scuba Diving**: Discover underwater treasures and vibrant
                  marine life in spots like Grande Island.
                </li>
                <li className="ps-2">
                  **Parasailing**: Enjoy panoramic views of Goa&apos;s coastline
                  as you soar high above the water.
                </li>
              </ul> */}
              {/* <blockquote className="text-center p-4 sm:px-7">
                <p className="text-xl font-medium text-gray-800 lg:text-2xl lg:leading-normal xl:text-2xl xl:leading-normal ">
                  &quot;Nothing compares to the thrill of parasailing with the
                  wind in your face and the sea beneath you.&quot;
                </p>
                <p className="mt-5 text-gray-800 ">
                  - Maria D&apos;Souza, Local Guide
                </p>
              </blockquote>
              <h3 className="text-2xl font-semibold">
                Exploring Goa on Two Wheels
              </h3>
              <p className="text-lg text-gray-800 ">
                Goa&apos;s bike tours are equally exhilarating, offering a
                chance to explore lush greenery, quaint villages, and stunning
                beaches. Popular routes include the Vagator-Chapora stretch and
                the scenic ride to Palolem.
              </p> */}
              <figure>
                <Image
                  width={600}
                  height={600}
                  className="w-full object-cover rounded-xl"
                  src="/images/white_water_rafting.png"
                  alt="Biking through Goan countryside"
                />
                <figcaption className="mt-3 text-sm text-center text-gray-500 ">
                  {/* Uncover Goa&apos;s beauty with bike tours */}
                </figcaption>
              </figure>
              <p className="text-lg text-gray-800 ">
                <b>Review the Host’s Ratings and Responsiveness :</b> A good
                host ensures a smooth stay. Choose homestays with high ratings,
                consistent positive reviews, and hosts known for quick replies.
                Responsive hosts help with early check-ins, local tips, and
                faster issue resolution.
              </p>
              <p className="text-lg text-gray-800 ">
                <b>Check the Location Carefully :</b> Pick a neighbourhood close
                to key attractions, restaurants, and medical facilities. For
                family trips, convenience is more important than staying in
                crowded hotspots. Search for homestays in safe, accessible areas
                with good transport options.
              </p>
              <p className="text-lg text-gray-800 ">
                <b>Browse Real Guest Photos :</b>
                Guest photos reveal the actual condition of the property. They
                show cleanliness, furnishing quality, and how well the homestay
                is maintained—without filters or wide-angle tricks.
              </p>
              <p className="text-lg text-gray-800 ">
                <b>Understand the Policies :</b>
                Check cancellation rules, extra guest charges, house rules, and
                check-in timings. Clear policies help avoid surprises and keep
                your family’s schedule smooth. Choosing the right homestay
                becomes easy when you focus on space, safety, amenities, and
                trustworthy hosts. Start exploring well-reviewed homestays to
                find the perfect fit for your family getaway.
              </p>

              {/* <div className="space-y-3">
                <h3 className="text-2xl font-semibold ">
                  Tips for Adventure Enthusiasts
                </h3>
                <p className="text-lg text-gray-800 ">
                  Before setting out on your adventure, remember to:
                </p>
                <ul className="list-disc list-outside space-y-5 ps-5 text-lg text-gray-800 ">
                  <li className="ps-2">
                    Wear appropriate safety gear for water sports and biking.
                  </li>
                  <li className="ps-2">
                    Stay hydrated and apply sunscreen to protect against the
                    tropical sun.
                  </li>
                  <li className="ps-2">
                    Respect local guidelines and the environment.
                  </li>
                </ul>
              </div> */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-y-5 lg:gap-y-0">
                <div>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 "
                    href="#"
                  >
                    Water Sports
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 "
                    href="#"
                  >
                    Adventure
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 "
                    href="#"
                  >
                    Bike Tours
                  </a>
                </div>
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
                    Top 5 Reasons Why Homestays Are Better Than Hotels
                  </span>
                </div>
                <div className="shrink-0 relative rounded-lg overflow-hidden size-20">
                  <Image
                    width={600}
                    height={600}
                    className="size-full absolute top-0 start-0 object-cover rounded-lg"
                    src="/images/sada-fort-karnataka.png?height=220&width=320"
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
