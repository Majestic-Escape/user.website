import { Skeleton } from "@/components/ui/skeleton";
import ImageGallery from "./components/image-gallery";

// Geometry-matched placeholder for the stay page: same container, top
// padding, title slot and the real gallery skeleton, so the transition from
// placeholder to content doesn't shift anything.
export default function Loading() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="me-fade-in min-h-screen bg-white pt-[80px] md:pt-52 desktop:pt-56"
    >
      <span className="sr-only">Loading property…</span>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-0.5 overflow-hidden"
      >
        <div className="me-route-progress h-full w-full bg-primaryGreen" />
      </div>
      <div aria-hidden="true" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-7 w-2/3 max-w-lg lg:mt-4 md:mb-6" />
        <ImageGallery images={[]} isLoading />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
