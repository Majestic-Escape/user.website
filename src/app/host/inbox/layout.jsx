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

          {/* Phones: the top bar (h-16) and the bottom navigation leave the
              visible screen minus both for the page; md+: the header (h-16)
              leaves the visible screen minus 4rem and the page scrolls inside
              (the list and the thread are their own scrollers). Visible
              screen, not 100vh: with the URL bar showing, 100vh is taller
              than the screen and the list's last rows ended up under the
              bottom navigation. md:flex-none: as a flex-1 item of the
              column SidebarInset its flex-basis overrode that height, so a
              long list or thread stretched the whole page (5000px+) and the
              page scrolled instead of the panes. */}
          <main className="min-h-[calc(var(--visible-vh)_-_4rem_-_var(--host-tab-bar-h))] flex-1 bg-muted/50 md:min-h-0 md:flex-none md:h-[calc(var(--visible-vh)_-_4rem)] md:bg-white md:overflow-hidden">
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
