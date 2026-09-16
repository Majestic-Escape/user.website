"use client";

import RouteError from "@/components/route-error";

export default function Error({ error, reset }) {
  return <RouteError error={error} reset={reset} homeHref="/host/dashboard/listings" homeLabel="Back to listings" />;
}
