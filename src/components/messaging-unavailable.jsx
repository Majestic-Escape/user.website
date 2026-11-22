import Link from "next/link";
import { MessageCircleOff } from "lucide-react";

// What /messages, /host/inbox and /contact_host show while an admin has
// messaging switched off. No data, no sockets, no retry button: there is
// nothing to retry until it is switched back on (the guard re-checks by itself).
export function MessagingUnavailable({ home = "/", homeLabel = "Back to home" }) {
  return (
    <div
      role="status"
      className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <MessageCircleOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold text-gray-900">Messaging is temporarily unavailable</h1>
      <p className="mt-2 text-sm text-gray-600">
        We&apos;ve paused messaging for a short while. Your conversations are safe and will be back
        here as soon as it&apos;s on again.
      </p>
      <Link
        href={home}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-primaryGreen px-5 text-sm text-white hover:bg-brightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
