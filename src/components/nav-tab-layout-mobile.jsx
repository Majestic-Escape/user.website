"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, MobileTabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Stays", href: "/stays", icon: "/images/mobile/gen/house1-140.webp" },
  {
    name: "Experiences",
    href: "/experiences",
    icon: "/images/mobile/gen/compass-140.webp",
  },
  { name: "Services", href: "/services", icon: "/images/mobile/gen/service1-140.webp" },
];

export default function MobileNavTabLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.href ?? "";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => router.push(value)}
      className="w-screen"
    >
      <MobileTabsList className="w-full grid grid-cols-3 bg-muted rounded-none p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.href}
            value={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 rounded-lg transition-all",
              "data-[state=active]:bg-white data-[state=active]:shadow"
            )}
          >
            <img src={tab.icon} height={70} width={70} alt={tab.name} />
            <span className="text-sm font-medium">{tab.name}</span>
          </TabsTrigger>
        ))}
      </MobileTabsList>
    </Tabs>
  );
}
