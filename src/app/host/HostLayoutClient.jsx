"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Host routes that must work without a token. Everything else under /host
// renders the "not authorized" message until the user logs in; the dashboard
// layouts additionally verify the token with the API (ProtectedRoute).
const PUBLIC_HOST_PATHS = ["/host/register", "/host/help-center", "/host/resources"];

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
      <>
        <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
          You are not authorized to access this page. &nbsp;{" "}
          <Link href="/login">
            <u>
              <b>Click Here</b>
            </u>
          </Link>
          &nbsp; to log in now to access.
        </div>
      </>
    );
  }

  return <main className="font-poppins">{children}</main>;
};

export default Layout;
