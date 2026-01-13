"use client";

import Navbar from "@/components/ui/navbar";
import FooterWrapper from "@/components/footer-wrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
import FilterModal from "@/components/ui/modal";
import { PriceNavigation } from "@/components/ui/price-navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const queryClient = new QueryClient();

export default function Layout({ children }) {
  const { modalFilter, setModalFilter, openModal, closeModal, toggleModal } =
    useAuth();
  const [matches, setMatches] = useState(false);
  const pathname = usePathname();

  // Check if current path is a stay detail page
  const isStayDetailPage =
    pathname.startsWith("/stay/") && pathname !== "/stay";
  function useMediaQuery(query) {
    useEffect(() => {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  }
  const isMobile = useMediaQuery("(max-width: 640px)");
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-poppins">
        <div>
          <Navbar />
          {/* <MobileNavbar /> Stay Page */}
          {/* {children} */}
          <main className={modalFilter ? "filter blur-sm" : ""}>
            {children}
          </main>
          <FilterModal isOpen={modalFilter} onClose={closeModal} />

          <FooterWrapper />
          {!isStayDetailPage ? (
            <BottomNavigation />
          ) : isMobile ? (
            <PriceNavigation />
          ) : null}
        </div>
      </div>
    </QueryClientProvider>
  );
}
