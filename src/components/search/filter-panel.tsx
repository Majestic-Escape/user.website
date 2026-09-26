"use client";

// The filters (type of place, price, rooms, amenities, booking options,
// property type), shared by the phone search sheet and the desktop Filters
// dialog so both behave the same. State lives in AuthContext, as before.
import * as React from "react";
import Image from "next/image";
import {
  AlertCircle,
  AlertOctagon,
  Bath,
  BeanIcon as Beach,
  Briefcase,
  Car,
  ChevronDown,
  Dumbbell,
  Flame,
  FlameIcon as Fireplace,
  KeyRound,
  PawPrint,
  PocketIcon as Pool,
  Snowflake,
  Tv,
  UtensilsIcon,
  WashingMachineIcon as Washing,
  Wifi,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { properties } from "@/lib/property-type";
import { Stepper } from "@/components/search/guest-counter";
import { cn } from "@/lib/utils";

export const PRICE_MIN = 501;
export const PRICE_MAX = 83000;
const PRICE_GAP = 1000;
// The sliders run 500…83,000 in ₹100 steps (so the top end is reachable);
// their bottom stop means the historic floor of ₹501.
const SLIDER_MIN = 500;
const fromSlider = (v: number) => (v <= SLIDER_MIN ? PRICE_MIN : v);
const toSlider = (v: number) => (v <= PRICE_MIN ? SLIDER_MIN : v);

export const AMENITIES = [
  { id: "pool", title: "Pool", icon: Pool },
  { id: "hot-tub", title: "Hot tub", icon: Bath },
  { id: "bbq", title: "BBQ grill", icon: Flame },
  { id: "indoor-fireplace", title: "Indoor fireplace", icon: Fireplace },
  { id: "exercise", title: "Exercise equipment", icon: Dumbbell },
  { id: "beach", title: "Beach access", icon: Beach },
  { id: "smoke-alarm", title: "Smoke alarm", icon: AlertOctagon },
  { id: "carbon-monoxide", title: "Carbon monoxide alarm", icon: AlertCircle },
  { id: "wifi", title: "Wifi", icon: Wifi },
  { id: "tv", title: "TV", icon: Tv },
  { id: "kitchen", title: "Kitchen", icon: UtensilsIcon },
  { id: "washing", title: "Washing machine", icon: Washing },
  { id: "free-parking", title: "Free parking on premises", icon: Car },
  { id: "air-conditioning", title: "Air conditioning", icon: Snowflake },
  { id: "workspace", title: "Dedicated workspace", icon: Briefcase },
];

const PLACE_TYPES = [
  { value: "", label: "Any type" },
  { value: "Room", label: "Room" },
  { value: "Entire Place", label: "Entire place" },
];

type Rooms = { bedrooms: number; beds: number; bathrooms: number };
const ROOM_ROWS: { key: keyof Rooms; label: string }[] = [
  { key: "bedrooms", label: "Bedrooms" },
  { key: "beds", label: "Beds" },
  { key: "bathrooms", label: "Bathrooms" },
];

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** How many filters differ from "anything" — for the Filters badge. */
export function useActiveFilterCount(): number {
  const { priceRange, rooms, addAmenities, addPlaceType, addPropertyType, bookingType, petAllowed, checkinType } = useAuth();
  let n = 0;
  if (addPlaceType && addPlaceType !== "Any type") n++;
  if (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) n++;
  for (const r of ROOM_ROWS) if ((rooms as Rooms)?.[r.key] > 0) n++;
  n += Array.isArray(addAmenities) ? addAmenities.length : 0;
  if (bookingType) n++;
  if (checkinType) n++;
  if (petAllowed) n++;
  if (addPropertyType) n++;
  return n;
}

const chip = (on: boolean) =>
  cn(
    "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm transition-[background-color,border-color,box-shadow,transform] duration-150",
    "active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
    on ? "border-absoluteDark bg-gray-50 text-absoluteDark ring-1 ring-absoluteDark" : "border-gray-300 bg-white text-graphite [@media(hover:hover)]:hover:border-absoluteDark",
  );

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="border-b border-gray-200 py-6 first:pt-4 last:border-0">
      <h3 id={id} className="font-bricolage text-lg font-semibold text-absoluteDark">
        {title}
      </h3>
      {hint ? <p className="mt-0.5 text-sm text-stone">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ShowMore({ open, onToggle, total }: { open: boolean; onToggle: () => void; total: number }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-absoluteDark underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
    >
      {open ? "Show fewer" : `Show all ${total}`}
      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
    </button>
  );
}

function PriceInput({ label, value, plus, onCommit }: { label: string; value: number; plus?: boolean; onCommit: (n: number) => void }) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const n = Number(draft.replace(/[^\d]/g, ""));
    setDraft(null);
    if (Number.isFinite(n) && draft.trim() !== "") onCommit(n);
  };
  return (
    <label className="flex min-w-0 flex-1 flex-col rounded-2xl border border-gray-300 px-4 py-2 transition-colors focus-within:border-absoluteDark focus-within:ring-1 focus-within:ring-absoluteDark">
      <span className="text-xs text-stone">{label}</span>
      <input
        inputMode="numeric"
        aria-label={`${label} price per night`}
        className="w-full bg-transparent text-base font-medium text-absoluteDark outline-none"
        value={draft ?? `${rupees(value)}${plus ? "+" : ""}`}
        onFocus={(e) => {
          setDraft(String(value));
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => setDraft(e.target.value.slice(0, 9))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </label>
  );
}

function PriceRange() {
  const { priceRange, setPriceRange } = useAuth();
  const [lo, hi] = priceRange as [number, number];
  const pct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const setLo = (v: number) => setPriceRange([Math.max(PRICE_MIN, Math.min(v, hi - PRICE_GAP)), hi]);
  const setHi = (v: number) => setPriceRange([lo, Math.min(PRICE_MAX, Math.max(v, lo + PRICE_GAP))]);
  return (
    <>
      <p className="text-sm font-medium text-absoluteDark" aria-live="polite">
        {rupees(lo)} – {rupees(hi)}
        {hi >= PRICE_MAX ? "+" : ""}
      </p>
      <div className="relative mt-3 h-8 px-3">
        <div className="relative h-full">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
          <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-absoluteDark" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
          <input
            type="range"
            min={SLIDER_MIN}
            max={PRICE_MAX}
            step={100}
            value={toSlider(lo)}
            aria-label="Minimum price per night"
            aria-valuetext={rupees(lo)}
            onChange={(e) => setLo(fromSlider(Number(e.target.value)))}
            className="me-range absolute -inset-x-3 top-0 h-8 w-[calc(100%+1.5rem)]"
            // the lower thumb must stay grabbable when both sit at the top end
            style={{ zIndex: lo > PRICE_MAX - 5 * PRICE_GAP ? 3 : 2 }}
          />
          <input
            type="range"
            min={SLIDER_MIN}
            max={PRICE_MAX}
            step={100}
            value={toSlider(hi)}
            aria-label="Maximum price per night"
            aria-valuetext={hi >= PRICE_MAX ? `${rupees(hi)} or more` : rupees(hi)}
            onChange={(e) => setHi(fromSlider(Number(e.target.value)))}
            className="me-range absolute -inset-x-3 top-0 z-[2] h-8 w-[calc(100%+1.5rem)]"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <PriceInput label="Minimum" value={lo} onCommit={setLo} />
        <span className="h-px w-3 shrink-0 bg-gray-300" aria-hidden="true" />
        <PriceInput label="Maximum" value={hi} plus={hi >= PRICE_MAX} onCommit={setHi} />
      </div>
    </>
  );
}

export default function FilterPanel({ size = "md" }: { size?: "md" | "lg" }) {
  const {
    rooms,
    handleRoomChange,
    showAllAmenities,
    setShowAllAmenities,
    showAllProperties,
    setShowAllProperties,
    addAmenities,
    addAmenitiesList,
    addPlaceType,
    setAddPlaceType,
    addPropertyType,
    setAddPropertyType,
    bookingType,
    setBookingType,
    petAllowed,
    setPetAllowed,
    checkinType,
    setCheckinType,
  } = useAuth();

  const placeType = addPlaceType === "Any type" ? "" : addPlaceType || "";
  const amenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 6);
  const types = showAllProperties ? properties : properties.slice(0, 6);
  const booking = [
    { key: "instant", label: "Instant book", icon: Zap, on: bookingType === "instant", toggle: () => setBookingType(bookingType === "instant" ? "" : "instant") },
    { key: "self", label: "Self check-in", icon: KeyRound, on: checkinType === "self-check-in", toggle: () => setCheckinType(checkinType === "self-check-in" ? "" : "self-check-in") },
    { key: "pets", label: "No pets", icon: PawPrint, on: petAllowed === "no_pets", toggle: () => setPetAllowed(petAllowed === "no_pets" ? "" : "no_pets") },
  ];

  return (
    <div className="font-poppins">
      <Section title="Type of place">
        <div role="radiogroup" aria-label="Type of place" className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1">
          {PLACE_TYPES.map((t) => {
            const on = placeType === t.value;
            return (
              <button
                key={t.label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setAddPlaceType(t.value)}
                className={cn(
                  "min-h-[44px] rounded-xl px-2 text-sm font-medium transition-[background-color,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
                  on ? "bg-white text-absoluteDark shadow-sm ring-1 ring-black/5" : "text-graphite [@media(hover:hover)]:hover:text-absoluteDark",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Price range" hint="Price per night">
        <PriceRange />
      </Section>

      <Section title="Rooms and beds">
        <div className="divide-y divide-gray-100">
          {ROOM_ROWS.map((r) => {
            const v = Number((rooms as Rooms)?.[r.key]) || 0;
            return (
              <div key={r.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-absoluteDark">{r.label}</span>
                <Stepper label={r.label} value={v} zeroLabel="Any" canDecrease={v > 0} canIncrease={v < 50} onChange={(d) => handleRoomChange(r.key, d)} size={size} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => {
            const on = addAmenities.includes(a.id);
            return (
              <button key={a.id} type="button" aria-pressed={on} onClick={() => addAmenitiesList(a.id)} className={chip(on)}>
                <a.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {a.title}
              </button>
            );
          })}
        </div>
        <ShowMore open={showAllAmenities} total={AMENITIES.length} onToggle={() => setShowAllAmenities((v: boolean) => !v)} />
      </Section>

      <Section title="Booking options">
        <div className="flex flex-wrap gap-2">
          {booking.map((b) => (
            <button key={b.key} type="button" aria-pressed={b.on} onClick={b.toggle} className={chip(b.on)}>
              <b.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {b.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Property type">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {types.map((p) => {
            const on = addPropertyType === p.route;
            return (
              <button
                key={p.route + p.label}
                type="button"
                aria-pressed={on}
                onClick={() => setAddPropertyType(on ? "" : p.route)}
                className={cn(
                  "flex min-h-[88px] flex-col items-start justify-between gap-2 rounded-2xl border p-3 text-left text-sm transition-[border-color,box-shadow,transform] duration-150",
                  "active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
                  on ? "border-absoluteDark bg-gray-50 ring-1 ring-absoluteDark" : "border-gray-300 [@media(hover:hover)]:hover:border-absoluteDark",
                )}
              >
                <Image width={32} height={32} src={p.icon} alt="" className="h-8 w-8 object-contain" />
                <span className="font-medium text-absoluteDark">{p.label}</span>
              </button>
            );
          })}
        </div>
        <ShowMore open={showAllProperties} total={properties.length} onToggle={() => setShowAllProperties((v: boolean) => !v)} />
      </Section>
    </div>
  );
}
