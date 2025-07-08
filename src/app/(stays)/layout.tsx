"use client"

import { SheetProvider } from '@/components/providers/sheet-provider'
import Navbar from "@/components/ui/nav-stays"
import FooterWrapper from "@/components/footer-wrapper"
import { BottomNavigation } from "@/components/bottom-navigation"
import { MobileNavbar } from "@/components/stays-mobile-navbar"

import type { ReactNode } from 'react'

export default function StaysLayout({ children }: { children: ReactNode }) {
  return (
    <SheetProvider>
      
      <div className="font-publicSans">
      <Navbar />

        <MobileNavbar />

     
      
        <main>{children}</main>
        <FooterWrapper />
        <BottomNavigation />
      </div>
    </SheetProvider>
  )
}

