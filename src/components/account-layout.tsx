'use client'

import { ReactNode } from 'react'
import AccountHeader from './account-header'
import AccountSidebar from './account-sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function AccountLayout({ children }: LayoutProps) {
  return (
    <div className="font-publicSans min-h-screen pt-24 bg-offWhite">
      <div className="container max-w-[1400px] mx-auto">
        <AccountHeader />
        <div className="flex">
          <AccountSidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}