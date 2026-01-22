import SpotWiseStays from "@/components/spot-wise-stays";
import LocationWiseStays from "@/components/location-wise-stays";
// import Testimonials from '@/components/testimonials';
import Newsletter from "@/components/newsletter";
import StaysProperties from "@/components/stays-properties";

export default function Stays() {
  return (
    <main className="pt-40 pb-16 md:pt-56 desktop:pt-64">
      <StaysProperties />
      <LocationWiseStays />
      {/* <SpotWiseStays /> */}
      {/* <Testimonials /> */}
      {/* <Newsletter /> */}
    </main>
  );
}
