
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Home,  Calendar, DollarSign, Settings, ArrowRight, Phone, Mail, MessageSquare } from 'lucide-react'

export default function HostHelpCenter() {
  const categories = [
    { icon: <Home className="h-6 w-6" />, title: "Property Management", description: "Learn about listing, updating, and managing your properties" },
    { icon: <Calendar className="h-6 w-6" />, title: "Booking & Availability", description: "Manage your calendar, reservations, and guest communications" },
    { icon: <DollarSign className="h-6 w-6" />, title: "Payments & Pricing", description: "Understand pricing strategies, payouts, and financial reports" },
    { icon: <Settings className="h-6 w-6" />, title: "Account Settings", description: "Manage your host profile, preferences, and account security" },
  ]

  const popularQuestions = [
    { question: "How do I list a new property?", link: "#" },
    { question: "What are the best practices for pricing my property?", link: "#" },
    { question: "How can I improve my property's ranking?", link: "#" },
    { question: "What should I do if I have an issue with a guest?", link: "#" },
  ]

  return (
    
    <div className="font-publicSans min-h-screen py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <header className=" mb-6">
          <h1 className="text-4xl font-bricolage font-bold text-absoluteDark mb-2">Host Support Center</h1>
          <p className="text-base text-stone">Find answers to your hosting questions or contact our host support team</p>
        </header>

        <div className="max-w-2xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search for hosting answers..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-200 focus:border-gray-300 focus:ring-0 transition-colors text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {categories.map((category, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-3">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{category.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-6">Popular Host Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularQuestions.map((item, index) => (
              <Link 
                key={index} 
                href={item.link} 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span className="text-gray-700">{item.question}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        <div id='host-support' className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-6">Contact Host Support</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <MessageSquare className="h-8 w-8 text-stone mb-4" />
                  <h3 className="text-lg font-semibold text-absoluteDark mb-2">Whatsapp Chat</h3>
                  <p className="text-gray-600 mb-4">Start a conversation with our host support team right now.</p>
                  <Link href="https://wa.me/918369995283" target="_blank" className="w-full bg-primaryGreen py-2 px-3 rounded-3xl hover:bg-brightGreen transition-colors text-white ">
                    Chat on WhatsApp
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Mail className="h-8 w-8 text-stone mb-4" />
                  <h3 className="text-lg font-semibold text-absoluteDark mb-2">Email</h3>
                  <p className="text-gray-600 mb-4">Send us an email and we&apos;ll get back to you within 24 hours.</p>
                  <Link href="mailto:support@majesticescape.com" target="_blank" className="w-full bg-primaryGreen py-2 px-3 rounded-3xl hover:bg-brightGreen transition-colors text-white">
                    support@majesticescape.com
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Phone className="h-8 w-8 text-stone mb-4" />
                  <h3 className="text-lg font-semibold text-absoluteDark mb-2">Phone</h3>
                  <p className="text-gray-600 mb-4">Call us directly for immediate host assistance.</p>
                  <Link href="tel:918830627338" target="_blank" className="w-full bg-primaryGreen py-2 px-3 rounded-3xl hover:bg-brightGreen transition-colors text-white">
                    +91 88306 27338
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
     
  )
}

