import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InfoDialog({ isOpen, onClose, property }) {
    const dialogRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
          onClose();
        }
      };
  
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose]);
  
    if (!isOpen) return null;
  
  
    const dialog = (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={dialogRef} className="bg-white text-absolute-dark rounded-lg shadow-xl w-full max-w-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
  
          <div className="p-6">
  
            <div className="grid gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">{property.title}</h2>
                <p className="text-gray-600">{property.location}</p>
              </div>
  
              <div className="grid gap-2">
  
                <div className="flex justify-between py-2 ">
                  <span className="text-gray-600">Price per night</span>
                  <span className="font-medium">₹{property.price}</span>
                </div>
                <div className="flex justify-between py-2 ">
                  <span className="text-gray-600">Available dates</span>
                  <span className="font-medium">{property.dateRange}</span>
                </div>
              </div>
  
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Property Images</h3>
                <div className="grid grid-cols-4 gap-2">
                  {property?.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative rounded-md overflow-hidden ${currentImageIndex === idx ? 'ring-2 ring-primary' : ''
                        }`}
                    >
                      <Image
                      width={500}
                      height={500}
                        src={image}
                        alt={`${property.title} thumbnail ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  
    return createPortal(dialog, document.body);
  }