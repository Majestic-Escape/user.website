"use client";
import Link from "next/link";
import Image from "next/image";
import NavTabLayout from "@/components/nav-tab-layout";
import { useWishlist } from "@/components/wishlist-context";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FolderContentsDialog from "../FolderContentsDialog";
import SearchFilter from "../search-filter";

export default function Navbar() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { returnUrl } = useAuth();
  const totalWishlistItems =
    staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders).reduce(
      (sum, folder) => sum + folder.items.length,
      0,
    );

  const toggleWishlist = () => {
    setIsWishlistOpen(!isWishlistOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavItems = ({ isMobile = false }) => (
    <>
      {isWishlistOpen && (
        <div className="fixed w-screen  font-bricolage inset-0 bg-white z-50">
          <div className="h-screen flex flex-col">
            <header className="px-6 h-20 flex items-center border-b border-gray-200">
              <button
                onClick={toggleWishlist}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
              <h1 className="ml-6 text-xl font-semibold">Wishlists</h1>
            </header>

            {totalWishlistItems > 0 ? (
              <div className="flex-1 font-poppins overflow-auto px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Stays Folder */}
                  {staysWishlist.length > 0 && (
                    <div
                      className="group relative aspect-square rounded-xl cursor-pointer"
                      onClick={() =>
                        setSelectedFolder({
                          name: "Stays",
                          items: staysWishlist,
                        })
                      }
                    >
                      <div className="absolute max-h-[350px] inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                      <Image
                        width={350}
                        height={350}
                        src={staysWishlist[0].image}
                        alt="Stays"
                        className="w-full max-h-[350px] h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold">Stays</h3>
                        <p className="text-sm">{staysWishlist.length} items</p>
                      </div>
                    </div>
                  )}

                  {/* Experiences Folder */}
                  {experiencesWishlist.length > 0 && (
                    <div
                      className="group relative font-poppins aspect-square rounded-xl overflow-hidden cursor-pointer"
                      onClick={() =>
                        setSelectedFolder({
                          name: "Experiences",
                          items: experiencesWishlist,
                        })
                      }
                    >
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                      <Image
                        src={experiencesWishlist[0].image}
                        alt="Experiences"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold">Experiences</h3>
                        <p className="text-sm">
                          {experiencesWishlist.length} items
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Custom Folders */}
                  {Object.entries(wishlists.folders).map(([id, folder]) => (
                    <div
                      key={id}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                      onClick={() =>
                        setSelectedFolder({
                          name: folder.name,
                          items: folder.items,
                        })
                      }
                    >
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                      {folder.items.length > 0 ? (
                        <Image
                          src={folder.items[0].image}
                          alt={folder.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold">{folder.name}</h3>
                        <p className="text-sm">{folder.items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 stroke-2" />
                  <h3 className="text-2xl font-semibold mb-2">
                    Create your first wishlist
                  </h3>
                  <p className="text-gray-500">
                    As you search, click the heart icon to save your favorite
                    places to stay or things to do
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedFolder && (
        <FolderContentsDialog
          isOpen={true}
          onClose={() => setSelectedFolder(null)}
          folderName={selectedFolder.name}
          items={selectedFolder.items}
        />
      )}

      <Link
        className="text-sm text-stone font-medium hover:text-brightGreen hover:transition-colors hover:underline"
        href="/host"
      >
        Become a Host
      </Link>

      <span className="hidden md:block w-0.5 h-7 bg-gray-300 rounded"></span>
      {isMobile && (
        <>
          <Link
            className="text-stone text-sm font-medium hover:underline"
            href="/faq"
          >
            FAQ
          </Link>
          <Link className="text-sm font-medium hover:underline" href="/host">
            Host an Experience
          </Link>
          <Link
            className="text-sm hidden md:inline-block font-medium hover:underline"
            target="_blank"
            href="/host"
          >
            Host your property
          </Link>
          <Link
            className="text-sm text-stone hover:bg-gray-100 font-medium hover:underline"
            href="/help-center"
          >
            Help Center
          </Link>
        </>
      )}

      <Link
        href={{
          pathname: "/login",
          query: returnUrl,
        }}
        className="bg-primaryGreen font-medium hover:bg-brightGreen px-5 rounded-3xl text-white py-2"
        variant="default"
      >
        Login
      </Link>
    </>
  );

  return (
    <header
      className={`fixed left-0 right-0 w-screen bg-white z-50 font-poppins border-b px-4 md:px-6 transition-all duration-300 ${
        isScrolled ? "py-2  h-20" : "py-4"
      }`}
    >
      {" "}
      <div className="container max-w-[1400px] flex h-12 md:h-16 w-full items-center mx-auto">
        <div></div>{" "}
        <Link className="flex items-center gap-2 text-[#3B5D2D]" href="/">
          <Image
            className="h-6 md:h-8 w-auto"
            width={200}
            height={40}
            src="/images/logo.svg"
            alt="Logo"
          />
        </Link>
        <div
          className={`inline-block z-50 absolute   right-[50%] translate-x-1/2 
          transition-all duration-300 ${
            isScrolled
              ? "opacity-0 hidden md:hidden"
              : "opacity-100 hidden md:block"
          }`}
        >
          <NavTabLayout />
        </div>
        <nav className=" ml-auto hidden md:flex items-center gap-4 sm:gap-6">
          <NavItems />
          <div>
            <button
              className="bg-white p-2 rounded-full hover:bg-gray-50 relative pr-8"
              onClick={toggleWishlist}
            >
              {/* <Heart className={`w-6 h-6 ${isWishlistOpen ? 'text-red-500' : 'text-[#7A7A7A]'}`} /> */}
              <Image
                src="/icons/hearticon.svg"
                width={6}
                height={6}
                alt="Heart Icon"
                className={`w-6 h-6 ${
                  isWishlistOpen ? "text-red-500" : "text-[#7A7A7A]"
                }`}
              />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-0 right-6 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-full border border-gray-200"
                  size="icon"
                  variant="ghost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className=" w-8 h-8 text-stone"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="font-poppins text-stone bg-white"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/account/personal-info"
                    className=" text-stone hover:bg-gray-100 w-full"
                  >
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/faq"
                    className=" text-stone hover:bg-gray-100 w-full"
                  >
                    FAQ
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    target="_blank"
                    href="/host/login"
                    className="w-full text-stone hover:bg-gray-100"
                  >
                    Host your property
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    target="_blank"
                    href="/host/login"
                    className="w-full text-stone hover:bg-gray-100"
                  >
                    Host Experience
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/help-center"
                    className="text-stone hover:bg-gray-100 w-full"
                  >
                    Help Center
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        <div className="ml-auto md:hidden ">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="p-0 w-8 h-8" size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white w-[300px] sm:w-[400px]"
            >
              <nav className="font-poppins bg-white  flex flex-col gap-4">
                <NavItems isMobile={true} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "opacity-100 -translate-y-full"
            : "opacity-100 translate-y-0 "
        }`}
      >
        <SearchFilter isScrolled={isScrolled} />
      </div>
    </header>
  );
}
