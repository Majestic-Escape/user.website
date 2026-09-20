import React, { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  formatDate,
  parseDate,
  parseFiniteNumber,
  parseInteger,
} from "@/lib/format";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Receipt amounts keep their two-decimal look; a missing/invalid amount is
// "—", never "₹NaN.00" or "₹0.00".
const inr2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const money = (value) => {
  const n = parseFiniteNumber(value);
  return n === null ? "—" : inr2.format(n);
};
const Invoice = ({ payment, invoiceData }) => {
  const getDate = (date) => {
    const newDate = parseDate(date);
    if (!newDate) return "—";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZoneName: "short",
    };

    return newDate.toLocaleString("en-US", options);
  };
  const changeUpperCase = (data) => {
    return data
      ?.trim()
      ?.split(" ")
      ?.map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(),
      )
      ?.join(" ");
  };

  const calTax = (subtotal, serviceFee) => {
    if (subtotal <= 7500) {
      return Math.round(subtotal * 0.12); // 12% GST in India
    } else if (subtotal > 7500) {
      return Math.round(subtotal * 0.18); // 18% GST in India
    }
  };
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("ul", payment);
  }
  // Per-night is derived from the stored subtotal and nights; nights are
  // never back-computed from money. Anything missing renders as "—".
  const subTotal = parseFiniteNumber(invoiceData?.subTotal);
  const nights = parseInteger(invoiceData?.nights, 1);
  const perNight =
    subTotal !== null && nights !== null ? subTotal / nights : null;
  const serviceFee = subTotal !== null ? Math.round(subTotal * 0.12) : null;
  const gst = subTotal !== null ? calTax(subTotal, subTotal * 0.12) : null;
  const price = parseFiniteNumber(invoiceData?.price);
  // Stay dates are UTC-midnight instants: show the calendar day as booked.
  const stayDate = (v) =>
    formatDate(
      v,
      { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
      "—",
      "en-US",
    );
  const listing = invoiceData?.propertyId ?? {};
  const host = invoiceData?.hostId ?? {};
  const adults = Array.isArray(invoiceData?.guestData?.adults)
    ? invoiceData.guestData.adults
    : [];
  const children = Array.isArray(invoiceData?.guestData?.children)
    ? invoiceData.guestData.children
    : [];

  return (
    <div className="min-h-screen  flex justify-center py-10">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-md p-8">
        {/* Header */}
        <div className="border-b pb-4 mb-4 flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Your receipt from Majestic Escape
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Booking ID:{" "}
              <span className="font-medium text-gray-700">
                {invoiceData._id}
              </span>{" "}
              •{" "}
              {formatDate(
                invoiceData?.createdAt,
                { month: "short", day: "numeric", year: "numeric" },
                "—",
                "en-US",
              )}
            </p>
          </div>
          <Image
            width={200}
            height={100}
            src={"/logo.svg"}
            className="w-12 h-12"
            alt="Logo"
          />
        </div>

        {/* Property Info */}
        <div className="mb-6 flex justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {listing.title ?? "—"}
            </h2>
            <p className="text-sm text-gray-500">
              {[listing.address?.street, listing.address?.district]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-500">
              {[listing.address?.city, listing.address?.state]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-sm text-gray-500">{listing.address?.pincode}</p>
            <br />
            <p className="text-sm text-gray-500 mt-1">
              {stayDate(invoiceData?.checkIn)} &nbsp;–&nbsp;{" "}
              {stayDate(invoiceData?.checkOut)}
            </p>
            <p className="text-sm text-gray-500">
              {changeUpperCase(listing.placeType)} &nbsp;
              {changeUpperCase(listing.propertyType)} •{" "}
              {listing.beds ?? "—"} bed •{" "}
              {listing.guests ?? "—"} guest
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hosted by{" "}
              <span className="font-medium">
                {changeUpperCase(host?.firstName) || "your host"}
              </span>
            </p>
            <div className="mt-2">
              {/* <p className="text-sm text-gray-500">
              Confirmation code:{" "}
              <span className="font-semibold">HM5ZA5R82N</span>
            </p> */}
              <div className="mt-2 flex gap-4 text-sm text-blue-600 underline">
                {/* <a href="#">Go to itinerary</a>
                <a href="#">Go to listing</a> */}
              </div>
            </div>
          </div>
          <div>
            <Image
              width={200}
              height={200}
              src={invoiceData?.propertyId?.photos?.[0]}
              // className="w-12 h-12"
              alt="Logo"
            />
          </div>
        </div>

        {/* Traveler Info */}
        <div className="mb-6 border-t border-b py-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Traveler:</span>
            {adults[0] ? (
              <div>
                {changeUpperCase(adults[0]?.name) ?? "—"},{" "}
                {adults[0]?.age ?? "—"} (booked by)
              </div>
            ) : null}
            {adults.slice(1).map((item, index) => (
              <div key={`adult-${index}`}>
                {changeUpperCase(item?.name)?.trim() ?? "—"}, {item?.age ?? "—"}
              </div>
            ))}
            {children.map((item, index) => (
              <div key={`child-${index}`}>
                {changeUpperCase(item?.name) ?? "—"}, {item?.age ?? "—"}
              </div>
            ))}
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-6 border-b pb-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Cancellation policy
          </h3>
          <p className="text-sm text-gray-600">
            {invoiceData?.cancellationPolicy == "moderate"
              ? `Your booking has moderate cancellation policy. If you cancel anytime before 7 days of check-in, you receive a full refund. If the booking is within 7 days of check-in, the reservation becomes non-refundable, and you will not be able to cancel the booking. Once the check-in date has arrived, cancellation is not possible.`
              : invoiceData?.cancellationPolicy == "flexible"
                ? `Your booking has flexible cancellation policy. 
If you cancel at anytime before 24 hours before check-in, you receive a full refund. If the booking is within 24 hours of check-in, the reservation becomes non-refundable, and you will not be able to cancel the booking. After the check-in time passes, cancellation is no longer possible.`
                : `Your booking has strict cancellation policy. At no point will the booking be eligible for cancellation.The reservation is non-refundable.`}
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">
            Price breakdown
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>
                {money(perNight)} × {nights ?? "—"} night
                {nights !== null && nights !== 1 ? "s" : ""}
              </span>
              <span>{money(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Majestic Escape service fee</span>
              <span>{money(serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (GST)</span>
              <span>{money(gst)}</span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total (INR)</span>
              <span>{money(price)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6 pb-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Payment</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>{changeUpperCase(payment?.paymentMethod)}</p>
            <p>{getDate(payment?.createdAt)}</p>
            <p className="font-medium">{money(price)}</p>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Amount paid (INR)</span>
              <span>{money(price)}</span>
            </div>
          </div>
        </div>

        {/* Taxes Info */}
        <div className="mb-6 text-sm text-gray-600">
          {/* <p>Occupancy taxes include CGST (In - Goa), SGST (In - Goa).</p> */}
          <p className="mt-2">
            Majestic Escape Payments India Pvt. Ltd. is a limited payment
            collection agent of your Host. Upon payment of the total price to
            Majestic Escape Payments, your payment obligation to your host is
            satisfied.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-gray-500">
          {/* <p>
            Payment processed by Majestic Escape Payments India Pvt. Ltd.
            <br />
            c/o 4th floor, Statesman House, Barakhamba Road, Connaught Place,
            New Delhi - 110001
          </p>
          <p className="mt-2">
            Level 9, Spaze i-Tech Park, A1 Tower, Sector 49, Sohna Road,
            Gurugram, India - 122018
          </p> */}
          <p className="mt-2">
            <a href="" className="text-blue-600 underline">
              www.majesticescape.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
