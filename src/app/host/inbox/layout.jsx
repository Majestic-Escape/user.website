"use client";

import { AppSidebar } from "@/components/host/app-sidebar";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import { usePathname, useRouter } from "next/navigation";
import HostBottomNavigation from "@/components/host/bottom-navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { UserDropdownMenu } from "@/components/host-dropdown-menu";

export default function InboxLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const routes = pathname.split("/").filter(Boolean);
  const currentRoute = routes[routes.length - 1];
  const displayText =
    currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1);

  const switchToTraveling = () => {
    router.push("/stays");
  };

  return (
    <ProtectedRoute>
      {/* Mobile Layout */}
      <div className="md:hidden block">
        <header className="w-full z-10 bg-white border-b flex justify-between h-16 py-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear pr-6">
          <div className="flex w-full justify-between items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                {routes.length > 1 && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink>
                        {routes[0].charAt(0).toUpperCase() + routes[0].slice(1)}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayText}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px-64px)] flex-1 bg-muted/50">
          {children}
        </main>
        <HostBottomNavigation />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="w-full z-10 bg-white border-b flex justify-between h-16 py-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear pr-6">
              <div className="flex justify-between items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {routes.length > 1 && (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          {routes[0].charAt(0).toUpperCase() +
                            routes[0].slice(1)}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>{displayText}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="items-center gap-x-2 hidden md:flex">
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Button
                  onClick={switchToTraveling}
                  className="text-sm bg-transparent hover:bg-transparent border-none shadow-none text-stone font-medium hover:text-brightGreen hover:transition-colors hover:underline"
                >
                  Switch to Traveling
                </Button>
                <UserDropdownMenu />
              </div>
            </header>

            <main className="flex-1 h-[calc(100vh-64px)] overflow-hidden">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
