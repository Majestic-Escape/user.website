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
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
