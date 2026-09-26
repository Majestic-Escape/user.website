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
// is different:
//  - at build time, and in development, the bundled banner too (the build
//    must not depend on the backend);
//  - in a production regeneration (ISR) the error is thrown, so the
//    regeneration fails and the page generated last — with the banner it
//    already showed — keeps being served; the next one tries again. ("/" is
//    prerendered at build, so there is always such a page.) Returning null
//    here would replace a published banner with the bundled one for at
//    least a regeneration period after a publish whose purge met a backend
//    hiccup.
// HERO_DYNAMIC=off ignores the API altogether (a redeploy-time kill switch).
import { backendBase } from "@/lib/server/catalogue";
import { heroSource, validateHero } from "@/lib/hero";

export const HERO_REVALIDATE_SECONDS = 3600;
const FETCH_TIMEOUT_MS = 6000;

export type HeroConfig = ReturnType<typeof validateHero>;

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
    return config;
  } catch (err) {
    console.error("[site-hero] fetch failed:", err instanceof Error ? err.message : err);
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") throw err;
    return null;
  }
}
