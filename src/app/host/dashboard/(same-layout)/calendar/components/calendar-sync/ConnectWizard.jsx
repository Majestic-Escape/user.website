"use client";

// Guided "Connect a calendar" flow (SyncGuard). Steps:
//   1. copy the OTA's calendar link, paste it, Test & connect (server fetches
//      and checks it — nothing is saved unless it is a working calendar);
//   2. add Majestic's own link to the OTA (copy) and say so ("I've added it");
//   3. what Majestic can and cannot verify from here.
// A half-finished setup survives refresh/back: the connection exists after
// step 1, and the panel offers "Finish setup" (opens at step 2). The pasted
// URL is never stored in the browser — it is a credential.
import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmExportAdded, connectCalendar } from "./api";
import { CopyField } from "./CopyField";

const DIALOG_CLASS =
  "w-[calc(100%-24px)] max-w-xl max-h-[92dvh] overflow-y-auto rounded-xl p-5 sm:p-6 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none";

export default function ConnectWizard({ open, onOpenChange, propertyId, provider, resume, onChanged }) {
  // resume: an existing connection to finish (starts at step 2)
  const [step, setStep] = useState(resume ? 2 : 1);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { test, connection }
  const headingRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep(resume ? 2 : 1);
      setUrl("");
      setError(null);
      setResult(null);
    }
  }, [open, resume]);
  // Move focus to the step heading so screen-reader and keyboard users land
  // on the new content.
  useEffect(() => {
    if (open && headingRef.current) headingRef.current.focus();
  }, [step, open]);

  if (!provider) return null;
  const connection = resume || (result && result.connection);
  const label = provider.label;

  async function testAndConnect(e) {
    e.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await connectCalendar(propertyId, { channel: provider.id, url: url.trim() });
      const conn = r.data.connections.find((c) => c.id === r.id);
      setResult({ test: r.test, connection: conn, reconnected: r.reconnected });
      setUrl(""); // do not keep the credential in memory longer than needed
      onChanged?.(r.data);
      setStep(2);
    } catch (err) {
      setError(err.message || "That link didn't work.");
    } finally {
      setBusy(false);
    }
  }

  async function markAdded() {
    if (!connection || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await confirmExportAdded(connection.id);
      onChanged?.(r.data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={DIALOG_CLASS}
        aria-describedby="sync-wizard-desc"
        // Radix would focus the first field; land on the step heading instead
        // so screen readers announce where the user is.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          headingRef.current?.focus();
        }}
      >
        <DialogHeader className="text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Connect {label} · Step {step} of 3
          </p>
          <DialogTitle asChild>
            <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
              {step === 1 && `Copy your ${label} calendar link`}
              {step === 2 && `Add your Majestic link to ${label}`}
              {step === 3 && "You're connected"}
            </h2>
          </DialogTitle>
          <DialogDescription id="sync-wizard-desc" className="text-sm text-gray-600">
            {step === 1 && `Majestic will block every date that is booked on ${label}.`}
            {step === 2 && `This lets ${label} block the dates guests book on Majestic.`}
            {step === 3 && "Here is what happens from now on."}
          </DialogDescription>
        </DialogHeader>

        <div key={step} className="space-y-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200">
          {provider.note && step !== 3 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{provider.note}</p>}

          {step === 1 && (
            <form onSubmit={testAndConnect} className="space-y-4" noValidate>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-gray-700">
                {provider.importSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              {provider.helpUrl && (
                <a href={provider.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primaryGreen underline-offset-2 hover:underline">
                  {label} help <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="sync-url">{label} calendar link</Label>
                <Input
                  id="sync-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://… .ics"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "sync-url-error" : undefined}
                  className="h-[44px] text-[15px]"
                />
                <p id="sync-url-error" role="alert" aria-live="assertive" className="min-h-[1.25rem] text-sm text-red-700">
                  {error}
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="h-[44px]" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-[44px] bg-primaryGreen hover:bg-brightGreen" disabled={!url.trim() || busy} aria-busy={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
                  {busy ? "Checking the link…" : "Test & connect"}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && connection && (
            <div className="space-y-4">
              {result && result.test && (
                <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {result.reconnected ? "Reconnected. " : "Connected. "}
                    {result.test.upcomingEvents === 0
                      ? `${label} shows no upcoming bookings right now.`
                      : `${result.test.upcomingEvents} upcoming booking${result.test.upcomingEvents === 1 ? "" : "s"} from ${label} now block${result.test.upcomingEvents === 1 ? "s" : ""} those dates on Majestic.`}
                  </span>
                </p>
              )}
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-gray-700">
                {provider.exportSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <CopyField id="sync-export-link" label={`Your Majestic link for ${label}`} value={connection.export.url} />
              <p className="text-xs text-gray-500">Treat this link like a password: anyone who has it can see which dates are taken (never who booked).</p>
              <p role="alert" aria-live="assertive" className="min-h-[1.25rem] text-sm text-red-700">
                {error}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="h-[44px]" onClick={() => onOpenChange(false)}>
                  I'll do this later
                </Button>
                <Button type="button" className="h-[44px] bg-primaryGreen hover:bg-brightGreen" onClick={markAdded} disabled={busy} aria-busy={busy}>
                  I've added it in {label}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && connection && (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="rounded-lg border p-3">
                <p className="font-medium text-gray-900">
                  {label} → Majestic
                </p>
                <p>Checked automatically and again whenever a guest books on Majestic. Dates booked on {label} stay blocked even if {label} briefly fails to answer.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium text-gray-900">
                  Majestic → {label}
                </p>
                <p>
                  {provider.refresh}. We'll show here when your link is first requested — we can't see inside {label}, so that is the best confirmation available.
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="button" className="h-[44px] bg-primaryGreen hover:bg-brightGreen" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
