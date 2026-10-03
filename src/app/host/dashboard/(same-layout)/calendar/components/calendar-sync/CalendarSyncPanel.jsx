"use client";

// Host "Calendar sync" panel (SyncGuard — server.me docs/syncguard.md).
// Data: one GET per listing, refreshed on focus and after every action —
// no polling, no timers.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { USER } from "@/lib/query-presets";
import { queryKeys } from "@/lib/query-keys";
import { listConnections, releaseBlocks, stopExportLink } from "./api";
import ConnectWizard from "./ConnectWizard";
import ConnectionCard from "./ConnectionCard";
import DisconnectDialog from "./DisconnectDialog";
import { CopyField } from "./CopyField";
import { StatusPill } from "./StatusPill";
import { PROTECTION, relativeTime } from "./status";

const DIALOG_CLASS = "w-[calc(100%-24px)] max-w-lg max-h-[92dvh] overflow-y-auto rounded-xl p-5 sm:p-6 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none";

function reasonsOf(data) {
  const out = [];
  for (const c of data.connections) {
    if (c.protection === "HEALTHY") continue;
    if (["BROKEN", "NEEDS_ATTENTION", "STALE", "DEGRADED", "PARTIAL"].includes(c.health.state)) out.push(`${c.name}: ${c.health.reason || "needs a look"}`);
    else if (c.export.state === "NOT_CONFIRMED") out.push(`${c.name}: your Majestic link isn't set up in ${c.channelLabel} yet, so Majestic bookings don't block dates there.`);
    else if (c.export.state === "WAITING") out.push(`${c.name}: waiting for ${c.channelLabel} to request your Majestic link.`);
    else if (c.export.state === "QUIET") out.push(`${c.name}: ${c.channelLabel} hasn't requested your Majestic link recently.`);
    else if (c.export.state === "OPENED") out.push(`${c.name}: your Majestic link was opened, but not yet by ${c.channelLabel}. Check it is saved there.`);
  }
  return out;
}

