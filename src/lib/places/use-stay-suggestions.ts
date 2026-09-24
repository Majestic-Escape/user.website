"use client";
// Stays whose NAME matches what is being typed ("dev bhoo" → "Dev Bhoomi
// Retreat - Classic Tent"), for guests who remember a property but not
// where it is. Server-side (GET /api/v1/places/stays), because titles grow
// with the catalogue; asked only after a 250 ms pause and from 3 letters,
// keyed by the normalised text (so "Dev Bhoo" and "dev bhoo" share one
// edge-cached answer), and best-effort: any failure just shows no stays.
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { normalizePlaceText } from "./normalize";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEBOUNCE_MS = 250;
const NONE: StaySuggestion[] = []; // one empty list: a fresh [] per render would re-run effects keyed on it

export type StaySuggestion = { id: string; title: string; type: string; label: string };

function readStays(payload: unknown): StaySuggestion[] {
  const list = payload && typeof payload === "object" ? (payload as { stays?: unknown }).stays : null;
  if (!Array.isArray(list)) return [];
  return list
    .filter((s): s is StaySuggestion => !!s && typeof s.id === "string" && /^[a-f0-9]{24}$/.test(s.id) && typeof s.title === "string")
    .slice(0, 5)
    .map((s) => ({ id: s.id, title: s.title.slice(0, 120), type: typeof s.type === "string" ? s.type : "", label: typeof s.label === "string" ? s.label : "" }));
}

export function useStaySuggestions(text: string, active: boolean) {
  const [settled, setSettled] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setSettled(normalizePlaceText(text)), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [text]);
  const q = active ? settled : "";
  const enabled = q.replace(/ /g, "").length >= 3;
  const res = useQuery({
    queryKey: queryKeys.staySuggest(q),
    queryFn: async ({ signal }) => {
      const r = await fetch(`${API_URL}/places/stays?q=${encodeURIComponent(q)}`, { signal });
      if (!r.ok) return [];
      return readStays(await r.json());
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  // only the answer for what is on screen now (never a stale earlier word)
  const current = active && normalizePlaceText(text) === q;
  return current && enabled && res.data ? res.data : NONE;
}
