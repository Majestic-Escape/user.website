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
                className="inline-flex items-center gap-x-1.5 text-sm text-gray-600 decoration-2 hover:underline focus:outline-none focus:underline"
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
                How to Plan a Budget Trip Without Compromising Comfort
              </h1>
              <div className="flex items-center gap-x-5">
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                  href="#"
                >
                  Travel Inspiration
                </a>
                <p className="text-xs sm:text-sm text-gray-800">
                  November 21, 2024
                </p>
              </div>
              <p className="text-lg text-gray-800">
                A budget trip doesn’t require sacrificing comfort. With the
                right choices, you can enjoy a smooth, relaxing getaway at a
                reasonable cost. Here’s a clear, practical guide to planning a
                comfortable trip on a budget.
              </p>
              <div className="text-center">
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/2/beach-1.webp"
                        alt="Cola Beach Lagoon"
                      />
                    </figure>
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/2/beach-2.jpg"
                        alt="Divar Island Scenery"
                      />
                    </figure>
                  </div>
                  <figure className="relative w-full h-72 sm:h-96 lg:h-full">
                    <Image
                      width={600}
                      height={600}
                      className="size-full absolute top-0 start-0 object-cover rounded-xl"
                      src="/images/blog/2/beach-3.jpg"
                      alt="Dudhsagar Falls"
                    />
                  </figure>
                </div>
                <span className="mt-3 block text-sm text-center text-gray-500">
                  {/* Hidden gems: Cola Beach, Divar Island, and Dudhsagar Falls */}
                </span>
              </div>
              <p className="text-lg text-gray-800">
                <b>Choose Value-Driven</b> : Stays Look for vacation rentals,
                homestays, and short-term stays that offer strong amenities at
                low prices. Filter by reviews, cleanliness, and essentials like
                WiFi and AC. Many affordable stays deliver hotel-level comfort
                without premium rates.
              </p>
              <p className="text-lg text-gray-800">
                <b>Travel in Off-Peak Seasons</b> Airfares, stays, and
                activities cost far less outside peak periods. Off-season travel
                gives you quieter destinations, better availability, and
                high-quality stays at discounted rates.
              </p>
              <blockquote className="text-center p-4 sm:px-7">
                {/* <p className="text-xl font-medium text-gray-800 lg:text-2xl lg:leading-normal xl:text-2xl xl:leading-normal">
                  &quot;Goa’s hidden nooks are the heart of its charm, where
                  every traveler finds a story waiting to be told.&quot;
                </p>
                <p className="mt-5 text-gray-800">
                  - Ananya Desai, Travel Blogger
                </p> */}
              </blockquote>
              <figure>
                <Image
                  width={600}
                  height={600}
                  className="w-full object-cover rounded-xl"
                  src="/images/img1.png"
                  alt="Chorao Bird Sanctuary"
                />
                <figcaption className="mt-3 text-sm text-center text-gray-500">
                  {/* Wildlife wonders at Chorao Island Bird Sanctuary */}
                </figcaption>
              </figure>
              <p className="text-lg text-gray-800">
                <b>Select the Right Location</b>: Staying slightly away from
                hotspots reduces costs while maintaining access and comfort.
                Search for budget-friendly homes, private rooms, or villas near
                major attractions instead of inside them.
              </p>
              <div className="space-y-3">
                {/* <h3 className="text-2xl font-semibold">
                  Tips for November Explorers
                </h3> */}
                <p className="text-lg text-gray-800">
                  <b>Prioritize Low-Cost, High-Value Activities:</b> Skip
                  overpriced attractions. Choose walking trails, public
                  viewpoints, local markets, and free cultural experiences. Many
                  of these offer better immersion at nearly zero cost.
                </p>
              </div>
              <p className="text-lg text-gray-800">
                <b>Select the Right Location</b>: Staying slightly away from
                hotspots reduces costs while maintaining access and comfort.
                Search for budget-friendly homes, private rooms, or villas near
                major attractions instead of inside them.
              </p>
              <p className="text-lg text-gray-800">
                <b>Use Price Tracking Tools</b>: Set alerts for flights and
                stays. Flexible travel dates often unlock lower prices without
                affecting comfort.
              </p>
              <p className="text-lg text-gray-800">
                <b> Compare Amenities Before Booking</b>: Comfort comes from
                clarity. Check amenity lists, guest photos, and verified reviews
                to avoid surprises. Prioritize factors like hygiene, mattress
                quality, and noise levels. A budget trip becomes easy when you
                focus on smart timing, strategic locations, and high-value
                stays. Start exploring affordable rentals and plan your next
                comfortable getaway without stretching your budget.
              </p>
              {/* <ul className="list-disc list-outside space-y-5 ps-5 text-lg text-gray-800">
                <li className="ps-2">
                  Relish authentic Goan cuisine in small village restaurants to
                  complete your cultural journey.
                </li>
                <li className="ps-2">
                  Support local guides and conservation efforts wherever
                  possible.
                </li>
              </ul> */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-y-5 lg:gap-y-0">
                <div>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                    href="#"
                  >
                    Goa
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                    href="#"
                  >
                    Hidden Gems
                  </a>
                  <a
                    className="m-0.5 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
                    href="#"
                  >
                    Travel Tips
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
                href="/blog/top-5-reasons-why-homestays-are-better-than-hotels"
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
                href="/blog/how-to-choose-the-perfect-homestay-for-your-family-trip"
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
                href="/blog/spice-of-life-a-culinary-journey-through-goan-cuisine"
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
