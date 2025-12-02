import React, { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const Invoice = ({ payment, invoiceData }) => {
  const getDate = (date) => {
    const newDate = new Date(date);
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
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const changeUpperCase = (data) => {
    return data
      ?.trim()
      ?.split(" ")
      ?.map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      )
      ?.join(" ");
  };

  const calTax = (subtotal, serviceFee) => {
    if (subtotal <= 7500) {
      return Math.round(subtotal * 0.12) + Math.round(serviceFee * 0.18); // 12% GST in India
    } else if (subtotal > 7500) {
      return Math.round(subtotal * 0.18) + Math.round(serviceFee * 0.18); // 18% GST in India
    }
  };
  console.log("ul", payment);

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
              • {fmt.format(new Date(invoiceData.createdAt))}
            </p>
          </div>
          <Image
            width={200}
            height={100}
            src="/logo.svg"
            className="w-12 h-12"
            alt="Logo"
          />
        </div>

        {/* Property Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {invoiceData.propertyId.title}
          </h2>
          <p className="text-sm text-gray-500">
            {invoiceData.nights} night in {invoiceData.propertyId.address.city}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {fmt.format(new Date(invoiceData.checkIn))} &nbsp;–&nbsp;{" "}
            {fmt.format(new Date(invoiceData.checkOut))}
          </p>
          <p className="text-sm text-gray-500">
            {changeUpperCase(invoiceData.propertyId.placeType)} &nbsp;
            {changeUpperCase(invoiceData.propertyId.propertyType)} •{" "}
            {invoiceData.propertyId.beds} bed • {invoiceData.propertyId.guests}{" "}
            guest
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Hosted by{" "}
            <span className="font-medium">
              {changeUpperCase(invoiceData.hostId.firstName) +
                " " +
                changeUpperCase(invoiceData.hostId.lastName)}
            </span>
          </p>

          <div className="mt-2">
            {/* <p className="text-sm text-gray-500">
              Confirmation code:{" "}
              <span className="font-semibold">HM5ZA5R82N</span>
            </p> */}
            <div className="mt-2 flex gap-4 text-sm text-blue-600 underline">
              <a href="#">Go to itinerary</a>
              <a href="#">Go to listing</a>
            </div>
          </div>
        </div>

        {/* Traveler Info */}
        <div className="mb-6 border-t border-b py-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Traveler:</span>
            <div key={invoiceData.guestData?.adults[0]?.age}>
              {changeUpperCase(invoiceData.guestData?.adults[0]?.name)},{" "}
              {invoiceData.guestData?.adults[0]?.age} (booked by)
            </div>
            {invoiceData.guestData?.adults.slice(1).map((item, index) => (
              <div key={item.age || index}>
                {changeUpperCase(item?.name).trim()}, {item?.age}
              </div>
            ))}
            {invoiceData.guestData?.children
              ? invoiceData.guestData?.children.map((item, index) => (
                  <div key={item.name || index}>
                    {changeUpperCase(item.name)}, {item.age}
                  </div>
                ))
              : null}
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 text-sm mb-1">
            Cancellation policy
          </h3>
          <p className="text-sm text-gray-600">
            Free cancellation before 1:00 PM on Apr 20. After that, the
            reservation is non-refundable. Cutoff times are based on the
            listing’s local time.
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
                ₹{invoiceData.subTotal.toLocaleString()}.00 ×{" "}
                {invoiceData.nights} night
              </span>
              <span>₹{invoiceData.subTotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between">
              <span>Majestic Escape service fee</span>
              <span>
                ₹{Math.round(invoiceData.subTotal * 0.12).toLocaleString()}.00
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>
                ₹
                {calTax(
                  invoiceData.subTotal,
                  invoiceData.subTotal * 0.12
                ).toLocaleString()}
                .00
              </span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total (INR)</span>
              <span>₹{invoiceData.price.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Payment</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>{changeUpperCase(payment?.paymentMethod)}</p>
            <p>{getDate(payment?.createdAt)}</p>
            <p className="font-medium">
              ₹{invoiceData.price.toLocaleString()}.00
            </p>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Amount paid (INR)</span>
              <span>₹{invoiceData.price.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {/* Taxes Info */}
        <div className="mb-6 text-sm text-gray-600">
          <p>Occupancy taxes include CGST (In - Goa), SGST (In - Goa).</p>
          <p className="mt-2">
            Majestic Escape Payments India Pvt. Ltd. is a limited payment
            collection agent of your Host. Upon payment of the total price to
            Majestic Escape Payments, your payment obligation to your host is
            satisfied.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-gray-500">
          <p>
            Payment processed by Majestic Escape Payments India Pvt. Ltd.
            <br />
            c/o 4th floor, Statesman House, Barakhamba Road, Connaught Place,
            New Delhi - 110001
          </p>
          <p className="mt-2">
            Level 9, Spaze i-Tech Park, A1 Tower, Sector 49, Sohna Road,
            Gurugram, India - 122018
          </p>
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
