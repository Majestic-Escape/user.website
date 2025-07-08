import "./globals.css"
import { bricolage, publicSans } from "./fonts"
import Analytics from "@/components/analytics/google-analytics"
import { ReactNode } from "react"
import { WishlistProvider } from "@/components/wishlist-context"
import { Providers } from "@/components/providers"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

export const metadata = {
  title: "Majestic Escape - Handpicked Homestays Across India",
  description: "Discover trusted & verified homestays across India with Majestic Escape. From Himalayan retreats to coastal cottages, explore handpicked stays that celebrate India's local charm and hospitality.",
  keywords: "Majestic Escape, India, homestays, local stays, verified stays, vacation rentals, heritage homes, cottages, Indian travel",
  authors: [{ name: "Majestic Escape" }],
  
  metadataBase: new URL('https://majesticescape.in'),
  alternates: {
    canonical: '/',
    languages: {
      locale: "en_IN",
    },
  },

openGraph: {
    title: "Majestic Escape - Handpicked Homestays Across India",
    description: "Trusted & Verified Indian Homestays. Discover authentic, handpicked stays across India—from the mountains to the beaches.",
    url: "https://majesticescape.in/",
    siteName: "Majestic Escape",
    images: [
      {
        url: "/previews/home/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Majestic Escape - Handpicked Homestays Across India",
    description: "Discover authentic, handpicked homestays across India. Verified, local-first stays made for meaningful travel.",
    images: ["/previews/home/twitter-card.jpg"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.svg", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Majestic Escape",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#da532c",
    "msapplication-config": "/browserconfig.xml",
  },
}



interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${bricolage.variable} ${publicSans.variable}`}>
       <head>
        <Analytics/>


      </head>
      <body className="antialiased">     

      <Providers>
     <AuthProvider>

     
        <WishlistProvider>
          <div>
            
      
          {children}
          </div>
       
        </WishlistProvider>
        </AuthProvider>
        </Providers>
        <Toaster position="top-right" closeButton richColors />

          
      </body>
    </html>
  )
}