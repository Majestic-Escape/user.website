"use client"
import React, { useState } from 'react';
import MediaImage from "@/components/ui/media-image";
import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist-context';
import FolderContentsDialog from "@/components/FolderContentsDialog";
import Link from 'next/link';

export default function WishlistPage() {
  const { staysWishlist, experiencesWishlist, wishlists } = useWishlist();
  const [selectedFolder, setSelectedFolder] = useState(null);

  const totalWishlistItems = staysWishlist.length +
    experiencesWishlist.length +
    Object.values(wishlists.folders)
      .reduce((sum, folder) => sum + folder.items.length, 0);

  return (
    <>
      <div className="pt-24 min-h-screen px-6 font-bricolage">
        {totalWishlistItems > 0 ? (
            <>
                    <h1 className="text-base md:text-xl  font-semibold mb-6">Wishlists</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Stays Folder */}
            {staysWishlist.length > 0 && (
              <div
                className="group relative aspect-square rounded-xl cursor-pointer overflow-hidden"
                onClick={() => setSelectedFolder({
                  name: 'Stays',
                  items: staysWishlist
                })}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                <MediaImage
                  width={400}
                  height={400}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                  src={staysWishlist[0].image}
                  alt="Stays"
                  className="w-full h-full object-cover"
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
                className="group relative aspect-square rounded-xl cursor-pointer overflow-hidden"
                onClick={() => setSelectedFolder({
                  name: 'Experiences',
                  items: experiencesWishlist
                })}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                <MediaImage
                  src={experiencesWishlist[0].image}
                  alt="Experiences"
                  width={400}
                  height={400}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
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
                className="group relative aspect-square rounded-xl cursor-pointer overflow-hidden"
                onClick={() => setSelectedFolder({
                  name: folder.name,
                  items: folder.items
                })}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-200" />
                {folder.items.length > 0 ? (
                  <MediaImage
                    src={folder.items[0].image}
                    alt={folder.name}
                    width={400}
                    height={400}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
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
         
        
          </>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 stroke-2" />
              <h3 className="text-2xl font-semibold mb-2">Create your first wishlist</h3>
              <p className="text-gray-500">
                As you search, click the heart icon to save your favorite places to stay or things to do
              </p>
              <Link href={"/stays"} className="mt-6 inline-block bg-primaryGreen hover:bg-brightGreen text-white px-6 sm:px-8 md:px-10 py-2.5 font-bricolage rounded-full text-base sm:text-lg sm:w-auto">
          Explore stays
        </Link>
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
    </>
  );
}

