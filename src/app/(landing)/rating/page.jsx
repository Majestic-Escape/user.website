"use client";

import React, { Suspense } from "react";
import Ratings from "./ratings";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24">Loading...</div>}>
      <Ratings />
    </Suspense>
  );
}
