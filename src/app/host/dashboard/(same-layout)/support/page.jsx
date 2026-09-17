import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Phone, PhoneIcon as WhatsApp } from 'lucide-react'
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="container mx-auto ">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold mb-2 font-bricolage text-absoluteDark">Support Center</h1>
        <p className="text-muted-foreground mb-8">Get help with your Majestic Escape hosting experience</p>
     

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Call Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Speak directly with our support team.</p>
              <Link
              className="bg-primaryGreen text-sm hover:to-brightGreen px-3 w-full rounded-3xl text-white py-2"
              target="_blank"
              href="tel:+918369995283" 
              >
                +91 88306 27337
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WhatsApp className="mr-2 h-5 w-5" />
                WhatsApp Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Chat with us on WhatsApp for quick support.</p>
             
              
              <Link
              target="_blank"
              href="https://wa.me/+918369995283" 
              className="bg-primaryGreen text-sm hover:to-brightGreen px-3 w-full rounded-3xl text-white py-2"
              >
                Chat on whatsapp
              </Link>
            
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Get in touch with our support team via email.</p>
              <Link
              href="mailto:info@majesticescape.in" 
              className="bg-primaryGreen text-sm hover:to-brightGreen px-3 w-full rounded-3xl text-white py-2"
              >
                info@majesticescape.in
              </Link>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-6">Frequently Asked Questions</h2>
        <Accordion  type="single" collapsible className="w-full text-stone">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I list my property on Majestic Escape?</AccordionTrigger>
            <AccordionContent>
              To list your property, click on &quot;Become a Host&quot; in the top navigation bar at majesticescape.in. Our streamlined process will guide you through adding your property details, uploading photos, and setting your pricing and availability - all in just 10 minutes!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What are the fees for hosting on Majestic Escape?</AccordionTrigger>
            <AccordionContent>
              Majestic Escape charges a competitive host service fee on each booking. This fee covers the cost of processing payments, marketing your property, and providing 24/7 host support. There are no upfront costs or monthly fees to list your property.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do I manage my property bookings?</AccordionTrigger>
            <AccordionContent>
              You can manage all your bookings through the host dashboard. Here you can view upcoming reservations, communicate with guests, update your calendar, and access important booking details. We&apos;ve designed the system to be intuitive and efficient.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>What support does Majestic Escape provide to hosts?</AccordionTrigger>
            <AccordionContent>
              We provide comprehensive support to our hosts including:
              <ul className="list-disc pl-6 mt-2">
                <li>24/7 customer service</li>
                <li>Property management tools and resources</li>
                <li>Marketing and promotion of your property</li>
                <li>Secure payment processing</li>
                <li>Host protection and insurance options</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

