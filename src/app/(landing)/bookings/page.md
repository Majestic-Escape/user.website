import Link from "next/link";
import { Calendar } from "lucide-react";
import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";

export default function BookingsPage() {
  return (
    <div className="font-poppins flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <Heading text="No Booking History" />
        <SubHeading
          className="text-center mb-6"
          text="You haven't made any bookings yet. Start exploring stays to plan your next adventure!"
        />

        <Link
          href={"/stays"}
          className="bg-primaryGreen hover:bg-brightGreen text-white px-6 sm:px-8 md:px-10 py-2.5 font-bricolage rounded-full text-base sm:text-lg sm:w-auto"
        >
          Explore stays
        </Link>
      </div>
    </div>
  );
}
