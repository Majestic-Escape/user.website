import Script from "next/script";

// The membership page pays through Razorpay Checkout. This layout used to
// render its own <html>/<body> (a second document inside the root layout,
// which React reports as a hydration error); the script is simply loaded here.
export default function HostMembershipLayout({ children }) {
  return (
    <>
      {children}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </>
  );
}
