import Link from 'next/link'
import {  User } from 'lucide-react'

export default function LoginOptions() {
  return (
    <div className="font-publicSans flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="text-center">
         <User className="w-8 h-8 mx-auto mb-4 text-gray-400" />
         <h1 className='text-xl mb-4 font-bricolage text-absoluteDark'>Login to navigate our awesome stays and experiences</h1>
      <div className='my-2 gap-y-1 flex flex-col justify-center items-center'>
        
        <Link href={"/login"} className="bg-primaryGreen w-full hover:bg-brightGreen text-white px-6 sm:px-8 md:px-10 py-2 font-bricolage rounded-full text-base sm:text-lg sm:w-auto">
          Login
        </Link>
        or
        <Link href={"/register"} className="bg-gray-200 w-full  hover:bg-gray-100 text-absoluteDrak px-6 sm:px-8 md:px-10 py-2 font-bricolage rounded-full text-base sm:text-lg sm:w-auto">
          Create an Account
        </Link>
        
      </div>
  
      </div>
    </div>
  )
}

