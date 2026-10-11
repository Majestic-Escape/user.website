"use client";

// "Why is this date unavailable?" for the host calendar (SyncGuard explain).
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { explainDate } from "./api";
import { relativeTime } from "./status";

const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function describe(r) {
  if (r.type === "external") {
    const what = r.kind === "reserved" ? "a booking" : r.kind === "blocked" ? "unavailable dates" : "a calendar entry";
    let text = `${r.channelLabel} shows ${what} from ${fmt(r.checkIn)} to ${fmt(r.checkOut)}.`;
    if (r.state === "missing") text += ` It has disappeared from ${r.channelLabel}; we keep it blocked until that is confirmed.`;
    if (r.state === "orphaned") text += ` That calendar was disconnected; you chose to keep these dates blocked.`;
    if (r.echo) text += ` (It may be ${r.channelLabel} copying a Majestic booking.)`;
    if (r.conflict && !r.conflict.likelyMirror) text += " It overlaps a Majestic booking — our team has been alerted.";
    return text;
  }
  if (r.type === "majestic_booking") return `A guest booked on Majestic from ${fmt(r.checkIn)} to ${fmt(r.checkOut)}.`;
  if (r.type === "host_block") return `You blocked ${fmt(r.checkIn)} to ${fmt(r.checkOut)}.`;
  if (r.type === "checkout_hold") return "A guest is completing a booking for this date right now.";
  return "Unavailable.";
}

export default function ExplainDialog({ propertyId, date, onOpenChange }) {
  const { data, isLoading, isError } = useQuery({ queryKey: ["calendarSyncExplain", propertyId, date], queryFn: () => explainDate(propertyId, date), enabled: !!(propertyId && date), staleTime: 0, gcTime: 60_000, retry: false });
  return (
    <Dialog open={!!date} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-md rounded-xl p-5 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none">
        <DialogHeader className="text-left">
          <DialogTitle>Why is {date ? fmt(date) : ""} unavailable?</DialogTitle>
          <DialogDescription>What blocks this night, and where it came from.</DialogDescription>
        </DialogHeader>
        {isLoading && <Skeleton className="h-16 w-full" />}
        {isError && <p className="text-sm text-red-700">We couldn't load the explanation.</p>}
        {data && (
          <div className="space-y-3 text-sm">
            {data.available ? (
              <p>This date is available.</p>
            ) : (
              <ul className="space-y-2">
                {data.reasons.map((r, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <p className="text-gray-900">{describe(r)}</p>
                    {r.type === "external" && (
                      <p className="mt-1 text-xs text-gray-500">
                        First seen {relativeTime(r.firstSeenAt)}
                        {r.sourceLastSyncedAt ? ` · ${r.channelLabel} last checked ${relativeTime(r.sourceLastSyncedAt)}` : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {data.timeline.length > 0 && (
              <details>
                <summary className="cursor-pointer text-gray-700">History</summary>
                <ul className="mt-2 space-y-1 text-xs text-gray-600">
                  {data.timeline.slice(0, 15).map((t, i) => (
                    <li key={i}>
                      {new Date(t.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} — {t.channelLabel ? `${t.channelLabel}: ` : ""}
                      {t.type.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
