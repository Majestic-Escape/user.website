"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StayRow from "@/components/stay-row";
import RelatedStayCard from "@/components/related-stay-card";
import { queryKeys } from "@/lib/query-keys";
import { PUBLIC } from "@/lib/query-presets";
import { counterpartName } from "@/lib/displayName";
import {
  HOST_ROW_TITLE,
  NEARBY_ROW_TITLE,
  RELATED_CLIENT_TIMEOUT_MS,
  RELATED_PATH,
  nearbySubtitle,
  readRelatedStays,
} from "@/lib/related-stays";

// "More stays hosted by …" and "Similar stays nearby" under the host profile
// of a live stay (server.me docs/related-stays.md).
//
// The rows normally come with the page: page.jsx fetches them on the server
// (inside the stay page's ISR, validated with readRelatedStays) and a
// non-null `initialRelated` is rendered as-is — no client request, nothing
// in React Query that a stale entry could override. Only when the server
// render had no rows to give (the request failed, timed out or returned a
// malformed payload: `initialRelated === null`) does the browser fetch them,
// once the section is near the viewport (on mount without
// IntersectionObserver). Failures of that fetch render nothing: the rows
// are optional, the stay page around them is unaffected. Every attempt has
// its own deadline (a request that never completes must not leave the
// skeleton up), one retry follows a failure, and an `unavailable` answer
// (the API could not answer) is a failure — never cached as "nothing
// related": the next visit asks again.
//
// Render with key={propertyId} so moving between stays starts clean.

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// The caller's signal (React Query cancels on unmount) plus a deadline.
// AbortSignal.any / timeout are newer than the browsers the site supports
// (Safari < 17.4, Firefox < 124): a controller and a timer do the same. The
// deadline also REJECTS the attempt itself, so a fetch or body read that never
// settles even after its abort (seen under a test harness) cannot hold the
// skeleton up: the attempt ends at the deadline whatever the platform does.
function withDeadline(signal, ms) {
  const ctl = new AbortController();
  let fail;
  const expired = new Promise((_, reject) => { fail = reject; });
  expired.catch(() => {}); // only observed through the race below
  const abort = (reason) => {
    ctl.abort();
    fail(reason);
  };
  const timer = setTimeout(() => {
    const err = new Error("related stays: deadline");
    err.name = "TimeoutError";
    abort(err);
  }, ms);
  const onCallerAbort = () => {
    const err = new Error("related stays: cancelled");
    err.name = "AbortError";
    abort(err);
  };
  if (signal) {
    if (signal.aborted) onCallerAbort();
    else signal.addEventListener("abort", onCallerAbort, { once: true });
  }
  return {
    signal: ctl.signal,
    race: (work) => Promise.race([work, expired]),
    done: () => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onCallerAbort);
    },
  };
}

async function fetchRelatedStays(id, signal) {
  const attempt = withDeadline(signal, RELATED_CLIENT_TIMEOUT_MS);
  try {
    return await attempt.race(
      (async () => {
        const res = await fetch(`${API_URL}${RELATED_PATH(id)}`, { signal: attempt.signal, headers: { Accept: "application/json" } });
        if (!res.ok) {
          const err = new Error(`related stays → ${res.status}`);
          err.status = res.status;
          throw err;
        }
        const rows = readRelatedStays(await res.json(), id);
        if (!rows) throw new Error("related stays: unexpected payload");
        if (rows.unavailable) {
          const err = new Error("related stays: unavailable");
          err.status = 503; // transient: retried once, never stored as data
          throw err;
        }
        return rows;
      })(),
    );
  } finally {
    attempt.done();
  }
}

function Rows({ data, host }) {
  // The host row belongs to the host this page shows. If the listing was
  // reassigned since the rows were built, they would be another host's
  // stays under this host's name — hide that row until both agree.
  const hostId = host && typeof host === "object" && host._id ? String(host._id) : null;
  const showHost = data.host.length > 0 && hostId !== null && data.sourceHostId === hostId;
  const name = counterpartName(host, "");
  if (!showHost && !data.nearby.length) return null;
  return (
    <div className="space-y-10 md:space-y-12" data-testid="related-stays">
      {showHost ? (
        <StayRow
          testId="related-host"
          title={name ? HOST_ROW_TITLE(name) : "More stays from this host"}
          items={data.host}
          renderItem={(stay) => <RelatedStayCard stay={stay} />}
        />
      ) : null}
      {data.nearby.length ? (
        <StayRow
          testId="related-nearby"
          title={NEARBY_ROW_TITLE}
          subtitle={nearbySubtitle(data.nearbyScope)}
          items={data.nearby}
          renderItem={(stay) => <RelatedStayCard stay={stay} reserveDistance />}
        />
      ) : null}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4" data-testid="related-skeleton">
      <div className="h-7 w-56 max-w-full rounded bg-gray-100 motion-safe:animate-pulse" />
      <div className="-mx-4 flex gap-4 overflow-hidden px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-1.5 lg:gap-5 lg:px-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[78%] max-w-[300px] shrink-0 sm:w-[42%] md:w-[30%] lg:w-[calc((100%-3*1.25rem)/4)] lg:max-w-none">
            <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 motion-safe:animate-pulse" />
            <div className="mt-2.5 h-4 w-4/5 rounded bg-gray-100 motion-safe:animate-pulse" />
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-100 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// The browser fallback: its own component so the page never calls hooks
// conditionally (null ↔ rows switches mount / unmount it instead).
function RelatedStaysFetch({ propertyId, host }) {
  const sentinelRef = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver !== "function") {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { data, isFetching, failureCount } = useQuery({
    queryKey: queryKeys.relatedStays(propertyId),
    queryFn: ({ signal }) => fetchRelatedStays(propertyId, signal),
    enabled: near && !!propertyId,
    ...PUBLIC,
  });
  // The skeleton covers the first attempt only: React Query holds its retry
  // until the window has focus again, and a background tab must not come
  // back to a placeholder that has been waiting all along.
  return (
    <div ref={sentinelRef} data-testid="related-fallback">
      {data ? <Rows data={data} host={host} /> : isFetching && failureCount === 0 ? <RowSkeleton /> : null}
    </div>
  );
}

export default function RelatedStays({ propertyId, initialRelated, host }) {
  if (initialRelated) return <Rows data={initialRelated} host={host} />;
  return <RelatedStaysFetch propertyId={propertyId} host={host} />;
}
