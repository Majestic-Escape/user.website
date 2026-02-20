/* eslint-disable @next/next/no-img-element */
import { Card, CardContent } from "@/components/ui/card";

import { CarouselSpacing } from "../../components/carousel-heading";
import RegisterForm from "@/components/register-form";

import { TextReveal } from "@/components/text-reveal";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default function LoginPage() {
  return (
    <div className="min-h-screen  grid grid-cols-1 lg:grid-cols-2 font-poppins">
      <RegisterForm />

      <div className="bg-gradient-to-tr from-primaryGreen to-brightGreen p-6 lg:p-10  flex-col hidden lg:flex">
        <TextReveal>
          <h1 className="text-2xl  font-bricolage lg:text-3xl font-medium text-white mb-12">
            Create your guest account
            <br />
          </h1>
        </TextReveal>

        <Card className="bg-white p-6 mb-8">
          <CardContent className="p-0">
            <TextReveal>
              <h2 className="font-medium mb-4 bg-green-50 border border-green-500 px-6 py-1 inline-block rounded-3xl">
                Explore with Majestic Escape
              </h2>
              <h1 className="text-4xl font-bricolage">
                Find your perfect getaway on Majestic Escape
              </h1>
            </TextReveal>
          </CardContent>
        </Card>

        <div className="mt-auto overflow-hidden">
          <CarouselSpacing />
        </div>
      </div>
    </div>
  );
}
