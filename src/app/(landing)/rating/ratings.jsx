"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StarRating from "@/components/star-rating";
import { AlertCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LIVE } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import { readStoredToken } from "@/lib/session";
import Link from "next/link";
import LoginLink from "@/components/login-link";
import { contactInfoErrorFrom, contactInfoErrorFromResponse } from "@/lib/contactInfoError";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Ratings() {
  const searchParams = useSearchParams();
  const emailToken = searchParams.get("token");
  const [rating, setRating] = useState(0);
  const [reviewData, setReviewData] = useState();
  // A contact-policy refusal (422 CONTACT_INFO_NOT_ALLOWED) marks the review text
  const [contactRefusal, setContactRefusal] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const bookingId = searchParams.get("booking");
  const [bookData, setBookData] = useState();
  const allowedtoReview = searchParams.get("active");
  const [reviewed, setReviewed] = useState(false);

  const checkIfAlreadyReviewed = async () => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(
          `${API_URL}/review/checking/${bookingId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          return;
        }

        const final = await response.json();
        if (process.env.NEXT_PUBLIC_ENV === "dev") {
          console.log("jl", response);
        }
        setReviewed(final.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const router = useRouter();
  const queryClient = useQueryClient();
  const verifyToken = async (emailToken) => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      if (data) {
        const response = await fetch(`${API_URL}/review/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailToken: emailToken,
          }),
        });
        if (!response.ok) {
          return;
        }
        return response.json();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) setIsAuth(true);
  };

  // Throws on every failure path: react-query used to report "success" with
  // undefined data when the token was missing or the API failed, and the
  // page then rendered against nothing.
  const getBookingId = async (bookingId) => {
    const token = readStoredToken();
    if (!token) throw new Error("Not signed in");
    const response = await fetch(`${API_URL}/booking/${bookingId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch booking (status: ${response.status})`);
    }
    const result = await response.json();
    if (!result?.data) throw new Error("Booking data missing in response");
    return result.data;
  };
  useEffect(() => {
    auth();
  }, []);
  useEffect(() => {
    if (emailToken) {
      verifyToken(emailToken);
    }
  }, [emailToken]);

  useEffect(() => {
    checkIfAlreadyReviewed();
  }, []);

  const {
    data: bookingData,
    isLoading: isBookingLoading, // Renamed for clarity
    error: bookingError, // Renamed for clarity
    isFetching: isBookingFetching,
    isError: isBookingError,
  } = useQuery({
    queryKey: queryKeys.bookingById(bookingId),
    queryFn: () => getBookingId(bookingId),
    enabled: !!bookingId, // Only run if propertyId exists
    ...LIVE,
  });

  const today = new Date();
  const checkoutDate = new Date(bookingData?.checkOut);
  const differenceInDays = (today - checkoutDate) / (1000 * 60 * 60 * 24);
  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleChange = (event) => {
    setReviewData(event.target.value);
  };

  const handleSubmitReviewData = async () => {
    try {
      if (!reviewData) {
        toast.error("Cannot leave review text box empty.");
        return;
      }
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);

      if (data) {
        const response = await fetch(`${API_URL}/review/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingId,
            rating: rating,
            content: reviewData,
          }),
        });
        if (!response.ok) {
          const refusal = await contactInfoErrorFromResponse(response);
          setContactRefusal(refusal);
          toast.error(refusal ? refusal.toast : "Failed to submit review", refusal ? { duration: 9000 } : undefined);
          return;
        }
        setContactRefusal(null);
        toast.success("Submitted review");
        // Only after the 2xx: the stay page's cached reviews and this
        // booking (now marked reviewed) are stale.
        queryClient.invalidateQueries({
          queryKey: queryKeys.reviewsAll(bookingData?.propertyId?._id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.property(bookingData?.propertyId?._id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookingById(bookingId),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookingsAll });
        router.push(`/stay/${bookingData?.propertyId?._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = (value) => {
    setRating(value);
  };
  // setData(bookingData.checkOut);
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log(bookingData);
  }
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("bb", reviewed, bookingId);
  }
  if (isBookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  if (isBookingError) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24 text-center px-4">
        We couldn't load this booking. Please refresh, or open the link from
        your email again.
      </div>
    );
  }
  const dat = new Date().toLocaleDateString();
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You are not authorized to access this page. &nbsp;{" "}
        <LoginLink>
          <u>
            <b>Click Here</b>
          </u>
        </LoginLink>
        &nbsp; to log in now to access.
      </div>
    );
  }

  if (!bookingId && !emailToken) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        Use valid url link. &nbsp;{" "}
      </div>
    );
  }
  if (reviewed) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You have already submitted a review for this booking. &nbsp;{" "}
      </div>
    );
  }
  if (today < checkoutDate) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You can review only after checkout. &nbsp;{" "}
      </div>
    );
  }
  if (today < checkoutDate && differenceInDays >= 14) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        Your review date has expired. The review remains open only for the next
        14 days from check out date. &nbsp;{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen font-poppins pt-24">
      <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold font-bricolage text-absoluteDark">
            Review Submission
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Share your thoughts and suggestion.
          </p>
        </div>
      </header>
      <main>
        <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-semibold text-primary">
                  My Review
                </h2>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <div className=" p-10 font-sans">
                  <h1 className="text-lg font-bold mb-4">
                    Rate Your Experience
                  </h1>
                  <StarRating
                    onRatingChange={handleRatingChange}
                    resetChange={handleReset}
                  />{" "}
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:gap-4 sm:px-6">
                  <textarea
                    className={`px-4 py-4 border h-40 ${contactRefusal ? "border-red-500" : "border-gray"}`}
                    type="text"
                    placeholder="Write your review ....."
                    aria-invalid={contactRefusal ? true : undefined}
                    aria-describedby={contactRefusal ? "review-contact-error" : undefined}
                    onChange={(e) => {
                      setContactRefusal(null);
                      handleChange(e);
                    }}
                  />
                  {contactRefusal && (
                    <p id="review-contact-error" role="alert" className="text-sm text-red-600">
                      {contactRefusal.message}
                    </p>
                  )}
                  <Button onClick={handleSubmitReviewData}>Submit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
