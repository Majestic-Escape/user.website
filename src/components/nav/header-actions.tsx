"use client";

// Right-hand side of the desktop headers (stays header and the site header):
// "Switch to Hosting", Messages with its unread count, the account menu — or,
// signed out, "Become a Host" and "Login". One component so both headers look
// and behave the same: pill-shaped hover/focus, 44 px targets, the unread
// count in the Messages link's accessible name.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { UserDropdownMenu } from "@/components/user-dropdown-menu";
import { IconLink } from "@/components/nav/icon-button";
import { cn } from "@/lib/utils";

const textLink =
  "inline-flex h-[44px] items-center rounded-full px-4 text-sm font-medium text-stone transition-colors duration-200 " +
  "[@media(hover:hover)]:hover:bg-gray-100 [@media(hover:hover)]:hover:text-absoluteDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen";

export default function HeaderActions({ showBecomeHost = false, className }: { showBecomeHost?: boolean; className?: string }) {
  const { user, returnUrl, authReady } = useAuth();
  const { unreadCount } = useUnreadCount();
  const pathname = usePathname();

  // Neutral until the stored session is known: the server HTML cannot tell
  // who is signed in, and the signed-out "Login" used to flash on every
  // reload for signed-in visitors. Same footprint as the avatar button.
  if (!authReady) {
    return (
      <div className={cn("ml-auto hidden items-center gap-2 md:flex", className)} aria-hidden="true">
        <span className="h-10 w-10 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" />
      </div>
    );
  }
  if (user) {
    return (
      <nav aria-label="Account" className={cn("ml-auto hidden items-center gap-1 md:flex", className)}>
        <Link href="/host/dashboard" className={cn(textLink, "hidden lg:inline-flex")}>
          Switch to Hosting
        </Link>
        <IconLink href="/messages" label="Messages" icon={MessageSquare} count={unreadCount} active={pathname.startsWith("/messages")} iconClassName={pathname.startsWith("/messages") ? undefined : "text-muted-foreground"} />
        <UserDropdownMenu />
      </nav>
    );
  }
  return (
    <nav aria-label="Account" className={cn("ml-auto hidden items-center gap-2 md:flex", className)}>
      {showBecomeHost ? (
        <Link href="/login" className={cn(textLink, "hidden text-base text-absoluteDark lg:inline-flex")}>
          Become a Host
        </Link>
      ) : null}
      <Link
        href={{ pathname: "/login", query: returnUrl ? { returnUrl: decodeURIComponent(returnUrl) } : undefined }}
        className="rounded-3xl bg-primaryGreen px-6 py-1.5 text-base font-medium text-white transition-[background-color,transform] duration-200 [@media(hover:hover)]:hover:bg-brightGreen active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2 motion-reduce:active:scale-100"
      >
        Login
      </Link>
    </nav>
  );
}
