"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed font-bricolage top-0 z-50 w-full border-b py-1 border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto container flex  h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-primary"
        >
          <Image
            width={300}
            height={32}
            className="h-4 md:h-6"
            src="/images/logo-full.svg"
            alt="Logo"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/host/#features"
            className="text-gray-600 hover:text-gray-900"
          >
            Features
          </Link>
          <Link
            href="/host/#faqs"
            className="text-gray-600 hover:text-gray-900"
          >
            FAQs
          </Link>
          <Link
            href="/host/resources"
            className="text-gray-600 hover:text-gray-900"
          >
            Resources
          </Link>
          <Link
            href="/host/help-center"
            className="text-gray-600 hover:text-gray-900"
          >
            Help
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href={"/host/login"}
            className="hidden md:inline-flex text-primaryGreen hover:text-brightGreen font-medium hover:underline"
          >
            Login
          </Link>
          <Link
            href="/host/register"
            className="rounded-3xl py-2.5 px-6 hidden md:inline-flex bg-primaryGreen text-white hover:bg-brightGreen"
          >
            Become a Host
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 text-base">
                <Link
                  href="/host/#faqs"
                  className="text-base"
                  onClick={() => setIsOpen(false)}
                >
                  FAQs
                </Link>
                <Link
                  href="/host/resources"
                  className="text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Resources
                </Link>
                <Link
                  href="/host/#features"
                  className="text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/host/help-center"
                  className="text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Help
                </Link>
                <Link
                  href="/host/login"
                  className="text-base text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/host/register"
                  className="rounded-3xl py-2 text-center w-[256px] bg-primaryGreen inline text-white hover:bg-brightGreen"
                  onClick={() => setIsOpen(false)}
                >
                  Become a Host
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
