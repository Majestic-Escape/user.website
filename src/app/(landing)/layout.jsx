"use client";

import Navbar from "@/components/ui/nav-stays";
import Oldbar from "@/components/ui/navbar";
import FooterWrapper from "@/components/footer-wrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
import FilterModal from "@/components/ui/modal";
import { PriceNavigation } from "@/components/ui/price-navigation";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function Layout({ children }) {
  const { modalFilter, setModalFilter, openModal, closeModal, toggleModal } =
    useAuth();
  const pathname = usePathname();

  // The search/filters sheet (components/ui/modal.tsx) freezes and restores
  // the page scroll itself. A second lock here ran after it, read the frozen
  // position as 0 and scrolled to the top when the sheet closed.
  // Check if current path is a stay detail page
  const isStayDetailPage =
    pathname.startsWith("/stay/") && pathname !== "/stay";

  const mainPage = pathname == "/";
  const isFilter = pathname.startsWith("/filter");
  const isLocation = pathname.startsWith("/location/");

  // Same breakpoint as the bars' own CSS (md = 768px): 641–767px used to get
  // neither the desktop header (hidden below md) nor the phone one.
  const isMobile = useMediaQuery("(max-width: 767px)");
  return (
    <>
      <div className="font-poppins">
        <div>
          {isStayDetailPage || mainPage || isFilter || isLocation ? (
            !isMobile ? (
              <Navbar />
            ) : null
          ) : (
            <Oldbar />
          )}
          {/* phone header and price bar hide themselves from md up (CSS), so
              they render from the first paint — no header popping in after
              hydration, no gap between breakpoints */}
          {isStayDetailPage ? <MobileNavbar /> : null}
          {/* <MobileNavbar /> Stay Page */}
          {/* {children} */}
          <main className={modalFilter ? "md:blur-sm" : ""}>
            {children}
          </main>
          <FilterModal isOpen={modalFilter} onClose={closeModal} />
          <FooterWrapper />
          {!isStayDetailPage ? <BottomNavigation /> : <PriceNavigation />}
        </div>
      </div>
    </>
  );
}
