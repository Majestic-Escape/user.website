"use client";

// Round icon control for headers and menus: 44 × 44 px hit area on every
// device (px, not rem — the site's root font is 15 px), a required label that
// becomes the accessible name, an optional count bubble, and the same hover /
// focus / press feedback as the search pill. Renders a Link when given href.
import * as React from "react";
import Link from "next/link";
import CountBadge, { countLabel } from "@/components/nav/count-badge";
import { cn } from "@/lib/utils";

type Common = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  /** "3 unread" etc. appended to the label when count > 0 */
  countNoun?: string;
  className?: string;
  iconClassName?: string;
  active?: boolean;
};

const base =
  "relative inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-graphite transition-[background-color,color,transform] duration-200 " +
  "[@media(hover:hover)]:hover:bg-gray-100 [@media(hover:hover)]:hover:text-absoluteDark active:scale-95 motion-reduce:active:scale-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2";

function name(label: string, count?: number, noun = "unread") {
  return count && count > 0 ? `${label}, ${countLabel(count, 99)} ${noun}` : label;
}

export function IconLink({ href, label, icon: Icon, count, countNoun, className, iconClassName, active, ...rest }: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link href={href} aria-label={name(label, count, countNoun)} aria-current={active ? "page" : undefined} className={cn(base, active && "text-primaryGreen", className)} {...rest}>
      <Icon className={cn("h-5 w-5", iconClassName)} aria-hidden="true" />
      <CountBadge count={count ?? 0} />
    </Link>
  );
}

export const IconButton = React.forwardRef<HTMLButtonElement, Common & React.ButtonHTMLAttributes<HTMLButtonElement>>(function IconButton(
  { label, icon: Icon, count, countNoun, className, iconClassName, active, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={name(label, count, countNoun)} className={cn(base, active && "text-primaryGreen", className)} {...rest}>
      <Icon className={cn("h-5 w-5", iconClassName)} aria-hidden="true" />
      <CountBadge count={count ?? 0} />
    </button>
  );
});
