"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, MobileTabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { name: "Stays", id: "1", href: "/stays", icon: "🏠" },
  { name: "Experiences", id: "2", href: "/experiences", icon: "🧗" },
  { name: "Services", id: "3", href: "/services", icon: "🛎️" },
];

export default function MobileNavTabLayout({ hideTabs }) {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className="w-screen ">
      <MobileTabsList className="mx-auto grid grid-cols-3 max-w-md  shadow-md p-1 ">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.href}
            className={tab.id == 3 ? null : "border-r-2"}
            asChild
          >
            <Link
              href={tab.href}
              className="flex flex-col items-center  justify-center w-full pt-2"
            >
              <span className="text-2xl leading-none">{tab.icon}</span>
              <span className="text-sm font-medium text-absoluteDark">
                {tab.name}
              </span>
            </Link>
          </TabsTrigger>
        ))}
      </MobileTabsList>
    </Tabs>
  );
}
