import "./globals.css";
import { bricolage, poppins } from "./fonts";
import Analytics from "@/components/analytics/google-analytics";
import { ReactNode } from "react";
import { WishlistProvider } from "@/components/wishlist-context";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
export const revalidate = 0;
export const metadata = {
  title: "Majestic Escape | Book Hotels, Tours & Holiday Packages in India",
  description:
    "Discover your perfect gateway with Majestic Escape.From beachfront villas to heritage homes, experience thoughtfully curated stays across India’s most distinctive destinations.",
  keywords:
    "Majestic Escape, Goa, home-stays, luxury accommodation, vacation rentals, beachfront villas, heritage homes",
  authors: [{ name: "Majestic Escape" }],
  openGraph: {
    title: "Majestic Escape | Book Hotels, Tours & Holiday Packages in India",
    description:
      "Discover your perfect gateway with Majestic Escape. From beachfront villas to heritage homes, experience thoughtfully curated stays across India’s most distinctive destinations.",
    url: "https://majesticescape.in/",
    siteName: "Majestic Escape",
    images: [
      {
        url: "https://majesticescape.in/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Majestic Escape | Book Hotels, Tours & Holiday Packages in India",
    description:
      "Discover your perfect gateway with Majestic Escape. From beachfront villas to heritage homes, find authentic stays that capture the true spirit of Goa.",
    images: ["https://majesticescape.in/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/logo.svg", sizes: "180x180", type: "image/png" }],
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
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${bricolage.variable} ${poppins.variable}`}>
      <head>
        <Analytics />
      </head>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            <WishlistProvider>
              <div>{children}</div>
            </WishlistProvider>
          </AuthProvider>
        </Providers>
        <Toaster position="top-center" closeButton richColors />
      </body>
    </html>
  );
}
