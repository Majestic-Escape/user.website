import "./globals.css";
import { bricolage, poppins } from "./fonts";
import Analytics from "@/components/analytics/google-analytics";
import { ReactNode } from "react";
import { WishlistProvider } from "@/components/wishlist-context";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";
import { Toaster } from "sonner";
import Script from "next/script";
export const revalidate = 0;

// Standalone chat widget bundle. Lives in the majestic-escape-rag-ai-chat-widget
// repo; loaded here as a single <script> tag so chat-only changes never need a
// user.website redeploy. See the widget repo's src/embed/ for source.
//
// In production, NEXT_PUBLIC_CHAT_WIDGET_URL is the absolute URL of the bundle
// (e.g. https://chat.majesticescape.in/embed/widget.js).
//
// In dev, when the env var is unset, we use a tiny inline loader that picks the
// widget host at runtime from the page's own hostname. This makes IP-based LAN
// access (http://192.168.x.x:3000) work without per-machine env-var tweaks —
// otherwise the script tag would point at localhost:3003, which on a phone
// resolves to the phone itself and silently 404s.
const EXPLICIT_WIDGET_URL = process.env.NEXT_PUBLIC_CHAT_WIDGET_URL;
const DEV_WIDGET_PORT = process.env.NEXT_PUBLIC_CHAT_WIDGET_PORT ?? "3003";
// The dev-only loader runs ONLY when NEXT_PUBLIC_CHAT_WIDGET_URL is unset.
// On a public hostname (i.e. anything that isn't localhost / 127.0.0.1 / a
// private LAN IP) we refuse to fall back — fetching `https://<prod-host>:3003`
// would silently 404 and leave the chat invisible with no diagnostic. Instead
// we log a console.error pointing at the exact env var to set so the misconfig
// is obvious in production / staging.
const DEV_LOADER = `(function(){
  var hostname = window.location.hostname;
  var isLocal = hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\\.168\\./.test(hostname) ||
    /^10\\./.test(hostname) ||
    /^172\\.(1[6-9]|2[0-9]|3[01])\\./.test(hostname);
  if (!isLocal) {
    console.error('[Majestic Chat] NEXT_PUBLIC_CHAT_WIDGET_URL is not set. The chat widget will not load on this domain. Set NEXT_PUBLIC_CHAT_WIDGET_URL to your widget service URL (e.g. https://chat.majesticescape.in/embed/widget.js) on the deployment platform of this site (Vercel → Settings → Variables) and redeploy.');
    return;
  }
  // Dev path: cache-bust per page-load so a freshly rebuilt bundle is always
  // picked up immediately. The /embed/widget.js Cache-Control of 5min + SWR
  // is great for prod (set via EXPLICIT_WIDGET_URL above) but causes "why
  // isn't my change showing up" confusion during local development.
  var s = document.createElement('script');
  s.src = window.location.protocol + '//' + hostname + ':${DEV_WIDGET_PORT}/embed/widget.js?t=' + Date.now();
  s.defer = true;
  document.head.appendChild(s);
})();`;
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
      "Discover your perfect gateway with Majestic Escape.From beachfront villas to heritage homes, experience thoughtfully curated stays across India’s most distinctive destinations.",
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
            <UnreadCountProvider>
            <WishlistProvider>
              <div>{children}</div>
            </WishlistProvider>
            </UnreadCountProvider>
          </AuthProvider>
        </Providers>
        <Toaster position="top-center" closeButton richColors />
        {EXPLICIT_WIDGET_URL ? (
          <Script src={EXPLICIT_WIDGET_URL} strategy="lazyOnload" />
        ) : (
          <Script id="chat-widget-loader" strategy="lazyOnload">
            {DEV_LOADER}
          </Script>
        )}
      </body>
    </html>
  );
}
