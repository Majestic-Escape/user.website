import Image from "next/image";
import PrimaryLink from "@/components/primary-link";

export default function Component({ user }) {
  return (
    <section className="w-full   flex md:items-center items-start desktop:min-h-screen  bg-white mobile:pt-20 md:pt-32 sm:py-16 ">
      <div className="container max-w-7xl mx-auto px-4  pt-20 md:pt-0 md:px-6">
        <div className="grid gap-6 gap-y-16 justify-center desktop:grid-cols-2 desktop:gap-12">
          {/* Left Column */}
          <div className="flex flex-col  justify-center space-y-4 sm:space-y-6 text-center md:text-left">
            <h1 className="font-bricolage text-balance text-3xl text-absolute-dark sm:text-4xl  font-bold">
              Host your <span className="text-primary">Majestic&nbsp;</span>
              <br className="hidden sm:inline" />
              Stay Now!&nbsp;
              <br className="hidden sm:inline" />
              {/* <span className="text-primary">Goan</span> platform */}
            </h1>
            <p className="text-base  text-gray-500 leading-relaxed max-w-[600px] mx-auto lg:mx-0">
              We handle the tools, you deliver unforgettable stays. From taxes
              to scheduling, listings to visibility – we&apos;ve got you covered
              on all fronts
            </p>
            <div className="flex flex-row justify-center md:justify-start gap-x-2 md:gap-x-4 gap-y-3 items-center">
              {!user ? (
                <PrimaryLink
                  text="Become a Host"
                  variant="primary"
                  href="/register"
                />
              ) : (
                <PrimaryLink
                  text="Become a Host"
                  variant="primary"
                  href="/host/dashboard"
                />
              )}
              <PrimaryLink
                text="Explore Features"
                variant="secondary"
                href="/hosting/#features"
              />
            </div>
          </div>

          <Image
            width={500}
            height={300}
            src="/images/hero-graphic.png"
            alt="Hero Graphic"
          />
        </div>
      </div>
    </section>
  );
}
