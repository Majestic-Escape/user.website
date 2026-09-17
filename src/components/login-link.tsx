"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { loginHref } from "@/lib/auth-return";

// A "Login" link that remembers the page it was clicked on, so signing in
// returns here (see lib/auth-return.ts). Drop-in for <Link href="/login">.
export default function LoginLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href="/login"
      {...props}
      onClick={(e) => {
        loginHref(); // records the current path (+ query) for the login form
        onClick?.(e);
      }}
    />
  );
}
