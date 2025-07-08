import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex font-publicSans flex-col items-center justify-center min-h-screen bg-white">
      <h2 className="text-4xl font-bricolage font-bold mb-4 font-bri">Not Found</h2>
      <p className="text-xl text-stone mb-4">Could not find requested resource</p>
      <Link href="/" className="bg-primaryGreen hover:bg-brightGreen text-white transition-colors focus:ring-2 focus:ring-lightGreen px-6 py-3 rounded-3xl">
        Return Home
      </Link>
    </div>
  )
}

