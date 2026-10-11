import { Clock, Ban, Book } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ThingsToKnowProps {
  thingsToKnow: {
    houseRules: string[]
    safety: string[]
    cancellation: string
  }
  isLoading: boolean
}

export default function ThingsToKnow({ thingsToKnow, isLoading }: ThingsToKnowProps) {
  if (isLoading) {
    return (
      <section className="mt-12 border-t pt-12">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-12 border-t pt-12">
      <h2 className="text-2xl font-semibold mb-6">Things to know</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div id="house-rules" className="scroll-mt-28">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="h-6 w-6 mr-2" />
            House rules
          </h3>
          <ul className="space-y-2 text-sm">
            {thingsToKnow?.houseRules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 flex items-center">
            <Ban className="h-6 w-6 mr-2" />
            Safety & property
          </h3>
          <ul className="space-y-2 text-sm">
            {thingsToKnow?.safety.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 flex items-center">
            <Book className="h-6 w-6 mr-2" />
            Cancellation policy
          </h3>
          <p className="text-sm">{thingsToKnow?.cancellation}</p>
        </div>
      </div>
    </section>
  )
}

