"use client";

// Host account menu in the host header (components/nav/account-menu).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AccountMenu from "@/components/nav/account-menu";

export function UserDropdownMenu() {
  const { user, logout, authReady } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  // Signed out once the stored session is known → login. Never during render
  // (the session is read in an effect, so the first render has no user yet).
  useEffect(() => {
    if (authReady && !user) router.push("/login");
  }, [authReady, user, router]);

  if (!user) {
    return <span className="h-[44px] w-[44px] shrink-0 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" aria-hidden="true" />;
  }
  return (
    <AccountMenu
      entries={[
        { type: "link", label: "Account", href: "/account/personal-info" },
        { type: "link", label: "Bookings Received", href: "/host/dashboard/bookings" },
        { type: "separator" },
        { type: "link", label: "Host your Property", href: "/host/dashboard/add-listing" },
        { type: "separator" },
        { type: "link", label: "FAQ", href: "/host-faq" },
        { type: "link", label: "Help Center", href: "/help-center" },
        { type: "separator" },
        { type: "action", label: "Logout", onSelect: handleLogout },
      ]}
    />
  );
}
