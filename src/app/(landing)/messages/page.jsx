import React, { Suspense } from "react";
import Messaging from "./Messaging";
import MessagesSkeleton from "./MessagesSkeleton";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default function MessageLayout() {
  return (
    // Same skeleton the client component uses while it loads, so the Suspense
    // boundary and the component's own loading state are visually identical —
    // previously these were two different spinners and the user saw both in
    // sequence on a single navigation.
    <Suspense fallback={<MessagesSkeleton />}>
      <Messaging />
    </Suspense>
  );
}
