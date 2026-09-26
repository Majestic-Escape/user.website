"use client";

// Slide-in menu (phone "Menu", host menu, host marketing menu): a titled
// dialog with 48 px rounded rows and the current page marked. It closes on
// the phone's Back, and the chat launcher steps aside while it is open. Row
// taps leave through the sheet's own history entry (leaveLayersThen), so Back
// from the next page never lands on a stale menu.
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { leaveLayersThen, useBackToClose, useOverlayFlag } from "@/lib/ui/layers";
import { cn } from "@/lib/utils";

type SheetCtx = { close: () => void; go: (href: string) => void };
const Ctx = React.createContext<SheetCtx | null>(null);

export function NavSheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "right" | "left";
}) {
  const router = useRouter();
  useBackToClose(open, () => onOpenChange(false));
  useOverlayFlag(open);
  const ctx = React.useMemo<SheetCtx>(
    () => ({
      close: () => onOpenChange(false),
      go: (href) =>
        leaveLayersThen(() => {
          onOpenChange(false);
          router.push(href);
        }),
    }),
    [onOpenChange, router],
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className="flex w-[min(340px,88vw)] flex-col gap-0 bg-white p-0 pb-[env(safe-area-inset-bottom)] font-poppins">
        <SheetHeader className="border-b border-gray-100 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] text-left">
          <SheetTitle className="font-bricolage text-lg text-absoluteDark">{title}</SheetTitle>
          <SheetDescription className={description ? "text-sm text-stone" : "sr-only"}>{description || title}</SheetDescription>
        </SheetHeader>
        <Ctx.Provider value={ctx}>
          <nav aria-label={title} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <ul className="flex flex-col gap-1">{children}</ul>
          </nav>
        </Ctx.Provider>
      </SheetContent>
    </Sheet>
  );
}

const rowCls = (active?: boolean, tone?: "brand" | "default" | "danger") =>
  cn(
    "flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen",
    active ? "bg-primaryGreen/10 font-medium text-primaryGreen" : tone === "brand" ? "font-medium text-primaryGreen" : tone === "danger" ? "text-red-700" : "text-graphite",
    !active && "[@media(hover:hover)]:hover:bg-gray-100 active:bg-gray-100",
  );

export function NavSheetLink({
  href,
  label,
  icon: Icon,
  active,
  tone,
  variant = "row",
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  tone?: "brand" | "default";
  /** "cta": a filled brand button (e.g. "Become a Host") */
  variant?: "row" | "cta";
  onNavigate?: () => void;
}) {
  const ctx = React.useContext(Ctx);
  return (
    <li className={variant === "cta" ? "px-1 pt-2" : undefined}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          variant === "cta"
            ? "flex h-[48px] w-full items-center justify-center rounded-full bg-primaryGreen px-6 text-base font-medium text-white transition-colors [@media(hover:hover)]:hover:bg-brightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2"
            : rowCls(active, tone)
        }
        onClick={(e) => {
          onNavigate?.();
          // new tab / window: leave it to the browser
          if (!ctx || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          if (active) ctx.close();
          else ctx.go(href);
        }}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
        <span className="min-w-0 truncate">{label}</span>
      </Link>
    </li>
  );
}

export function NavSheetButton({ label, icon: Icon, onClick, tone }: { label: string; icon?: React.ComponentType<{ className?: string }>; onClick: () => void; tone?: "danger" | "default" }) {
  return (
    <li>
      <button type="button" onClick={onClick} className={rowCls(false, tone)}>
        {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
        <span className="min-w-0 truncate">{label}</span>
      </button>
    </li>
  );
}

export function NavSheetSeparator() {
  return <li role="separator" className="my-2 h-px bg-gray-100" />;
}
