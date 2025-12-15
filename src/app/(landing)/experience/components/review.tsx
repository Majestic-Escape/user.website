"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { reviewsData } from "@/lib/experience/data";

export default function Review() {
  const [thought, setThought] = useState("");

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={cn(
          "w-4 h-4",
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  return (
    <div className="sm:pt-[340px] pb-4">
      <div className="mx-auto p-6  white-border rounded-lg">
        <h2 className="text-2xl mb-4 font-semibold">
          Reviews ({reviewsData.totalReviews} reviews)
        </h2>
        <hr className="sm:w-[300px] w-[200px] mb-6 border-gray-200" />
        <div className="flex mb-6">{renderStars(5)}</div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Share your thoughts ..."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            className="flex-1 py-6 text-lg pr-14"
          />
          <Button
            className="min-w-[44px] min-h-[44px] aspect-square bg-[#46921E] text-white rounded-full flex items-center justify-center hover:bg-[#387819] transition-colors"
            onClick={() => {
              if (process.env.NEXT_PUBLIC_ENV === "dev") {
                console.log("Submitted thought:", thought);
              }
              setThought("");
            }}
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>

        <div className="space-y-6 pt-6">
          {reviewsData.reviews.map((review) => (
            <div key={review.id} className="flex items-start space-x-4">
              <Image
                src={review.avatar}
                alt={review.user}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold">{review.user}</h3>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                <p className="text-gray-700">{review.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button className="bg-white text-[#46921E] px-[25px] py-[20px] rounded-full green-border">
            View more {reviewsData.remainingReviews} reviews
          </Button>
        </div>
      </div>
    </div>
  );
}
