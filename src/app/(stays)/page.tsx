import { HydrationBoundary } from "@tanstack/react-query";
import Hero from "@/components/hero-section";
import StaysProperties from "@/components/stays-properties";
import BecomePartner from "@/components/become-partner";
import LocationWiseStays from "@/components/location-wise-stays";
import Blogs from "@/components/blogs";
import { prefetchCatalogue } from "@/lib/server/catalogue";

// Batch P: the page is regenerated at most every 5 minutes, and on demand
// when the backend reports a listing change (POST /api/revalidate). The
// listing grid and destination counts are prefetched on the server and
// hydrated into the shared QueryClient, so they are in the first HTML and
// the client only refetches once the snapshot is older than staleTime.
// Segment config must be a literal: keep in sync with CATALOGUE_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function Component() {
  const state = await prefetchCatalogue();
  return (
    <HydrationBoundary state={state ?? undefined}>
      <div>
        <Hero />
        <StaysProperties />
        <BecomePartner />

        <LocationWiseStays />
        <Blogs />
      </div>
    </HydrationBoundary>
  );
}
