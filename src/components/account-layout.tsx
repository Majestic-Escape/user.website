"use client";

import { ReactNode, useEffect, useState } from "react";
import AccountHeader from "./account-header";
import AccountSidebar from "./account-sidebar";
import { readStoredToken } from "@/lib/session";
import NotAuthorized from "@/components/not-authorized";

interface LayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: LayoutProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const authenticate = () => {
    // Presence check only (the API enforces auth). Previously `loading` was
    // never cleared without a token, leaving a spinner forever when logged out.
    setIsAuth(!!readStoredToken());
    setLoading(false);
  };

  useEffect(() => {
    authenticate();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  if (!isAuth) {
    return <NotAuthorized />;
  }
  return (
    <div className="font-poppins min-h-screen pt-24 bg-offWhite">
      <div className="container max-w-[1400px] mx-auto">
        <AccountHeader />
        <div className="flex">
          {/* <AccountSidebar /> */}
          {/* <390px: this inset plus the form's own p-4 + p-6 squeezed the State select under 110px.
              min-w-0: as a flex item main grew to the widest unbreakable value (a long
              e-mail) and the profile card was cut off on phones. */}
          <main className="flex-1 min-w-0 p-8 [@media(max-width:389px)]:px-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
