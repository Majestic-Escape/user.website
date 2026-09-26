"use client";

// Top bar of the host dashboard and inbox (both layouts share it). Phones get
// the breadcrumb only (their navigation is the bottom tab bar); md and up add
// the sidebar toggle, "Switch to Traveling" and the account menu.
// Breadcrumbs read as words ("Dashboard › Bookings › Review guest"), the
// ancestors are links, and ids in the URL show as "Details".
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserDropdownMenu } from "@/components/host-dropdown-menu";

const LABELS = {
  host: "Host",
  dashboard: "Dashboard",
  inbox: "Inbox",
  "bank-info": "Bank details",
  "add-listing": "Add listing",
  "edit-listing": "Edit listing",
  "booking-details": "Booking details",
  "active-bookings": "Active bookings",
  "review-guest": "Review guest",
  "sync-calendar": "Sync calendar",
  "current-stays": "Current stays",
  kyc: "KYC",
};

const label = (seg) =>
  LABELS[seg] || (/^[a-f0-9]{24}$/i.test(seg) ? "Details" : (seg.charAt(0).toUpperCase() + seg.slice(1)).replace(/-/g, " "));

function Crumbs() {
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  // /host/dashboard/... → Dashboard › …; /host/inbox → Inbox
  const start = segs[0] === "host" ? 1 : 0;
  const trail = segs.slice(start).map((seg, i) => ({ seg, href: "/" + segs.slice(0, start + i + 1).join("/") }));
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? <span aria-hidden="true" className="text-gray-400">›</span> : null}
              {last ? (
                <span aria-current="page" className="truncate font-medium text-absoluteDark">
                  {label(c.seg)}
                </span>
              ) : (
                <Link href={c.href} className="truncate rounded-md text-stone transition-colors [@media(hover:hover)]:hover:text-absoluteDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen">
                  {label(c.seg)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function HostTopBar() {
  return (
    <>
      <header className="z-10 flex h-16 w-full shrink-0 items-center border-b bg-white px-4 md:hidden">
        <Crumbs />
      </header>
      <header className="z-10 hidden h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-white pr-6 md:flex">
        <div className="flex min-w-0 items-center gap-2 px-2">
          <SidebarTrigger className="h-[44px] w-[44px] rounded-full [@media(hover:hover)]:hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primaryGreen" />
          <span aria-hidden="true" className="h-4 w-px bg-gray-200" />
          <Crumbs />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/stays"
            className="inline-flex h-[44px] items-center rounded-full px-4 text-sm font-medium text-stone transition-colors duration-200 [@media(hover:hover)]:hover:bg-gray-100 [@media(hover:hover)]:hover:text-absoluteDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
          >
            Switch to Traveling
          </Link>
          <UserDropdownMenu />
        </div>
      </header>
    </>
  );
}
