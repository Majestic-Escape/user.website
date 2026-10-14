import Script from "next/script";

// Only the live site reports to Google Analytics. Vercel sets VERCEL_ENV to
// "production" for the production deployment and "preview" for staging and
// PR previews; local and test builds have none — before this, every one of
// them sent page views into the real property, mixing test traffic into the
// numbers. Read on the server (this component renders no client JS of its
// own), so nothing extra ships to the browser.
const GA_ID = "G-487QRHZ6JW";

export default function GoogleAnalytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
  `}
      </Script>
    </>
  );
}
