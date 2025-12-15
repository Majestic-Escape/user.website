"use client";

import { AppSidebar } from "@/components/host/app-sidebar";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";

import { usePathname } from "next/navigation";
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
import {
  Bell,
  BellDotIcon,
  Headphones,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserDropdownMenu } from "../../../../components/host-dropdown-menu";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const pathname = usePathname();
  const routes = pathname.split("/").filter(Boolean);
  const currentRoute = routes[routes.length - 1];
  const displayText =
    currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1);

  const switchToTraveling = () => {
    router.push("/stays");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/host/login");
  };

  return (
    <ProtectedRoute>
      <div className="md:hidden block">
        <header className=" w-full z-10 bg-white border-b flex justify-between h-16 py-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear pr-6 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex w-full justify-between  items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                {routes.length > 1 && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink>
                        {/* href={`/${routes[0]}`} */}
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

            <div className=" flex justify-end gap-x-4 ">
              {/* <MessageCircle className="text-gray-500" /> */}
              {/* <BellDotIcon className="text-gray-500" /> */}
            </div>
          </div>

          <div className="items-center gap-x-2 hidden md:flex">
            <Link
              href={"/inbox"}
              className="hover:text-primaryGreen   text-brightGreen"
              size="icon"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
            <Button
              variant="ghost"
              className="hover:text-primaryGreen   text-brightGreen"
              size="icon"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Link
              href="/host/help-center"
              className="hover:text-primaryGreen   text-brightGreen"
              size="icon"
            >
              <Headphones className="w-5 h-5" />
            </Link>
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Button
              className="bg-primaryGreen  text-white hover:bg-brightGreen  rounded-full px-6"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        <main
          className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8"
          style={{ maxWidth: "100vw" }}
        >
          {children}
        </main>
        <HostBottomNavigation />
      </div>
      <div className="hidden md:block">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className=" w-full z-10 bg-white border-b flex justify-between h-16 py-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear pr-6 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex justify-between  items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {routes.length > 1 && (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          {/* <BreadcrumbLink href={`/${routes[0]}`}> */}
                          {routes[0].charAt(0).toUpperCase() +
                            routes[0].slice(1)}
                          {/* </BreadcrumbLink> */}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage href={pathname}>
                        {displayText}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="items-center gap-x-2 hidden md:flex">
                {/* <Link href={"/inbox"} className="hover:text-primaryGreen   text-brightGreen" size="icon">
          <MessageSquare className="w-5 h-5" />
        </Link>
        <Button variant="ghost"  className="hover:text-primaryGreen   text-brightGreen" size="icon">
        <Bell className="w-5 h-5" />
        </Button>
        <Link href="/host/help-center"  className="hover:text-primaryGreen   text-brightGreen" size="icon">
        <Headphones className="w-5 h-5" />
        </Link> */}

                <Separator orientation="vertical" className="mr-2 h-4" />
                <Button
                  onClick={switchToTraveling}
                  className="text-sm bg-transparent hover:bg-transparent border-none shadow-none  text-stone font-medium hover:text-brightGreen hover:transition-colors hover:underline"
                >
                  Switch to Traveling
                </Button>

                <UserDropdownMenu />
              </div>
            </header>

            <main
              className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8"
              style={{ maxWidth: "100vw" }}
            >
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
