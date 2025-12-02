"use client";

import React, { Suspense } from "react";
import FarmHouse from "./farm-house";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24">Loading...</div>}>
      <FarmHouse />
    </Suspense>
  );
}
