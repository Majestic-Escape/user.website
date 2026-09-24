"use client";

// Destination field with Airbnb-style suggestions.
//
// - Empty field: "Nearby" (asks for location only on click), recent picks,
//   destinations with the most stays.
// - Typing: places matched locally (aliases, "Colva, Goa", small typos),
//   best first, plus a last row to search the typed text as-is.
// - Enter picks the highlighted row; with nothing typed it just searches.
// - If the suggestion index can't load, the field is plain text and the
//   server still resolves what was typed.
//
// cmdk provides the combobox / listbox / option semantics and arrow-key
// navigation; filtering is ours (shouldFilter={false}).
import * as React from "react";
import { Clock, Loader2, Map as MapIcon, MapPin, Navigation, Search, Waves } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { popularPlaces, suggestPlaces, placeTypeLabel, type PlaceSuggestion } from "@/lib/places/match";
import { usePlacesIndex } from "@/lib/places/use-places-index";
import { readRecentPlaces, rememberPlace, type RecentPlace } from "@/lib/search/recent-places";
import { getRoundedPosition, NEAR_ME_MESSAGES, type NearMeError } from "@/lib/search/near-me";
import { cn } from "@/lib/utils";

export type PickedPlace = { id: string; name: string; label: string };

type Props = {
  value: string;
  onTextChange: (text: string) => void;
  onPick: (place: PickedPlace) => void;
  onNearMe: (point: { lat: number; lng: number }) => void;
  onSubmitText: () => void;
  autoFocus?: boolean;
  className?: string;
};

const TEXT_ROW = "__search_text__";
const NEAR_ROW = "__near_me__";

function icon(type: PlaceSuggestion["type"]) {
  if (type === "state" || type === "district" || type === "taluka") return MapIcon;
  if (type === "beach" || type === "island") return Waves;
  return MapPin;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q && text.toLowerCase().startsWith(q.toLowerCase())) {
    return (
      <>
        <span className="font-semibold text-absoluteDark">{text.slice(0, q.length)}</span>
        {text.slice(q.length)}
      </>
    );
  }
  return <>{text}</>;
}

function Row({ Icon, title, subtitle, meta }: { Icon: React.ElementType; title: React.ReactNode; subtitle?: string; meta?: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lightGreen/20" aria-hidden="true">
        <Icon className="h-4 w-4 text-primaryGreen" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm text-graphite">{title}</span>
        {subtitle ? <span className="truncate text-xs text-stone">{subtitle}</span> : null}
      </span>
      {meta ? <span className="shrink-0 text-xs text-stone">{meta}</span> : null}
    </div>
  );
}

