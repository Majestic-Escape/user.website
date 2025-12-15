/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ChevronLeft,
  Star,
  Trophy,
  Calendar,
  Percent,
  Shield,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function HostMembershipPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [membershipDetails, setMembershipDetails] = useState<any>(null);

  useEffect(() => {
    // Simulating API call to fetch membership details
    setTimeout(() => {
      setMembershipDetails({
        id: "host-premium-membership",
        name: "Host Membership",
        price: 99,
        regularPrice: 999,
        benefits: [
          "0% commission for 3 months",
          "Priority listing in search results",
          "Dedicated host support",
          "Professional photography services",
          "Free listing optimization",
        ],
        testimonials: [
          {
            name: "Priya Sharma",
            location: "Mumbai",
            rating: 4.9,
            text: "Joining as a host was the best decision. The 0% commission period helped me establish my property!",
            image: "/placeholder.svg?height=56&width=56",
          },
          {
            name: "Rahul Verma",
            location: "Goa",
            rating: 5.0,
            text: "My beach villa gets consistent bookings thanks to the priority listing feature.",
            image: "/placeholder.svg?height=56&width=56",
          },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handlePayment = () => {
    if (typeof window.Razorpay === "undefined") {
      console.error("Razorpay SDK is not loaded");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, //"rzp_test_w0bKE5w5UPOPrY",
      amount: membershipDetails.price * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "Majestic Escape",
      description: "Host Membership Subscription",
      image: "/logo.png",
      handler: (response: any) => {
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log(response);
        }
        // Redirect to success page
        const successParams = new URLSearchParams({
          memberId: response.razorpay_payment_id,
          plan: "premium-host",
          activationDate: new Date().toISOString(),
        });
        router.push(`/host/dashboard`);
      },
      prefill: {
        name: "Host Name",
        email: "host@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#36621f", // Majestic Escape green
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (isLoading) {
    return <MembershipPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Image
            src="/logo.png?height=40&width=40"
            alt="Majestic Escape Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-[#36621f] font-semibold text-xl">
            Majestic Escape
          </span>
        </div>
        <Button
          variant="ghost"
          className="text-[#36621f]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <div className="inline-block bg-[#e8f0e3] text-[#36621f] px-4 py-1 rounded-full text-sm font-medium mb-4">
          Exclusive Offer
        </div>
        <h1 className="text-4xl md:text-4xl font-bricolage font-semibold mb-4 text-[#36621f]">
          Become a Majestic Escape Host
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join our community of exceptional hosts and start earning with your
          property
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Card className="border-2 border-[#e8f0e3] overflow-hidden">
            <div className="bg-[#36621f] text-white py-6 px-6 text-center">
              <div className="text-2xl font-bold mb-1">
                Special Launch Offer
              </div>
              <div className="text-[#e8f0e3]">Limited time only</div>
            </div>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold">
                    ₹{membershipDetails.price}
                  </span>
                  <span className="text-gray-500 line-through ml-2">
                    ₹{membershipDetails.regularPrice}
                  </span>
                </div>
                <p className="text-lg font-normal text-gray-600">
                  Host Membership
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-[#f8faf6] p-4 rounded-lg border border-[#e8f0e3] flex items-center">
                  <div className="bg-[#36621f] rounded-full p-2 mr-4">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#36621f]">3 Months Free</h3>
                    <p className="text-sm text-gray-600">
                      Get started with zero risk
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8faf6] p-4 rounded-lg border border-[#e8f0e3] flex items-center">
                  <div className="bg-[#36621f] rounded-full p-2 mr-4">
                    <Percent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#36621f]">0% Commission</h3>
                    <p className="text-sm text-gray-600">
                      Keep 100% of your earnings for 3 months
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8faf6] p-4 rounded-lg border border-[#e8f0e3] flex items-center">
                  <div className="bg-[#36621f] rounded-full p-2 mr-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#36621f]">
                      Instant Activation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Start hosting immediately after payment
                    </p>
                  </div>
                </div>

                <div className="bg-[#f8faf6] p-4 rounded-lg border border-[#e8f0e3] flex items-center">
                  <div className="bg-[#36621f] rounded-full p-2 mr-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#36621f]">
                      Host Protection
                    </h3>
                    <p className="text-sm text-gray-600">
                      Property damage protection included
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-3 text-gray-800">
                  All benefits include:
                </h3>
                <ul className="space-y-2">
                  {membershipDetails.benefits.map(
                    (benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 mr-2 text-[#36621f] flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                onClick={handlePayment}
                className="w-full h-14 text-lg bg-[#36621f] hover:bg-[#2a4d18] text-white"
              >
                Join for ₹{membershipDetails.price} only
              </Button>
              <p className="text-xs text-center mt-4 text-gray-500">
                After 3 months, standard commission rates will apply. You can
                cancel anytime.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#36621f]">
              Why Host with Majestic Escape?
            </h2>
            <div className="grid gap-6">
              <div className="flex">
                <div className="mr-4  p-2">
                  <Check className="h-5 w-5 text-[#36621f]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reach More Travelers</h3>
                  <p className="text-gray-600">
                    Connect with thousands of travelers looking for unique stays
                    across India.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4  p-2">
                  <Check className="h-5 w-5 text-[#36621f]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Management</h3>
                  <p className="text-gray-600">
                    Our host dashboard makes it simple to manage bookings,
                    availability, and payments.
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="mr-4  p-2">
                  <Check className="h-5 w-5 text-[#36621f]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Support</h3>
                  <p className="text-gray-600">
                    Dedicated host support team available around the clock to
                    help you succeed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <div>
            <h2 className="text-2xl font-bold mb-6 text-[#36621f]">Hear from our Hosts</h2>
            <div className="space-y-4">
              {membershipDetails.testimonials.map((testimonial: any, index: number) => (
                <Card key={index} className="border border-[#e8f0e3]">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="text-sm ml-1">{testimonial.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}

          <div className="bg-[#f8faf6] p-6 rounded-lg border border-[#e8f0e3]">
            <h3 className="font-bold text-lg mb-2 text-[#36621f]">
              Ready to start hosting?
            </h3>
            <p className="mb-4 text-gray-600">
              Join today and take advantage of our exclusive offer. Limited
              spots available at this special price.
            </p>
            <Button
              onClick={handlePayment}
              className="bg-[#36621f] hover:bg-[#2a4d18] text-white"
            >
              Become a Host Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembershipPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-10 w-32 mb-6" />
      <Skeleton className="h-12 w-64 mx-auto mb-4" />
      <Skeleton className="h-8 w-96 mx-auto mb-12" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
