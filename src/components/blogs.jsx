'use client'

import React, { useState } from "react"
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import Heading from '@/components/ui/heading'
import SubHeading from '@/components/ui/sub-heading'

const blogPosts = [
  {
    id: 1,
    image: "/images/sada-fort-karnataka.png?height=220&width=320",
    category: "Heritage",
    title: "Exploring Sada Fort: Goa's Overlooked Coastal Gem",
    date: "October 21, 2024"
  },
  {
    id: 2,
    image: "/images/img1.png?height=220&width=320",
    category: "Adventure",
    title: "November Nooks: Hidden Gems to Explore in Goa Before Winter",
    date: "October 20, 2024"
  },
  {
    id: 3,
    image: "/images/white_water_rafting.png?height=220&width=320",
    category: "Adventure",
    title: "Waves and Wheels: Goa's Best Water Sports and Bike Tours",
    date: "October 19, 2024"
  },
  {
    id: 4,
    image: "/images/Fish-curry.jpg?height=220&width=320",
    category: "Food",
    title: "Spice of Life: A Culinary Journey Through Goan Cuisine",
    date: "October 18, 2024"
  },
]

function BlogCard({ id, image, category, title, date }) {
  return (
    <Link href={`/blog/${id}`} className="w-full flex-shrink-0">
      <div className="flex flex-col overflow-hidden rounded-lg">
        <Image
          width={500}
          height={500}
          src={image} 
          alt={title} 
          className="w-full aspect-[4/3] object-cover rounded-lg" 
        />
        <div className="pt-4">
          <span className="inline-block px-3 py-1 text-sm font-medium text-absolute-dark bg-[#BBEEA1] rounded">
            {category}
          </span>
          <h3 className="mt-3 text-[16px] font-medium text-absolute-dark">{title}</h3>
          <p className="mt-2 text-sm text-stone">{date}</p>
        </div>
      </div>
    </Link>
  )
}

export default function Blogs() {
  const [currentIndex, setCurrentIndex] = useState(0)

  function handleNext() {
    setCurrentIndex((prev) => Math.min(prev + 1, blogPosts.length - 4))
  }

  function handlePrev() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="flex justify-center w-full px-4 sm:px-6 lg:px-[72px] bg-white">
      <div className="w-full max-w-[1760px] mx-auto">
        <section className=" py-16  bg-white font-publicSans text-absolute-dark">
          <div className="mx-auto">
            <div className="mb-12">
              <Heading text="Stories & Insights"/>
              <SubHeading text="Handpicked luxury stays in the pearl of the orient"/>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 md:grid-cols-4 transition-transform duration-300 ease-in-out"
                  style={{
                    width: `${(100 / 4) * blogPosts.length}%`,
                    transform: `translateX(-${(currentIndex * 100) / blogPosts.length}%)`
                  }}
                >
                  {blogPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className=" px-2"
                    >
                      <BlogCard 
                        id={post.id}
                        image={post.image}
                        category={post.category}
                        title={post.title}
                        date={post.date}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute -left-3 top-[140px] -translate-y-1/2 bg-white shadow-gray hover:bg-white rounded-full p-2 shadow-md transition-colors z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {currentIndex < blogPosts.length - 4 && (
                <button
                  onClick={handleNext}
                  className="absolute -right-3 top-[140px] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}