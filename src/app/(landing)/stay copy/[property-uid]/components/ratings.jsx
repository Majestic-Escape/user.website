/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import MediaImage from "@/components/ui/media-image";
import { Star, StarHalf, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const hostData = {
  hostNames: "Nanda and Napoor",
  designation: "Experienced Host",
  rating: 5,
  totalReviews: 40,
  profileImage: "/profile.jpeg",
  verified: true,
};

export default function Rating({ property }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="w-4 h-4 text-yellow-400" />
      );
    }

    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto pt-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-6 bg-white rounded-lg gap-6 custom-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:flex-1 gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <MediaImage
                src={hostData.profileImage}
                alt={`${hostData.hostNames}'s profile`}
                width={56}
                height={56}
                className="rounded-full object-cover w-10 h-10 sm:w-14 sm:h-14"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900 inline-flex items-center">
                  Hosted by {hostData.hostNames}
                  {hostData.verified && (
                    <BadgeCheck className=" w-5 h-5 text-blue-500 flex-shrink-0 sm:mb-0 mb-5 sm:mr-2 mr-12 sm:ml-2" />
                  )}
                </h3>
              </div>
              <p className="text-base text-gray-500">{hostData.designation}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="text-sm font-medium bg-white text-[#46921E] w-40 h-12 rounded-full green-border px-6"
          >
            See host profile
          </Button>
        </div>
        <div className="flex flex-col items-start">
          <div className="flex gap-0.5">{renderStars(hostData.rating)}</div>
          <p className="text-base text-black sm:mt-0 mt-2">
            {hostData.rating} star rating{" "}
            <span className="font-bold mr-1">({hostData.totalReviews}</span>
            reviews)
          </p>
        </div>
      </div>
    </div>
  );
}
