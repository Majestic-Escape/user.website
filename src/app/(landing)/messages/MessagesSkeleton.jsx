import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationRowSkeleton } from "@/components/conversation-row-skeleton";

// Loading shell for /messages.
//
// This replaces two *different* spinners that used to cover the same page — a
// 20x20 ring in page.jsx's Suspense fallback and an 8x8 Loader2 inside
// Messaging.jsx. Because they didn't match, navigating to Messages showed one
// spinner, then the other, then the list: three distinct frames for one
// navigation. Both entry points now render this, so the chrome (title, search,
// filters, row geometry) is identical from the very first frame through to the
// loaded list and nothing jumps.
//
// The geometry below deliberately mirrors the real markup in Messaging.jsx —
// `p-4 border-b` header, `p-2 border-b` filter strip, `p-2 space-y-2` list of
// `p-3` cards with a 12x12 avatar. If you restyle the list, restyle this too.

export default function MessagesSkeleton({ rows = 5 }) {
  return (
    <div
      className="h-screen pt-12 md:pt-[76px] pb-16 md:pb-0 w-full bg-white font-poppins flex overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading your conversations…</span>
      <div className="flex flex-col w-full md:w-[380px] border-r overflow-hidden bg-white">
        {/* Header — matches the real one so the title doesn't shift on load */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bricolage font-semibold">Messages</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <div className="pl-8 bg-gray-50 border-none rounded-lg text-sm h-9 flex items-center">
              <span className="text-gray-400 text-sm">Search conversations...</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-2 border-b">
          <div className="flex gap-1 px-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
              <ConversationRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop reading pane placeholder — keeps the two-column layout stable
          on md+ so the list doesn't visibly reflow once data lands. */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white" />
    </div>
  );
}
