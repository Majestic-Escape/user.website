import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";
import { Car, Utensils, Camera, Scissors } from "lucide-react";
import { MainTab } from "../../../components/ui/main-tab";
import { MobileNavbar } from "@/components/stays-mobile-navbar";
const services = [
  {
    title: "Taxi Service",
    description:
      "Convenient and reliable transportation to explore the local area or for airport transfers.",
    icon: Car,
    tags: ["Local Tours", "Airport Transfer", "24/7 Available"],
  },
  {
    title: "Dining",
    description:
      "Indulge in exquisite culinary offerings throughout the day, from locally-sourced breakfast options to international dinner specialties.",
    icon: Utensils,
    tags: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Local Cuisine",
      "International Menu",
    ],
  },
  {
    title: "Pre-wedding Shoot",
    description:
      "Capture beautiful moments in stunning locations perfect for your pre-wedding photoshoot.",
    icon: Camera,
    tags: ["Photography", "Scenic Locations", "Professional Service"],
  },
  {
    title: "Beautician Services",
    description:
      "Expert beauty treatments and styling to help you look and feel your best during your stay.",
    icon: Scissors,
    tags: ["Hair Styling", "Makeup", "Manicure", "Pedicure", "Facials"],
  },
];

export default function Services() {
  return (
    <div className="w-screen pt-2 pb-16">
      <MobileNavbar />
      {/* <MainTab /> */}

      <div className="container px-4 max-w-[1400px] md:px-12 font-poppins mx-auto py-12">
        <div className="mt-12 md:mt-0 mb-8">
          <Heading text="Our Services" />
          <SubHeading text="Experience Offerings Tailored to Your Needs" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="w-12 h-12 bg-brightGreen rounded-full flex items-center justify-center">
                  <service.icon className="w-6 h-6  text-white" />
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {service.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
