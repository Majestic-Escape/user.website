"use client";

import Navbar from "@/components/ui/navbar";
import FooterWrapper from "@/components/footer-wrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
const queryClient = new QueryClient();

export default function Layout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-poppins">
        <div>
          <Navbar />
          <MobileNavbar />
          {children}

          <FooterWrapper />
          <BottomNavigation />
        </div>
      </div>
    </QueryClientProvider>
  );
}
