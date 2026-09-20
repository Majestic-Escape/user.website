import Image from "next/image"
import MediaImage from "@/components/ui/media-image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Calendar,
  CheckCircle,
  Flag,
  Globe,
  Home,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react"

export default function HostProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Host Information Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-32 h-32 border-4 border-[#3C6E37]">
                <AvatarImage src="/images/host-divya.svg" alt="Host Divya Yash" />
                <AvatarFallback className="bg-[#8BA77C] text-white text-2xl">DY</AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl font-bold">Divya Yash</h1>
                <p className="text-muted-foreground">Host since 2025</p>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Star className="h-5 w-5 text-[#3C6E37]" />
                <span className="font-medium">0</span>
                <span className="text-muted-foreground">(0 reviews)</span>
              </div>

              <Button className="w-full bg-primaryGreen hover:bg-[#6A4423] text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Host
              </Button>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h2 className="font-semibold text-lg">About</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#3C6E37]" />
                  <span>Lives in Delhi, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#3C6E37]" />
                  <span>Speaks English, Hindi</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#3C6E37]" />
                  <span>Work: Hospitality Professional</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h2 className="font-semibold text-lg">Verified Info</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3C6E37]" />
                  <span>Identity</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3C6E37]" />
                  <span>Email address</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#3C6E37]" />
                  <span>Phone number</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8 pt-32">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Divya Yash's Properties</h2>
              <Badge className="bg-brightGreen">Verified Host</Badge>
              
            </div>

            <p className="text-muted-foreground">
              Divya is a dedicated host who takes pride in providing exceptional stays for guests.
              With a passion for hospitality and attention to detail, every guest is made to feel welcome.
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 text-primaryGreen" />
                <span className="text-sm">Verified</span>
              </div>
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <Award className="h-4 w-4 text-primaryGreen" />
                <span className="text-sm">0 guests</span>
              </div>
              <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                <Users className="h-4 w-4 text-primaryGreen" />
                <span className="text-sm">0 reviews</span>

              </div>
            </div>
          </div>

          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="listings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primaryGreen data-[state=active]:bg-transparent text-base py-2 px-4"
              >
                Listings
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primaryGreen data-[state=active]:bg-transparent text-base py-2 px-4"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="guidebook"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primaryGreen data-[state=active]:bg-transparent text-base py-2 px-4"
              >
                Guidebook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="pt-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Single Property Card */}
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link href="#" className="block">
                      <div className="relative h-48 w-full">
                        <MediaImage
                          src="https://majestic-escape-host-properties.blr1.digitaloceanspaces.com/1742666768717-pexels-frans-van-heerden-201846-1438834.jpg"
                          alt="Listing for Goa"
                          fill
                          sizes="(max-width: 1023px) 100vw, 800px"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Listing for Goa</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-[#D4AF37] mr-1" />
                            <span>0</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Entire house · 1 BHK · 1 Bed &amp; 1 Bath
                        </p>
                        <p className="font-medium">₹20,000 night</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-lg font-medium">
                  <Star className="h-5 w-5 text-[#D4AF37]" />
                  <span>0</span>
                </div>
                <span className="text-muted-foreground">(0 reviews)</span>
              </div>
              <p className="text-muted-foreground">No reviews yet.</p>
            </TabsContent>

            <TabsContent value="guidebook" className="pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Home className="h-5 w-5 text-primaryGreen" />
                    Recommended Places to Stay
                  </h3>
                  <p className="text-muted-foreground">
                    Divya’s curated list of the best accommodations in the area, perfect for every type of traveler.
                  </p>
                  <div className="hidden cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {[1, 2].map((item) => (
                      <Card key={item} className="overflow-hidden">
                        <CardContent className="p-3 flex gap-3">
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                              src="/placeholder.svg?height=80&width=80"
                              alt="Place"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">Beachside Resort</h4>
                            <p className="text-sm text-muted-foreground">Perfect for families</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primaryGreen" />
                    Local Attractions
                  </h3>
                  <p className="text-muted-foreground">
                    Discover the best local attractions and hidden gems recommended by Divya.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {[1, 2].map((item) => (
                      <Card key={item} className="overflow-hidden">
                        <CardContent className="p-3 flex gap-3">
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                              src="/placeholder.svg?height=80&width=80"
                              alt="Attraction"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">Sunset Beach</h4>
                            <p className="text-sm text-muted-foreground">Beautiful views</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Calendar</h2>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Check Availability
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Divya typically responds within 1 hour and has a 98% response rate.
            </p>
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primaryGreen" />
                <div>
                  <p className="font-medium">
                    To protect your payment, never transfer money or communicate outside of the Majestic Escape website.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
                <span className="sr-only">Report</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
