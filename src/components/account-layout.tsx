"use client";

import { ReactNode, useEffect, useState } from "react";
import AccountHeader from "./account-header";
import AccountSidebar from "./account-sidebar";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: LayoutProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const authenticate = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = getLocalData ? JSON.parse(getLocalData) : null;
    if (data) {
      setIsAuth(true);
      setLoading(false);
    }
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
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
        You are not authorized to access this page. &nbsp;{" "}
        <Link href="/login">
          <u>
            <b>Click Here</b>
          </u>
        </Link>
        &nbsp; to log in now to access.
      </div>
    );
  }
  return (
    <div className="font-poppins min-h-screen pt-24 bg-offWhite">
      <div className="container max-w-[1400px] mx-auto">
        <AccountHeader />
        <div className="flex">
          <AccountSidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
