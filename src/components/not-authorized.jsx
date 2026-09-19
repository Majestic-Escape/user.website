"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import LoginLink from "@/components/login-link";

// The signed-out state of a members-only page (account, host area). One
// centred card instead of a bare sentence: the previous inline text was laid
// out as three flex columns on phones ("You are not authorized … | Click Here
// | to log in now") and sat in an empty screen.
export default function NotAuthorized({
  title = "Sign in to continue",
  description = "This page is only for signed-in members. Log in and we will bring you straight back here.",
}) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-offWhite px-4 pb-24 pt-28 font-poppins md:items-center md:pb-12 md:pt-24">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm md:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lightGreen/40 text-primaryGreen">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-bricolage text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <LoginLink className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-primaryGreen px-6 text-sm font-medium text-white transition-colors hover:bg-brightGreen">
          Log in
        </LoginLink>
        <Link
          href="/"
          className="mt-3 inline-block py-2 text-sm font-medium text-gray-600 hover:text-primaryGreen"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
