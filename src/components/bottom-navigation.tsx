"use client";

// Guest tab bar for phones (Home · Help/Messages · Login/Bookings · Menu) and
// its Menu sheet. Built from the shared nav parts (components/nav/*) so it
// looks and behaves like the host bar: pill behind the active icon,
// aria-current, 44 px+ targets, safe-area aware, Back closes the menu.
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CircleHelp,
  FileText,
  HandHelping,
  HomeIcon,
  Info,
  MenuIcon,
  MessageCircle,
  Newspaper,
  Scale,
  ShieldCheck,
  User,
  UserPlus,
  Handshake,
  Building2,
  ReceiptText,
  Undo2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { loginHref } from "@/lib/auth-return";
import { activeHref } from "@/lib/nav/active";
import { leaveLayersThen } from "@/lib/ui/layers";
import { cn } from "@/lib/utils";
import { BottomTabBar, BottomTabItem, TabIcon, tabItemCls, BottomTabPlaceholder } from "@/components/nav/bottom-tab-bar";
import { NavSheet, NavSheetButton, NavSheetLink, NavSheetSeparator } from "@/components/nav/nav-sheet";

type Item = { name: string; href: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };

const navItems: Item[] = [
  { name: "Home", href: "/", icon: HomeIcon, exact: true },
  { name: "Help", href: "/help-center", icon: HandHelping },
  { name: "Login", href: "/login-options", icon: User },
];

const navItemsLoggedIn: Item[] = [
  { name: "Home", href: "/", icon: HomeIcon, exact: true },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Bookings", href: "/manage-bookings", icon: Calendar },
];

const menuItems: Item[] = [
  { name: "Register", href: "/register", icon: UserPlus },
  { name: "About", href: "/about", icon: Info },
  { name: "Partners", href: "/partners", icon: Handshake },
  { name: "Blogs", href: "/blogs", icon: Newspaper },
  { name: "Host your property", href: "/login", icon: Building2 },
  { name: "FAQ", href: "/faq", icon: CircleHelp },
  { name: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
  { name: "Cancellation Policy", href: "/cancellation-policy", icon: ReceiptText },
  { name: "Refund Policy", href: "/refund-policy", icon: Undo2 },
  { name: "Terms of Service", href: "/terms-of-service", icon: Scale },
  { name: "Help Center", href: "/help-center", icon: HandHelping },
  { name: "Account", href: "/account/personal-info", icon: User },
];

const menuItemsLoggedIn: Item[] = [
  { name: "Switch to Hosting", href: "/host/dashboard", icon: Building2 },
  { name: "FAQ", href: "/faq", icon: CircleHelp },
  { name: "Blogs", href: "/blogs", icon: Newspaper },
  { name: "FAQ (Host)", href: "/host-faq", icon: FileText },
  { name: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
  { name: "Cancellation Policy", href: "/cancellation-policy", icon: ReceiptText },
  { name: "Refund Policy", href: "/refund-policy", icon: Undo2 },
  { name: "Terms of Service", href: "/terms-of-service", icon: Scale },
  { name: "Account", href: "/account/personal-info", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout, authReady } = useAuth();
  const { unreadCount } = useUnreadCount();
  const router = useRouter();

  // The open menu owns a history entry (Back closes it). Leave it first:
  // closing and pushing in the same tick let the menu's pending history.back()
  // land after the push and return to this page instead of /login.
  const handleLogout = () =>
    leaveLayersThen(() => {
      logout();
      setOpen(false);
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    });

  const tabs = user ? navItemsLoggedIn : navItems;
  const tabActive = activeHref(pathname, tabs);
  const menu = user ? menuItemsLoggedIn : menuItems;
  const menuActive = activeHref(pathname, menu);

  return (
    <BottomTabBar label="Main" columns={4}>
      {/* Until the stored session has been read, the two session-dependent
          slots are neutral placeholders: the server HTML used to carry the
          signed-out items (Help / Login), which flashed on every reload for
          signed-in visitors before Messages / Bookings took their place. */}
      {!authReady ? (
        <>
          <BottomTabItem href="/" label="Home" icon={HomeIcon} active={pathname === "/"} />
          <BottomTabPlaceholder />
          <BottomTabPlaceholder />
        </>
      ) : (
        tabs.map((item) => (
          <BottomTabItem
            key={item.name}
            href={item.href}
            label={item.name}
            icon={item.icon}
            active={tabActive === item.href}
            count={item.name === "Messages" ? unreadCount : 0}
            // Sign-in via /login-options: remember this page so the login
            // form brings the visitor back here.
            onClick={item.href === "/login-options" ? () => loginHref() : undefined}
          />
        ))
      )}
      <li className="flex min-w-0 items-stretch py-1">
        <NavSheet
          open={open}
          onOpenChange={setOpen}
          title="Menu"
          trigger={
              <button type="button" className={cn(tabItemCls, "text-gray-700")}>
                <TabIcon icon={MenuIcon} />
                <span className="text-xs">Menu</span>
              </button>
          }
        >
          {menu.map((item) => (
            <NavSheetLink
              key={item.name}
              href={item.href}
              label={item.name}
              active={menuActive === item.href}
              tone={item.name === "Switch to Hosting" ? "brand" : "default"}
            />
          ))}
          {user ? (
            <>
              <NavSheetSeparator />
              <NavSheetButton label="Logout" onClick={handleLogout} />
            </>
          ) : null}
        </NavSheet>
      </li>
    </BottomTabBar>
  );
}
