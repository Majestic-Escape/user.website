import RouteLoading from "@/components/route-loading";

// The dashboard layout (sidebar + header) persists; only the page area
// shows the placeholder.
export default function Loading() {
  return <RouteLoading className="min-h-[60vh] pt-4" />;
}
