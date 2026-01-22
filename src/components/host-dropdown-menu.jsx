"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserDropdownMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login"); // Redirect to home page after logout
  };

  if (!user) {
    // If there's no user, redirect to login page
    router.push("/login");
    return null;
  }
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-full border border-gray-200"
            size="icon"
            variant="ghost"
          >
            <User className="h-6 w-6" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            "w-56",
            "absolute right-0 mt-2",
            "overflow-hidden",
            "origin-top-right",
          )}
          sideOffset={5}
        >
          <DropdownMenuItem asChild>
            <Link className="py-2" href="/account/personal-info">
              Account
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link className="py-2" href="/notifications">
              Notifications
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem asChild>
            <Link className="py-2" href="/host/dashboard/bookings">
              Bookings Recieved
            </Link>
          </DropdownMenuItem>

          <hr />
          <DropdownMenuItem asChild>
            <Link
              className="py-2"
              href="/host/dashboard/add-listing"
              // target="_blank"
              // rel="noopener noreferrer"
            >
              Host your Property
            </Link>
          </DropdownMenuItem>

          {/* <DropdownMenuItem asChild>
            <Link
              className="py-2"
              href="/host/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Manage Experiences
            </Link>
          </DropdownMenuItem> */}

          <hr />
          <DropdownMenuItem asChild>
            <Link className="py-2" href="/host-faq">
              FAQ
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link className="py-2" href="/help-center">
              Help Center
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button onClick={handleLogout} className="py-2 w-full">
              Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
