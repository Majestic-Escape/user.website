import { Skeleton } from "@/components/ui/skeleton";

// Shared loading rows for the two conversation lists — /messages (guest) and
// /host/inbox (host). Both render the same card geometry (`p-3` card, 12x12
// avatar, name + timestamp row, property badge, preview line), so they get the
// same placeholder instead of one showing a spinner and the other showing bars.
//
// Keep this in step with the real rows in both files. If you restyle a
// conversation card, restyle this too — a skeleton that doesn't match its
// content is worse than none, because the layout jumps when data lands.

export function ConversationRowSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-gray-50">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-10 ml-2 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>
    </div>
  );
}

export default function ConversationRowsSkeleton({ rows = 5 }) {
  return (
    <div className="p-2 space-y-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading conversations…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <ConversationRowSkeleton key={i} />
      ))}
    </div>
  );
}
