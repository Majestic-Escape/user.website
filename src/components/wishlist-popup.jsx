"use client"
import React, { useState } from 'react';
import Image from "next/image";
import { X, Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist-context';
import FolderContentsDialog from "./FolderContentsDialog";

export default function WishlistPopup({ isOpen, onClose }) {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [selectedFolder, setSelectedFolder] = useState(null);

  const totalWishlistItems = staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders)
      .reduce((sum, folder) => sum + folder.items.length, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed w-screen font-bricolage inset-0 bg-white z-[1000]">
      <div className="h-screen flex flex-col">
        <header className="px-6 h-20 flex items-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
          <h1 className="ml-6 text-xl font-semibold">Wishlists</h1>
        </header>

        {totalWishlistItems > 0 ? (
          <div className="flex-1 font-publicSans overflow-auto px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Stays Folder */}
              {staysWishlist.length > 0 && (
                <div
                  className="group relative aspect-square rounded-xl cursor-pointer"
                  onClick={() => setSelectedFolder({
                    name: 'Stays',
                    items: staysWishlist
                  })}
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
                  className="group relative font-publicSans aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedFolder({
                    name: 'Experiences',
                    items: experiencesWishlist
                  })}
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
                    <p className="text-sm">{experiencesWishlist.length} items</p>
                  </div>
                </div>
              )}

              {/* Custom Folders */}
              {Object.entries(wishlists.folders).map(([id, folder]) => (
                <div
                  key={id}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedFolder({
                    name: folder.name,
                    items: folder.items
                  })}
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
              <h3 className="text-2xl font-semibold mb-2">Create your first wishlist</h3>
              <p className="text-gray-500">
                As you search, click the heart icon to save your favorite places to stay or things to do
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFolder && (
        <FolderContentsDialog
          isOpen={true}
          onClose={() => setSelectedFolder(null)}
          folderName={selectedFolder.name}
          items={selectedFolder.items}
        />
      )}
    </div>
  );
}

