"use client";

// Read-only link with a Copy button. Falls back to selecting the text when
// the Clipboard API is unavailable (older in-app browsers, http previews).
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function CopyField({ id, label, value }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
    }
    setCopied(ok ? "copied" : "select");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={id}
          readOnly
          value={value || ""}
          onFocus={(e) => e.target.select()}
          className="h-[44px] min-w-0 flex-1 truncate rounded-md border border-input bg-gray-50 px-3 font-mono text-[13px] text-gray-800"
        />
        <Button type="button" variant="outline" className="h-[44px] shrink-0 px-3" onClick={copy} aria-label={`Copy ${label}`}>
          {copied === "copied" ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          <span className="ml-1.5 hidden sm:inline">{copied === "copied" ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <p className="min-h-[1rem] text-xs text-emerald-800" role="status" aria-live="polite">
        {copied === "copied" ? "Link copied." : copied === "select" ? "Press Ctrl+C (or long-press → Copy) to copy the selected link." : ""}
      </p>
    </div>
  );
}
