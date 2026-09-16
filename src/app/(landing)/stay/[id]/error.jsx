"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

// Error boundary for the stay page. page.jsx throws when the listing can't be
// fetched (instead of rendering an error page as a 200, which ISR would cache
// for an hour). This keeps the previous "Error loading property" UI; `reset`
// re-renders the segment so a transient backend blip can be retried in place.
export default function StayError({ error, reset }) {
  const params = useParams();

  useEffect(() => {
    console.error("Error loading property:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-32">
      <div className="text-center p-8 bg-red-50 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          Error loading property
        </h2>
        <p className="text-red-600">Try refreshing</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
          <a
            href={`/stay/${params?.id ?? ""}`}
            className="inline-block px-4 py-2 border border-red-600 text-red-700 rounded hover:bg-red-100"
          >
            Reload page
          </a>
        </div>
      </div>
    </div>
  );
}
