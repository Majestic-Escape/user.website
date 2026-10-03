"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { releaseBlocks, rotateExportLink, syncConnectionNow, updateConnection } from "./api";
import { CopyField } from "./CopyField";
import { StatusPill } from "./StatusPill";
import { PROTECTION, inboundText, outboundText, relativeTime } from "./status";

const DIALOG_CLASS = "w-[calc(100%-24px)] max-w-lg max-h-[92dvh] overflow-y-auto rounded-xl p-5 sm:p-6 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none";

export default function ConnectionCard({ connection: c, provider, onChanged, onFinishSetup, onDisconnect }) {
  const [busy, setBusy] = useState(null); // "sync" | "rotate" | "release" | "link"
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState(null); // "link" | "rotate" | "release" | "copy"
  const [newUrl, setNewUrl] = useState("");
  const [dialogError, setDialogError] = useState(null);
  const label = c.channelLabel;
  const inbound = inboundText(c.health.state, label);
  const outbound = outboundText(c.export.state, label, c.export);
  const protection = PROTECTION[c.protection] || PROTECTION.DEGRADED;

  async function run(kind, fn, success) {
    setBusy(kind);
    setNotice(null);
    try {
      const r = await fn();
      onChanged?.(r.data);
      if (success) setNotice({ tone: "good", text: typeof success === "function" ? success(r) : success });
      return true;
    } catch (err) {
      setNotice({ tone: "bad", text: err.message });
      return false;
    } finally {
      setBusy(null);
    }
  }
  const syncNow = () =>
    run("sync", () => syncConnectionNow(c.id), (r) => (r.result && r.result.ok === false ? "The check finished with an error — see above." : r.syncState === "pending" ? "Checking — this can take a few seconds." : "Checked just now."));

  async function dialogRun(kind, fn, success) {
    setDialogError(null);
    setBusy(kind);
    try {
      const r = await fn();
      onChanged?.(r.data);
      setDialog(null);
      setNewUrl("");
      setNotice({ tone: "good", text: success });
    } catch (err) {
      setDialogError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="rounded-xl border bg-white p-3 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">{c.name}</h3>
          <p className="truncate text-xs text-gray-500" title="Saved link (hidden for your security)">
            {c.importUrl}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <StatusPill tone={protection.tone} label={protection.label} />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-[44px] w-[44px]" aria-label={`More actions for ${c.name}`}>
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="min-h-[44px]" onSelect={() => setDialog("link")}>Change {label} link</DropdownMenuItem>
              <DropdownMenuItem className="min-h-[44px]" onSelect={() => setDialog("rotate")}>Replace my Majestic link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="min-h-[44px] text-red-700 focus:text-red-800" onSelect={() => onDisconnect(c)}>
                Disconnect…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section aria-label={`${label} to Majestic`} className="min-w-0 rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm font-medium text-gray-900">
              {label} <ArrowRight className="h-3.5 w-3.5" aria-label="to" /> Majestic
            </p>
            <StatusPill tone={inbound.tone} label={inbound.label} />
          </div>
          <p className="mt-1.5 text-sm text-gray-600">{c.health.reason || inbound.detail}</p>
          <p className="mt-1 text-xs text-gray-500">
            {c.sync.lastSuccessAt ? `Last checked ${relativeTime(c.sync.lastSuccessAt)}` : "Not checked successfully yet"}
            {c.counts.active + c.counts.missing > 0 ? ` · ${c.counts.active + c.counts.missing} upcoming booking${c.counts.active + c.counts.missing === 1 ? "" : "s"} blocked` : ""}
          </p>
          <Button type="button" variant="outline" className="mt-3 h-auto min-h-[44px] w-full whitespace-normal sm:w-auto" onClick={syncNow} disabled={busy === "sync"} aria-busy={busy === "sync"}>
            {busy === "sync" ? <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />}
            Check {label} now
          </Button>
        </section>

        <section aria-label={`Majestic to ${label}`} className="min-w-0 rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm font-medium text-gray-900">
              Majestic <ArrowRight className="h-3.5 w-3.5" aria-label="to" /> {label}
            </p>
            <StatusPill tone={outbound.tone} label={outbound.label} />
          </div>
          <p className="mt-1.5 text-sm text-gray-600">{outbound.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(c.export.state === "NOT_CONFIRMED" || c.export.state === "WAITING") && (
              <Button type="button" className="h-auto min-h-[44px] w-full whitespace-normal bg-primaryGreen hover:bg-brightGreen sm:w-auto" onClick={() => onFinishSetup(c)}>
                {c.export.state === "NOT_CONFIRMED" ? "Finish setup" : "See setup steps"}
              </Button>
            )}
            <Button type="button" variant="outline" className="h-auto min-h-[44px] w-full whitespace-normal sm:w-auto" onClick={() => setDialog("copy")}>
              Show my Majestic link
            </Button>
          </div>
        </section>
      </div>

      {c.counts.conflicts > 0 && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          A booking on {label} overlaps a Majestic booking. Check {label} — one guest may need to be moved. Our team has been alerted.
        </p>
      )}
      {c.counts.overlaps > 0 && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          A booking on {label} overlaps one on another connected site. Check both sites — one guest may need to be moved. We keep these dates blocked either way.
        </p>
      )}
      {c.counts.likelyMirrors > 0 && c.counts.conflicts === 0 && (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {label} shows {c.counts.likelyMirrors === 1 ? "a date" : "dates"} you sold on Majestic as unavailable — most likely {label} copying your Majestic booking. Worth a quick look in {label}.
        </p>
      )}
      {c.counts.missing > 0 && (
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p>
            {c.counts.missing} booking{c.counts.missing === 1 ? "" : "s"} disappeared from {label}. We keep {c.counts.missing === 1 ? "its dates" : "their dates"} blocked until that is confirmed
            {c.health.state === "NEEDS_ATTENTION" ? " (everything vanished at once, so we wait at least 12 hours)" : " (at least 2 hours)"}.
          </p>
          <Button type="button" variant="outline" className="mt-2 h-auto min-h-[44px] whitespace-normal border-amber-300 bg-white py-2 text-left text-amber-900 hover:bg-amber-100" onClick={() => setDialog("release")}>
            They were cancelled — release the dates now
          </Button>
        </div>
      )}
      <p className="mt-2 min-h-[1.25rem] text-sm" role="status" aria-live="polite">
        {notice && <span className={notice.tone === "bad" ? "text-red-700" : "text-emerald-800"}>{notice.text}</span>}
      </p>

      <Dialog open={dialog === "copy"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Your Majestic link for {label}</DialogTitle>
            <DialogDescription>Paste it into {label}'s “import calendar” setting. Keep it private.</DialogDescription>
          </DialogHeader>
          <CopyField id={`exp-${c.id}`} label="Majestic calendar link" value={c.export.url} />
          {provider && (
            <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
              {provider.exportSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "link"} onOpenChange={(o) => !o && (setDialog(null), setDialogError(null))}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Change the {label} link</DialogTitle>
            <DialogDescription>Use this if {label} gave you a new calendar link. Bookings missing from the new calendar stay blocked until that is confirmed.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (newUrl.trim()) dialogRun("link", () => updateConnection(c.id, { url: newUrl.trim() }), `${label} link updated.`);
            }}
          >
            <Label htmlFor={`new-url-${c.id}`}>New {label} calendar link</Label>
            <Input id={`new-url-${c.id}`} type="url" inputMode="url" autoComplete="off" spellCheck={false} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="h-[44px]" aria-invalid={!!dialogError} />
            <p role="alert" className="min-h-[1.25rem] text-sm text-red-700">
              {dialogError}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="h-[44px]" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit" className="h-[44px] bg-primaryGreen hover:bg-brightGreen" disabled={!newUrl.trim() || busy === "link"} aria-busy={busy === "link"}>
                Test & save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rotate"} onOpenChange={(o) => !o && (setDialog(null), setDialogError(null))}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Replace your Majestic link?</DialogTitle>
            <DialogDescription>The current link stops working immediately. Paste the new one into {label}, or {label} will stop receiving your Majestic bookings.</DialogDescription>
          </DialogHeader>
          <p role="alert" className="min-h-[1.25rem] text-sm text-red-700">
            {dialogError}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-[44px]" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" className="h-[44px]" disabled={busy === "rotate"} onClick={() => dialogRun("rotate", () => rotateExportLink(c.id), "New link created — paste it into " + label + ".")}>
              Replace link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "release"} onOpenChange={(o) => !o && (setDialog(null), setDialogError(null))}>
        <DialogContent className={DIALOG_CLASS}>
          <DialogHeader className="text-left">
            <DialogTitle>Release these dates?</DialogTitle>
            <DialogDescription>Only if you've checked {label} and those bookings really were cancelled. The dates become bookable on Majestic straight away.</DialogDescription>
          </DialogHeader>
          <p role="alert" className="min-h-[1.25rem] text-sm text-red-700">
            {dialogError}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="h-[44px]" onClick={() => setDialog(null)}>
              Keep blocked
            </Button>
            <Button type="button" variant="destructive" className="h-[44px]" disabled={busy === "release"} onClick={() => dialogRun("release", () => releaseBlocks(c.id), "Dates released.")}>
              Yes, they were cancelled
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
