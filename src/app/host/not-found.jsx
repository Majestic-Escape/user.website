import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex font-poppins flex-col items-center justify-center min-h-screen bg-white">
      <div className="pb-8">
        <Image src={`/images/logo.svg`} width={300} height={300} />
      </div>
      <h2 className="text-4xl font-bricolage font-bold mb-4 font-bri">
        Not Found
      </h2>
      <p className="text-xl text-stone mb-4">
        Could not find requested resource
      </p>
      <Link
        href="/"
        className="bg-primaryGreen hover:bg-brightGreen text-white transition-colors focus:ring-2 focus:ring-lightGreen px-6 py-3 rounded-3xl"
      >
        Return Home
      </Link>
    </div>
  );
}
