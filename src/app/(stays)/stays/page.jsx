import SpotWiseStays from "@/components/spot-wise-stays";
import LocationWiseStays from "@/components/location-wise-stays";
// import Testimonials from '@/components/testimonials';
import Newsletter from "@/components/newsletter";
import StaysProperties from "@/components/stays-properties";

export default function Stays() {
  return (
    <main className="py-32 md:pt-36">
      <StaysProperties />
      <LocationWiseStays />
      {/* <SpotWiseStays /> */}
      {/* <Testimonials /> */}
      {/* <Newsletter /> */}
    </main>
  );
}
