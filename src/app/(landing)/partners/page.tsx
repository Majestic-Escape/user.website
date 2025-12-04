"use client";

import {
  ArrowRight,
  CheckCircle2,
  Hotel,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function PartnerPage() {
  const router = useRouter();
  function PartnerForm() {
    return (
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Enter your first name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Enter your last name" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" placeholder="Enter your phone number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name (if applicable)</Label>
          <Input id="companyName" placeholder="Enter your company name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfProperties">Number of properties</Label>
          <Input
            id="numberOfProperties"
            type="number"
            placeholder="How many properties do you manage?"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primaryGreen hover:bg-brightGreen"
        >
          Submit Application
        </Button>
      </form>
    );
  }

  return (
    <div className="font-poppins min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 bg-lightGreen">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bricolage lg:text-6xl font-bold tracking-tight text-absoluteDark mb-6">
            Become a Hospitality Partner
          </h1>
          <p className="text-xl text-graphite mb-8">
            Join the Elite Network of Luxury Stay Providers
          </p>
          <Button
            size="lg"
            className="bg-primaryGreen hover:bg-brightGreen transition-colors rounded-3xl"
            onClick={() => router.push("/register")}
          >
            Partner with us
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-primaryGreen hover:bg-brightGreen transition-colors rounded-3xl"
              >
                Partner with us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bricolage">
                  Partner Application
                </DialogTitle>
                <DialogDescription>
                  Fill out the form below to start your partnership journey with
                  Majestic Escape.
                </DialogDescription>
              </DialogHeader>
              <PartnerForm />
            </DialogContent>
          </Dialog> */}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold font-bricolage tracking-tight mb-12 text-center text-absoluteDark">
            Why Partner with Majestic Escape?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Hotel,
                title: "Increased Visibility",
                description:
                  "Showcase your property to our network of luxury travelers",
              },
              {
                icon: TrendingUp,
                title: "Revenue Growth",
                description:
                  "Boost your bookings and maximize your property's potential",
              },
              {
                icon: Users,
                title: "Quality Guests",
                description:
                  "Connect with discerning travelers who appreciate luxury",
              },
              {
                icon: Zap,
                title: "Streamlined Operations",
                description:
                  "Benefit from our efficient booking and management tools",
              },
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <benefit.icon className="h-6 w-6 text-stone mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-stone mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-solidGray">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="px-4 py-20 bg-offWhite border border-y-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold font-bricolage tracking-tight mb-12 text-center text-absoluteDark">
            Partnership Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-stone">
                  Property Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Luxury accommodations with high-end amenities",
                    "Exceptional cleanliness and maintenance",
                    "Unique or prime locations",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-stone">
                  Operational Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Responsive communication",
                    "Professional guest services",
                    "Commitment to guest satisfaction",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Terms Section */}
      <section className="px-4 py-20" id="terms">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold font-bricolage tracking-tight mb-12 text-center text-green-800">
            Partnership Terms
          </h2>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        title: "Property Standards",
                        description:
                          "All properties must meet our luxury standards and undergo a verification process. Regular quality checks will be conducted to maintain standards.",
                      },
                      {
                        title: "Listing Requirements",
                        description:
                          "Partners must provide high-quality photos, accurate descriptions, and maintain up-to-date availability calendars.",
                      },
                      {
                        title: "Contract Duration",
                        description:
                          "Initial partnership agreement is for 12 months with automatic renewal option.",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="support">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        title: "Dedicated Account Manager",
                        description:
                          "Each partner is assigned a dedicated account manager for personalized support and optimization guidance.",
                      },
                      {
                        title: "24/7 Support",
                        description:
                          "Round-the-clock support for urgent issues and guest-related matters through our partner hotline.",
                      },
                      {
                        title: "Training Resources",
                        description:
                          "Access to comprehensive training materials, webinars, and best practices guides for optimal performance.",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold font-bricolage tracking-tight mb-12 text-center text-absoluteDark">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: "What types of properties do you accept?",
                answer:
                  "We accept a wide range of luxury properties, including villas, apartments, boutique hotels, and unique stays that meet our high standards for quality and guest experience.",
              },
              {
                question: "How long does the application process take?",
                answer:
                  "The application process typically takes 2-3 weeks, depending on the completeness of your application and the current volume of applications we're processing.",
              },
              {
                question: "Can I list my property on other platforms?",
                answer:
                  "Yes, we do not require exclusivity. However, we offer incentives for partners who choose to list exclusively with Majestic Escape.",
              },
              {
                question: "What marketing support do you provide?",
                answer:
                  "We provide comprehensive marketing support, including professional photography services, content creation, and targeted advertising to showcase your property to our audience of luxury travelers.",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-graphite">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-primaryGreen text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bricolage font-semibold  mb-6">
            Ready to Elevate Your Hospitality Business?
          </h2>
          <p className="text-xl mb-8">
            Join Majestic Escape today and unlock the potential of your luxury
            property.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-800 hover:bg-green-100"
            onClick={() => router.push("/register")}
          >
            Become a Partner
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-white text-green-800 hover:bg-green-100"
              >
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bricolage">
                  Partner Application
                </DialogTitle>
                <DialogDescription>
                  Fill out the form below to start your partnership journey with
                  Majestic Escape.
                </DialogDescription>
              </DialogHeader>
              <PartnerForm />
            </DialogContent>
          </Dialog> */}
        </div>
      </section>
    </div>
  );
}
