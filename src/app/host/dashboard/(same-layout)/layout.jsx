"use client";

import { AppSidebar } from "@/components/host/app-sidebar";
import ProtectedRoute from "@/components/protected-route";
import HostBottomNavigation from "@/components/host/bottom-navigation";
import HostTopBar from "@/components/host/host-top-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {/* One tree for every width. The mobile header, the desktop sidebar/
          header and the bottom navigation switch on `md:`; the page itself
          (`children`) is mounted exactly once. Rendering it twice (a hidden
          mobile copy and a hidden desktop copy) doubled every page's effects
          and network calls. */}
      <SidebarProvider>
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <SidebarInset>
          <HostTopBar />

          {/* phones: the fixed host tab bar (4.5rem + home indicator) must not
              cover the end of the page, so the bottom padding clears it */}
          <main
            className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-8"
            style={{ maxWidth: "100vw" }}
          >
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
