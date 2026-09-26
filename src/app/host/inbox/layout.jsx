"use client";

import { AppSidebar } from "@/components/host/app-sidebar";
import ProtectedRoute from "@/components/protected-route";
import HostBottomNavigation from "@/components/host/bottom-navigation";
import HostTopBar from "@/components/host/host-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function InboxLayout({ children }) {
  return (
    <ProtectedRoute optimistic>
      {/* One tree for every width — the same shape as the dashboard layout
          (8d1605f). The mobile header and the bottom navigation are md:hidden,
          the sidebar and the desktop header are md-only, and the inbox page
          itself is mounted exactly once. Rendering it twice (a hidden mobile
          copy beside the desktop copy) doubled the page's socket handlers,
          its conversation/property fetches and every event it processed. */}
      <SidebarProvider>
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <SidebarInset className="overflow-hidden min-w-0 flex-1">
          <HostTopBar />

          {/* Mobile: header + bottom navigation leave 100vh - 64 - 64 for the
              page; desktop: the header leaves 100vh - 64 and the page scrolls
              inside (the list and the thread are their own scrollers). */}
          <main className="min-h-[calc(100vh-64px-64px)] flex-1 bg-muted/50 md:min-h-0 md:h-[calc(100vh-64px)] md:bg-white md:overflow-hidden">
            {children}
          </main>
          <div className="md:hidden">
            <HostBottomNavigation />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