export default function LocationCombobox({ value, onTextChange, onPick, onNearMe, onSubmitText, autoFocus = true, className }: Props) {
  const [touched, setTouched] = React.useState(false);
  const { index, loading, unavailable } = usePlacesIndex(true);
  const [recent, setRecent] = React.useState<RecentPlace[]>([]);
  const [locating, setLocating] = React.useState(false);
  const [nearError, setNearError] = React.useState<NearMeError | null>(null);
  const [selected, setSelected] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRecent(readRecentPlaces());
  }, []);

  // Screen readers follow the highlighted row through aria-activedescendant.
  // cmdk 1.0.0 computes it once on mount and never updates it, so it is kept
  // in sync here after every render (cmdk's own value never changes after
  // mount, so React does not overwrite this).
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const row = selected ? listRef.current?.querySelector<HTMLElement>('[cmdk-item][data-selected="true"]') : null;
    if (row && row.id) input.setAttribute("aria-activedescendant", row.id);
    else input.removeAttribute("aria-activedescendant");
  });

  const query = value || "";
  const typing = touched && query.trim().length > 0;
  const suggestions = React.useMemo(() => (typing ? suggestPlaces(index, query) : []), [typing, index, query]);
  const popular = React.useMemo(() => (typing ? [] : popularPlaces(index)), [typing, index]);

  // Highlight the best suggestion while typing; nothing before (so Enter on
  // an empty field searches everywhere instead of asking for location).
  React.useEffect(() => {
    setSelected(typing ? (suggestions[0]?.id ?? TEXT_ROW) : "");
  }, [typing, suggestions]);

  const pick = (p: PickedPlace) => {
    rememberPlace(p);
    onPick(p);
  };

  const nearMe = async () => {
    setNearError(null);
    setLocating(true);
    try {
      const point = await getRoundedPosition();
      onNearMe(point);
    } catch (e) {
      setNearError((typeof e === "string" ? e : "unavailable") as NearMeError);
    } finally {
      setLocating(false);
    }
  };

  const count = typing ? suggestions.length : 0;

  return (
    <Command
      shouldFilter={false}
      loop
      value={selected}
      onValueChange={setSelected}
      className={cn("bg-white font-poppins", className)}
      label="Search destinations"
    >
      <CommandInput
        ref={inputRef}
        autoFocus={autoFocus}
        value={query}
        maxLength={100}
        placeholder="Search destinations"
        aria-label="Destination"
        onValueChange={(v) => {
          setTouched(true);
          setNearError(null);
          onTextChange(v);
        }}
        onKeyDown={(e) => {
          // Enter with no highlighted row (empty field): search as typed.
          if (e.key === "Enter" && !selected) {
            e.preventDefault();
            onSubmitText();
          }
        }}
        className="h-12 text-base sm:text-sm"
      />
      <span className="sr-only" aria-live="polite">
        {typing ? `${count} ${count === 1 ? "suggestion" : "suggestions"}` : ""}
      </span>
      <CommandList ref={listRef} className="max-h-[min(60vh,360px)]">
        {nearError ? (
          <p role="status" className="px-3 py-2 text-xs text-red-600">
            {NEAR_ME_MESSAGES[nearError]}
          </p>
        ) : null}

        {typing ? (
          <>
            {suggestions.length ? (
              <CommandGroup heading="Destinations">
                {suggestions.map((s) => (
                  <CommandItem key={s.id} value={s.id} onSelect={() => pick({ id: s.id, name: s.name, label: s.label })} className="min-h-[52px] cursor-pointer py-2">
                    <Row
                      Icon={icon(s.type)}
                      title={<Highlight text={s.name} query={query.split(",")[0]} />}
                      subtitle={[placeTypeLabel(s.type), s.label].filter(Boolean).join(" · ")}
                      meta={s.stays ? `${s.stays} ${s.stays === 1 ? "stay" : "stays"}` : undefined}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : loading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-stone">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Finding places…
              </div>
            ) : null}
            <CommandGroup>
              <CommandItem value={TEXT_ROW} onSelect={onSubmitText} className="min-h-[52px] cursor-pointer py-2">
                <Row Icon={Search} title={<>Search for “{query.trim()}”</>} subtitle={unavailable ? "Suggestions are unavailable right now" : undefined} />
              </CommandItem>
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandGroup heading="Nearby">
              <CommandItem value={NEAR_ROW} onSelect={nearMe} disabled={locating} className="min-h-[52px] cursor-pointer py-2">
                <Row Icon={locating ? Loader2 : Navigation} title={locating ? "Finding your location…" : "Stays near me"} subtitle="Uses your location once, about 1 km accurate" />
              </CommandItem>
            </CommandGroup>
            {recent.length ? (
              <CommandGroup heading="Recent searches">
                {recent.map((r) => (
                  <CommandItem key={`r:${r.id}`} value={`r:${r.id}`} onSelect={() => pick(r)} className="min-h-[52px] cursor-pointer py-2">
                    <Row Icon={Clock} title={r.name} subtitle={r.label} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {popular.length ? (
              <CommandGroup heading="Popular destinations">
                {popular.map((p) => (
                  <CommandItem key={`p:${p.id}`} value={`p:${p.id}`} onSelect={() => pick({ id: p.id, name: p.name, label: p.label })} className="min-h-[52px] cursor-pointer py-2">
                    <Row Icon={icon(p.type)} title={p.name} subtitle={p.label} meta={`${p.stays} ${p.stays === 1 ? "stay" : "stays"}`} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : loading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-stone">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading destinations…
              </div>
            ) : null}
          </>
        )}
      </CommandList>
    </Command>
  );
}
