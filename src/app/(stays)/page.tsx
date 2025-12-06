import Hero from "@/components/hero-section";
import StaysProperties from "@/components/stays-properties";
import BecomePartner from "@/components/become-partner";
import SpotWiseStays from "@/components/spot-wise-stays";
import LocationWiseStays from "@/components/location-wise-stays";
import Blogs from "@/components/blogs";
import Newsletter from "@/components/newsletter";
// import Testimonials from "@/components/testimonials";

export default function Component() {
  return (
    <div>
      <Hero />
      <StaysProperties />
      <BecomePartner />

      <LocationWiseStays />
      {/* <SpotWiseStays /> */}

      {/* <Testimonials /> */}
      <Blogs />
      {/* <Newsletter /> */}
    </div>
  );
}
