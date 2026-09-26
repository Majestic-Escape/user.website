"use client";

// Account dropdown for the desktop headers (guest and host variants share it):
// a 44 px round avatar trigger with a real label, rounded items that are ≥ 40
// px (44 px on touch), the current page marked, proper separators, and the
// same focus / hover language as the rest of the navigation.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { activeHref } from "@/lib/nav/active";
import { cn } from "@/lib/utils";

export type AccountMenuEntry =
  | { type: "link"; label: string; href: string; className?: string }
  | { type: "separator" }
  | { type: "action"; label: string; onSelect: () => void; tone?: "danger" };

const itemCls =
  "min-h-[40px] cursor-pointer rounded-xl px-3 text-[15px] text-graphite focus:bg-gray-100 focus:text-absoluteDark [@media(pointer:coarse)]:min-h-[44px]";

export default function AccountMenu({ entries, label = "Account menu" }: { entries: AccountMenuEntry[]; label?: string }) {
  const pathname = usePathname();
  const current = activeHref(
    pathname,
    entries.flatMap((e) => (e.type === "link" ? [{ href: e.href }] : [])),
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* 44 px hit area around the same 34 px avatar circle as before */}
        <button
          type="button"
          aria-label={label}
          className="group inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-absoluteDark transition-[box-shadow,transform] duration-200 [@media(hover:hover)]:group-hover:shadow-md group-active:scale-95 group-data-[state=open]:shadow-md motion-reduce:group-active:scale-100">
            <User className="h-6 w-6" aria-hidden="true" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[1100] w-60 rounded-2xl border-0 bg-white p-1.5 font-poppins shadow-[0_12px_40px_rgba(0,0,0,0.16)] ring-1 ring-black/5 motion-reduce:animate-none"
      >
        {entries.map((e, i) => {
          if (e.type === "separator") return <DropdownMenuSeparator key={`s${i}`} className="mx-1 my-1.5 bg-gray-100" />;
          if (e.type === "action")
            return (
              <DropdownMenuItem key={e.label} onSelect={e.onSelect} className={cn(itemCls, e.tone === "danger" && "text-red-700 focus:text-red-700")}>
                {e.label}
              </DropdownMenuItem>
            );
          const on = current === e.href;
          return (
            <DropdownMenuItem key={e.href + e.label} asChild className={cn(itemCls, on && "font-medium text-primaryGreen", e.className)}>
              <Link href={e.href} aria-current={on ? "page" : undefined}>
                {e.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
