import "server-only";
// The admin-managed homepage banner (server.me docs/site-hero.md), read at
// page generation — never per visitor.
//
// Cached under the `site-hero` tag: the backend purges it on every publish
// (POST /api/revalidate), so the next generation reads the new banner; the
// hour-long revalidate only bounds staleness when a purge is lost, and the
// 5-minute page regenerations in between reuse this entry (no backend call).
// Like the catalogue it carries the fresh bypass, so a regeneration after a
// purge is never refilled from a stale edge copy of the API response.
//
// A payload that fails validateHero() means null: the page shows the
// bundled banner. A backend that can't be reached (error, 5xx, timeout)
// never fails the page — like the catalogue, the error is swallowed:
//  - the answer this server process last read successfully is used, if it
//    is less than a day old (a replaced banner's images are kept at least
//    24 h after it is retired, so its URLs still resolve);
//  - otherwise (a fresh instance, the build) the bundled banner.
// Either way the failed fetch is not cached, so the page is regenerated
// with the real banner within one page period (5 min) once the backend
// answers. Throwing instead is not safe: after a purge (revalidateTag) Next
// renders the page in the foreground, and a thrown error there is a 500
// for the home page for as long as the backend is failing
// (tests/pw-final/hero-isr-failure.mjs).
// HERO_DYNAMIC=off ignores the API altogether (a redeploy-time kill switch).
import { backendBase } from "@/lib/server/catalogue";
import { heroSource, validateHero } from "@/lib/hero";

export const HERO_REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 6000;

export type HeroConfig = ReturnType<typeof validateHero>;

const LAST_GOOD_MAX_AGE_MS = 24 * 60 * 60 * 1000;
let lastGood: { config: HeroConfig; at: number } | null = null;

export async function fetchSiteHero(): Promise<HeroConfig> {
  if (process.env.HERO_DYNAMIC === "off") return null;
  const base = backendBase();
  if (!base) return null;
  try {
    const headers: Record<string, string> = {};
    if (process.env.CATALOGUE_FRESH_SECRET) headers["x-catalogue-fresh"] = process.env.CATALOGUE_FRESH_SECRET;
    const res = await fetch(`${base}/site/hero?fresh=1`, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: HERO_REVALIDATE_SECONDS, tags: ["site-hero"] },
    });
    if (!res.ok) throw new Error(`/site/hero → ${res.status}`);
    const config = validateHero(await res.json(), heroSource(process.env));
    if (!config) console.error("[site-hero] payload refused; showing the bundled banner");
    lastGood = { config, at: Date.now() };
    return config;
  } catch (err) {
    const known = lastGood && Date.now() - lastGood.at < LAST_GOOD_MAX_AGE_MS ? lastGood : null;
    console.error("[site-hero] fetch failed:", err instanceof Error ? err.message : err, known ? "— showing the last banner read" : "— showing the bundled banner");
    return known ? known.config : null;
  }
}
