"use client";

import * as React from "react";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import {
  AlertCircle,
  CheckCheck,
  DollarSign,
  HelpCircle,
  HotelIcon,
  Inbox,
  IndianRupeeIcon,
  LayoutDashboard,
  MessageCircleIcon,
  PlusIcon,
  Receipt,
  StarIcon,
  StickyNote,
  ChartColumnIncreasing,
  Landmark,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/host/nav-main";
import { useMessagingEnabled } from "@/lib/use-messaging-enabled";
import { TeamSwitcher } from "@/components/host/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Divya Yash",
    email: "divyayashsaxea2000@gmail.com",
    avatar: "/logo.svg",
  },
  teams: [
    {
      name: "Majestic Escape",
      plan: "Host",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/host/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },

    {
      title: "Listings",
      url: "/host/dashboard/listings",
      icon: HotelIcon,
      items: [],
    },
    {
      title: "Add Listing",
      url: "/host/dashboard/add-listing",
      icon: PlusIcon,
      items: [],
    },
    {
      title: "Inbox",
      url: "/host/inbox",
      icon: Inbox,
      items: [],
    },
    {
      title: "Revenue",
      url: "/host/dashboard/revenue",
      icon: IndianRupeeIcon,
      items: [],
    },
    // {
    //   title: "Queries",
    //   url: "/host/dashboard/queries",
    //   icon: MessageCircleIcon,
    //   items: [],
    // },
    // {
    //   title: "Complaints",
    //   url: "/host/dashboard/complaints",
    //   icon: AlertCircle,
    //   items: [],
    // },
    {
      title: "Analytics",
      url: "/host/dashboard/analytics",
      icon: ChartColumnIncreasing,
      items: [],
    },
    {
      title: "Add Bank",
      url: "/host/dashboard/bank-info",
      icon: Landmark,
      items: [],
    },
    {
      title: "KYC Form",
      url: "/host/dashboard/kyc",
      icon: StickyNote,
      items: [],
    },
    // {
    //   title: "Taxes",
    //   url: "/host/dashboard/taxes",
    //   icon: DollarSign,
    //   items: [],
    // },

    {
      title: "Bookings",
      url: "/host/dashboard/bookings",
      // Same sub-pages as the phone tab bar, so they light "Bookings" too.
      also: ["/host/dashboard/active-bookings", "/host/dashboard/booking-details"],
      icon: CheckCheck,
      items: [],
    },

    // {
    //   title: "Invoices",
    //   url: "/host/dashboard/invoices",
    //   icon: Receipt,
    //   items: [],
    // },
    {
      title: "Reviews",
      url: "/host/dashboard/reviews",
      icon: StarIcon,
      items: [],
    },
    {
      title: "Help Center",
      url: "/help-center",
      icon: HelpCircle,
      items: [],
    },
  ],
  projects: [],
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();
  const messagingOn = useMessagingEnabled();

  // Inject badge into Inbox item; no Inbox at all while an admin has messaging off
  const navItems = data.navMain.filter((item) => messagingOn || item.title !== "Inbox").map((item) => {
    if (item.title === "Inbox") {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} pathname={pathname} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
