import React, { Suspense } from "react";
import BookingSummaryPage from "./booking-summary-page";
import BookingList from "./BookingList";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default function HostLayout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
        </div>
      }
    >
      <BookingList />
    </Suspense>
  );
}
