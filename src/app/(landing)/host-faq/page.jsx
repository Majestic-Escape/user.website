"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";
import Link from "next/link";

export default function Component() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "onboarding", label: "Onboarding" },
    { id: "kyc", label: "KYC" },
    { id: "listing", label: "Listing" },
    { id: "payments", label: "Payments" },
    { id: "security", label: "Security" },
    { id: "support", label: "Support" },
    { id: "booking", label: "Booking" }, // Added for users
    { id: "cancellation", label: "Cancellation" }, // Added for users
  ];

  const faqs = [
    {
      question: "How do I create and verify my account?",
      answer:
        "Creating an account is simple: sign up with your email and complete your profile with a photo. Addtionally, as part of our commitment to security and regulatory compliance, we require KYC (Know Your Customer) verification before you can start your hosting journey with us. This helps build trust in our community.",
      //or phone, verify your identity with a government ID, and complete your profile with a photo. This helps build trust in our community.
      categories: ["onboarding", "kyc"],
    },
    {
      question: "Where do I find new bookings for my properties?",
      answer: (
        <ol className="ml-4 list-decimal space-y-2">
          <li>Switch to hosting.</li>
          <li>Select Bookings from the left sidebar.</li>
          <li>Select a date range and search to apply custom filter.</li>
        </ol>
      ),
      categories: ["listing", "booking"],
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through our platform to protect both guests and hosts.",
      categories: ["payments"],
    },

    {
      question: "How do I create a property?",
      answer: (
        <ol className="ml-4 list-decimal space-y-2">
          <li>Switch to hosting</li>
          <li>
            Select Add Listing from left sidebar to start property creation
            process.
          </li>
          <li>
            Once completed, select Listings from left sidebar to check out all
            the properties created and their statuses.
          </li>
        </ol>
      ),
      categories: ["booking", "cancellation"],
    },
    {
      question: "How do I contact my guest?",
      answer:
        "Once guest booking is confirmed, you can call or message them directly using contact details provided in your property booked email.",
      categories: ["support", "booking"],
    },
    {
      question: "Is my payment and personal information secure?",
      answer:
        "Yes, all payments are processed through secure, payment providers. Your payment information is never shared with hosts, and personal details are only shared after booking confirmation.",
      categories: ["security", "payments"],
    },
    {
      question: "What should I do in case of an issue with a guest?",
      answer: (
        <>
          If you encounter any issues with a guest, you can either contact them
          directly through the contact details provided in the booking email, or
          incase they are unresponsive or the issue remains unresolved, contact
          our 24/7 customer support at{" "}
          <Link
            href="mailto:support@majesticescape.in"
            target="_blank"
            className="text-primaryGreen hover:text-brightGreen underline transition-colors"
          >
            support@majesticescape.in
          </Link>{" "}
          or call us at{" "}
          <Link
            href="tel:+917219666822"
            target="_blank"
            className="text-primaryGreen hover:text-brightGreen underline transition-colors"
          >
            +91-7219666822
          </Link>
          .
        </>
      ),
      categories: ["support", "security"],
    },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.categories.includes(activeCategory));

  return (
    <section id="faqs" className="font-poppins min-h-screen py-32 bg-[#FAFAFA]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-6 pt-8 md:pt-0">
            <Heading text={"Frequently Asked Questions"} />
            <SubHeading
              text={
                "Detailed information about our properties, services, and everything you need to know for a perfect stay"
              }
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    category.id === activeCategory ? "default" : "secondary"
                  }
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
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className=" bg-white border border-[#E5E7EB] rounded-lg mb-4 overflow-hidden"
                >
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
              <p className="text-center text-[#6B7280]">
                No FAQs found for this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
