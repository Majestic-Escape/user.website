"use client";

import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Info, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();
  const [queryData, setQueryData] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) setIsAuth(true);
  };
  const router = useRouter();

  // Push a fake entry into history so back button fires popstate

  useEffect(() => {
    auth();
  }, []);

  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    const bookingHistory = searchParams.get("bookingHistory")
      ? searchParams.get("bookingHistory")
      : null;
    // Add a fake history entry so back button doesn't leave the page
    if (bookingHistory && bookingHistory != "true") {
      window.history.pushState({ preventBack: true }, "");

      const handlePopState = (event) => {
        // Instead of going back, redirect where you want
        router.replace(`/stay/${propertyId}`);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  function parseDateSafe(value) {
    if (!value) return null;

    // If it's an integer (epoch ms)
    if (/^\d+$/.test(value)) {
      return new Date(Number(value));
    }

    // If it's an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }

    // If it's just YYYY-MM-DD (date only, no time)
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }

    // ✅ Handle MM/DD/YYYY (like your case)
    const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
    if (usMatch) {
      const [, m, d, y] = usMatch;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }

    return null; // Fallback
  }

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    const propertyId = searchParams.get("propertyId");
    const propertyName = searchParams.get("propertyName");
    const propertyImage = searchParams.get("propertyImage");
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const numberOfGuests = searchParams.get("numberOfGuests");
    const totalAmount = searchParams.get("totalAmount");
    const nights = searchParams.get("nights");
    const street = searchParams.get("street");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const country = searchParams.get("country");
    const hostFirstName = searchParams.get("hostFirstName");
    const hostLastName = searchParams.get("hostLastName");
    const propertyType = searchParams.get("propertyType");
    const placeType = searchParams.get("placeType");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const infants = searchParams.get("infants");
    const checkinTime = searchParams.get("checkinTime");
    const checkoutTime = searchParams.get("checkoutTime");
    const instant = searchParams.get("instant");
    setQueryData({
      bookingId,
      propertyId,
      propertyName,
      propertyImage,
      checkin,
      checkout,
      numberOfGuests,
      totalAmount,
      nights,
      street,
      city,
      state,
      country,
      hostFirstName,
      hostLastName,
      propertyType,
      placeType,
      adults,
      children,
      infants,
      checkinTime,
      checkoutTime,
      instant,
    });
  }, [searchParams]);

  if (!queryData)
    return (
      <div className="min-h-screen font-poppins pt-24">
        <p>Loading...</p>
      </div>
    );

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You are not authorized to access this page. &nbsp;{" "}
        <Link href="/login">
          <u>
            <b>Click Here</b>
          </u>
        </Link>
        &nbsp; to log in now to access.
      </div>
    );
  }

  const checkInDate = parseDateSafe(queryData?.checkin);
  const checkOutDate = parseDateSafe(queryData?.checkout);
  // console.log("logiteh", propertyImage);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const changeTime = (num) => {
    return `${Number(num) - 12} p.m.`;
  };
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="min-h-screen font-poppins pt-24">
      <header className="flow-root bg-offWhite shadow-sm">
        <div className=" max-w-7xl mx-auto py-4 ml-10 sm:px-6 lg:px-8">
          <div className="text-center">
            {queryData?.instant == "true" ? (
              <h2 className="flex justify-center text-3xl pb-2 font-semibold font-bricolage text-absoluteDark mt-4">
                Your reservation is confirmed
              </h2>
            ) : (
              <h2 className="flex justify-center text-3xl pb-2 font-semibold font-bricolage text-absoluteDark mt-4">
                Wait for host email for confirmation
              </h2>
            )}
            {/* <p className="text-gray-600">You're going to San Francisco!</p> */}
            <p className="flex justify-center text-gray-600 ">
              Thanks for choosing Us
            </p>
          </div>
        </div>
        {/* <div className="float-right max-w-7xl mx-auto py-4 mr-10 sm:px-6 lg:px-8">
          <Link
            href={{
              pathname: "/",  
            }}
          >
            <Button className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium">
              Go Back Home
            </Button>
          </Link>
        </div> */}
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-xl p-4 shadow-lg">
              <div>
                <Image
                  src={`https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/${queryData?.propertyImage}`}
                  alt="Property Image"
                  width={600}
                  height={400}
                  className="rounded-xl"
                />
                <h3 className="mt-4 text-lg font-medium"></h3>
                <p className="text-gray-600 text-sm">
                  {queryData?.placeType.charAt(0).toUpperCase() +
                    queryData?.placeType.slice(1)}{" "}
                  {queryData?.propertyType.charAt(0).toUpperCase() +
                    queryData?.propertyType.slice(1)}{" "}
                  by {queryData?.hostFirstName} {queryData?.hostLastName}
                </p>

                <div className="mt-4 text-sm"></div>

                <button
                  className="mt-4 w-full bg-primaryGreen hover:bg-brightGreen text-white py-2 rounded-full"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {" "}
                    <p>
                      {/* {days[checkInDate?.getDay()]},{" "}
                      <strong>
                        {months[checkInDate?.getMonth()]}{" "}
                        {checkInDate?.getDate()}, {checkInDate?.getFullYear()}
                      </strong>
                      <br /> */}
                      <strong>{fmt.format(checkInDate)}</strong>
                      <br />
                      Check-in :{" "}
                      {queryData?.checkinTime > 12
                        ? changeTime(queryData?.checkinTime)
                        : `${queryData?.checkinTime} a.m.`}
                    </p>
                  </div>
                  <div>
                    <p>
                      {/* {days[checkOutDate?.getDay()]},{" "}
                      <strong>
                        {months[checkOutDate?.getMonth()]}{" "}
                        {checkOutDate?.getDate()}, {checkOutDate?.getFullYear()}
                      </strong>
                      <br /> */}
                      <strong>{fmt.format(checkOutDate)}</strong>
                      <br />
                      Check-out :{" "}
                      {queryData?.checkoutTime > 12
                        ? changeTime(queryData?.checkoutTime)
                        : `${queryData?.checkoutTime} a.m.`}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Total Nights</h4>
                    <p className="text-gray-500">{queryData?.nights}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Total Guests</h4>
                    <p className="text-gray-500">{queryData?.numberOfGuests}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Adults</h4>
                    <p className="text-gray-500">{queryData?.adults}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Children</h4>
                    <p className="text-gray-500">{queryData?.children}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Infants</h4>
                    <p className="text-gray-500">{queryData?.infants}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Booking Id</h4>
                    <p className="text-gray-500">{queryData?.bookingId}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Total Amount</h4>
                  <p className="text-gray-500">₹{queryData?.totalAmount}.00</p>
                </div>

                <button className="w-full border border-gray-300 py-2 rounded-lg">
                  Change reservation
                </button>
                <div>
                  <h4 className="font-medium text-gray-700">
                    Property Address
                  </h4>
                  <p className="text-gray-500">
                    {queryData?.street}, {queryData?.city}, {queryData?.state},{" "}
                    {queryData?.country}
                  </p>
                  {/* <button className="text-red-400 text-xs mt-1">
                    Get directions
                  </button> */}
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">
                    {queryData?.hostFirstName} {queryData?.hostLastName} is your
                    host
                  </h4>
                  <p className="text-gray-500">
                    Contact {queryData?.hostFirstName} {queryData?.hostLastName}{" "}
                    to coordinate arrival time and key exchange.
                  </p>
                  {/* <button className="text-red-400 text-xs mt-1">
                    Message Host
                  </button> */}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">
                    Know what to expect
                  </h4>
                  <p className="text-gray-500">
                    Make sure to review the house rules and amenities.
                  </p>
                  <button className="text-red-400 text-xs mt-1">
                    View House Rules
                  </button>
                </div>

                <div>
                  {/* <h4 className="font-medium text-gray-700">
                    Customer support
                  </h4>
                  <p className="text-gray-500">
                    Contact our support team 24/7 from anywhere in the world.
                  </p> */}
                  <div className="flex gap-2 mt-1">
                    {/* <button className="text-red-400 text-xs">
                    Visit Help Centre
                  </button>
                  <button className="text-red-400 text-xs">
                    Contact Airbnb
                  </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-semibold text-primary">
                  Contact Us
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  If you have any questions about our Cancellation Policy,
                  please contact us.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2">
                      <a
                        className="underline"
                        href="mailto:support@majesticescape.in"
                      >
                        support@majesticescape.in
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
