/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import WishlistDialog from "../WishlistDialog";

import  InfoDialog from '@/components/experiences/info-dialog'
import { MainTab } from "../ui/main-tab";
import ShareDialog from "./share-dialog";

import { useWishlist } from '@/components/wishlist-context';

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ExperienceCard = ({ experience, includeTaxes }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const {isInWishlist, wishlists } = useWishlist();
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const cardRef = useRef(null);
    
    
const calculatePriceWithTax = (price) => {
  return Math.round(price * 1.18); // 18% tax
};

  
    const isWishlisted = 
      isInWishlist(experience.id, 'stays') || 
      isInWishlist(experience.id, 'experiences') || 
      Object.keys(wishlists.folders).some(folderId => 
        isInWishlist(experience.id, folderId)
      );
  
    const formatPrice = (price) => {
      return typeof price === 'string' ?
        Number(price.replace(/,/g, '')) :
        Number(price);
    };
  
    const handleWishlist = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWishlistDialogOpen(true);
    };
  
    const nextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === experience.images.length - 1 ? 0 : prevIndex + 1
      );
    };
  
    const prevImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? experience.images.length - 1 : prevIndex - 1
      );
    };
  
    useEffect(() => {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === `#experience-${experience.id}`) {
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
              setIsHighlighted(true);
              setTimeout(() => setIsHighlighted(false), 2000);
            }
          }, 500); // Delay to ensure content is loaded
        }
      };
  
      // Check on mount
      handleHashChange();
  
      // Listen for hash changes
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, [experience.id]);
  
    // Add scroll and highlight effect
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash === `#experience-${experience.id}`) {
          const element = document.getElementById(`experience-${experience.id}`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
            setIsHighlighted(true);
            setTimeout(() => {
              setIsHighlighted(false);
            }, 2000);
          }
        }
      }
    }, [experience.id]);
  
    const displayPrice = includeTaxes ? calculatePriceWithTax(experience.price) : experience.price;
  
    return (
      <div>
      {/* <MainTab/> */}
      <div 
      ref={cardRef}
        id={`experience-${experience.id}`}
        className={`overflow-hidden w-full font-publicSans mt-8 group
          transition-all duration-300 ease-in-out
          ${isHighlighted ? 'scale-[1.02] shadow-lg shadow-blue-200 ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
      >
        <div className="relative aspect-[4/3] rounded-2xl">
          <div
            className="absolute rounded-2xl inset-0 flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {experience.images.map((image, index) => (
              <Image
              width={600}
              height={600}
                key={index}
                src={image}
                alt={`${experience.title} view ${index + 1}`}
                className="w-full h-full rounded-xl object-cover flex-shrink-0"
              />
            ))}
          </div>
  
          <div
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            onClick={prevImage}
            aria-label="Previous image"
          />
  
          <div
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            onClick={nextImage}
            aria-label="Next image"
          />
  
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
            <div className="bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              Guest&apos;s fav
            </div>
            <div className="bg-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
              <span>5</span>
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-yellow-400" />
            </div>
          </div>
  
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {experience.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  currentImageIndex === index ? 'bg-white' : 'bg-white/60'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
  
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base sm:text-lg font-semibold">{experience.title}</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="inline-flex items-center justify-center h-8 w-8 right-4 hover:text-gray"
                onClick={() => setIsInfoDialogOpen(true)}
              >
                <Image
                width={24}
                height={24}
                 src="/icons/info-icon.svg"
                  alt="Info Icon" 
                  className="w-6 h-6 justify-center" />
              </button>
  
              <button
                onClick={handleWishlist}
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-opacity-60 border-[#A7A7A7] bg-white hover:bg-accent hover:text-accent-foreground ${
                  isWishlisted ? 'text-red-500' : 'text-gray'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4 transition-colors duration-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
              
              <button
                className="text-gray inline-flex h-8 w-8 items-center justify-center rounded-md hover:text-gray-600"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Image
                width={24}
                height={24}
                 src="/icons/share-icon.svg" alt="Share Icon" className="w-6 h-6 justify-center" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-xs sm:text-sm">{experience.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-base sm:text-lg font-semibold">₹{displayPrice}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1">per person</span>
              {includeTaxes && <span className="text-xs ml-1">(incl. taxes)</span>}
            </div>
           
          </div>
        </div>
  
        <InfoDialog
          isOpen={isInfoDialogOpen}
          onClose={() => setIsInfoDialogOpen(false)}
          property={experience}
        />
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          property={experience}
        />
        <WishlistDialog
          isOpen={isWishlistDialogOpen}
          onClose={() => setIsWishlistDialogOpen(false)}
          property={{
            id: experience.id,
            name: experience.title,
            location: experience.location,
            price: formatPrice(experience.price),
            dates: experience.dateRange,
            images: experience.images,
            itemType: 'experiences'
          }}
        />
      </div>
      </div>
    );
  };

  export default ExperienceCard