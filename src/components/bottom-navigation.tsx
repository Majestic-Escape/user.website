"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calendar,
  User,
  MenuIcon,
  HomeIcon,
  Heart,
  Building2Icon,
  HandHelping,
  SquareUser,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/contexts/UnreadCountContext";
import { loginHref } from "@/lib/auth-return";

const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Help", href: "/help-center", icon: HandHelping },
  // { name: "Experience", href: "/experiences", icon: Compass },
  { name: "Login", href: "/login-options", icon: User },
];

const navItemsLoggedIn = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Bookings", href: "/manage-bookings", icon: Calendar },
]; //trips

const menuItems = [
  // Navigation Links
  // { name: "Login", href: "/login" },
  { name: "Register", href: "/register" },
  { name: "About", href: "/about" },
  { name: "Partners", href: "/partners" },
  { name: "Blogs", href: "/blogs" },

  // { name: "Book an Experience", href: "/experiences" },

  // Host Links
  { name: "Host your property", href: "/login" },
  // Support Links
  { name: "FAQ", href: "/faq" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Cancellation Policy", href: "/cancellation-policy" },
  { name: "Refund Policy", href: "/cancellation-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Help Center", href: "/help-center" },
  { name: "Account", href: "/account/personal-info" },
  // { name: "Complaints", href: "/complaints" },
];

const menuItemsLoggedIn = [
  // Navigation Links
  // { name: "Services", href: "/services" },
  { name: "Switch to Hosting", href: "/host/dashboard" },
  { name: "FAQ", href: "/faq" },
  { name: "Blogs", href: "/blogs" },

  { name: "FAQ (Host)", href: "/host-faq" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Cancellation Policy", href: "/cancellation-policy" },
  { name: "Refund Policy", href: "/cancellation-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Account", href: "/account/personal-info" },
  // Support Links
  // { name: "Help Center", href: "/help-center" },
  // { name: "Complaints", href: "/complaints" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout, authReady } = useAuth();
  const { unreadCount } = useUnreadCount();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    setOpen(false);
    localStorage.clear();
    sessionStorage.clear();
    // localStorage.removeItem("token");
    router.push("/login"); // Redirect to home page after logout
  };

  return (
    <div className="md:hidden  font-poppins fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {/* Until the stored session has been read, the two auth-dependent
            slots are neutral placeholders: the server HTML used to carry the
            signed-out items (Help / Login), which flashed on every reload for
            signed-in visitors before Messages / Bookings took their place. */}
        {!authReady ? (
          <>
            <Link
              href="/"
              className={cn(
                "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group",
                pathname === "/" ? "text-primaryGreen" : "text-gray-700",
              )}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <HomeIcon className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </Link>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="inline-flex flex-col items-center justify-center px-2"
                aria-hidden="true"
              >
                <Skeleton className="mb-1 h-5 w-5 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </>
        ) : user
          ? navItemsLoggedIn.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group",
                  pathname === item.href
                    ? "text-primaryGreen"
                    : "text-gray-700",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 mb-1" />
                  {item.name === "Messages" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.name}</span>
              </Link>
            ))
          : navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                // Sign-in via /login-options: remember this page so the
                // login form brings the visitor back here.
                onClick={item.href === "/login-options" ? () => loginHref() : undefined}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group",
                  pathname === item.href
                    ? "text-primaryGreen"
                    : "text-gray-700",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="font-poppins" asChild>
            {/* A plain button styled like the three links — the shadcn Button
                added its own font-weight and padding, so "Menu" sat lower and
                bolder than the other labels. */}
            <button
              type="button"
              className="inline-flex flex-col items-center justify-center px-2 text-gray-700 hover:bg-gray-50 group"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 mb-1" />
              <span className="text-xs">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="
    w-[300px] sm:w-[400px] bg-white
    data-[state=open]:animate-in
    data-[state=closed]:animate-out
    data-[state=closed]:slide-out-to-right
    data-[state=open]:slide-in-from-right
    duration-300
  "
          >
            <SheetHeader>
              <SheetTitle className="text-left text-gray-900 font-bricolage">
                Menu
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] pb-10">
              <div className="flex font-poppins flex-col space-y-3 mt-4">
                {user ? (
                  <>
                    {menuItemsLoggedIn.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "px-4 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-gray-700",
                          pathname === item.href ? "bg-gray-100" : "",
                          item.name == "Switch to Hosting"
                            ? " text-primaryGreen hover:text-brightGreen "
                            : "",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}

                    <Button
                      onClick={handleLogout}
                      className="px-4 py-2 text-left font-normal text-sm rounded-md hover:bg-gray-100 transition-colors bg-gray-100 shadow-none border-none text-gray-700"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-4 py-2  text-sm rounded-md hover:bg-gray-100 transition-colors text-gray-700",
                        pathname === item.href ? "bg-gray-100" : "",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
