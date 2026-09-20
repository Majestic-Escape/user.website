"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotAuthorized from "@/components/not-authorized";

// Host routes that must work without a token. Everything else under /host
// renders the "not authorized" message until the user logs in; the dashboard
// layouts additionally verify the token with the API (ProtectedRoute).
const PUBLIC_HOST_PATHS = [
  "/host/login",
  "/host/register",
  "/host/help-center",
  "/host/resources",
];

const Layout = ({ children }) => {
  const pathname = usePathname();
  const isPublic = PUBLIC_HOST_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Presence check only — real verification happens in ProtectedRoute.
    let hasToken = false;
    try {
      hasToken = !!JSON.parse(localStorage.getItem("token"));
    } catch {
      hasToken = false;
    }
    setIsAuth(hasToken);
    // Previously `loading` was only cleared when a token existed, so a
    // logged-out visitor saw a spinner forever.
    setLoading(false);
  }, []);

  if (isPublic) {
    return <main className="font-poppins">{children}</main>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  if (!isAuth) {
    return (
      <NotAuthorized description="The host area is only for signed-in hosts. Log in and we will bring you straight back here." />
    );
  }

  return <main className="font-poppins">{children}</main>;
};

export default Layout;
