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
                Spice of Life: A Culinary Journey Through Goan Cuisine
              </h2>
              <div className="flex items-center gap-x-5">
                <a
                  className="inline-flex items-center gap-1.5 py-1 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200   "
                  href="#"
                >
                  Food & Travel
                </a>
                <p className="text-xs sm:text-sm text-gray-800 ">
                  November 21, 2024
                </p>
              </div>
              <p className="text-lg text-gray-800 ">
                Goa is more than its stunning beaches and vibrant
                nightlife—it&apos;s a haven for food enthusiasts. The state’s
                unique culinary heritage is a rich blend of Portuguese, Indian,
                and local Konkani flavors, making it a paradise for those
                seeking a flavorful adventure.
              </p>
              <p className="text-lg text-gray-800 ">
                From spicy curries to fresh seafood, Goan cuisine captures the
                essence of its cultural diversity and coastal abundance. Every
                dish tells a story, offering a sensory experience unlike any
                other.
              </p>
              <div className="text-center">
                <div className="grid lg:grid-cols-2 gap-3">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/4/food-1.jpg"
                        alt="Traditional Goan Fish Curry"
                      />
                    </figure>
                    <figure className="relative w-full h-60">
                      <Image
                        width={600}
                        height={600}
                        className="size-full absolute top-0 start-0 object-cover rounded-xl"
                        src="/images/blog/4/food-4.jpg"
                        alt="Goan Spices and Ingredients"
                      />
                    </figure>
                  </div>
                  <figure className="relative w-full h-72 sm:h-96 lg:h-full">
                    <Image
                      width={600}
                      height={600}
                      className="size-full absolute top-0 start-0 object-cover rounded-xl"
                      src="/images/blog/4/food-2.webp"
                      alt="Goan Seafood Platter"
                    />
                  </figure>
                </div>
                <span className="mt-3 block text-sm text-center text-gray-500 ">
                  Vibrant Goan Flavors: A Feast for the Senses
                </span>
              </div>
              <p className="text-lg text-gray-800 ">
                The star of Goan cuisine is undoubtedly its seafood. Delicacies
                like prawn balchão, recheado mackerel, and the iconic Goan fish
                curry are a must-try. These dishes are elevated with the use of
                coconut, kokum, and fiery spices.
              </p>
              <p className="text-lg text-gray-800 ">
                Goa’s vibrant culinary palette also includes vegetarian delights
                such as sol kadhi, a tangy kokum-based drink, and sannas, fluffy
                rice cakes often paired with curries.
              </p>
              <blockquote className="text-center p-4 sm:px-7">
                <p className="text-xl font-medium text-gray-800 lg:text-2xl lg:leading-normal xl:text-2xl xl:leading-normal ">
                  “Goan food is not just a meal; it’s a celebration of the
                  region’s soul, culture, and history.”
                </p>
                <p className="mt-5 text-gray-800 ">Chef Marcus Fernandes</p>
              </blockquote>
              <figure>
                <Image
                  width={600}
                  height={600}
                  className="w-full object-cover rounded-xl"
                  src="/images/blog/4/food-3.jpg"
                  alt="Spices and Ingredients"
                />
                <figcaption className="mt-3 text-sm text-center text-gray-500 ">
                  The essential spices of Goan cooking
                </figcaption>
              </figure>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold ">
                  Beyond the Kitchen: Exploring Goa Through Food
                </h3>
                <p className="text-lg text-gray-800 ">
                  Goa’s bustling markets and vibrant festivals are the perfect
                  places to dive into its food culture. Local feasts like the
                  Sao Joao Festival showcase the importance of food in bringing
                  communities together.
                </p>
              </div>
              <ul className="list-disc list-outside space-y-5 ps-5 text-lg text-gray-800 ">
                <li className="ps-2">
                  Popular desserts like bebinca and dodol offer a sweet ending
                  to any meal.
                </li>
                <li className="ps-2">
                  Don’t miss a chance to sip on the local cashew-based drink,
                  feni, a true Goan specialty.
                </li>
              </ul>
              <p className="text-lg text-gray-800 ">
                Whether you’re a seasoned traveler or a first-time visitor,
                exploring Goan cuisine is an unforgettable journey into the
                heart of this coastal paradise.
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
                    Food
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
                    Culture
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
                href="/blog/1"
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
            </div>
          </div>
        </div>
        {/* End Sidebar */}
      </div>
    </div>
  );
}
