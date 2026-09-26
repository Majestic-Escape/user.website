"use client";

// Stays · Experiences · Services — the site's top-level categories. One
// component for the desktop header and the phone header, drawn exactly as
// before (same strip, image sizes, labels and active style); what changed is
// underneath: they are plain links with aria-current (they used to be tab
// widgets pointing at panels that don't exist, and on phones an arrow key
// navigated away), and keyboard focus is visible.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Stays", href: "/stays", icon: "/images/mobile/gen/house1-140.webp" },
  { label: "Experiences", href: "/experiences", icon: "/images/mobile/gen/compass-140.webp" },
  { label: "Services", href: "/services", icon: "/images/mobile/gen/service1-140.webp" },
];

const isOn = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * `compact` (phones, once the page is scrolled): the pictures fold away and
 * the labels stay as one short row — ~40 px more for the listings, the
 * categories still one tap away. At the top of the page it is exactly the
 * full strip. The fold animates the row height (a fixed header's own box, so
 * nothing below reflows), the pictures' opacity and scale; none of it runs
 * for reduced motion.
 */
export default function CategoryNav({ variant, compact = false }: { variant: "desktop" | "mobile"; compact?: boolean }) {
  const pathname = usePathname() || "";

  if (variant === "mobile") {
    return (
      <nav aria-label="Categories" className="w-screen" data-compact={compact}>
        <ul className="grid w-full grid-cols-3 items-center justify-center rounded-none bg-muted p-1 text-muted-foreground">
          {CATEGORIES.map((c) => {
            const on = isOn(pathname, c.href);
            return (
              <li key={c.href} className="min-w-0">
                <Link
                  href={c.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-[padding,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen",
                    compact ? "py-1.5" : "py-2",
                    on && "bg-white text-foreground shadow",
                  )}
                >
                  {/* the picture row collapses to 0 height (grid 1fr → 0fr) */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                      compact ? "grid-rows-[0fr] opacity-0 duration-200" : "grid-rows-[1fr] opacity-100 duration-300",
                    )}
                  >
                    <span className="min-h-0 overflow-hidden">
                      <img
                        src={c.icon}
                        height={70}
                        width={70}
                        alt=""
                        className={cn(
                          "mb-1 block origin-bottom transition-transform ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
                          compact ? "scale-50 duration-200" : "scale-100 duration-300",
                        )}
                      />
                    </span>
                  </span>
                  <span className="text-sm font-medium">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Categories" className="w-screen bg-white md:w-full">
      <ul className="grid w-full grid-cols-3 items-center justify-center rounded-lg bg-muted p-1 font-bricolage text-muted-foreground md:w-[560px] desktop:w-full">
        {CATEGORIES.map((c) => {
          const on = isOn(pathname, c.href);
          return (
            <li key={c.href} className="min-w-0">
              <Link
                href={c.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex w-full items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2",
                  on && "bg-background text-foreground shadow",
                )}
              >
                <img src={c.icon} alt="" height="60" width="60" />
                <span className="text-base font-medium text-absoluteDark">{c.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
