"use client"

import Navbar from "@/components/ui/navbar";
import FooterWrapper from "@/components/footer-wrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


export default function Layout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>

    <div className="font-publicSans">
      
      <div>
        <Navbar />
        {children}
        <FooterWrapper />
        <BottomNavigation />
      </div>
    </div>
    </QueryClientProvider>

  );
}
