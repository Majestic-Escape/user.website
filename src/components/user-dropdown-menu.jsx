"use client";

// Guest account menu in the desktop headers (components/nav/account-menu).
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AccountMenu from "@/components/nav/account-menu";

export function UserDropdownMenu() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Same destination as the host menu and the mobile navigation; without
    // it the account pages stayed on screen with the signed-out data.
    router.push("/login");
  };

  return (
    <AccountMenu
      entries={[
        { type: "link", label: "Account", href: "/account/personal-info" },
        { type: "link", label: "Messages", href: "/messages" },
        { type: "link", label: "Bookings", href: "/manage-bookings" },
        // the header shows "Switch to Hosting" itself from lg up
        { type: "link", label: "Switch to Hosting", href: "/host/dashboard", className: "lg:hidden" },
        { type: "separator" },
        { type: "link", label: "FAQ", href: "/faq" },
        { type: "link", label: "Help Center", href: "/help-center" },
        { type: "separator" },
        { type: "action", label: "Logout", onSelect: handleLogout },
      ]}
    />
  );
}
