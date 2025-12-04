"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { name: "Stays", id: "1", href: "/stays" },
  { name: "Experiences", id: "2", href: "#" },
  { name: "Services", id: "3", href: "#" },
];

export default function NavTabLayout() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className="w-screen bg-white md:w-full">
      <TabsList className="grid font-bricolage w-full grid-cols-3">
        {tabs.map((tab, index) => (
          <TabsTrigger key={tab.id} value={tab.href} asChild>
            <Link href={tab.href}>
              {" "}
              <span
                className={`text-absoluteDark text-base font-medium 'text-absoluteDark'
              `}
              >
                {tab.name}
              </span>
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
