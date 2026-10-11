"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// "This didn't load" state for screens that fetch their own data (messages,
// inbox, account). It replaces two failures users used to see: skeletons that
// never ended, and a false "nothing here yet" screen after a failed request
// (which reads as "my messages are gone").
//
// - block: replaces the content. role="alert" so it is announced once when it
//   appears; it never takes focus (nobody was typing).
// - banner: a thin strip above content that DID load, for a partial failure.
//   role="status" (polite), because the page is still usable.
// - Retry is user-initiated, one request per press: while `retrying` the
//   button is aria-disabled (not `disabled`, which would drop keyboard focus to
//   the page) and ignores presses, so a double tap is a single request and
//   nothing polls.
// - The fade is opacity only and switched off for prefers-reduced-motion.
export type LoadErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  retryLabel?: string;
  variant?: "block" | "banner";
  className?: string;
};

export function LoadError({
  title = "Couldn't load this",
  message = "Check your connection and try again.",
  onRetry,
  retrying = false,
  retryLabel = "Try again",
  variant = "block",
  className,
}: LoadErrorProps) {
  const fade = "animate-in fade-in-0 duration-200 motion-reduce:animate-none";
  const retry = onRetry ? (
    <Button
      type="button"
      onClick={() => {
        if (!retrying) onRetry();
      }}
      aria-disabled={retrying}
      aria-busy={retrying}
      className={cn(
        "h-11 shrink-0 aria-disabled:cursor-default aria-disabled:opacity-70 gap-2 rounded-full bg-primaryGreen px-5 text-sm font-medium text-white shadow-none",
        "[@media(hover:hover)]:hover:bg-brightGreen focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
      )}
    >
      <RefreshCw
        aria-hidden="true"
        className={cn("h-4 w-4", retrying && "animate-spin motion-reduce:animate-none")}
      />
      {retrying ? "Trying again…" : retryLabel}
    </Button>
  ) : null;

  if (variant === "banner") {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-absoluteDark",
          fade,
          className,
        )}
      >
        <span>{message}</span>
        {onRetry ? (
          <button
            type="button"
            onClick={() => {
              if (!retrying) onRetry();
            }}
            aria-disabled={retrying}
            aria-busy={retrying}
            className="inline-flex min-h-[44px] items-center font-medium text-primaryGreen underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen aria-disabled:cursor-default aria-disabled:opacity-60"
          >
            {retrying ? "Trying again…" : retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", fade, className)}
    >
      <AlertCircle aria-hidden="true" className="h-10 w-10 text-stone" />
      <div className="space-y-1">
        <p className="font-semibold text-absoluteDark">{title}</p>
        <p className="text-sm text-stone">{message}</p>
      </div>
      {retry}
    </div>
  );
}
