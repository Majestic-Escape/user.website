"use client";

// Phone tab bar (guest and host): a labelled <nav>, clear of the iPhone home
// indicator, ≥ 56 px tall items with the active one marked by a pill behind
// its icon (same rounded language as the search pill) and aria-current.
import * as React from "react";
import Link from "next/link";
import CountBadge, { countLabel } from "@/components/nav/count-badge";
import { cn } from "@/lib/utils";

// listClassName: the row's height where a bar keeps its own (the host bar is
// production's 4.5rem, the guest bar 4rem).
export function BottomTabBar({ label, columns, children, className, listClassName }: { label: string; columns: number; children: React.ReactNode; className?: string; listClassName?: string }) {
  return (
    <nav
      aria-label={label}
      className={cn("fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] font-poppins md:hidden", className)}
    >
      <ul className={cn("mx-auto grid h-16 max-w-lg", listClassName)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {children}
      </ul>
    </nav>
  );
}

type ItemProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  count?: number;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  labelClassName?: string;
};

// Same layout as the original bar (icon, 4 px, label, centred in 64 px); the
// active pill sits BEHIND the icon, so it changes nothing else on screen.
export const tabItemCls =
  "group inline-flex h-full w-full flex-col items-center justify-center px-2 outline-none transition-transform duration-150 active:scale-95 motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaryGreen";

export function TabIcon({ icon: Icon, active, count }: { icon: React.ComponentType<{ className?: string }>; active?: boolean; count?: number }) {
  return (
    <span className="relative mb-1 flex items-center justify-center">
      <span
        aria-hidden="true"
        className={cn(
          "absolute -inset-x-[18px] -inset-y-[5px] rounded-full transition-colors duration-200",
          active ? "bg-primaryGreen/10" : "[@media(hover:hover)]:group-hover:bg-gray-100",
        )}
      />
      <Icon className="relative h-5 w-5" aria-hidden="true" />
      <CountBadge count={count ?? 0} className="-right-2.5 -top-1.5" />
    </span>
  );
}

function Inner({ label, icon, active, count, labelClassName }: ItemProps) {
  return (
    <>
      <TabIcon icon={icon} active={active} count={count} />
      <span className={cn("max-w-full truncate text-xs", labelClassName)}>{label}</span>
    </>
  );
}

export const BottomTabItem = React.forwardRef<HTMLButtonElement, ItemProps>(function BottomTabItem(props, ref) {
  const { href, label, active, count, onClick, buttonProps } = props;
  const aria = count && count > 0 ? `${label}, ${countLabel(count, 99)} unread` : undefined;
  const cls = cn(tabItemCls, active ? "text-primaryGreen" : "text-gray-700");
  return (
    <li className="flex min-w-0 items-stretch">
      {href ? (
        <Link href={href} onClick={onClick} aria-label={aria} aria-current={active ? "page" : undefined} className={cls}>
          <Inner {...props} />
        </Link>
      ) : (
        <button ref={ref} type="button" onClick={onClick} aria-label={aria} className={cls} {...buttonProps}>
          <Inner {...props} />
        </button>
      )}
    </li>
  );
});

/** Neutral placeholder for an item whose content depends on the session. */
export function BottomTabPlaceholder() {
  return (
    <li className="flex flex-col items-center justify-center px-2" aria-hidden="true">
      <span className="mb-1 h-5 w-5 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" />
      <span className="h-3 w-12 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" />
    </li>
  );
}
