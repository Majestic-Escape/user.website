import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CompanyDetails() {
  return (
    <div className="min-h-screen bg-white">
      {/* Company Overview */}
      <section className="py-32">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-semibold font-bricolage mb-8">
            Company Details
          </h1>

          <div className="max-w-4xl">
            <h2 className="text-2xl font-semibold mb-4">
              About Majestic Escape
            </h2>
            <p className="text-gray-600 mb-6">
              Founded with a passion for exceptional hospitality, Majestic
              Escape has grown to become a leading luxury accommodation
              provider. We connect travelers with extraordinary stays across
              various destinations, ensuring memorable experiences through our
              curated selection of properties. Our platform specializes in quick
              and efficient booking processes, allowing guests to secure their
              perfect getaway in just 10 minutes.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-primaryGreen mb-2">
                  Our Mission
                </h3>
                <p className="text-gray-600">
                  To provide effortless luxury getaways that create lasting
                  memories, connecting travelers with exceptional
                  accommodations.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-primaryGreen  mb-2">
                  Our Values
                </h3>
                <p className="text-gray-600">
                  Excellence in service, attention to detail, and creating
                  authentic experiences that exceed expectations.
                </p>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Company Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Company Name</h3>
                  <p>Majestic Escape LLP</p>
                </div>
                <div>
                  <h3 className="font-medium">Founded</h3>
                  <p>2023</p>
                </div>
                <div>
                  <h3 className="font-medium">Headquarters</h3>
                  <p>Goa, India 403001</p>
                </div>
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <p>Phone: +91 83699 95283</p>
                  <p>Email: info@majesticescape.in</p>
                </div>
                <div>
                  <h3 className="font-medium">Website</h3>
                  <p>www.majesticescape.in</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Services</h2>

              <Tabs defaultValue="accommodations" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="accommodations">
                    Accommodations
                  </TabsTrigger>
                  <TabsTrigger value="experiences">Experiences</TabsTrigger>
                  <TabsTrigger value="services">Concierge Services</TabsTrigger>
                </TabsList>
                <TabsContent value="accommodations">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Luxury Stays
                      </h3>
                      <p className="text-gray-600 mb-4">
                        From beachfront villas to mountain retreats, our curated
                        selection of properties offers the highest standards of
                        comfort and elegance.
                      </p>
                      <h4 className="font-medium mb-2">Property Types:</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        <li>Beachfront Properties</li>
                        <li>Luxury Villas</li>
                        <li>Premium Apartments</li>
                        <li>Mountain Cabins</li>
                        <li>Historic Mansions</li>
                        <li>Farm Houses</li>
                        <li>Properties with Pools</li>
                        <li>Bed & Breakfast</li>
                      </ul>
                      <h4 className="font-medium mb-2">Host Program:</h4>
                      <p className="text-gray-600 mb-4">
                        Join our network of premium property owners and earn by
                        sharing your exceptional space with discerning
                        travelers.
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-700 text-green-700 hover:bg-green-50"
                      >
                        Become a Host
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="experiences">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Curated Experiences
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Discover handpicked local experiences that transform
                        your stay into an unforgettable journey. From private
                        tours to exclusive activities, we connect you with
                        authentic local culture.
                      </p>
                      <h4 className="font-medium mb-2">
                        Experience Categories:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Adventure Experiences</li>
                        <li>Culinary Journeys</li>
                        <li>Cultural Immersions</li>
                        <li>Wellness Retreats</li>
                        <li>Wildlife Encounters</li>
                        <li>Historical Tours</li>
                        <li>Local Crafts & Workshops</li>
                        <li>Photography Expeditions</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="services">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3">
                        Premium Concierge
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Our dedicated concierge team is available to handle all
                        aspects of your stay, from transportation arrangements
                        to special requests and personalized itineraries.
                      </p>
                      <h4 className="font-medium mb-2">Services Include:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Private transportation and airport transfers</li>
                        <li>Restaurant reservations at exclusive venues</li>
                        <li>Personal chef and in-home dining experiences</li>
                        <li>Childcare and pet services</li>
                        <li>
                          Event planning and special occasion arrangements
                        </li>
                        <li>Guided tours with local experts</li>
                        <li>Wellness and spa appointments</li>
                        <li>Equipment rentals (boats, cars, sports gear)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <Separator className="my-8" />

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Flash Booking Technology
              </h2>
              <p className="text-gray-600 mb-4">
                Our proprietary Flash Booking system allows guests to complete
                their entire booking process in under 10 minutes. This
                innovative technology streamlines the traditional booking
                experience by:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-6">
                <li>Providing instant property availability</li>
                <li>Offering transparent pricing with no hidden fees</li>
                <li>Simplifying the payment process</li>
                <li>Generating immediate booking confirmations</li>
                <li>Connecting guests directly with property hosts</li>
              </ul>
            </div>

            <Separator className="my-8" />

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Management Team</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Vardha Naik</h3>
                  <p className="text-gray-500">
                    Founder & Chief Executive Officer
                  </p>
                  {/* <p className="text-gray-600 mt-1">
                    With over 15 years of experience in luxury hospitality, Rajiv founded Majestic Escape with a vision
                    to transform how travelers experience premium accommodations.
                  </p> */}
                </div>
                <div>
                  <h3 className="text-lg font-medium">Shriraj Naik</h3>
                  <p className="text-gray-500">Chief Technical Officer</p>
                  {/* <p className="text-gray-600 mt-1">
                    Priya oversees all operational aspects of Majestic Escape, ensuring seamless experiences for both
                    guests and property hosts.
                  </p> */}
                </div>
                <div>
                  <h3 className="text-lg font-medium">Abhishek Singh</h3>
                  <p className="text-gray-500">Chief Operating Officer</p>
                  {/* <p className="text-gray-600 mt-1">
                    The architect behind our Flash Booking technology, Vikram leads our technical innovation and digital
                    experience development.
                  </p> */}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="grid gap-8">
                <div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">Goa, India 403001</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+91 83699 95283</p>
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">info@majesticescape.in</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
