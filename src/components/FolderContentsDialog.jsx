// FolderContentsDialog.jsx
"use client"

import React from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

export const FolderContentsDialog = ({ isOpen, onClose, folderName, items }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 font-publicSans bg-white z-[60]">
      <div className="h-screen flex flex-col">
        <header className="px-6 h-20 flex items-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
          <h1 className=" font-bricolage ml-6 text-xl font-semibold">{folderName}</h1>
        </header>

        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div key={index} className="relative aspect-[1/1.1] flex flex-col">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  <Image
                  width={200}
                  height={200}
                    src={item.image}
                    alt="name"
                    className="w-full h-full object-cover"
                  />
                  {/* <div className="absolute top-3 left-3 bg-white px-4 py-2 rounded-full text-sm font-medium">
                    Guest favourite
                  </div> */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === 0 ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    {/* <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>5.0</span>
                    </div> */}
                  </div>
                  <p className="text-gray-500 text-sm">{item.location}</p>
                  <p className="text-gray-500 text-sm">1 queen bed</p>
                  {/* <p className="text-gray-500 text-sm">5 nights · {item.dates || '10-15 Nov'}</p> */}
                  {/* <p className="mt-1">
                    <span className="font-semibold">₹{item.price.toLocaleString()}</span>
                    <span className="text-gray-500"> night</span>
                    <span className="text-gray-500 ml-1">· ₹{(item.price * 5).toLocaleString()} total</span>
                  </p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FolderContentsDialog;