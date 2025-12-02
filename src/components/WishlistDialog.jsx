"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, FolderPlus, Folder } from "lucide-react";
import { useWishlist } from "./wishlist-context";
import { createPortal } from "react-dom";
import { FolderContentsDialog } from "./FolderContentsDialog";
import Image from "next/image";

export const WishlistDialog = ({ isOpen, onClose, property }) => {
  const { addToWishlist, isInWishlist, createFolder, wishlists } =
    useWishlist();
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedFolderView, setSelectedFolderView] = useState(null);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isCreatingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingNew]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      handleAddToFolder(newFolderName.toLowerCase().replace(/\s+/g, "-"));
      setNewFolderName("");
      setIsCreatingNew(false);
      onClose();
    }
  };

  const handleAddToFolder = (folderId) => {
    const wishlistItem = {
      id: property.id,
      name: property.name,
      location: property.location,
      price: property.price,
      dates: property.dates,
      image: property?.photos[0],
      itemType: property.itemType || "stays",
    };
    addToWishlist(wishlistItem, folderId);
    onClose();
  };

  if (!isOpen) return null;

  const folders = Object.entries(wishlists.folders).map(([id, folder]) => ({
    id,
    name: folder.name,
    count: folder.items.length,
  }));

  return createPortal(
    <div
      className="fixed inset-0 font-poppins bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div ref={dialogRef} className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bricolage font-semibold">
              Save to wishlist
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-3">
              <Image
                width={64}
                height={64}
                src={property?.photos[0]}
                alt="Property"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium">{property.name}</h3>
                <p className="text-sm text-gray-600">{property.location}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Default Stays folder */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isInWishlist(property.id, "stays")) {
                  setSelectedFolderView({
                    isOpen: true,
                    name: "Stays",
                    items: wishlists.stays,
                  });
                } else {
                  handleAddToFolder("stays");
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Stays</span>
              </div>
              {isInWishlist(property.id, "stays") ? (
                <span className="text-sm text-green-600">Saved</span>
              ) : (
                <span className="text-sm text-gray-500">
                  {wishlists.stays.length} items
                </span>
              )}
            </button>

            {/* Default Experiences folder */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isInWishlist(property.id, "experiences")) {
                  setSelectedFolderView({
                    isOpen: true,
                    name: "Experiences",
                    items: wishlists.experiences,
                  });
                } else {
                  handleAddToFolder("experiences");
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Experiences</span>
              </div>
              {isInWishlist(property.id, "experiences") ? (
                <span className="text-sm text-green-600">Saved</span>
              ) : (
                <span className="text-sm text-gray-500">
                  {wishlists.experiences.length} items
                </span>
              )}
            </button>

            {/* Custom Folders */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (isInWishlist(property.id, folder.id)) {
                    setSelectedFolderView({
                      isOpen: true,
                      name: folder.name,
                      items: wishlists.folders[folder.id]?.items || [],
                    });
                  } else {
                    handleAddToFolder(folder.id);
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {isInWishlist(property.id, folder.id) ? (
                  <span className="text-sm text-green-600">Saved</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {folder.count} items
                  </span>
                )}
              </button>
            ))}

            {/* Create new folder section - remains unchanged */}
            {isCreatingNew ? (
              <div className="flex items-center gap-2 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-brightGreen"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFolder();
                    }
                  }}
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-6 py-2 bg-primaryGreen text-sm rounded-3xl  text-white  hover:bg-brightGreen disabled:bg-gray-300"
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderPlus className="w-5 h-5 text-primaryGreen" />
                <span className=" font-bricolage font-medium">
                  Create new wishlist
                </span>
              </button>
            )}

            {selectedFolderView && (
              <FolderContentsDialog
                isOpen={true}
                onClose={() => setSelectedFolder(null)}
                folderName={selectedFolder.name}
                items={selectedFolder.items}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WishlistDialog;
