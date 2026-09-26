"use client";

// Header of the public host pages (/host/help-center, /host/resources).
// Features / FAQs live on /hosting (/host has no page — those links used to
// 404). Phones get the shared menu sheet (components/nav/nav-sheet).
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, LayoutGrid, LifeBuoy, LogIn, Menu, Sparkles } from "lucide-react";
import { IconButton } from "@/components/nav/icon-button";
import { NavSheet, NavSheetLink, NavSheetSeparator } from "@/components/nav/nav-sheet";
import { activeHref } from "@/lib/nav/active";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Features", href: "/hosting#features", icon: Sparkles },
  { label: "FAQs", href: "/hosting#faqs", icon: CircleHelp },
  { label: "Resources", href: "/host/resources", icon: LayoutGrid },
  { label: "Help", href: "/host/help-center", icon: LifeBuoy },
];

const link =
  "inline-flex h-[44px] items-center rounded-full px-4 text-gray-600 transition-colors duration-200 [@media(hover:hover)]:hover:bg-gray-100 [@media(hover:hover)]:hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const current = activeHref(pathname, LINKS.filter((l) => !l.href.includes("#")));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white py-1 pt-[max(0.25rem,env(safe-area-inset-top))] font-bricolage">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          aria-label="Majestic Escape home"
          className="flex min-h-[44px] items-center gap-2 rounded-lg text-xl font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen"
        >
          <Image width={300} height={32} className="h-4 w-auto md:h-6" src="/images/logo-full.svg" alt="" />
        </Link>

        <nav aria-label="Hosting" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current === l.href ? "page" : undefined} className={cn(link, current === l.href && "bg-primaryGreen/10 font-medium text-primaryGreen")}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/host/login" className={cn(link, "hidden font-medium text-primaryGreen md:inline-flex")}>
            Login
          </Link>
          <Link
            href="/host/register"
            className="hidden h-[44px] items-center rounded-full bg-primaryGreen px-6 text-white transition-[background-color,transform] duration-200 [@media(hover:hover)]:hover:bg-brightGreen active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2 md:inline-flex"
          >
            Become a Host
          </Link>

          <div className="md:hidden">
            <NavSheet open={isOpen} onOpenChange={setIsOpen} title="Hosting" trigger={<IconButton label="Open menu" icon={Menu} iconClassName="h-6 w-6" />}>
              {LINKS.map((l) => (
                <NavSheetLink key={l.href} href={l.href} label={l.label} icon={l.icon} active={current === l.href} />
              ))}
              <NavSheetSeparator />
              <NavSheetLink href="/host/login" label="Login" icon={LogIn} tone="brand" />
              <NavSheetLink href="/host/register" label="Become a Host" variant="cta" />
            </NavSheet>
          </div>
        </div>
      </div>
    </header>
  );
}
