'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Heading from "@/components/ui/heading"
import Title from "@/components/ui/title"
import SubHeading from "@/components/ui/sub-heading"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, Copy,  Heart, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from "@/lib/utils"


interface Offer {
  id: string
  type: 'credit' | 'wallet' | 'location' | 'new' | 'seasonal'
  badge: string
  badgeColor: string
  title: string
  description: string
  endDate: string
  code: string
}


const offers: Offer[] = [
  {
    id: '1',
    type: 'new',
    badge: 'New User Offer',
    badgeColor: 'bg-[#3B7D3B] text-white',
    title: 'Welcome Discount: 25% Off Your First Stay',
    description: 'Use code WELCOME25 at checkout',
    endDate: '23/11/24',
    code: 'WELCOME25'
  },
  {
    id: '2',
    type: 'credit',
    badge: 'Credit Card',
    badgeColor: 'bg-lightGreen text-brightGreen',
    title: 'HDFC Bank Offer',
    description: 'Get 10% instant discount up to ₹5000 on HDFC Bank Credit Cards',
    endDate: '23/11/24',
    code: 'HDFC10'
  },
  {
    id: '3',
    type: 'wallet',
    badge: 'Wallet',
    badgeColor: 'bg-blue-100 text-blue-700',
    title: 'MobiKwik Cashback',
    description: 'Use MobiKwik wallet and get up to ₹1000 cashback',
    endDate: '23/11/24',
    code: 'MOBIKWIK'
  },
  {
    id: '4',
    type: 'seasonal',
    badge: 'Seasonal',
    badgeColor: 'bg-orange-100 text-orange-700',
    title: 'Summer Special',
    description: 'Get 20% off on all bookings for the summer season',
    endDate: '31/08/24',
    code: 'SUMMER20'
  },
  {
    id: '5',
    type: 'credit',
    badge: 'Credit Card',
    badgeColor: 'bg-lightGreen text-brightGreen',
    title: 'Axis Bank Offer',
    description: 'Get 15% cashback up to ₹2000 on Axis Bank Credit Cards',
    endDate: '30/09/24',
    code: 'AXIS15'
  }
]

export default function Component() {
  const [activeTab, setActiveTab] = useState('all')
  const [likedOffers, setLikedOffers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOffers, setFilteredOffers] = useState(offers)

  useEffect(() => {
    const filtered = offers.filter(offer => activeTab === 'all' || offer.type === activeTab);
    setFilteredOffers(filtered);
  }, [activeTab])

  const toggleLike = (id: string) => {
    setLikedOffers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-7xl font-publicSans py-12 sm:py-32 mx-auto px-4 ">
      <div className="space-y-8">
        <div>
          <Heading text="Special Offers & Discounts"/>
          <SubHeading text="Exclusive deals for your perfect stay"/>
        
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            
            <Input 
              placeholder="Search Offers..." 
              className="pl-12 pr-12 py-6 bg-gray-100 border-0 text-base placeholder:text-gray-500 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primaryGreen hover:bg-[#2E632E] text-white rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => {
                // Perform search action here
                const filtered = offers.filter(offer => {
                  const matchesTab = activeTab === 'all' || offer.type === activeTab;
                  const matchesSearch = 
                    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    offer.code.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesTab && matchesSearch;
                });
                setFilteredOffers(filtered);
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-14 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setSearchTerm('');
                  setFilteredOffers(offers.filter(offer => activeTab === 'all' || offer.type === activeTab));
                }}
              >
                <X className="h-5 w-5 text-gray-400" />
              </Button>
            )}
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-4 rounded-full border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
          >
            <MapPin className="mr-2 h-5 w-5 text-gray-400" />
            All Locations
          </Button>
          <Button 
            variant="outline" 
            className="h-12 px-4 rounded-full border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
          >
            <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-400" />
            Filters
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex gap-3 bg-transparent p-0 h-auto overflow-x-auto">
            {['all', 'credit', 'wallet', 'seasonal'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  "h-11 px-4 rounded-full border border-gray-200 bg-transparent whitespace-nowrap",
                  "data-[state=active]:bg-primaryGreen data-[state=active]:text-white data-[state=active]:border-[#3B7D3B]",
                  "hover:bg-gray-50 data-[state=active]:hover:bg-[#2E632E]"
                )}
              >
                <span>{tab === 'all' ? 'All Offers' : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs data-[state=active]:bg-primaryGreen data-[state=active]:text-white">
                  {tab === 'all' ? offers.length : offers.filter(o => o.type === tab).length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-6">
              {activeTab === 'all' && filteredOffers.find(offer => offer.type === 'new') && (
                <Card className="w-full bg-lightGreen border-0 rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-3">
                      <span className="bg-brightGreen text-white px-3 py-1 rounded-full text-sm">
                        New User Offer
                      </span>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Title text="Welcome Discount: 25% Off Your First Stay"/>
                          <p className="text-gray-600">Use code <span className="font-medium">WELCOME25</span> at checkout</p>
                        </div>
                        <div className="bg-brightGreen text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Offer Ends on 23/11/24
                        </div>
                      </div>
                      <Button className="h-11 w-32 bg-primaryGreen hover:bg-[#2E632E] text-white rounded-lg mt-2">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Regular Offers - Grid of 3 */}
              {filteredOffers.filter(offer => offer.type !== 'new').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOffers.filter(offer => offer.type !== 'new').map((offer) => (
                    <Card key={offer.id} className="rounded-2xl overflow-hidden border-gray-200">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-sm inline-block",
                                offer.badgeColor
                              )}>
                                {offer.badge}
                              </span>
                              <h3 className="text-xl text-graphite font-bricolage font-semibold mt-3">{offer.title}</h3>
                              <p className="text-stone text-sm mt-1">{offer.description}</p>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm text-solidGray">Offer Ends on {offer.endDate}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
                                {offer.code}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-[#3B7D3B] hover:text-[#2E632E] hover:bg-transparent p-0 h-auto font-normal"
                                onClick={() => {
                                  navigator.clipboard.writeText(offer.code);
                                  // You might want to add a toast notification here
                                }}
                              >
                                <Copy className="h-4 w-4 mr-1.5" />
                                Copy
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent"
                            onClick={() => toggleLike(offer.id)}
                          >
                            <Heart className={cn(
                              "h-6 w-6",
                              likedOffers.includes(offer.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                            )} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No offers found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}