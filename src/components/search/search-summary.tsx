"use client";

// Heading, context line and banners for /filter, driven by the server's
// canonical reading of the search (`search` block of search-properties) —
// never by the raw URL text. All strings are rendered as text (React
// escapes them); nothing here builds HTML.
import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Info, MapPin } from "lucide-react";

export type SearchPlace = { id: string; name: string; type: string; label: string };
export type SearchMeta = {
  mode: "all" | "place" | "nearby" | "near" | "text";
  query: string | null;
  place: SearchPlace | null;
  corrected: boolean;
  alternatives: SearchPlace[];
  reason: "no_inventory" | "filters" | "dates" | null;
  nearestKm: number | null;
  suggestions: SearchPlace[];
};

export function formatDistance(km: number | null | undefined): string {
  if (typeof km !== "number" || !Number.isFinite(km)) return "";
  if (km < 1) return "< 1 km";
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Validates the (untrusted, possibly absent — older API) search block. */
export function readSearchMeta(raw: unknown): SearchMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const modes = ["all", "place", "nearby", "near", "text"];
  if (typeof r.mode !== "string" || !modes.includes(r.mode)) return null;
  const place = (p: unknown): SearchPlace | null => {
    if (!p || typeof p !== "object") return null;
    const x = p as Record<string, unknown>;
    return typeof x.id === "string" && typeof x.name === "string"
      ? { id: x.id, name: x.name, type: typeof x.type === "string" ? x.type : "", label: typeof x.label === "string" ? x.label : "" }
      : null;
  };
  const places = (v: unknown) => (Array.isArray(v) ? v.map(place).filter((x): x is SearchPlace => !!x).slice(0, 5) : []);
  const reasons = ["no_inventory", "filters", "dates"];
  return {
    mode: r.mode as SearchMeta["mode"],
    query: typeof r.query === "string" ? r.query : null,
    place: place(r.place),
    corrected: r.corrected === true,
    alternatives: places(r.alternatives),
    reason: typeof r.reason === "string" && reasons.includes(r.reason) ? (r.reason as SearchMeta["reason"]) : null,
    nearestKm: typeof r.nearestKm === "number" ? r.nearestKm : null,
    suggestions: places(r.suggestions),
  };
}

/** The current search with another place chosen (other filters kept). */
function usePlaceHref() {
  const params = useSearchParams();
  const pathname = usePathname();
  return (p: SearchPlace) => {
    const next = new URLSearchParams(params.toString());
    next.set("placeId", p.id);
    next.set("location", p.name);
    next.delete("lat");
    next.delete("lng");
    // /location/<name> pages carry the place in the path; results live on /filter
    return `${pathname.startsWith("/filter") ? pathname : "/filter"}?${next.toString()}`;
  };
}

function stays(n: number) {
  return `${n} ${n === 1 ? "stay" : "stays"}`;
}

export function searchTitle(meta: SearchMeta | null): string {
  if (!meta) return "Discover Our Finest Stays";
  if (meta.mode === "place" && meta.place) return `Stays in ${meta.place.name}`;
  if (meta.mode === "nearby" && meta.place) return `Stays near ${meta.place.name}`;
  if (meta.mode === "near") return "Stays near you";
  if (meta.mode === "text" && meta.query) return `Stays matching “${meta.query}”`;
  return "Discover Our Finest Stays";
}

export default function SearchSummary({ meta, totalCount, hasDates }: { meta: SearchMeta | null; totalCount: number; hasDates: boolean }) {
  const href = usePlaceHref();
  const placeName = meta?.place?.name ?? "";
  let subtitle = "Explore through featured properties available on Majestic Escape";
  if (meta?.mode === "place" && meta.place) subtitle = [stays(totalCount), meta.place.label].filter(Boolean).join(" · ");
  else if ((meta?.mode === "nearby" || meta?.mode === "near") && totalCount) subtitle = `${stays(totalCount)} within 250 km, nearest first`;
  else if (meta?.mode === "text") subtitle = stays(totalCount);

  let banner: string | null = null;
  if (meta?.mode === "nearby" && placeName) {
    if (meta.reason === "no_inventory") banner = `No stays in ${placeName} yet`;
    else if (meta.reason === "dates") banner = `No stays in ${placeName} are free on ${hasDates ? "your dates" : "those dates"}`;
    else banner = `No stays in ${placeName} match your filters`;
    banner += totalCount ? ` — here are the nearest ones${meta.nearestKm !== null ? ` (closest ${formatDistance(meta.nearestKm)} away)` : ""}.` : ", and none nearby either.";
  }

  return (
    <div className="mb-4 sm:mb-8">
      <h1 className="text-3xl sm:text-2xl lg:text-4xl font-bricolage font-semibold mb-2 text-absoluteDark lg:mt-40 sm:pt-10 md:pt-0">{searchTitle(meta)}</h1>
      <p className="text-lg sm:text-base text-stone">{subtitle}</p>
      {meta?.corrected && meta.place && meta.query ? (
        <p className="mt-2 text-sm text-stone">
          Showing results for <span className="font-medium text-absoluteDark">{meta.place.name}</span> — you searched “{meta.query}”.
        </p>
      ) : null}
      {banner ? (
        <div role="status" className="mt-3 flex items-start gap-2 rounded-lg border border-lightGreen/60 bg-lightGreen/10 px-3 py-2 text-sm text-graphite">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primaryGreen" aria-hidden="true" />
          <span>{banner}</span>
        </div>
      ) : null}
      {meta?.alternatives?.length ? (
        <p className="mt-2 text-sm text-stone">
          Looking for another {placeName}?{" "}
          {meta.alternatives.map((a, i) => (
            <React.Fragment key={a.id}>
              {i ? ", " : ""}
              <Link href={href(a)} className="text-primaryGreen underline underline-offset-2 hover:text-brightGreen">
                {a.name}
                {a.label ? `, ${a.label}` : ""}
              </Link>
            </React.Fragment>
          ))}
        </p>
      ) : null}
    </div>
  );
}

/** "Did you mean …" + popular destinations, for an empty result. */
export function SearchSuggestions({ meta, popular }: { meta: SearchMeta | null; popular: SearchPlace[] }) {
  const href = usePlaceHref();
  const didYouMean = meta?.suggestions ?? [];
  const list = didYouMean.length ? didYouMean : popular;
  if (!list.length) return null;
  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-stone mb-2">{didYouMean.length ? "Did you mean" : "Popular destinations"}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {list.map((p) => (
          <Link
            key={p.id}
            href={href(p)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-gray-300 bg-white px-4 text-sm text-graphite hover:border-primaryGreen hover:text-primaryGreen"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
