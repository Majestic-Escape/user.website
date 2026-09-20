import { Star, Award, Shield } from "lucide-react"
import MediaImage from "@/components/ui/media-image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface HostProps {
  host: {
    name: string
    joinDate: string
    isSuperhost: boolean
    avatar: string
  }
  isLoading: boolean
}

export default function Host({ host, isLoading }: HostProps) {
  if (isLoading) {
    return (
      <section className="mt-12 border-t pt-12">
        <div className="flex items-center mb-6">
          <Skeleton className="h-14 w-14 rounded-full mr-4" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-32 mb-6" />
      </section>
    )
  }

  return (
    <section className="mt-12 border-t pt-12">
      <div className="flex items-center mb-6">
        <MediaImage
          src={host?.avatar || "/placeholder.svg"}
          alt={host?.name}
          width={56}
          height={56}
          className="rounded-full mr-4"
        />
        <div>
          <h2 className="text-2xl font-semibold">Hosted by {host?.name}</h2>
          <p className="text-gray-500">Joined in {host?.joinDate}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-primary mr-2" />
          <span>1,378 Reviews</span>
        </div>
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-primary mr-2" />
          <span>Identity verified</span>
        </div>
        {host?.isSuperhost && (
          <div className="flex items-center">
            <Award className="h-5 w-5 text-primary mr-2" />
            <span>Superhost</span>
          </div>
        )}
      </div>
      <p className="mb-4">
        Hi, I'm {host?.name}! I'm passionate about providing exceptional hospitality experiences. I love sharing the
        beauty of Lonavala with guests from around the world.
      </p>
      <p className="mb-4">
        As a Superhost, I ensure that every detail is taken care of to make your stay comfortable and memorable. Feel
        free to reach out if you have any questions!
      </p>
      <Button variant="outline" className="mb-6">
        Contact Host
      </Button>
      <div className="flex items-center space-x-4 text-sm">
        <Shield className="h-5 w-5 flex-shrink-0" />
        <p>
          To protect your payment, never transfer money or communicate outside of the Majestic Escape website or app.
        </p>
      </div>
    </section>
  )
}

