'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Component() {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: "all", label: "All" },
    { id: "onboarding", label: "Onboarding" },
    { id: "kyc", label: "KYC" },
    { id: "listing", label: "Listing" },
    { id: "payments", label: "Payments" },
    { id: "cover", label: "Cover" },
    { id: "security", label: "Security" },
    { id: "support", label: "Support" },
  ]

  const faqs = [
    {
      question: "How do I add a new property listing?",
      answer: (
        <ol className="ml-4 list-decimal space-y-2">
          <li>Go to your Host Dashboard</li>
          <li>Click on &quot;Add New Property&quot;</li>
          <li>Fill out the required information including property details, amenities, and house rules</li>
          <li>Upload high-quality photos (minimum 5 photos)</li>
        </ol>
      ),
      categories: ["listing", "onboarding"]
    },
    {
      question: "What documents do I need to register as a host?",
      answer: "Documentation requirements vary by region. Typically, you'll need to provide government-issued ID, proof of address, and property ownership or rental agreement documents.",
      categories: ["kyc", "onboarding"]
    },
    {
      question: "How do I set up my pricing and availability?",
      answer: "You can set your pricing and availability in your Host Dashboard. Navigate to your property listing, then to the 'Pricing and Availability' section. Here, you can set base rates, seasonal pricing, and mark dates as unavailable.",
      categories: ["listing", "payments"]
    },
    {
      question: "What are the photography requirements?",
      answer: "We recommend high-quality photos that accurately represent your property. Include at least 5 photos covering main areas like bedrooms, bathrooms, kitchen, and living spaces. Good lighting and decluttered spaces are key for attractive listings.",
      categories: ["listing"]
    },
    {
      question: "How do I handle guest communications and bookings?",
      answer: "Guest communications can be managed through our messaging system in your Host Dashboard. You'll receive notifications for new bookings and messages. Respond promptly to inquiries and booking requests to maintain a good response rate.",
      categories: ["support"]
    },
    {
      question: "What are the payout terms and processing time?",
      answer: "Payout terms typically include receiving payment 24 hours after guest check-in. Processing time varies by payout method, usually 1-7 business days. You can view and manage your payout settings in your Host Dashboard.",
      categories: ["payments"]
    },
    {
      question: "How can I optimize my listing's performance?",
      answer: "To optimize your listing, ensure your description is detailed and accurate, use high-quality photos, keep your calendar up-to-date, respond quickly to inquiries, and encourage guests to leave reviews. Regularly update your amenities and consider competitive pricing.",
      categories: ["listing"]
    },
    {
      question: "What emergency support is available?",
      answer: "Emergency support is available 24/7 through our helpline. For urgent issues related to safety, security, or major property problems, contact our emergency support team immediately. The contact information is provided in your Host Dashboard and guest communications.",
      categories: ["support", "security"]
    },
  ]

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.categories.includes(activeCategory))

  return (


    <section id='faqs' className="font-publicSans min-h-screen py-32 bg-[#FAFAFA]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-6">
          <h1 className="font-grot md:text-3xl text-2xl  font-semibold text-absolute-dark">
              Frequently Asked Questions
            </h1>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Detailed information about our properties, services,
              and everything you need to know for a perfect stay
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={category.id === activeCategory ? "default" : "secondary"}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    category.id === activeCategory 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-[#E5E7EB] rounded-lg mb-4 overflow-hidden">
                  <AccordionTrigger className="text-base font-normal text-[#111827] hover:no-underline px-6 py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-[#6B7280] px-6 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-[#6B7280]">No FAQs found for this category.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}