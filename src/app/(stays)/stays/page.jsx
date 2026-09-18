import { HydrationBoundary } from "@tanstack/react-query";
import LocationWiseStays from "@/components/location-wise-stays";
import StaysProperties from "@/components/stays-properties";
import { prefetchCatalogue } from "@/lib/server/catalogue";

// Batch P: same server prefetch + hydration as the home page (see
// src/app/(stays)/page.tsx); regenerated every 5 minutes or on demand.
// Segment config must be a literal: keep in sync with CATALOGUE_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function Stays() {
  const state = await prefetchCatalogue();
  return (
    <HydrationBoundary state={state ?? undefined}>
      <main className="pt-40 pb-16 md:pt-56 desktop:pt-64">
        <StaysProperties />
        <LocationWiseStays />
      </main>
    </HydrationBoundary>
  );
}
