import { Suspense } from "react";
import PageLayout from "@/layouts/PageLayout";
import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";
import { FAQClient } from "./faq-client";

const categories = [
  { id: "all", label: "All" },
  { id: "onboarding", label: "Onboarding" },
  { id: "kyc", label: "KYC" },
  { id: "listing", label: "Listing" },
  { id: "payments", label: "Payments" },
  { id: "security", label: "Security" },
  { id: "support", label: "Support" },
  { id: "booking", label: "Booking" },
  { id: "reviews", label: "Reviews" },
  { id: "cancellation", label: "Cancellation" },
];

const faqs = [
  {
    question: "How do I create and verify my account?",
    answer:
      "Creating an account is simple: sign up with your email or phone, verify your identity with a government ID, and complete your profile with a photo. This helps build trust in our community.",
    categories: ["onboarding", "kyc"],
  },
  {
    question: "How do I search for properties on Majestic Escape?",
    answer: (
      <ol className="ml-4 list-decimal space-y-2">
        <li>Enter your desired location</li>
        <li>Select your check-in and check-out dates</li>
        <li>Specify number of guests</li>
        <li>
          Use filters to narrow down by price range, amenities, or property type
        </li>
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
    question: "What is your cancellation policy?",
    answer:
      "Cancellation policies vary by property and are clearly displayed on each listing. Generally, we offer three types: Flexible (full refund 24hrs before check-in), Moderate (50% refund 5 days before), and Strict (50% refund 14 days before). Check the specific policy before booking.",
    categories: ["booking", "cancellation"],
  },
  {
    question: "How do I contact my host?",
    answer:
      "Once your booking is confirmed, you can message your host directly through our platform's messaging system. We recommend discussing check-in details, directions, and any special requirements before arrival.",
    categories: ["support", "booking"],
  },
  {
    question: "Is my payment and personal information secure?",
    answer:
      "Yes, we use bank-grade encryption to protect your data. Your payment information is never shared with hosts, and personal details are only shared after booking confirmation. We also offer secure authentication and regular security updates.",
    categories: ["security", "payments"],
  },
  {
    question: "What should I do in case of an issue during my stay?",
    answer:
      "If you encounter any issues during your stay: 1) First contact your host through our platform, 2) If the host is unresponsive or the issue remains unresolved, contact our 24/7 customer support, 3) For emergencies, use the SOS button in the app to reach our emergency team.",
    categories: ["support", "security"],
  },
  {
    question: "How does the review system work?",
    answer:
      "You can leave a review within 14 days after check-out. Ratings cover cleanliness, communication, check-in, accuracy, location, and value. Reviews are published only after both guest and host have submitted their reviews or after the 14-day period ends.",
    categories: ["reviews"],
  },
];

export default function FAQPage() {
  return (
    <PageLayout>
      <section
        id="faqs"
        className="font-poppins min-h-screen py-32 bg-[#FAFAFA]"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-6">
              <Heading text="Frequently Asked Questions" />
              <SubHeading text="Detailed information about our properties, services, and everything you need to know for a perfect stay" />
              <Suspense fallback={<div>Loading...</div>}>
                <FAQClient categories={categories} faqs={faqs} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
