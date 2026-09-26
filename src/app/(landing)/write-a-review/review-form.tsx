import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react'
import { format } from "date-fns";

interface ReviewFormProps {
  booking: {
    id: string
    type: "stay" | "experience"
    title: string
    date: string
  }
}

export function ReviewForm({ booking }: ReviewFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{booking.title}</h2>
        <p className="text-gray-500">
          {format(new Date(booking.date), "d MMM yyyy")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Overall Rating</Label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className="text-gray-400 hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full p-1"
            >
              <Star className="h-8 w-8" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title</Label>
        <input
          type="text"
          id="title"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Sum up your experience in a few words"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Your Review</Label>
        <Textarea
          id="review"
          placeholder="Tell us about your experience..."
          className="min-h-[150px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Would you recommend this to others?</Label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="recommend" value="yes" className="text-[#447C43]" />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="recommend" value="no" className="text-[#447C43]" />
            <span>No</span>
          </label>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-[#447C43] hover:bg-[#3A6A3A] text-white"
      >
        Submit Review
      </Button>
    </div>
  )
}

