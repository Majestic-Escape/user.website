"use client";

import React, { Suspense, useEffect } from "react";
import FarmHouse from "../../filter/farm-house";
import { useParams, useSearchParams } from "next/navigation";

export default function LocationPage() {
  const params = useParams();
  const locationName = params.id;
  useEffect(() => {
    sessionStorage.setItem(
      "searchFilters",
      JSON.stringify({
        dateRange: {
          from: null,
          to: null,
        },
        searchTerm: `${locationName}`,
        guests: {
          adults: 0,
          children: 0,
          infants: 0,
        },
      }),
    );
  }, []);
  return (
    <Suspense fallback={<div className="min-h-screen pt-24">Loading...</div>}>
      <FarmHouse locationName={locationName} />
    </Suspense>
  );
}
