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
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Stay", href: "/stays", icon: Building2Icon },
  { name: "Experience", href: "/experiences", icon: Compass },
  { name: "Login", href: "/login-options", icon: User },
];

const navItemsLoggedIn = [
  { name: "Home", href: "/", icon: HomeIcon },

  { name: "Bookings", href: "/manage-bookings", icon: Calendar },
  { name: "Hosting", href: "/host/dashboard", icon: SquareUser },
  { name: "Help", href: "/help-center", icon: HandHelping },
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
  // { name: "Complaints", href: "/complaints" },
];

const menuItemsLoggedIn = [
  // Navigation Links
  { name: "Services", href: "/services" },
  { name: "FAQ", href: "/faq" },
  { name: "Blogs", href: "/blogs" },
  { name: "Switch to hosting", href: "/host/dashboard" },
  { name: "FAQ (Host)", href: "/host-faq" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Cancellation Policy", href: "/cancellation-policy" },
  { name: "Refund Policy", href: "/cancellation-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  // Support Links
  { name: "Help Center", href: "/help-center" },
  // { name: "Complaints", href: "/complaints" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

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
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {user
          ? navItemsLoggedIn.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group",
                  pathname === item.href ? "text-primaryGreen" : "text-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))
          : navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-2 hover:bg-gray-50 group",
                  pathname === item.href ? "text-primaryGreen" : "text-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="font-poppins" asChild>
            <Button
              variant="ghost"
              className="inline-flex flex-col items-center justify-center w-full h-full px-5 hover:bg-gray-50 group"
            >
              <MenuIcon className="w-5 h-5 mb-1 text-gray-700" />
              <span className="text-xs px-2 text-gray-700">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] sm:w-[400px] bg-white"
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
                          pathname === item.href ? "bg-gray-100" : ""
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
                        pathname === item.href ? "bg-gray-100" : ""
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
