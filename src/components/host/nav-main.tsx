"use client";

// Host sidebar menu. Each row IS the link (SidebarMenuButton asChild — it used
// to be a <button> inside an <a>: two tab stops, invalid HTML), the section of
// the current page is lit (sub-pages included, via lib/nav/active), and the
// highlight is the same soft pill as the phone tab bar.
import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { activeHref } from "@/lib/nav/active";
import { countLabel } from "@/components/nav/count-badge";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  badge?: number;
  items?: { title: string; url: string }[];
};

export function NavMain({ items, pathname }: { items: Item[]; pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const handleLinkClick = () => setOpenMobile(false);
  const current = activeHref(
    pathname,
    items.map((i) => ({ href: i.url, exact: i.url === "/host/dashboard" })),
  );

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const isActive = current === item.url;
          const badge = item.badge != null && item.badge > 0 ? item.badge : 0;
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem className="font-bricolage">
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-11 rounded-full px-3 text-base transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-primaryGreen",
                    isActive
                      ? "bg-primaryGreen/10 font-medium text-primaryGreen data-[active=true]:bg-primaryGreen/10 data-[active=true]:text-primaryGreen"
                      : "text-absoluteDark [@media(hover:hover)]:hover:bg-gray-100",
                  )}
                >
                  <Link
                    href={item.url}
                    onClick={handleLinkClick}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={badge ? `${item.title}, ${countLabel(badge, 99)} unread` : undefined}
                  >
                    {item.icon ? <item.icon className={isActive ? "text-primaryGreen" : "text-absoluteDark"} aria-hidden="true" /> : null}
                    <span className="pl-1">{item.title}</span>
                    {badge ? (
                      <span
                        aria-hidden="true"
                        className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white"
                      >
                        {countLabel(badge)}
                      </span>
                    ) : null}
                  </Link>
                </SidebarMenuButton>

                {item.items && item.items.length > 0 && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                            className={cn("rounded-full", subActive && "bg-primaryGreen/10 font-medium text-primaryGreen")}
                          >
                            <Link href={subItem.url} onClick={handleLinkClick} aria-current={subActive ? "page" : undefined}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
