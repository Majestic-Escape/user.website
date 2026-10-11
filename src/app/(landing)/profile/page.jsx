"use client";

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import Heading from '@/components/ui/heading'
import SubHeading from '@/components/ui/sub-heading'
import { useAuth } from '@/contexts/AuthContext'

// Same box for every state. The fixed header (~60-77px) and the bottom tab bar
// (~73px) are cleared with padding, so the panel centres when it fits and
// scrolls when it does not, instead of hiding under either bar.
const shell = "font-poppins flex min-h-dvh items-center justify-center bg-white px-4 pt-24 pb-28"

export default function ProfilePage() {
  const router = useRouter()
  const { user, authReady } = useAuth()

  // Signed-in visitors have nothing to see here: their profile lives under
  // /account. No request, just a client navigation.
  useEffect(() => {
    if (authReady && user) router.replace("/account/personal-info")
  }, [authReady, user, router])

  // Neutral until the stored session is known (and while redirecting), so
  // "You are logged out!" never flashes for a signed-in visitor.
  if (!authReady || user) {
    return (
      <div className={shell} aria-hidden="true">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-16 w-16 animate-pulse rounded-full bg-gray-200 motion-reduce:animate-none" />
        </div>
      </div>
    )
  }

  return (
    <div className={shell}>
      <div className="text-center">
         <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
         <Heading text="Login to navigate your profile"/>
        <SubHeading className="text-center mb-6" text="You are logged out!"/>
      <div className='my-2 gap-y-1 flex flex-col justify-center items-center'>

        <Link href={"/login"} className="bg-primaryGreen w-full hover:bg-brightGreen text-white px-6 sm:px-8 md:px-10 py-2.5 font-bricolage rounded-full text-base sm:text-lg sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-absoluteDark focus-visible:ring-offset-2">
          Login
        </Link>
        or
        <Link href={"/register"} className="bg-gray-200 w-full hover:bg-gray-100 text-absoluteDark px-6 sm:px-8 md:px-10 py-2.5 font-bricolage rounded-full text-base sm:text-lg sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-2">
          Create an Account
        </Link>

      </div>

      </div>
    </div>
  )
}
