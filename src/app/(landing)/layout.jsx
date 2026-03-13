"use client";

import Navbar from "@/components/ui/nav-stays";
import Oldbar from "@/components/ui/navbar";
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

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (modalFilter) {
      setCurrentIndex(0);

      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      // Store scroll position for later restoration
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      // Restore scroll position
      const scrollY = document.body.dataset.scrollY || "0";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";

      // Scroll back to original position
      window.scrollTo(0, parseInt(scrollY, 10));

      // Clean up
      delete document.body.dataset.scrollY;
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      delete document.body.dataset.scrollY;
    };
  }, [modalFilter]);
  // Check if current path is a stay detail page
  const isStayDetailPage =
    pathname.startsWith("/stay/") && pathname !== "/stay";

  const mainPage = pathname == "/";
  const isFilter = pathname.startsWith("/filter");
  const isLocation = pathname.startsWith("/location/");

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
          {isStayDetailPage || mainPage || isFilter || isLocation ? (
            !isMobile ? (
              <Navbar />
            ) : null
          ) : (
            <Oldbar />
          )}
          {isStayDetailPage && isMobile ? <MobileNavbar /> : null}
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
