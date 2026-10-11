'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit2, Filter, Star, Trash2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



export default function Component() {
  const [isClient, setIsClient] = useState(false)
  const reviews =[
    {
      id: '1',
      propertyName: 'Casa Belo - Chic 1BHK Serviced apt | Pool + Gym',
      location: 'North Goa, India',
      stayDate: '2024-10-29',
      nights: 10,
      rating: 5,
      status: 'published',
      review: 'A truly magical experience! The heritage property\'s charm and impeccable service made our stay unforgettable. Perfect location near all attractions.',
      helpful: 20,
      replies: 20
    },
    {
      id: '2',
      propertyName: 'Modern & Comfortable - 1 BHK w/ AC & Fast Wifi',
      location: 'Arambel, India',
      stayDate: '2024-10-09',
      nights: 5,
      rating: 5,
      status: 'pending',
      review: 'What a stunning property! Every corner reflects elegance and comfort. The garden views and peaceful surroundings made our stay absolutely memorable.',
      helpful: 0,
      replies: 0
    },
    {
      id: '3',
      propertyName: 'Easy Breeze 1BHK farm stay',
      location: 'Mandrem, India',
      stayDate: '2024-10-11',
      nights: 2,
      rating: 5,
      status: 'followup',
      review: 'What a stunning property! Every corner reflects elegance and comfort. The garden views and peaceful surroundings made our stay absolutely memorable.',
      helpful: 0,
      replies: 0
    }
  ]

  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [filters, setFilters] = useState({
    rating: 0,
    propertyType: 'all',
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (searchQuery) {
        return review.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               review.review.toLowerCase().includes(searchQuery.toLowerCase())
      }
      if (currentTab !== "all") {
        return review.status === currentTab
      }
      if (filters.rating > 0) {
        return review.rating >= filters.rating
      }
      if (filters.propertyType !== 'all') {
        return review.propertyName.toLowerCase().includes(filters.propertyType.toLowerCase())
      }
      return true
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.stayDate).getTime() - new Date(a.stayDate).getTime()
      } else {
        return new Date(a.stayDate).getTime() - new Date(b.stayDate).getTime()
      }
    })

  const counts = {
    all: reviews.length,
    published: reviews.filter(r => r.status === 'published').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    followup: reviews.filter(r => r.status === 'followup').length
  }

  return (
    // Top padding clears the fixed site header (~60px on phones, 77px from md),
    // matching the offset other landing pages use; p-6 alone hid the title
    // and the "Write a review" button underneath it.
    <div className="px-6 pb-6 pt-20 md:pt-28 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-4">Manage and write reviews for your stays</p>
        </div>
        <Button className="bg-primaryGreen hover:bg-green-700">
          + Write a review
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 mt-16">
        <div className="relative flex-1 min-w-[12rem] bg-[#EBEBEB] rounded-full p-2">
          <Input
            placeholder="Search Reviews"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bg-primaryGreen rounded-full text-white top-1/2 -translate-y-1/2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 border-primaryGreen text-brightGreen rounded-full p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px] border-primaryGreen text-brightGreen rounded-full">
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" >
              <DropdownMenuItem className="border-brightGreen" onClick={() => setSortOrder("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem className="border-brightGreen" onClick={() => setSortOrder("oldest")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-brightGreen rounded-full">
                Filters
                <Filter className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Reviews</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="rating" className="text-right">
                    Minimum Rating
                  </label>
                  <Input
                    id="rating"
                    type="number"
                    className="col-span-3"
                    min="0"
                    max="5"
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: parseInt(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="propertyType" className="text-right">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    className="col-span-3"
                    value={filters.propertyType}
                    onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  >
                    <option value="all">All</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        {/* Scrolls inside its pill on phones (tabs never shrink); 48px gaps only
            from md. The fixed gap-12 row was wider than a phone and Pending /
            Followup were cut off with no way to reach them. */}
        <TabsList className="mb-6 flex w-fit max-w-full justify-start overflow-x-auto gap-4 md:gap-12 rounded-full bg-white [&>*]:shrink-0">
          <TabsTrigger value="all">
            All Reviews <span className="ml-2 text-muted-foreground">({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published <span className="ml-2 text-muted-foreground">({counts.published})</span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending <span className="ml-2 text-muted-foreground">({counts.pending})</span>
          </TabsTrigger>
          <TabsTrigger value="followup">
            Followup <span className="ml-2 text-muted-foreground">({counts.followup})</span>
          </TabsTrigger>
        </TabsList>

        {isClient && (
          <TabsContent value={currentTab}>
            <div className="space-y-4">
              {filteredAndSortedReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted mb-2">
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1">{review.propertyName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="inline-block mr-2">📍 {review.location}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Stayed on {new Date(review.stayDate).toLocaleDateString()} • {review.nights} Nights
                        </p>
                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm">{review.review}</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                          <Button variant="ghost" size="sm">
                            👍 Helpful ({review.helpful})
                          </Button>
                          <Button variant="ghost" size="sm">
                            💬 Reply ({review.replies})
                          </Button>
                          {review.status === 'published' && (
                            <Button variant="ghost" size="sm" className="text-green-600">
                              Host Reply...
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}