import { NextResponse } from "next/server";
import { probeMessagingAvailability } from "@/lib/messaging-config";

// Is guest-host messaging available? One cheap, public, same-origin answer for every
// browser (see lib/messaging-config.js for why the probing lives here and not in the
// browser). It reveals nothing beyond "is the chat feature offered" — the same thing
// a visitor can see on the page.
//
// Cost: the response is cached at the CDN (`s-maxage`) with stale-while-revalidate, so
// the two probes behind it run at most about once per window per region no matter
// how many visitors there are, and visitors never wait for them. A dead service is
// cached longer than a live one: it only changes when the owner un-pauses it, and each
// dead probe is the slow one.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let inflight = null; // one probe at a time per instance

export async function GET() {
  const run = inflight ?? (inflight = probeMessagingAvailability().finally(() => { inflight = null; }));
  const enabled = await run;
  return NextResponse.json(
    { enabled },
    {
      headers: {
        "Cache-Control": enabled
          ? "public, s-maxage=10, stale-while-revalidate=60"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
