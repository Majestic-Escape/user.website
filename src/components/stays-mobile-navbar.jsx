"use client";

// Phone header: home logo, the search pill + filters (MobileSearchBar) and the
// Stays · Experiences · Services categories (not on a stay page, where the
// space goes to the listing). Once the page is scrolled the category pictures
// fold away (labels stay) and come back at the top — more room for listings,
// like the desktop header condensing its search bar. Hidden from md up.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNavTabLayout from "@/components/nav-tab-layout-mobile";
import MobileSearchBar from "@/components/search/mobile-search-bar";
import { useCompactOnScroll } from "@/hooks/use-scrolled";

export function MobileNavbar() {
  const pathname = usePathname();
  const isStayDetailPage = pathname.startsWith("/stay/") && pathname !== "/stay";
  const compact = useCompactOnScroll();

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 bg-white pt-[env(safe-area-inset-top)] transition-shadow duration-300 motion-reduce:transition-none md:hidden ${
        compact ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col">
        <div className="flex h-16 items-center gap-1.5 pl-[9px] pr-3">
          <Link
            href="/"
            aria-label="Majestic Escape home"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-colors [@media(hover:hover)]:hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
          >
            <Image width={20} height={20} className="h-5 w-auto" src="/logo.png" alt="" />
          </Link>
          <MobileSearchBar />
        </div>
      </div>
      {isStayDetailPage ? null : <MobileNavTabLayout compact={compact} />}
    </div>
  );
}
