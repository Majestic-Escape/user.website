"use client";

// Disconnecting does not make dates safe to sell: the other site may still
// take reservations Majestic can no longer see. The host must acknowledge
// that, and choose what happens to the dates already blocked:
//   keep (default)  — they stay blocked on Majestic until released;
//   release         — only if the listing there is no longer selling
//                     (a second, explicit confirmation).
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { disconnectCalendar } from "./api";

export default function DisconnectDialog({ open, onOpenChange, connection, onChanged }) {
  const [mode, setMode] = useState("keep");
  const [ack, setAck] = useState(false);
  const [releaseAck, setReleaseAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (open) {
      setMode("keep");
      setAck(false);
      setReleaseAck(false);
      setError(null);
    }
  }, [open]);
  if (!connection) return null;
  const label = connection.channelLabel;
  const blocks = connection.counts.active + connection.counts.missing;
  const canSubmit = ack && (mode === "keep" || releaseAck) && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const r = await disconnectCalendar(connection.id, { acknowledge: true, releaseBlocks: mode === "release" });
      onChanged?.(r.data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] max-w-lg max-h-[92dvh] overflow-y-auto rounded-xl p-5 sm:p-6 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none">
        <DialogHeader className="text-left">
          <DialogTitle>Disconnect {connection.name}?</DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                If this stay is still listed on {label}, {label} can keep taking bookings — and Majestic will no longer see them. Your Majestic link for {label} keeps working, so {label} still sees your Majestic bookings; if you stop listing there, remove it in {label} or stop it here afterwards.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-medium text-gray-900">
            {blocks > 0 ? `${blocks} upcoming booking${blocks === 1 ? "" : "s"} from ${label} block dates on Majestic. What should happen to ${blocks === 1 ? "it" : "them"}?` : "What should happen to dates already blocked by it?"}
          </legend>
          <RadioGroup value={mode} onValueChange={setMode} className="space-y-2">
            <label htmlFor="dc-keep" className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primaryGreen">
              <RadioGroupItem id="dc-keep" value="keep" className="mt-0.5" />
              <span className="text-sm">
                <span className="block font-medium">Keep them blocked (recommended)</span>
                <span className="text-gray-600">They stay blocked on Majestic until you release them yourself.</span>
              </span>
            </label>
            <label htmlFor="dc-release" className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-red-600">
              <RadioGroupItem id="dc-release" value="release" className="mt-0.5" />
              <span className="text-sm">
                <span className="block font-medium">Release them now</span>
                <span className="text-gray-600">Only if this stay is no longer bookable on {label} and those bookings were cancelled.</span>
              </span>
            </label>
          </RadioGroup>
          {mode === "release" && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
              <Checkbox id="dc-release-ack" checked={releaseAck} onCheckedChange={(v) => setReleaseAck(v === true)} className="mt-0.5" />
              <Label htmlFor="dc-release-ack" className="text-sm font-normal leading-snug text-red-900">
                I've checked {label}: these bookings are cancelled and the stay is no longer selling there.
              </Label>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Checkbox id="dc-ack" checked={ack} onCheckedChange={(v) => setAck(v === true)} className="mt-0.5" />
            <Label htmlFor="dc-ack" className="text-sm font-normal leading-snug">
              I understand that bookings taken on {label} after this will not reach Majestic.
            </Label>
          </div>
        </fieldset>
        <p role="alert" aria-live="assertive" className="min-h-[1.25rem] text-sm text-red-700">
          {error}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-[44px]" onClick={() => onOpenChange(false)}>
            Keep connected
          </Button>
          <Button type="button" variant="destructive" className="h-[44px]" onClick={submit} disabled={!canSubmit} aria-busy={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
            Disconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
