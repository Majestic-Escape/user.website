/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Briefcase,
  Globe,
  MapPin,
  Shield,
  Star,
  ShieldCheck,
  Clock,
  MessageCircle,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

// Simple Skeleton component (assuming it might be used elsewhere too)
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Skeleton loading state component for HostProfile
export function HostProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left Column - Host Card Skeleton */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 text-center">
              <div className="relative mx-auto mb-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              </div>
              <Skeleton className="h-6 w-24 mx-auto mb-1" />
              <Skeleton className="h-4 w-32 mx-auto mb-4" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-14 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-14 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-5 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-14 mx-auto" />
                </div>
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </Card>
          <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        </div>
        {/* Right Column - Host Details Skeleton */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-32 mt-2" />
          </Card>
        </div>
      </div>
      <div className="mt-4 text-center">
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <Skeleton className="w-3 h-3 mr-2 rounded-full" />
          <Skeleton className="h-3 flex-1" />
        </div>
      </div>
    </div>
  );
}

// Main HostProfile component - now receives data as props
export default function HostProfile({ hostData, isLoading, error }) {
  if (isLoading) {
    return <HostProfileSkeleton />;
  }

  if (error) {
    // You might want to pass the error object to display a more specific message
    return (
      <div className="text-center text-red-500 py-10">
        Error loading host data. Please try again later.
      </div>
    );
  }

  // If not loading and no error, but hostData is somehow null/undefined (shouldn't happen with RQ enabled flag, but good practice)
  if (!hostData) {
    return (
      <div className="text-center text-gray-500 py-10">
        Host data not available.
      </div>
    );
  }
  function calculateAge(birthDate) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  }
  // --- Render the actual profile using hostData ---
  return (
    <>
      <div className="max-w-7xl mx-auto py-2 md:py-8 px-4 sm:px-6 md:px-0">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 font-bricolage mb-6">
          Meet your host
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
          {/* Left Column - Host Card */}
          <div className="space-y-4">
            <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
              <div className="p-6 text-center">
                <div className="relative mx-auto mb-4">
                  <div className="relative">
                    {" "}
                    {/* Keep this relative container */}
                    <Avatar className="w-24 h-24 border-2 border-white shadow-sm mx-auto">
                      <AvatarImage
                        src={
                          hostData.avatar ||
                          "/placeholder.svg?height=96&width=96"
                        }
                        alt={`${hostData.name || "Host"} Avatar`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {hostData.name
                          ? hostData.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)
                          : "H"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Display badge only once */}
                    {hostData.isSuperhost && (
                      <Badge className="absolute bottom-0 right-0 bg-[#4D7C3F] text-white border-0 rounded-full p-1">
                        <Shield className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  {/* Removed duplicate badge block here */}
                </div>

                <h3 className="text-lg md:text-xl font-semibold font-bricolage text-gray-900 mb-1">
                  {hostData.firstName + " " + hostData.lastName || "Host"}
                </h3>
                {hostData.isSuperhost && (
                  <div className="flex items-center justify-center mb-4">
                    <Shield className="w-4 h-4 text-[#4D7C3F] mr-1" />
                    <span className="text-[#4D7C3F] font-medium text-sm">
                      Superhost
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  {hostData.reviewCount !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {hostData?.reviewCount}
                      </div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                  )}
                  <div>Avg. Rating</div>
                  {hostData.rating !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 flex items-center justify-center">
                        {hostData.rating}
                        <Star className="w-3 h-3 text-[#4D7C3F] ml-1" />
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  )}
                  <div>Years of hosting</div>
                  {hostData.yearsHosting !== undefined && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {hostData.yearsHosting}s
                      </div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                  )}
                </div>

                <Button className="w-full hidden bg-primaryGreen hover:bg-brightGreen font-normal text-white rounded-lg text-sm">
                  Message host
                </Button>
              </div>
            </Card>

            <div></div>
            {hostData.responseRate !== undefined &&
              hostData.responseTime && ( // Simplified check
                <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-4">
                  <div className="text-sm space-y-2">
                    {hostData.responseRate !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#4D7C3F]"></div>
                        <span>Response rate: {hostData.responseRate}%</span>
                      </div>
                    )}

                    {hostData.responseTime && (
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#4D7C3F]"></div>
                        <span>Response time: {hostData.responseTime}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
          </div>

          {/* Right Column - Host Details */}
          <div className="space-y-4">
            {/* Conditionally render the details card only if there's info to show OR if they are a superhost (to show the superhost explanation) */}

            {hostData.about && (
              <div className="flex items-start gap-3">
                <p className="text-md font-medium"></p>
                <p className="text-md font-light">{hostData.about}</p>
              </div>
            )}
            <div className="flex justify-between pt-8">
              {hostData?.dob && (
                <div className="flex pl-3 items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                  <div>
                    <p className="text-md font-medium">
                      {calculateAge(hostData?.dob)} yrs old
                    </p>
                  </div>
                </div>
              )}

              {hostData.languages && hostData.languages.length > 0 && (
                <div className="flex  items-start gap-3">
                  <Globe className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                  <div>
                    <p className="text-md font-medium">
                      Speaks {hostData?.languages}
                    </p>
                  </div>
                </div>
              )}

              {hostData.address && (
                <div className="flex items-start gap-3 pr-8">
                  <MapPin className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                  <div>
                    <p className="text-md font-medium">
                      Lives in {hostData?.address?.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* {hostData && (
              <>
                <div className=" items-center gap-2 mb-4">
                <Badge className="bg-[#4D7C3F]/10 text-[#4D7C3F] hover:bg-[#4D7C3F]/10 border-0"> 
                  <p className="text-lg font-semibold text-gray-600">
                    {hostData.firstName + " " + hostData.lastName} is a
                    Superhost
                  </p>
                  <p className="text-md  text-gray-600">
                    Superhosts are experienced, highly rated hosts who are
                    committed to providing great stays for guests.
                  </p>
                </div>
                <Separator className="my-4" />
              </>
            )} */}
            <div className="grid gap-4">
              {/* {hostData?.dob && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                        <div>
                          <p className="text-md font-medium">
                            {calculateAge(hostData?.dob)} yrs old
                          </p>
                        </div>
                      </div>
                    )} */}
              {hostData && (
                <>
                  <div className="items-center pl-3 pt-8 gap-2 mb-4">
                    {/* <Badge className="bg-[#4D7C3F]/10 text-[#4D7C3F] hover:bg-[#4D7C3F]/10 border-0"> */}
                    <p className="text-lg font-semibold text-gray-600">
                      Host Details
                    </p>
                    <p className="text-md  text-gray-600">
                      Response rate : 100%
                    </p>
                    <p className="text-md  text-gray-600">
                      {" "}
                      Host responds within hour
                    </p>
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              {hostData.education && (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{hostData.education}</p>
                  </div>
                </div>
              )}

              {hostData.work && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{hostData.work}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Testimonial Card */}
            {hostData.testimonial &&
              (hostData.testimonial.text || hostData.testimonial.author) && (
                <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    What guests are saying
                  </h3>
                  {hostData.testimonial.text && (
                    <div className="text-sm text-gray-600 italic">
                      "{hostData.testimonial.text}"
                    </div>
                  )}
                  {hostData.testimonial.author && (
                    <p className="text-xs text-gray-500 mt-2">
                      — {hostData.testimonial.author}
                    </p>
                  )}
                </Card>
              )}
            {/* Placeholder if NO details AND NO testimonial exist */}
            {/* {!hostData.isSuperhost &&
            !hostData.birthInfo &&
            !hostData.education &&
            !hostData.work &&
            !hostData.languages?.length > 0 &&
            !hostData.location &&
            !hostData.testimonial && (
              <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No additional host information available.
                  </p>
                </div>
              </Card>
            )} */}
          </div>
        </div>

        {/* "Show more" button (still hidden as per original code) */}
        <div className="mt-4 text-center hidden">
          <Button
            variant="link"
            className="text-[#4D7C3F] hover:text-[#3D6A2F] font-medium text-sm"
          >
            Show more <span className="ml-1">→</span>
          </Button>
        </div>

        {/* Footer Protection Message */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-2 text-gray-400" />
            <p>
              To help protect your payment, always use Majestic Escape to send
              money and communicate with hosts.
            </p>
          </div>
        </div>
      </div>

      {/* <section className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
      
        <div className="lg:col-span-1 bg-white shadow-md rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-3">
            <Image
              // replace with actual image path
              alt="Host"
              fill
              className="object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 bg-pink-500 text-white p-1 rounded-full">
              <ShieldCheck size={16} />
            </span>
          </div>

          <h2 className="text-xl font-semibold">Skand</h2>
          <p className="text-gray-500 flex items-center gap-1">
            <ShieldCheck size={14} /> Superhost
          </p>

          <div className="flex justify-center gap-6 mt-4 text-gray-700">
            <div className="text-center">
              <p className="text-xl font-semibold">116</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <p className="text-xl font-semibold">4.97</p>
              </div>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">1</p>
              <p className="text-sm text-gray-500">Year hosting</p>
            </div>
          </div>
        </div>


        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Skand is a Superhost</h3>
            <p className="text-gray-600 mt-1">
              Superhosts are experienced, highly rated hosts who are committed
              to providing great stays for guests.
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 font-medium mb-1">Co-Hosts</h4>
            <div className="flex items-center gap-3">
              <Image
                src="/images/cohost.png" // replace with cohost logo
                alt="BluJam Getaways"
                width={32}
                height={32}
                className="rounded-full border"
              />
              <p className="text-gray-700">BluJam Getaways</p>
            </div>
          </div>

          <div>
            <h4 className="text-gray-800 font-medium mb-1">Host details</h4>
            <ul className="text-gray-600 space-y-1">
              <li>Response rate: 100%</li>
              <li>Responds within an hour</li>
            </ul>
            <button className="mt-4 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
              <MessageCircle size={16} /> Message host
            </button>
          </div>

          <div className="text-gray-700 space-y-2 mt-6">
            <p>🌍 Born in the 90s</p>
            <p>
              🎓 Where I went to school: St. Xavier's, Mumbai / ISB, Hyderabad
            </p>
            <p>
              💼 Ex Ad, Ex Corporate, Current Chiller. Find me @blujamgetaways /
              @trulyskandalous
            </p>
          </div>

          <p className="text-sm text-gray-500 border-t pt-4">
            To help protect your payment, always use Airbnb to send money and
            communicate with hosts.
          </p>
        </div>
      </section> */}
    </>
  );
}
