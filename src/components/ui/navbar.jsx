/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Link from "next/link";
import Image from "next/image";
import NavTabLayout from '@/components/nav-tab-layout'
import { useWishlist } from '@/components/wishlist-context';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import WishlistPopup from '../wishlist-popup';
import {UserDropdownMenu} from "@/components/user-dropdown-menu"


import { Heart, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'


export default function Navbar() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const { user, logout } = useAuth();
  const [totalMessages, setTotalMessages] = useState(false);
  const router = useRouter()

  const switchToHosting = () => {
    router.push('/host/dashboard');

  };



  const totalWishlistItems = staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders)
      .reduce((sum, folder) => sum + folder.items.length, 0);

  
 
  return (
    <header className="fixed left-0 right-0 w-screen bg-white  z-50  font-poppins border-b px-4 md:px-6 ">
      <div className="container max-w-[1400px] flex h-12 md:h-[76px] w-full items-center mx-auto">
     <div>
      
      </div>   <Link className="flex items-center gap-2 text-[#3B5D2D]" href="/">
          <Image
            className="h-6 md:h-6 w-auto"
            width={200}
            height={40}
            src="/images/logo.svg"
            alt="Logo"
          />
        </Link>
        <div className="z-50 absolute hidden md:block right-[50%] translate-x-1/2">
        <NavTabLayout />

        </div>
        {user? 
      
          <nav className=" ml-auto hidden md:flex items-center gap-4 sm:gap-6">
            <WishlistPopup isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
            <Button
            onClick={switchToHosting}
            className="text-sm bg-transparent hover:bg-transparent border-none shadow-none  text-stone  hover:text-brightGreen hover:transition-colors hover:underline"
          >
            Switch to Hosting
          </Button>
            <Button 
        variant="ghost" 
        size="icon"
        className="relative"
        onClick={() => setIsWishlistOpen(!isWishlistOpen)}
      >
        <Heart className={`h-5 w-5 ${isWishlistOpen ? 'text-red-500' : 'text-muted-foreground'}`} />
        {totalWishlistItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {totalWishlistItems}
          </span>
        )}
      </Button>

      <Link href="/inbox"  className="relative">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      {totalMessages>0 &&  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {totalMessages}
        </span>
}
      </Link>

      <UserDropdownMenu/>

          


          </nav>

          :

          <nav className=" ml-auto hidden md:flex items-center gap-4 sm:gap-6">
          <WishlistPopup isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
          <Link
            className="text-base text-absoluteDark font-medium hover:text-brightGreen hover:transition-colors hover:underline"
            href="/host"
          >
            Become a Host
          </Link>
          <Link
            href="/login"
            className="bg-primaryGreen font-medium hover:bg-brightGreen px-6 text-base rounded-3xl text-white py-1.5"
          >
            Login
          </Link>

          
            

        </nav> }
      
      </div>
    

    </header>
  );
}