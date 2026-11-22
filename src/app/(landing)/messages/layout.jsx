import { fetchMessagingEnabled } from "@/lib/messaging-config";
import { MessagingRouteGuard } from "@/components/messaging-route-guard";
import MessagesSkeleton from "./MessagesSkeleton";

// Server half of the admin Messaging switch for the guest inbox (see
// host/inbox/layout.jsx): while it is off the page is not rendered at all, so a
// typed URL or an old e-mail link lands on the unavailable notice. While the
// answer is pending the guard shows the same skeleton the page itself starts with.
export default async function MessagesLayout({ children }) {
  const enabled = (await fetchMessagingEnabled({ revalidate: 10 })) !== false;
  return (
    <MessagingRouteGuard serverEnabled={enabled} fallback={<MessagesSkeleton />}>
      {children}
    </MessagingRouteGuard>
  );
}
