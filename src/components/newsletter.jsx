"use client"
import React, { useState } from "react";
import Image from "next/image"
import {toast} from 'sonner'
import Heading from '@/components/ui/heading'
import SubHeading from '@/components/ui/sub-heading'
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/services/newsletterService";

const FeatureItem = function FeatureItem({ id, text }) {

  return (
    <div className="flex items-center gap-2 mt-3">
  
      <div className="flex items-center justify-center w-5 h-5 text-[10px] font-medium  bg-light-green rounded-full">
        {id}
      </div>
      <p className="text-sm text-[#667085]">{text}</p>
    </div>
  );
};

const NewsletterSection = React.memo(function NewsletterSection() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const response = await subscribeToNewsletter(email);
      if (response.ok) {
        toast.success("Subscribed successfully!");
        setEmail(""); // Clear the input field
      } else {
        const data = await response.json();
        toast.error(data.message || "Subscription failed.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className=" px-4 sm:px-6 lg:px-[72px]  w-full flex justify-center py-20 bg-white">
  <div className="w-full max-w-[1760px] mx-auto">
  <section className="font-publicSans flex overflow-hidden flex-col justify-center  bg-white">
      <div className="flex flex-wrap gap-5 justify-between w-full mx-auto">
        <div className="flex flex-col w-[500px]">
         
         <div className="mb-4">
         <Heading text="Subscribe to our newsletter" />
              <SubHeading text="Never miss a chance on exciting offers and deals. Get more exciting offers and updates" />
          </div>
            <FeatureItem key="1" id="1" text="Updates on trending home-stays" />
            <FeatureItem key="2" id="2" text="Discounts and offer updates" />
          
            <form
                className="flex flex-wrap gap-2 p-2 mt-8 text-base"
                onSubmit={handleSubscription}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@email.com"
                  className="flex-grow px-4 py-3 leading-6 bg-[#F2F4F7] rounded-lg border border-[#D0D5DD] text-[#667085] min-w-[240px]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2.5 font-medium text-white bg-primaryGreen rounded-lg hover:bg-brightGreen transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
              {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
        </div>
        <div className="w-full md:w-auto mt-8 md:mt-0">
          <Image
         
          width={400}
          height={400}
            src="/images/newsletter-image.png"
            alt="Newsletter"
            className="w-full h-auto md:w-auto md:h-[240px]"
          />
        </div>
      </div>
    </section>
  </div>
</div>
  );
});

export default NewsletterSection;