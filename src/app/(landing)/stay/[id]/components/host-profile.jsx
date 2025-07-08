/* eslint-disable @next/next/no-img-element */
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Briefcase, Globe, MapPin, Shield, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Simple Skeleton component (assuming it might be used elsewhere too)
export function Skeleton({ className, ...props }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
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
  )
}

// Main HostProfile component - now receives data as props
export default function HostProfile({ hostData, isLoading, error }) {

  if (isLoading) {
    return <HostProfileSkeleton />
  }

  if (error) {
    // You might want to pass the error object to display a more specific message
    return <div className="text-center text-gray-500 py-10">Error loading host data. Please try again later.</div>
  }

  // If not loading and no error, but hostData is somehow null/undefined (shouldn't happen with RQ enabled flag, but good practice)
  if (!hostData) {
     return <div className="text-center text-gray-500 py-10">Host data not available.</div>;
  }

  // --- Render the actual profile using hostData ---
  return (
    <div className="max-w-7xl mx-auto py-2 md:py-8 px-4 sm:px-6 md:px-0">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 font-bricolage mb-6">Meet your host</h2>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left Column - Host Card */}
        <div className="space-y-4">
          <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 text-center">
              <div className="relative mx-auto mb-4">
                <div className="relative"> {/* Keep this relative container */}
                  <Avatar className="w-24 h-24 border-2 border-white shadow-sm mx-auto">
                    <AvatarImage
                      src={hostData.avatar || "/placeholder.svg?height=96&width=96"}
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

              <h3 className="text-lg md:text-xl font-semibold font-bricolage text-gray-900 mb-1">{hostData.name || "Host"}</h3>
              {hostData.isSuperhost && (
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-4 h-4 text-[#4D7C3F] mr-1" />
                  <span className="text-[#4D7C3F] font-medium text-sm">Superhost</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                {hostData.reviewCount !== undefined && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{hostData.reviewCount}</div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                )}

                {hostData.rating !== undefined && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 flex items-center justify-center">
                      {hostData.rating}
                      <Star className="w-3 h-3 text-[#4D7C3F] ml-1" />
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                )}

                {hostData.yearsHosting !== undefined && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{hostData.yearsHosting}</div>
                    <div className="text-xs text-gray-500">Years</div>
                  </div>
                )}
              </div>

              <Button className="w-full hidden bg-primaryGreen hover:bg-brightGreen font-normal text-white rounded-lg text-sm">
                Message host
              </Button>
            </div>
          </Card>

          {(hostData.responseRate !== undefined && hostData.responseTime) && ( // Simplified check
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
          {(hostData.isSuperhost || hostData.birthInfo || hostData.education || hostData.work || hostData.languages?.length > 0 || hostData.location) && (
             <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
              {hostData.isSuperhost && (
                  <>
                   <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-[#4D7C3F]/10 text-[#4D7C3F] hover:bg-[#4D7C3F]/10 border-0">Superhost</Badge>
                       <p className="text-sm text-gray-600">
                         Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                       </p>
                   </div>
                   <Separator className="my-4" />
                 </>
               )}

               <div className="grid gap-4">
                 {hostData.birthInfo && (
                   <div className="flex items-start gap-3">
                     <BookOpen className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                     <div>
                       <p className="text-sm font-medium">{hostData.birthInfo}</p>
                     </div>
                   </div>
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

                 {hostData.languages && hostData.languages.length > 0 && (
                   <div className="flex items-start gap-3">
                     <Globe className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                     <div>
                       <p className="text-sm font-medium">Speaks {hostData.languages.join(", ")}</p>
                     </div>
                   </div>
                 )}

                 {hostData.location && (
                   <div className="flex items-start gap-3">
                     <MapPin className="w-5 h-5 text-[#4D7C3F] mt-0.5" />
                     <div>
                       <p className="text-sm font-medium">Lives in {hostData.location}</p>
                     </div>
                   </div>
                 )}
               </div>
             </Card>
           )}

          {/* Testimonial Card */}
          {hostData.testimonial && (hostData.testimonial.text || hostData.testimonial.author) && (
            <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">What guests are saying</h3>
              {hostData.testimonial.text && (
                <div className="text-sm text-gray-600 italic">"{hostData.testimonial.text}"</div>
              )}
              {hostData.testimonial.author && (
                <p className="text-xs text-gray-500 mt-2">— {hostData.testimonial.author}</p>
              )}
            </Card>
          )}

          {/* Placeholder if NO details AND NO testimonial exist */}
          {!hostData.isSuperhost && !hostData.birthInfo && !hostData.education && !hostData.work && !hostData.languages?.length > 0 && !hostData.location && !hostData.testimonial && (
              <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm p-5">
                  <div className="text-center py-6">
                      <p className="text-gray-500">No additional host information available.</p>
                  </div>
              </Card>
          )}
        </div>
      </div>

      {/* "Show more" button (still hidden as per original code) */}
      <div className="mt-4 text-center hidden">
        <Button variant="link" className="text-[#4D7C3F] hover:text-[#3D6A2F] font-medium text-sm">
          Show more <span className="ml-1">→</span>
        </Button>
      </div>

      {/* Footer Protection Message */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <Shield className="w-3 h-3 mr-2 text-gray-400" />
          <p>To help protect your payment, always use Majestic Escape to send money and communicate with hosts.</p>
        </div>
      </div>
    </div>
  )
}