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

export default function Page() {
  const searchParams = useSearchParams();
  const [queryData, setQueryData] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) setIsAuth(true);
  };

  useEffect(() => {
    auth();
  }, []);

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
  return (
    <div className="min-h-screen font-poppins pt-24">
      <header className="flow-root bg-offWhite shadow-sm">
        <div className=" float-left max-w-7xl mx-auto py-4 ml-10 sm:px-6 lg:px-8">
          <h1 className=" text-3xl font-semibold font-bricolage text-absoluteDark">
            Thanks for choosing Us
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Last updated: June 1, 2024
          </p>
        </div>
        <div className="float-right max-w-7xl mx-auto py-4 mr-10 sm:px-6 lg:px-8">
          <Link
            href={{
              pathname: "/",
            }}
          >
            <Button className="w-full flex justify-center items-center text-center py-3 px bg-primaryGreen text-base font-bricolage hover:bg-brightGreen text-white h-10 rounded-lg font-medium">
              Go Back Home
            </Button>
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-semibold text-primary">
                  Booking Details
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Booking Id
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {queryData.bookingId}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Property Id
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {queryData.propertyId}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Property Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {queryData.propertyName}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {queryData.checkin} - {queryData.checkout}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Total Amount
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ₹ {queryData.totalAmount}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
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
                        href="mailto:info@majesticescape.in"
                      >
                        info@majesticescape.in
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
