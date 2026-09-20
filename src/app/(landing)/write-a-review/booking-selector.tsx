import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MediaImage from "@/components/ui/media-image"
import { Calendar } from 'lucide-react'

interface Booking {
  id: string
  type: "stay" | "experience"
  title: string
  date: string
  image: string
}

interface BookingSelectorProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}

export function BookingSelector({ bookings, onSelect }: BookingSelectorProps) {
  const stays = bookings.filter(b => b.type === "stay")
  const experiences = bookings.filter(b => b.type === "experience")

  return (
    <Tabs defaultValue="stays" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="stays">Stays</TabsTrigger>
        <TabsTrigger value="experiences">Experiences</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stays">
        <div className="space-y-4">
          {stays.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No stays found to review</p>
          ) : (
            stays.map((stay) => (
              <BookingCard key={stay.id} booking={stay} onSelect={onSelect} />
            ))
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="experiences">
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No experiences found to review</p>
          ) : (
            experiences.map((experience) => (
              <BookingCard key={experience.id} booking={experience} onSelect={onSelect} />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function BookingCard({ booking, onSelect }: { booking: Booking, onSelect: (booking: Booking) => void }) {
  return (
    <Card 
      className="hover:border-[#447C43] cursor-pointer transition-all"
      onClick={() => onSelect(booking)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <MediaImage
          src={booking.image}
          alt={booking.title}
          width={150}
          height={100}
          className="rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{booking.title}</h3>
          <div className="flex items-center gap-2 text-gray-500 mt-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {new Date(booking.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

