"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { name: "Stays", id: "1", href: "/stays", icon: "/images/mobile/house1.png" },
  {
    name: "Experiences",
    id: "2",
    href: "/experiences",
    icon: "/images/mobile/compass.png",
  },
  {
    name: "Services",
    id: "3",
    href: "/services",
    icon: "/images/mobile/service1.png",
  },
];

export default function NavTabLayout() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className="w-screen bg-white md:w-full">
      <TabsList className="grid font-bricolage w-full grid-cols-3 md:w-[560px] desktop:w-full">
        {tabs.map((tab, index) => (
          <TabsTrigger key={tab.id} value={tab.href} className="py-2" asChild>
            <Link href={tab.href}>
              {" "}
              <img src={tab.icon} height="60" width="60" />
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
