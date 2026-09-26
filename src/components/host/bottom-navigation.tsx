"use client";

// Host tab bar for phones (Home · Inbox · Bookings · Listings · Menu) and its
// Menu sheet — the same shared parts as the guest bar (components/nav/*).
// The active tab follows the page (it used to be local state that matched
// nothing), sub-pages light their section, and Back closes the menu.
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  ChartNoAxesColumn,
  HelpingHand,
  HousePlus,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Receipt,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { activeHref } from "@/lib/nav/active";
import { leaveLayersThen } from "@/lib/ui/layers";
import { cn } from "@/lib/utils";
import { BottomTabBar, BottomTabItem, TabIcon, tabItemCls } from "@/components/nav/bottom-tab-bar";
import { NavSheet, NavSheetButton, NavSheetLink, NavSheetSeparator } from "@/components/nav/nav-sheet";

const navItems = [
  { name: "Home", icon: LayoutDashboard, href: "/host/dashboard", exact: true },
  { name: "Inbox", icon: MessageCircle, href: "/host/inbox" },
  { name: "Bookings", icon: BookOpen, href: "/host/dashboard/bookings", also: ["/host/dashboard/active-bookings", "/host/dashboard/booking-details"] },
  { name: "Listings", icon: Building2, href: "/host/dashboard/listings" },
];

const menuItems = [
  { name: "Switch to Guest", icon: User, href: "/", tone: "brand" as const },
  { name: "Add Listing", icon: HousePlus, href: "/host/dashboard/add-listing" },
  { name: "Revenue", icon: Receipt, href: "/host/dashboard/revenue" },
  { name: "Analytics", icon: ChartNoAxesColumn, href: "/host/dashboard/analytics" },
  { name: "Bank Details", icon: Landmark, href: "/host/dashboard/bank-info" },
  { name: "Reviews", icon: Star, href: "/host/dashboard/reviews" },
  { name: "Help", icon: HelpingHand, href: "/help-center" },
];

export default function HostBottomNavigation() {
  const { logout } = useAuth();
  const { unreadCount } = useUnreadCount();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Leave the open menu's history entry before navigating (see the guest
  // bottom navigation): otherwise its pending pop returns here from /login.
  const handleLogout = () =>
    leaveLayersThen(() => {
      logout();
      setOpen(false);
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    });

  const tabActive = activeHref(pathname, navItems);
  const menuActive = activeHref(pathname, menuItems.filter((m) => m.href !== "/"));

  return (
    // production's host bar: 4.5rem tall, medium-weight labels
    <BottomTabBar label="Host" columns={5} listClassName="h-[4.5rem]">
      {navItems.map((item) => (
        <BottomTabItem
          key={item.name}
          href={item.href}
          label={item.name}
          icon={item.icon}
          active={tabActive === item.href}
          count={item.name === "Inbox" ? unreadCount : 0}
          labelClassName="font-medium"
        />
      ))}
      <li className="flex min-w-0 items-stretch py-1">
        <NavSheet
          open={open}
          onOpenChange={setOpen}
          title="Menu"
          trigger={
            <button type="button" className={cn(tabItemCls, "text-gray-700")}>
              <TabIcon icon={Menu} />
              <span className="text-xs font-medium">Menu</span>
            </button>
          }
        >
          {menuItems.map((item) => (
            <NavSheetLink key={item.name} href={item.href} label={item.name} icon={item.icon} active={menuActive === item.href} tone={item.tone} />
          ))}
          <NavSheetSeparator />
          <NavSheetButton label="Logout" icon={LogOut} onClick={handleLogout} />
        </NavSheet>
      </li>
    </BottomTabBar>
  );
}
