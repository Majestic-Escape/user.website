import RouteLoading from "@/components/route-loading";

// Shown inside the (landing) layout while a page in this group streams in.
// The top padding mirrors the navbars this group renders above <main>.
export default function Loading() {
  return <RouteLoading className="min-h-screen pt-[80px] md:pt-52 desktop:pt-56" />;
}
