"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems = [
  { name: "Stays", href: "/stays" },
  { name: "Experiences", href: "/experiences" },
  { name: "Services", href: "/services" },
];

export function MainTab() {
  const pathname = usePathname();

  return (
    <div className="fixed z-50 md:hidden  font-poppins top-12 right-0 left-0 px-4">
      <div className="mx-auto">
        <Tabs defaultValue={pathname} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {navItems.map((item) => (
              <TabsTrigger key={item.href} value={item.href} asChild>
                <Link href={item.href}>{item.name}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
