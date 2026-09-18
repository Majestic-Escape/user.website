// Batch P — the backend calls this after a public listing change so the
// cached catalogue (the ISR home/stays pages, the Data Cache entries their
// server fetches created, and this project's edge copies of the proxied
// /api/v1 responses) is refreshed by tag. Purging marks entries stale: the
// next request may still get the old copy while it revalidates, the one
// after is fresh.
//
// Secret-gated (x-revalidate-secret vs REVALIDATE_SECRET, constant time),
// POST only, tags allow-listed. Nothing here reads or writes data.
import { createHash, timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { invalidateByTag } from "@vercel/functions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAG = /^(listings|listing:[a-f0-9]{24})$/;
const MAX_TAGS = 20;
const MAX_BODY = 4096;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function secretOk(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretOk(request.headers.get("x-revalidate-secret"))) {
    return json(401, { success: false, code: "UNAUTHORIZED" });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(400, { success: false, code: "BODY_TOO_LARGE" });
  let tags: unknown;
  try {
    tags = JSON.parse(raw).tags;
  } catch {
    return json(400, { success: false, code: "INVALID_JSON" });
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every((t) => typeof t === "string" && TAG.test(t))) {
    return json(400, { success: false, code: "INVALID_TAGS" });
  }
  const unique = Array.from(new Set(tags as string[]));
  for (const tag of unique) revalidateTag(tag);
  try {
    await invalidateByTag(unique); // no-op outside Vercel
  } catch {
    // The Next.js revalidation above already happened; the edge copy expires by TTL.
  }
  return json(200, { success: true, revalidated: unique });
}

export function GET() {
  return json(405, { success: false, code: "METHOD_NOT_ALLOWED" });
}
