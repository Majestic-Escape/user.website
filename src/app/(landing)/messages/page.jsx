import React, { Suspense } from "react";
import Messaging from "./Messaging";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default function MessageLayout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
        </div>
      }
    >
      <Messaging />
    </Suspense>
  );
}
