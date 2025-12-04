import Hero from "@/components/host/hero";
import Features from "@/components/host/features";
import Newsletter from "@/components/newsletter";
import Faq from "@/components/host/faq";
import Blogs from "@/components/blogs";
export default function Component() {
  return (
    <div>
      <Hero />
      <Features />
      <Faq />
      <Blogs />
      {/* <Newsletter /> */}
    </div>
  );
}
