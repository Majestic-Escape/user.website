"use client"

import React from 'react';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';
import Heading from '@/components/ui/heading'
import SubHeading from '@/components/ui/sub-heading'

const testimonials = [
    {
        name: 'Aditya Mehrotra',
        location: 'Azure Villa, Goa',
        rating: 5,
        review: 'Exceptional Luxury',
        description: "A perfect blend of luxury and comfort! The villa's colonial charm and modern amenities created an unforgettable stay. The private pool was a delightful bonus.",
        date: '18th Oct, 23',
        image: '/images/testimonials/aditya.png?height=43&width=43'
    },
    {
        name: 'Priya Singhania',
        location: 'Heritage Manor, Goa',
        rating: 5,
        review: 'Perfect Getaway',
        description: "Such a beautiful property! Just minutes from the beach, yet so peaceful and private. The staff's attention to detail made our family vacation truly special.",
        date: '18th Oct, 23',
        image: '/images/testimonials/priya.png?height=43&width=43'
      },
  {
    name: 'Vikram Deshpande',
    location: 'Seaside House, Goa',
    rating: 5,
    review: 'Amazing Experience',
    description: "Exceeded all expectations! The beachfront location was incredible, and the property's blend of luxury and authenticity was just perfect. Highly recommended.",
    date: '18th Oct, 23',
    image: '/images/testimonials/vikram.png?height=43&width=43'
  },
  {
    name: 'Kavita Krishnan',
    location: 'Villa Marina, Goa',
    rating: 5,
    review: 'Luxurious Stay',
    description: "What a stunning property! Every corner reflects elegance and comfort. The garden views and peaceful surroundings made our stay absolutely memorable.",
    date: '22 Oct, 24',
    image: '/images/testimonials/kavita.png?height=43&width=43'
  },
  {
    name: 'Rahul Malhotra',
    location: 'Portuguese Villa, Goa',
    rating: 5,
    review: 'Perfect Holiday',
    description: "An absolute gem! The traditional Portuguese architecture combined with modern luxury created the perfect holiday atmosphere. Will definitely return.",
    date: '15 Nov, 23',
    image: '/images/testimonials/rahul.png?height=43&width=43'
  },
  {
    name: 'Anjali Kapoor',
    location: 'Braganza House, Goa',
    rating: 5,
    review: 'Outstanding Property',
    description: "A truly magical experience! The heritage property's charm and impeccable service made our stay unforgettable. Perfect location near all attractions.",
    date: '29th Oct, 23',
    image: '/images/testimonials/anjali.png?height=43&width=43'
  }
  
  
];

const TestimonialCard = ({ testimonial }) => (
  <div className="bg-white rounded-lg p-5 pb-[20px] py-4 shadow-md max-w-[90vw]  w-[374px] h-[300px] mx-4 my-2 relative font-publicSans text-absolute-dark">
    <span className="absolute top-4 right-2 bg-primaryGreen text-white text-xs font-medium py-1 px-3 rounded-md">
      Stay
    </span>
    <div className="flex items-center mb-2">
    <Image width={48} height={48} src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h3 className="font-medium text-absoluteDark font-bricolage">{testimonial.name}</h3>
        <p className="text-xs text-primaryGreen">{testimonial.location}</p>
      </div>
    </div>
    <div className="flex mb-2">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="text-yellow-400 w-5 h-5" fill={i < testimonial.rating ? "#FFCB45" : "none"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
      </svg>
      
        
      ))}
    </div>
    <h4 className="font-semibold mb-2 font-bricolage text-absoluteDark">{testimonial.review}</h4>
    <p className="text-xs sm:text-sm  text-stone mb-4">{testimonial.description}</p>
    <p className="text-xs text-lightGray text-right">{testimonial.date}</p>
  </div>
);

export default function Testimonials() {
  return (
    <section className="bg-white font-publicSans px-6 py-12">
      <div className="max-w-7xl  mx-auto">
        
        <div className="mb-6">
        <Heading text="What our guests say about us"/>
        <SubHeading text="Stories from our luxury travel community"/>
        </div>
      
        <Marquee gradient={false}  speed={30} pauseOnHover={true} className="cursor-pointer">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}