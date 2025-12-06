/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  StarHalf,
  StarIcon,
  CircleArrowLeftIcon,
  CircleArrowRightIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function ReviewSection({
  reviews,
  isLoading,
  error,
  handleNext,
  handleBack,
  prev,
  next,
  property,
}) {
  // const [reviews, setReviews] = useState<Review[] | null>(null);

  const [averageRating, setAverageRating] = useState(0);
  console.log("zzzz", reviews, isLoading);
  const router = useRouter();
  const b = "68909384202eafcb9eaa7b33";
  // Modify the useEffect to allow for testing the empty state
  // Update the fetchReviews function in the useEffect hook

  // Category ratings
  // const categoryRatings: CategoryRating[] = [
  //   {
  //     name: "Cleanliness",
  //     rating: 5.0,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //           <path
  //             d="M12 6V12L16 14"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Accuracy",
  //     rating: 4.7,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M20 6L9 17L4 12"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Check-in",
  //     rating: 5.0,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Communication",
  //     rating: 5.0,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Location",
  //     rating: 5.0,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //           <path
  //             d="M9 22V12H15V22"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "Value",
  //     rating: 5.0,
  //     icon: (
  //       <div className="w-8 h-8 flex items-center justify-center">
  //         <svg
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //           <path
  //             d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //   },
  // ];

  // Render stars based on rating
  // const renderStars = (rating: number) => {
  //   return (
  //     <div className="flex">
  //       {[...Array(5)].map((_, i) => (
  //         <Star
  //           key={i}
  //           className={`w-4 h-4 ${
  //             i < rating
  //               ? "fill-primary text-primary"
  //               : "fill-muted text-muted-foreground"
  //           }`}
  //         />
  //       ))}
  //     </div>
  //   );
  // };

  // Skeleton loading for reviews

  const ReviewSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
  if (isLoading) {
    return <ReviewSkeleton />;
  }
  // Skeleton loading for category ratings
  const CategorySkeleton = () => (
    <div className="animate-pulse bg-gray-100 rounded-md p-4 h-24">
      <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
    </div>
  );
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mb-4 text-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
      <p className="text-gray-500 max-w-md">
        This property hasn't received any reviews yet. Be the first to share
        your experience!
      </p>
    </div>
  );
  console.log("glanter", reviews);
  if (reviews?.data?.length == 0) {
    return <EmptyState />;
  }
  if (error) {
    // You might want to pass the error object to display a more specific message
    return (
      <div className="text-center text-red-500 py-10">
        Error loading review data. Please try again later.
      </div>
    );
  }
  // Truncate text and add "Show more" button
  // const TruncatedText = ({ text }: { text: string }) => {
  //   const [isExpanded, setIsExpanded] = useState(false);
  //   const shouldTruncate = text.length > 100;

  //   return (
  //     <div>
  //       {isExpanded || !shouldTruncate ? text : `${text.substring(0, 100)}...`}
  //       {shouldTruncate && (
  //         <button
  //           onClick={() => setIsExpanded(!isExpanded)}
  //           className="block text-black font-semibold mt-1 hover:underline"
  //         >
  //           {isExpanded ? "Show less" : "Show more"}
  //         </button>
  //       )}
  //     </div>
  //   );
  // };

  // Add an EmptyState component after the TruncatedText component
  // Add this component before the return statement

  // return (
  //   <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
  //     <div className="mb-8">
  //       {/* Update the header section to handle empty reviews */}
  //       {/* Replace the header section with this: */}
  //       <div className="flex items-center gap-2 mb-6">
  //         <Star className="w-6 h-6 fill-black" />
  //         <h2 className="text-2xl font-bricolage font-semibold">
  //           {isLoading ? (
  //             <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
  //           ) : reviews && reviews.length > 0 ? (
  //             <>
  //               {averageRating.toFixed(1)} · {reviews.length} reviews
  //             </>
  //           ) : (
  //             "0 reviews"
  //           )}
  //         </h2>
  //       </div>

  //       {/* Category ratings */}
  //       {(isLoading || (reviews && reviews.length > 0)) && (
  //         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
  //           {isLoading ? (
  //             <>
  //               {[...Array(6)].map((_, i) => (
  //                 <div
  //                   key={i}
  //                   className="animate-pulse bg-gray-100 rounded-md p-4 h-24"
  //                 ></div>
  //               ))}
  //             </>
  //           ) : (
  //             reviews.map((category, index) => (
  //               <div
  //                 key={index}
  //                 className="flex flex-col items-center justify-center bg-gray-50 rounded-md p-4 h-24"
  //               >
  //                 {category.icon}
  //                 <span className="font-medium text-lg mt-2">
  //                   {category.rating.toFixed(1)}
  //                 </span>
  //                 <span className="text-sm text-gray-500">{category.name}</span>
  //               </div>
  //             ))
  //           )}
  //         </div>
  //       )}
  //     </div>

  //     {/* Divider */}
  //     <hr className="my-8 border-gray-200" />

  //     {/* Update the return statement to include the empty state */}
  //     {/* Replace the entire Reviews section with this: */}
  //     {/* Reviews */}
  //     <div>
  //       {isLoading ? (
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
  //           {[...Array(4)].map((_, i) => (
  //             <div key={i} className="mb-8">
  //               <ReviewSkeleton />
  //             </div>
  //           ))}
  //         </div>
  //       ) : reviews && reviews.length > 0 ? (
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
  //           {reviews.map((review) => (
  //             <div key={review.id} className="mb-4">
  //               <div className="flex items-start gap-4 mb-3">
  //                 <div className="w-12 h-12 rounded-full overflow-hidden">
  //                   <img
  //                     src={review.author.image || "/placeholder.svg"}
  //                     alt={review.author.name}
  //                     className="w-full h-full object-cover"
  //                   />
  //                 </div>
  //                 <div>
  //                   <h3 className="font-semibold">{review.author.name}</h3>
  //                   <p className="text-sm text-gray-500">
  //                     {review.author.yearsOnPlatform} years on Airbnb
  //                   </p>
  //                 </div>
  //               </div>
  //               <div className="flex items-center gap-2 mb-2">
  //                 {renderStars(review.rating)}
  //                 <span className="text-sm text-gray-500">· {review.date}</span>
  //               </div>
  //               <div className="text-sm">
  //                 <TruncatedText text={review.comment} />
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       ) : (
  //         <EmptyState />
  //       )}
  //     </div>
  //   </div>
  // );
  console.log("nice ma", property);
  return (
    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-2 text-yellow-500 mt-1">
            {Array(Math.round(property?.averageRating))
              .fill(0)
              .map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 fill-yellow-500" />
              ))}
            <span className="text-sm text-gray-600 ml-2">
              {Math.round(property?.averageRating)} rating of{" "}
              {property?.reviewCount} reviews
            </span>
          </div>
        </div>
        <Link href={`/manage-bookings`}>
          <button className="bg-primaryGreen hover:bg-brightGreen text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm font-medium">
            Write a review
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.data.slice(prev, next).map((r, i) => (
          <div
            key={i}
            className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2 relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {r.user.firstName}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(r.createdAt).getDate()}/
                  {new Date(r.createdAt).getMonth()}/
                  {new Date(r.createdAt).getFullYear()}
                </p>
              </div>
              {/* <Image
                src="/google-icon.png"
                width={20}
                height={20}
                alt="Google"
              /> */}
            </div>

            <div className="flex text-yellow-500">
              {Array(r.rating)
                .fill(0)
                .map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-yellow-500" />
                ))}
            </div>
            <p className="text-sm text-gray-700">{r.content}</p>
          </div>
        ))}
      </div>
      <div className="pt-8">
        <div
          className="flex justify-start cursor-pointer"
          onClick={() => {
            handleBack();
          }}
        >
          <CircleArrowLeftIcon className="mr-3" />
          Back
        </div>
        <div
          className="flex justify-end cursor-pointer"
          onClick={() => {
            handleNext();
          }}
        >
          Next
          <CircleArrowRightIcon className="ml-3" />
        </div>
      </div>
    </section>
  );
}
