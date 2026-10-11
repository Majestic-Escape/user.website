"use client"
import Image from "next/image"
import Link from "next/link"
import { Shield, MapPin, Wallet, AmbulanceIcon as FirstAid, Sun, Phone, Globe, AlertTriangle } from "lucide-react"

export default function SafetyTips() {
  return (
    <div className="flex flex-col min-h-screen">
     

      {/* Hero Section */}
      <section className=" pt-24 md:pt-32 pb-8">
        <div className="container mx-auto px-4 ">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bricolage font-semibold mb-4">
              Travel <span className="text-[#4d8c40]">Safety Tips</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl mb-8">Ensuring your journey is as safe as it is memorable</p>
            <div className="inline-block bg-[#e8f5e4] text-[#3c6e2f] px-4 py-2 rounded-full text-sm font-medium">
              Your safety is our priority
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <Shield className="text-[#4d8c40] w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Before You Travel</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Research your destination thoroughly, including local customs and laws</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Share your itinerary with family or friends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Make copies of important documents (passport, visa, insurance)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Check travel advisories for your destination</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <MapPin className="text-[#4d8c40] w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">At Your Destination</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Stay aware of your surroundings at all times</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Use reputable transportation services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Know the location of the nearest embassy or consulate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Learn a few basic phrases in the local language</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <Wallet className="text-[#4d8c40] w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Money & Valuables</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Use a money belt or hidden pouch for important documents and cash</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Avoid displaying expensive items or large amounts of cash</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Use hotel safes for valuables when available</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Have multiple payment methods (cash, cards) in case of emergency</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <FirstAid className="text-[#4d8c40] w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Health & Wellness</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Pack a basic first aid kit with essential medications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Research health risks at your destination and get necessary vaccinations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Drink bottled or purified water in areas with questionable water quality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[#e8f5e4] text-[#3c6e2f] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                    <span>Know how to contact emergency services in your destination</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Additional Tips Section */}
            <div className="bg-[#f8f9fa] p-8 rounded-xl mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Essential Safety Tips for All Travelers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Sun className="text-[#4d8c40] w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2">Climate Awareness</h3>
                  <p className="text-gray-600 text-sm">
                    Pack appropriate clothing and protection for the local climate
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Phone className="text-[#4d8c40] w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2">Stay Connected</h3>
                  <p className="text-gray-600 text-sm">Keep your phone charged and consider a local SIM card</p>
                </div>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Globe className="text-[#4d8c40] w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2">Cultural Respect</h3>
                  <p className="text-gray-600 text-sm">Research and respect local customs and traditions</p>
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="border border-[#ffd0d0] bg-[#fff8f8] p-6 rounded-xl mb-12">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-[#e74c3c] w-6 h-6 mr-3" />
                <h2 className="text-xl font-bold text-[#e74c3c]">In Case of Emergency</h2>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-[#ffe8e8] text-[#e74c3c] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                  <span>Know the local emergency numbers</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#ffe8e8] text-[#e74c3c] rounded-full w-5 h-5 shrink-0 flex justify-center items-center p-1 mr-2 mt-0.5">•</span>
                  <span>Contact your country's embassy or consulate for serious situations</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-[#ffe8e8] text-[#e74c3c] rounded-full p-1 mr-2 mt-0.5 w-5 h-5 shrink-0 flex justify-center items-center">•</span>
                  <span>Have your travel insurance information readily available</span>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold font-bricolage mb-4">Ready for a Safe Adventure?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                At Majestic Escape, we're committed to helping you have both a safe and unforgettable travel experience.
                Book your stay with confidence knowing you're prepared for your journey.
              </p>
              <Link
                href="/stays"
                className="bg-[#3c6e2f] text-white px-6 py-3 rounded-full hover:bg-[#2c5320] transition-colors inline-block font-medium"
              >
                Book your stay
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
