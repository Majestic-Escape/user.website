import { fetchMessagingEnabled } from "@/lib/messaging-config";
import InboxLayoutClient from "./inbox-layout-client";

// Server half of the admin Messaging switch for the host inbox: read once per
// 10 s window (Next's data cache), so a visit costs no extra request, and passed
// down so the first paint is already right. An unreadable answer means "on" —
// the chat service refuses requests itself while the switch is off.
export default async function InboxLayout({ children }) {
  const enabled = (await fetchMessagingEnabled({ revalidate: 10 })) !== false;
  return <InboxLayoutClient messagingEnabled={enabled}>{children}</InboxLayoutClient>;
}
