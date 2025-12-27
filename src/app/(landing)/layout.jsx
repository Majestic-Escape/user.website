"use client";

import Navbar from "@/components/ui/navbar";
import FooterWrapper from "@/components/footer-wrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
import FilterModal from "@/components/ui/modal";
const queryClient = new QueryClient();

export default function Layout({ children }) {
  const { modalFilter, setModalFilter, openModal, closeModal, toggleModal } =
    useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-poppins">
        <div>
          <Navbar />
          <MobileNavbar />
          {/* {children} */}
          <main className={modalFilter ? "filter blur-sm" : ""}>
            {children}
          </main>
          <FilterModal isOpen={modalFilter} onClose={closeModal} />
          <FooterWrapper />
          <BottomNavigation />
        </div>
      </div>
    </QueryClientProvider>
  );
}
