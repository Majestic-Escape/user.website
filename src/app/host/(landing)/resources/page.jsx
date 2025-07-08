'use client'


import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  FileText,
} from "lucide-react";

export default function HostResources() {
  const [searchTerm, setSearchTerm] = useState("");

  const allResources = [
    {
      title: "Ultimate Hosting Guide",
      description: "A comprehensive guide covering all aspects of being a successful host.",
      icon: <BookOpen className="h-6 w-6" />,
      link: "#",
      type: "guide",
      category: "Getting Started",
    },
    {
      title: "Mastering Property Photography",
      description: "Learn how to capture stunning photos that showcase your property's best features.",
      icon: <PlayCircle className="h-6 w-6" />,
      link: "#",
      type: "video",
      category: "Property Management",
    },
    {
      title: "Seasonal Pricing Strategies",
      description: "Optimize your pricing throughout the year to maximize occupancy and revenue.",
      icon: <DollarSign className="h-6 w-6" />,
      link: "#",
      type: "article",
      category: "Financial Planning",
    },
    {
      title: "Creating Memorable Guest Experiences",
      description: "Tips and tricks to delight your guests and earn stellar reviews.",
      icon: <Users className="h-6 w-6" />,
      link: "#",
      type: "guide",
      category: "Guest Relations",
    },
    {
      title: "Understanding Local Regulations",
      description: "Stay compliant with local laws and regulations for short-term rentals.",
      icon: <FileText className="h-6 w-6" />,
      link: "#",
      type: "article",
      category: "Legal & Safety",
    },
  ];

  const categories = [
    "All Resources",
    "Getting Started",
    "Property Management",
    "Guest Relations",
    "Financial Planning",
    "Legal & Safety",
  ];

  const filteredResources = allResources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const articles = [
    {
      title: "5 Ways to Boost Your Property's Appeal",
      description: "Learn how to make your listing stand out from the crowd",
    },
    {
      title: "Navigating the Post-Pandemic Travel Landscape",
      description: "Adapt your hosting strategy to meet changing guest expectations",
    },
    {
      title: "Eco-Friendly Hosting: A Complete Guide",
      description: "Implement sustainable practices to attract environmentally conscious guests",
    },
    {
      title: "Mastering the Art of Guest Communication",
      description: "Improve your response rates and guest satisfaction with effective communication",
    },
    {
      title: "Tax Tips for Short-Term Rental Hosts",
      description: "Understand your tax obligations and maximize deductions as a host",
    },
  ];

  return (
    <div className="font-publicSans min-h-screen py-16 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bricolage font-bold text-gray-900 mb-4">Host Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Explore our curated collection of guides, articles, and tools to enhance your hosting skills and grow your business.
          </p>
        </header>
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for resources..."
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-200 focus:border-gray-300 focus:ring-0 transition-colors text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Tabs defaultValue="All Resources" className="mb-12">
          <TabsList className="mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="px-4 py-2">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources
                  .filter((resource) => category === "All Resources" || resource.category === category)
                  .map((resource, index) => (
                    <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-brightGreen bg-opacity-10 p-3">
                            {resource.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {resource.title}
                              <span className="ml-2 text-xs font-normal text-gray-500 uppercase">
                                {resource.type}
                              </span>
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Link
                          href={resource.link}
                          className="text-brightGreen hover:text-brightGreen font-medium flex items-center"
                        >
                          View Resource <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Latest Articles</h2>
          <div className="grid gap-4">
            {articles.map((article, index) => (
              <Link
                key={index}
                href="#"
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-brightGreen" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-500">{article.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline">View All Articles</Button>
          </div>
        </section>
       
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Essential Host Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-brightGreen mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Track your listing&apos;s performance and identify areas for improvement.
                </p>
                <Link href="#" className="text-brightGreen hover:text-brightGreen font-medium">
                  View Analytics
                </Link>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <DollarSign className="h-8 w-8 text-brightGreen mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Pricing Tool</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Optimize your rates based on market trends and demand.
                </p>
                <Link href="#" className="text-brightGreen hover:text-brightGreen font-medium">
                  Set Smart Prices
                </Link>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Star className="h-8 w-8 text-brightGreen mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Management</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Monitor and respond to guest reviews to maintain your reputation.
                </p>
                <Link href="#" className="text-brightGreen hover:text-brightGreen font-medium">
                  Manage Reviews
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

