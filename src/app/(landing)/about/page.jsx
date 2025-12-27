/* eslint-disable react/prop-types */

import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";
import Title from "@/components/ui/title";

import Link from "next/link";

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg overflow-hidden border  ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const CardFooter = ({ children }) => (
  <div className="px-6 py-8 bg-offWhite border-t border-t-gray">{children}</div>
);

export default function About() {
  return (
    <div className="font-poppins min-h-screen pt-24 bg-white">
      <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <Heading text="About Majestic Escape" />
          <SubHeading text="Your gateway to authentic local experiences" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-12">
            <Card className="">
              <CardHeader>
                <Title text="Our Mission" />
              </CardHeader>
              <CardContent>
                <p className="text-base text-stone">
                  At Majestic Escape, we&apos;re passionate about making your adventure unforgettable. Our platform connects travellers
                  with unique, comfortable, and authentic accommodations across
                  stunning destinations. From cosy stays close to nature to
                  premium luxury villas, we offer something for every type of
                  traveller.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <Card>
              <CardHeader>
                <Title text="Why Choose Majestic Escape?" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-stone">
                        Curated Selection: We handpick high-quality
                        accommodations to ensure your comfort and satisfaction.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-stone">
                        Easy Booking: Our user-friendly platform makes
                        reservations and payments simple and secure.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-stone">
                        Local Insights: Benefit from our team’s deep regional
                        knowledge, including insider tips and personalized
                        recommendations.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-stone">
                        24/7 Support: Our customer service team is always ready
                        to assist you, day or night.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-stone">
                        Flexible Policies: We understand plans can change, so we
                        offer accommodating cancellation options.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <Title text="Our Story" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4 text-stone">
                    Founded in 2024, Majestic Escape was created by a team of
                    Goan founders inspired by their homeland’s vibrant culture,
                    natural beauty, and warm hospitality. As passionate
                    travellers, they recognised the need for a platform that
                    could showcase exceptional stays across diverse destinations
                    while continuing to support local communities and businesses
                    wherever we operate.
                  </p>
                  <p className="text-stone">
                    Today, we’re proud to be a trusted platform for travellers
                    seeking authentic and memorable experiences. Our team works
                    tirelessly to ensure that every stay booked through Majestic
                    Escape meets our high standards of quality, comfort, and
                    authenticity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="transform transition duration-300 hover:scale-105 active:scale-95">
              <Card className="h-full bg-white overflow-hidden relative group">
                <CardHeader>
                  <h3 className="text-xl font-medium font-bricolage text-absoluteDark">
                    Responsible Tourism
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We’re committed to encouraging responsible travel that
                    uplifts local communities and helps preserve the natural
                    beauty of every destination we serve.
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-lightGreen transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Card>
            </div>

            <div className="transform transition duration-300 hover:scale-105 active:scale-95">
              <Card className="h-full bg-white overflow-hidden relative group">
                <CardHeader>
                  <h3 className="text-xl font-medium font-bricolage text-absoluteDark">
                    Local Partnerships
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Majestic Escape actively collaborates with local businesses
                    and property owners, supporting regional economies and
                    providing travellers with genuine, meaningful experiences.
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-lightGreen transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Card>
            </div>

            <div className="transform transition duration-300 hover:scale-105 active:scale-95">
              <Card className="h-full bg-white overflow-hidden relative group">
                <CardHeader>
                  <h3 className="text-xl font-medium font-bricolage text-absoluteDark">
                    Cultural Respect
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We encourage our guests to immerse themselves in the local
                    culture of each destination while respecting its customs and
                    traditions.
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-lightGreen transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <Card className="bg-white ">
              <CardHeader>
                <h2 className="text-2xl font-bricolage font-semibold text-absoluteDark">
                  Discover Your Next Escape
                </h2>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-slate-600">
                  Whether you’re seeking a peaceful retreat or an
                  adventure-filled holiday, Majestic Escape is here to bring
                  your travel dreams to life. From the moment you book until the
                  end of your stay, we’re committed to delivering exceptional
                  service and unforgettable experiences.
                </p>
                <p className="font-medium text-stone">
                  Join us in discovering the magic of extraordinary
                  destinations, one stay at a time.
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href="/stays"
                  className=" bg-primaryGreen hover:bg-brightGreen text-white  hover:scale-105 transition-all px-6 py-3  rounded-3xl "
                >
                  Book your stay
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
