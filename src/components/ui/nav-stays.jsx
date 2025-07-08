/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Link from "next/link";
import Image from "next/image";
import NavTabLayout from '@/components/nav-tab-layout'
import { useWishlist } from '@/components/wishlist-context';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Heart, MessageSquare } from 'lucide-react';
import SearchFilter from "../search-filter";
import FilterStaysBar from "../filter-stays-bar";
import WishlistPopup from '../wishlist-popup';
import { useRouter } from 'next/navigation'


import {UserDropdownMenu} from "@/components/user-dropdown-menu"
export default function Navbar() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [totalMessages, setTotalMessages] = useState(false);

  const router = useRouter()

  const { user, logout } = useAuth();

  const switchToHosting = () => {
    router.push('/host/dashboard');

  };

  const totalWishlistItems = staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders)
      .reduce((sum, folder) => sum + folder.items.length, 0);


  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <div className={`fixed left-0 right-0 w-screen bg-white z-50 font-publicSans border-b  transition-all hidden md:block duration-300 ${isScrolled ? 'pt-2  h-20' : 'pt-3'}`}>
      <header className="px-4 bg-white  md:px-6" >
        <div className="container max-w-[1400px] flex h-12 md:h-16 w-full items-center mx-auto">
          <div>

          </div>   <Link className="flex items-center gap-2 text-[#3B5D2D]" href="/">
            <Image
              className="hidden md:inline-block h-4 md:h-7 w-auto"
              width={200}
              height={40}
              src="/images/logo.svg"
              alt="Logo"
            />

          </Link>

          <div></div>
          <div className={`inline-block z-50 absolute   right-[50%] translate-x-1/2 
            transition-all duration-300 ${isScrolled ? 'opacity-0 hidden md:hidden' : 'opacity-100 hidden md:block'}`}>
            <NavTabLayout />

          </div>

          {user?
          <nav className=" ml-auto hidden md:flex items-center gap-4 sm:gap-6">
            <WishlistPopup isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
            <button
            onClick={switchToHosting}
            className="text-base bg-transparent shadow:none font-medium border-none outline-none hover:bg-transparent focus:outline-none focus:border-none text-absoluteDark  hover:text-brightGreen hover:transition-colors hover:underline"
          >
            Switch to Hosting
          </button>
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
        {/* <div className={`transition-all duration-300 ${isScrolled ? 'opacity-100 -translate-y-full' : 'opacity-100 translate-y-0 '}`}> */}
        <SearchFilter isScrolled={isScrolled} />

      </header>
      <div className={` px-6 py-2 bg-white transition-all duration-300 ${isScrolled ? 'md:opacity-100 md:-translate-y-3/4 border-b border-gray-100 shadow-sm' : 'opacity-100 translate-y-0 '}`} >


        <FilterStaysBar/>
      </div>

    </div>
  );
}

