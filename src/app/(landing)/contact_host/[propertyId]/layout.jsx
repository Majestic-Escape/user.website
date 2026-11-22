import { fetchMessagingEnabled } from "@/lib/messaging-config";
import { MessagingRouteGuard } from "@/components/messaging-route-guard";
import RouteLoading from "@/components/route-loading";

// "Message host" compose page: same server-side gate as /messages, so the page
// (and the socket it would open) is never reachable while messaging is off.
export default async function ContactHostLayout({ children }) {
  const enabled = (await fetchMessagingEnabled({ revalidate: 10 })) !== false;
  return (
    <MessagingRouteGuard serverEnabled={enabled} fallback={<RouteLoading className="min-h-[50vh] pt-4" />}>
      {children}
    </MessagingRouteGuard>
  );
}