// onAvailabilityChanged: the page's date grid re-reads blocked dates after
// any action here (connect, check now, disconnect, release) — otherwise newly
// imported or released dates only showed after a reload.
export default function CalendarSyncPanel({ propertyId, onAvailabilityChanged }) {
  const queryClient = useQueryClient();
  const key = queryKeys.calendarSync(propertyId);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: key, queryFn: () => listConnections(propertyId), enabled: !!propertyId, ...USER });
  const setData = (d) => {
    if (!d) return;
    queryClient.setQueryData(key, d);
    onAvailabilityChanged?.();
  };
  const [wizard, setWizard] = useState({ open: false, provider: null, resume: null });
  const [disconnecting, setDisconnecting] = useState(null);
  const [orphanToRelease, setOrphanToRelease] = useState(null);
  const [orphanBusy, setOrphanBusy] = useState(false);
  const [orphanError, setOrphanError] = useState(null);
  const [linkToStop, setLinkToStop] = useState(null);
  const [stopBusy, setStopBusy] = useState(false);
  const [stopError, setStopError] = useState(null);

  if (!propertyId) return null;
  const providers = (data && data.providers) || [];
  const providerOf = (id) => providers.find((p) => p.id === id) || providers.find((p) => p.id === "GENERIC_ICAL");
  const overall = data ? PROTECTION[data.overall] || PROTECTION.NONE : null;
  const restricted = data ? data.connections.filter((c) => c.bookingRestricted) : [];
  const reasons = data ? reasonsOf(data) : [];

  async function releaseOrphan() {
    if (!orphanToRelease) return;
    setOrphanBusy(true);
    setOrphanError(null);
    try {
      const r = await releaseBlocks(orphanToRelease.id);
      setData(r.data);
      setOrphanToRelease(null);
    } catch (err) {
      setOrphanError(err.message);
    } finally {
      setOrphanBusy(false);
    }
  }

  async function stopLink() {
    if (!linkToStop) return;
    setStopBusy(true);
    setStopError(null);
    try {
      const r = await stopExportLink(linkToStop.id);
      setData(r.data);
      setLinkToStop(null);
    } catch (err) {
      setStopError(err.message);
    } finally {
      setStopBusy(false);
    }
  }

  return (
    <section aria-labelledby="calendar-sync-heading" className="rounded-xl border bg-gray-50/60 p-3 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="calendar-sync-heading" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CalendarClock className="h-5 w-5 text-primaryGreen" aria-hidden="true" /> Calendar sync
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Connect the other sites where this stay is listed. Majestic blocks the dates booked there, and gives each site a private link with your Majestic bookings.
          </p>
        </div>
        {overall && <StatusPill tone={overall.tone} label={overall.label} />}
      </div>

      {isLoading && (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading calendar connections">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-2/3 rounded-lg" />
        </div>
      )}
      {isError && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-900" role="alert">
          <p>{error && error.status === 403 ? "Only this stay's host can manage its calendar sync." : "We couldn't load your calendar connections."}</p>
          <Button type="button" variant="outline" className="mt-2 h-[44px]" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          {restricted.length > 0 && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                We couldn't verify {restricted.map((c) => c.channelLabel).join(" and ")} availability, so instant booking is temporarily restricted to protect this property from double booking. Fix the link below, or disconnect it if you no longer use it.
              </p>
            </div>
          )}
          {data.connections.length > 0 && reasons.length > 0 && restricted.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Protection is incomplete:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {data.connections.length > 0 && data.overall === "HEALTHY" && (
            <p className="flex items-center gap-2 text-sm text-emerald-800">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Both directions are working for every connected site.
            </p>
          )}

          {data.connections.length > 0 && (
            <ul className="space-y-3" aria-label="Connected calendars">
              {data.connections.map((c) => (
                <ConnectionCard
                  key={c.id}
                  connection={c}
                  provider={providerOf(c.channel)}
                  onChanged={setData}
                  onFinishSetup={(conn) => setWizard({ open: true, provider: providerOf(conn.channel), resume: conn })}
                  onDisconnect={(conn) => setDisconnecting(conn)}
                />
              ))}
            </ul>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{data.connections.length ? "Connect another site" : "Connect a site"}</h3>
            <ul className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3" aria-label="Sites you can connect">
              {providers.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setWizard({ open: true, provider: p, resume: null })}
                    className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left transition-colors hover:border-primaryGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen motion-reduce:transition-none"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900">{p.label}</span>
                      {!p.icalDocumented && <span className="block text-xs text-gray-500">Only if it offers a calendar link</span>}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primaryGreen">
                      <Plus className="h-4 w-4" aria-hidden="true" /> Connect
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {data.disconnected.length > 0 && (
            <div className="rounded-lg border bg-white p-3">
              <h3 className="text-sm font-semibold text-gray-900">Disconnected sites</h3>
              <ul className="mt-2 space-y-2">
                {data.disconnected.map((d) => (
                  <li key={d.id} className="flex flex-col gap-2 text-sm">
                    {d.orphanedBlocks > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          {d.name}: {d.orphanedBlocks} booking{d.orphanedBlocks === 1 ? "" : "s"} kept blocked{d.disconnectedAt ? ` since ${relativeTime(d.disconnectedAt)}` : ""}.
                        </span>
                        <Button type="button" variant="outline" className="h-[44px]" onClick={() => setOrphanToRelease(d)}>
                          Release dates…
                        </Button>
                      </div>
                    )}
                    {d.linkLive && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-gray-700">
                          {d.name}: your Majestic link still works, so {d.channelLabel} keeps seeing your Majestic bookings
                          {d.linkLastServedAt ? ` (last requested ${relativeTime(d.linkLastServedAt)})` : ""}.
                        </span>
                        <Button type="button" variant="outline" className="h-[44px]" onClick={() => setLinkToStop(d)}>
                          Stop link…
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.legacyFeed && (
            <details className="rounded-lg border bg-white p-3 text-sm">
              <summary className="cursor-pointer font-medium text-gray-900">Older Majestic link (Majestic bookings only)</summary>
              <p className="mt-2 text-gray-600">Created before each site had its own link. It shows only bookings made on Majestic. If you've pasted it into a site, replace it with that site's own link above.</p>
              <div className="mt-2">
                <CopyField id="legacy-feed" label="Older link" value={data.legacyFeed.url} />
              </div>
            </details>
          )}

          <p className="text-xs text-gray-500">{data.capability.note}</p>
          {isFetching && !isLoading && (
            <p className="flex items-center gap-1 text-xs text-gray-500" aria-live="polite">
              <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Updating…
            </p>
          )}
        </div>
      )}

      <ConnectWizard
        open={wizard.open}
        onOpenChange={(o) => setWizard((w) => ({ ...w, open: o }))}
        propertyId={propertyId}
        provider={wizard.provider}
        resume={wizard.resume}
        onChanged={setData}
      />
      <DisconnectDialog open={!!disconnecting} onOpenChange={(o) => !o && setDisconnecting(null)} connection={disconnecting} onChanged={setData} />
      <Dialog open={!!orphanToRelease} onOpenChange={(o) => !o && (setOrphanToRelease(null), setOrphanError(null))}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Release dates kept from {orphanToRelease && orphanToRelease.channelLabel}?</DialogTitle>
            <DialogDescription>Only if those bookings were cancelled on {orphanToRelease && orphanToRelease.channelLabel}. The dates become bookable on Majestic straight away.</DialogDescription>
          </DialogHeader>
          <p role="alert" className="min-h-[1.25rem] text-sm text-red-700">
            {orphanError}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-[44px]" onClick={() => setOrphanToRelease(null)}>
              Keep blocked
            </Button>
            <Button type="button" variant="destructive" className="h-[44px]" disabled={orphanBusy} onClick={releaseOrphan}>
              Release dates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!linkToStop} onOpenChange={(o) => !o && (setLinkToStop(null), setStopError(null))}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Stop your Majestic link for {linkToStop && linkToStop.channelLabel}?</DialogTitle>
            <DialogDescription>
              {linkToStop && linkToStop.channelLabel} will stop seeing your Majestic bookings and could sell those nights again. Only do this if you no longer list this stay there.
            </DialogDescription>
          </DialogHeader>
          <p role="alert" className="min-h-[1.25rem] text-sm text-red-700">
            {stopError}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-[44px]" onClick={() => setLinkToStop(null)}>
              Keep link
            </Button>
            <Button type="button" variant="destructive" className="h-[44px]" disabled={stopBusy} onClick={stopLink}>
              Stop link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
