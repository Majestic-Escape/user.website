/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
// Add Razorpay to Window interface
// declare global {
//   interface Window {
//     Razorpay: any
//   }
// }

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to fetch property data
const fetchProperty = async (id) => {
  try {
    if (!id) throw new Error("Property ID is missing");
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
      });
      // console.log("djfjdf", await response.json());
      if (!response.ok) {
        console.error(
          "Failed to fetch property:",
          response.status,
          await response.text()
        );
        throw new Error(
          `Failed to fetch property data (status: ${response.status})`
        );
      }
      const result = await response.json();
      return result?.data;
    }
  } catch (err) {
    console.error(err);
  }
};

// Create a BookPageContent component that uses React Query
function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const propertyId = params.id;
  const [isAuth, setIsAuth] = useState(false);
  const checkinDate = searchParams.get("checkin");
  const [date, setDate] = useState({
    from: searchParams.get("checkin")
      ? new Date(searchParams.get("checkin"))
      : new Date("2025-03-24"),
    to: searchParams.get("checkout")
      ? new Date(searchParams.get("checkout"))
      : new Date("2025-03-28"),
  });

  const [unavailableDates, setUnavailableDates] = useState([]);
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) setIsAuth(true);
  };
  function convertTo12HoursFormat(time24) {
    // Split the time string into hours and minutes
    let hours = time24;
    // Determine AM or PM based on the 24-hour hour
    let period = hours >= 12 ? "PM" : "AM";
    // Convert the hour to 12-hour format
    hours = hours % 12 || 12; // 0 becomes 12, otherwise use remainder
    return `${hours}:00 ${period}`;
  }
  useEffect(() => {
    auth();
  }, []);

  // useEffect(() => {
  //   async function checkAvailableDates() {
  //     const res = await axios.post(
  //       `${API_URL}/booking/check-availability/${propertyId}`,
  //       {
  //         selectedDates,
  //       }
  //     );
  //   }
  //   checkAvailableDates();
  // }, []);

  const [guests, setGuests] = useState(searchParams.get("guests") || "1");
  const [nights, setNights] = useState(searchParams.get("nights") || "0");
  const adults = searchParams.get("adults");
  const children = searchParams.get("children");
  const infants = searchParams.get("infants");

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestData, setGuestData] = useState({
    adults: [],
    children: [],
  });
  const [formErrors, setFormErrors] = useState({});
  // Fetch property data using TanStack Query
  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => fetchProperty(propertyId),
    enabled: !!propertyId,
  });
  console.log("property", property);
  const calculateTotal = () => {
    if (!property)
      return {
        nights: 0,
        subtotal: 0,
        cleaningFee: 0,
        serviceFee: 0,
        taxes: 0,
        total: 0,
      };

    const nightlyRate = property.basePrice;
    //|| 20000;
    const cleaningFee = 0;
    const nightsCount =
      nights && Number(nights) > 0
        ? Number(nights)
        : Math.ceil(
            (date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)
          );
    const subtotal = nightlyRate * nightsCount;
    const serviceFee = Math.round(subtotal * 0.12); // 12% service fee like Airbnb
    let taxes;
    if (subtotal <= 7500) {
      taxes = Math.round(subtotal * 0.12) + Math.round(serviceFee * 0.18); // 12% GST in India
    } else if (subtotal > 7500) {
      taxes = Math.round(subtotal * 0.18) + Math.round(serviceFee * 0.18); // 18% GST in India
    }

    return {
      nights: nightsCount,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total: subtotal + cleaningFee + serviceFee + taxes,
    };
  };

  const totals = calculateTotal();
  const fetchForm = async () => {
    // Get user data from localStorage

    const firstName = property?.host?.firstName || "";
    const lastName = property?.host?.lastName || "";

    // Initialize guest data arrays based on the number of adults and children
    const initialAdults = Array.from(
      { length: parseInt(adults) },
      (_, index) => ({
        name: index === 0 ? `${firstName} ${lastName}`.trim() : "",
        age: index === 0 ? 18 : 18,
      })
    );

    const initialChildren = Array.from({ length: parseInt(children) }, () => ({
      name: "",
      age: 3,
    }));

    setGuestData({
      adults: initialAdults,
      children: initialChildren,
    });

    setFormErrors({});
    setShowGuestModal(true);

    // Return the form data if needed elsewhere
    return {
      adults: initialAdults,
      children: initialChildren,
    };
  };

  // Add this function to handle form validation and submission
  const handleConfirmGuestInfo = async () => {
    const errors = {};

    // Validate adults
    guestData.adults.forEach((adult, index) => {
      if (!adult.name.trim()) {
        errors[`adult-name-${index}`] = "Name is required";
      }
      if (adult.age < 18) {
        errors[`adult-age-${index}`] = "Age must be 18 or above";
      }
    });

    // Validate children
    guestData.children.forEach((child, index) => {
      if (!child.name.trim()) {
        errors[`child-name-${index}`] = "Name is required";
      }
      if (child.age < 3 || child.age >= 18) {
        errors[`child-age-${index}`] = "Age must be between 3 and 17";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // If validation passes, close modal and proceed with payment
    setShowGuestModal(false);

    // Check dates again and proceed with payment

    const date = await fetchDates();
    console.log("sor", date);
    if (date.includes(checkinDate)) {
      toast.error("Sorry, someone has already booked");
    } else {
      await handlePayment();
    }
  };

  // Add this function to update guest data
  const updateGuestData = (type, index, field, value) => {
    // For the first adult, only allow age to be changed, not name
    if (type === "adults" && index === 0 && field === "name") {
      return; // Don't update the name for the first adult
    }

    setGuestData((prev) => {
      const newData = { ...prev };
      // newData[type][index][field] = value;
      newData[type][index] = { ...newData[type][index], [field]: value };
      return newData;
    });

    // Clear error for this field when user starts typing
    if (formErrors[`${type}-${field}-${index}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${type}-${field}-${index}`];
        return newErrors;
      });
    }
  };
  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    const initializeRazorpay = async () => {
      const res = await loadRazorpayScript();
      if (!res) {
        console.error("Razorpay SDK failed to load");
      }
    };

    initializeRazorpay();
  }, []);

  const saveData = async (
    propertyId,
    amount,
    currency,
    checkin,
    checkout,
    host,
    cancel,
    guestData,
    subTotal
  ) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      console.log("bat", subTotal);
      const response = await fetch(`${API_URL}/booking/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          userId: userId,
          guests: guests,
          nights: nights,
          adults: adults,
          children: children,
          infants: infants,
          propertyId: propertyId,
          hostId: host,
          checkIn: checkin,
          checkOut: checkout,
          price: amount,
          subTotal: subTotal,
          currency: currency,
          guestData: guestData,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Booking failed: ${errorText}`);
      }
      console.log("trhis is how", response.json);
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const createPaymentOrder = async (bookingId, amount, propertyId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
          currency: "INR",
          amount: amount,
          propertyId: propertyId,
        }),
      });

      const result = await response.json();

      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const verifyPayment = async (orderId, paymentId, signature, method) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/payment/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          paymentMethod: method,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save the data");
      }
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const updateBookingStatus = async (bookingId, host, manual, payment) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/booking/updateStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          hostEmail: host,
          userId: userId,
          manual: manual,
          payment: payment,
        }),
      });
      const result = await response.json();

      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const updateConfirmStatus = async (bookingId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/booking/instant/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
        }),
      });
      const result = await response.json();

      return result;
    } catch (err) {
      console.error(err);
    }
  };
  const closeModalUpdate = async (bookingId) => {
    try {
      console.log("enter close");
      const userId = JSON.parse(localStorage.getItem("userId"));
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/booking/modal-close`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
        }),
      });
      const result = await response.json();
      console.log("enter close", result);
      return result;
    } catch (err) {
      console.error(err);
    }
  };

  const createPayout = async (bookingId, propertyId, amount) => {
    try {
      const getLocalData = await localStorage.getItem("token");
      const data = JSON.parse(getLocalData);
      const response = await fetch(`${API_URL}/payment/create-payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          propertyId: propertyId,
          amount: amount,
        }),
      });
      const result = await response.json();

      return result;
    } catch (error) {
      console.error(error);
    }
  };
  // const initiatePayout = async (
  //   propertyId,
  //   amount,
  //   host,
  //   bookingId,
  //   property
  // ) => {
  //   try {
  //     const userId = JSON.parse(localStorage.getItem("userId"));
  //     const getLocalData = await localStorage.getItem("token");
  //     const data = JSON.parse(getLocalData);
  //     const response = await fetch(`${API_URL}/payment/payout`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${data}`,
  //       },
  //       body: JSON.stringify({
  //         userId: userId,
  //         bookingId: bookingId,
  //         hostId: host,
  //         propertyId: propertyId,
  //         amount: amount,
  //         property: property,
  //       }),
  //     });
  //     const result = await response.json();

  //     return result;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const handlePayment = async () => {
    if (typeof window.Razorpay === "undefined") {
      alert("Razorpay SDK is not loaded yet. Please try again in a moment.");
      return;
    }

    try {
      const propertyId = await property._id;
      const propertyHostId = await property.host;
      const propertyTitle = await property.title;
      console.log(propertyId, date.from, date.to, propertyHostId);
      const found = Object.entries(property?.cancellationType).find(
        ([key, value]) => value === true
      );
      const extract = JSON.stringify(found);
      const parsed = JSON.parse(extract);
      const cancel = parsed[0]; //check dates and property id payment status paid
      const booking = await saveData(
        propertyId,
        totals.total,
        "INR",
        date.from,
        date.to,
        propertyHostId,
        cancel,
        guestData,
        totals.subtotal
      );
      console.log("green lan", booking);
      if (!booking || !booking.data?._id) {
        toast.error("Booking could not be created. Please try again.");
        return; // stop here
      }
      const order_id = await createPaymentOrder(
        booking?.data?._id,
        totals?.total * 100,
        property?._id
      );
      console.log("ordersssss", order_id.data);
      const options = {
        key: "rzp_test_RRelkKgMDh3dun", //"rzp_test_w0bKE5w5UPOPrY", // Replace with your actual test key
        amount: totals.total * 100,
        currency: "INR",
        order_id: order_id?.data?.id,
        name: "Majestic Escape",
        description: `Booking for ${
          property?.title || "Property"
        } (${date.from.toLocaleDateString()} - ${date.to.toLocaleDateString()})`,
        image: "/logo.png",
        handler: async (response) => {
          console.log("Payment successful:", response);
          // Redirect to booking summary page

          const totalAmount = totals.total;
          const currency = "INR";
          const checkin = date.from.toISOString();
          const checkout = date.to.toISOString();
          const paymentId = response.razorpay_payment_id;
          const summaryParams = new URLSearchParams({
            hostFirstName: property?.host?.firstName,
            hostLastName: property?.host?.lastName,
            bookingId: booking?.data?._id,
            propertyId: propertyId,
            propertyType: property?.propertyType,
            placeType: property?.placeType,
            propertyName: property?.title || "Property",
            street: property?.address?.street,
            city: property?.address?.city,
            state: property?.address?.state,
            country: property?.address?.country,
            propertyImage: property?.photos[0],
            checkin: date.from.getTime(),
            checkout: date.to.getTime(),
            numberOfGuests: guests,
            adults: adults,
            children: children,
            infants: infants,
            totalAmount: totals.total.toString(),
            nights: totals.nights.toString(),
            checkinTime: property?.checkinTime,
            checkoutTime: property?.checkoutTime,
            instant: property?.bookingType?.manual ? false : true,
          });

          const verify = await verifyPayment(
            order_id?.data?.id, //orderid from server
            response.razorpay_payment_id,
            response.razorpay_signature,
            response.method
          );

          const hostEmail = await property.hostEmail;
          if (verify) {
            if (property.bookingType.manual) {
              console.log("not selected");
              const update = await updateBookingStatus(
                booking?.data?._id,
                hostEmail,
                property.bookingType.manual,
                verify?.data?._id
              );

              await createPayout(
                booking?.data?._id,
                propertyId,
                totals.subtotal
              );
              // const payout = await initiatePayout(
              //   propertyId,
              //   totals?.total * 100,
              //   propertyHostId,
              //   booking?.data?._id,
              //   propertyTitle
              // );
            } else {
              console.log("This got selected");
              const confirm = await updateConfirmStatus(booking?.data?._id);
              await updateBookingStatus(
                booking?.data?._id,
                hostEmail,
                property.bookingType.manual,
                verify?.data?._id
              );
              await createPayout(
                booking?.data?._id,
                propertyId,
                totals.subtotal
              );
              // const payout = await initiatePayout(
              //   propertyId,
              //   totals?.total * 100,
              //   propertyHostId,
              //   booking?.data?._id,
              //   propertyTitle
              // );
            }

            router.push(`/booking-summary?${summaryParams.toString()}`);
          }

          // router.push(`/booking-summary/${response.razorpay_payment_id}`);
        },

        theme: {
          color: "#36621F", // Airbnb red color
        },
        modal: {
          ondismiss: async () => {
            console.log("its closed no");
            await closeModalUpdate(booking?.data?._id);
          },
        },
        notes: {
          propertyId: propertyId,
          checkIn: date.from.toISOString(),
          checkOut: date.to.toISOString(),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Payment initialization failed. Please try again.");
    }
  };
  async function fetchDates() {
    try {
      const response = await axios.get(
        `${API_URL}/booking/check-dates/${propertyId}`
      );

      if (response.status != 200) {
        throw new Error(
          `Failed to fetch host data (status: ${response.status})`
        );
      }
      console.log("oppo", response);
      setUnavailableDates(response?.data?.data);
      return response?.data?.data;
    } catch (err) {
      console.error(err);
    }
  }
  if (isLoading) {
    return <BookingPageSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Error loading property
          </h2>
          <p className="text-red-600">
            {error.message || "An unknown error occurred."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primaryGreen text-white rounded hover:bg-brightGreen"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Extract property details
  const propertyTitle = property?.title || "Property";
  const propertyLocation = property?.address
    ? `${property.address.city || ""}, ${property.address.state || ""}, ${
        property.address.country || ""
      }`
    : "Location not specified";
  const propertyImage = property?.photos[0];
  const propertyPrice = property?.basePrice;
  const propertyRating = property?.rating || 0;
  const propertyReviews = property?.reviews?.length || 0;
  const propertyAmenities = property?.amenities?.map((a) => a.name);
  const propertyHouseRules = property?.houseRules || [
    "No smoking",
    "No parties",
    "No pets",
  ];
  const found = Object.entries(property?.cancellationType).find(
    ([key, value]) => value === true
  );

  const propertyCheckIn = property?.checkInTime || "2:00 PM";
  const propertyCheckOut = property?.checkOutTime || "11:00 AM";
  if (isAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to listing
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-semibold font-bricolage mb-6">
              Confirm and pay
            </h1>

            <div className="mb-8 border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Your trip</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-1">Dates</h3>
                  <p>
                    {date.from.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {date.to?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Guests</h3>
                  <p>
                    {guests} guest{Number(guests) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">Check-in details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-1">Check-in</h3>
                  <p>{convertTo12HoursFormat(property?.checkinTime)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check-out</h3>
                  <p>{convertTo12HoursFormat(property?.checkoutTime)}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">House rules</h2>
              <ul className="space-y-2">
                {propertyHouseRules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8 border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">
                Cancellation policy
              </h2>
              <p className="text-gray-700">
                This property has {found} cancellation policy.
                {/* {property?.cancellationPolicy}
                {date.from.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                and get a full refund, minus the first night and service fee. */}
              </p>
              <Link
                href="/cancellation-policy"
                className="px-0 text-black font-medium underline mt-2"
              >
                Learn more
              </Link>
            </div>

            <div className="mb-8 border-b pb-8">
              <h2 className="text-xl font-semibold mb-4">Ground rules</h2>
              <p className="text-gray-700">
                We ask every guest to remember a few simple things about what
                makes a great guest.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                  <span>Follow the house rules</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                  <span>Treat your Host's home like your own</span>
                </li>
              </ul>
            </div>
            {showGuestModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">Guest Information</h2>
                    <button
                      onClick={() => setShowGuestModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Adults section */}
                    {guestData.adults.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">
                          Adults ({adults})
                        </h3>
                        {guestData.adults.map((adult, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                {index === 0
                                  ? "Primary Guest Name"
                                  : `Adult ${index + 1} Name`}
                              </label>
                              <input
                                type="text"
                                value={adult.name}
                                onChange={(e) =>
                                  updateGuestData(
                                    "adults",
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded ${
                                  formErrors[`adult-name-${index}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Full name"
                                readOnly={index === 0} // Make first adult name read-only
                              />
                              {index === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  User Name cannot be edited
                                </p>
                              )}
                              {formErrors[`adult-name-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors[`adult-name-${index}`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Age
                              </label>
                              <input
                                type="number"
                                min="18"
                                value={adult.age}
                                onChange={(e) =>
                                  updateGuestData(
                                    "adults",
                                    index,
                                    "age",
                                    // parseInt(e.target.value) || 13
                                    e.target.value === ""
                                      ? ""
                                      : parseInt(e.target.value, 10)
                                  )
                                }
                                className={`w-full p-2 border rounded ${
                                  formErrors[`adult-age-${index}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {formErrors[`adult-age-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors[`adult-age-${index}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Children section */}
                    {guestData.children.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">
                          Children ({children})
                        </h3>
                        {guestData.children.map((child, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Child {index + 1} Name
                              </label>
                              <input
                                type="text"
                                value={child.name}
                                onChange={(e) =>
                                  updateGuestData(
                                    "children",
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded ${
                                  formErrors[`child-name-${index}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Full name"
                              />
                              {formErrors[`child-name-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors[`child-name-${index}`]}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Age
                              </label>
                              <input
                                type="number"
                                min="3"
                                max="17"
                                value={child.age}
                                onChange={(e) =>
                                  updateGuestData(
                                    "children",
                                    index,
                                    "age",
                                    // parseInt(e.target.value) || 2
                                    e.target.value === ""
                                      ? ""
                                      : parseInt(e.target.value, 10)
                                  )
                                }
                                className={`w-full p-2 border rounded ${
                                  formErrors[`child-age-${index}`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {formErrors[`child-age-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formErrors[`child-age-${index}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end p-6 border-t">
                    <button
                      onClick={() => setShowGuestModal(false)}
                      className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmGuestInfo}
                      className="px-6 py-2 bg-primaryGreen text-white rounded hover:bg-brightGreen"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-8">
              <Button
                onClick={async () => {
                  await fetchForm();
                }}
                className="w-full h-12 text-base bg-primaryGreen hover:bg-brightGreen"
              >
                Pay ₹{totals.total.toLocaleString()}
              </Button>
              {property.bookingType.manual ? (
                <p className="text-sm text-center mt-4 text-gray-500">
                  Payment does not confirm your booking. Please wait for a
                  confirmation email from the Host.
                </p>
              ) : (
                <p className="text-sm text-center mt-4 text-gray-500">
                  Instant booking available.
                </p>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 self-start">
            <Card className="border rounded-xl shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                {/* <Image
                src={propertyImage || "/placeholder.svg"}
                alt={propertyTitle}
                width={120}
                height={120}
               
                className="rounded-lg object-cover"
              /> */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Entire {property?.propertyType} in{" "}
                    {property?.address?.city || "Goa"}
                  </p>
                  <CardTitle className="text-lg">{propertyTitle}</CardTitle>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 fill-current text-black mr-1" />
                    <span className="text-sm">
                      {propertyRating} · {propertyReviews} reviews
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border-t pt-6">
                <h3 className="font-medium font-bricolage text-lg mb-4">
                  Price details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="underline">
                      ₹{propertyPrice.toLocaleString()} x {totals.nights} night
                      {totals.nights > 1 ? "s" : ""}
                    </span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="hidden justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>₹{totals.cleaningFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">
                      Majestic Escape service fee
                    </span>
                    <span>₹{totals.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Taxes</span>
                    <span>₹{totals.taxes.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full font-semibold text-lg">
                  <span>Total (INR)</span>
                  <span>₹{totals.total.toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-6 p-4 border rounded-xl">
              <h3 className="font-semibold mb-4">
                Your reservation is protected by
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">Booking Protection Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm">24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
      You are not authorized to access this page. &nbsp;{" "}
      <Link href="/login">
        <u>
          <b>Click Here</b>
        </u>
      </Link>
      &nbsp; to log in now to access.
    </div>
  );
}

// Main component that creates a QueryClient and provides it to the BookPageContent
export default function BookPage() {
  // Create a client
  const queryClientRef = useRef(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <BookPageContent />
    </QueryClientProvider>
  );
}

function BookingPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-32 w-full mb-6 rounded-xl" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-14 w-full mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full mb-6 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
