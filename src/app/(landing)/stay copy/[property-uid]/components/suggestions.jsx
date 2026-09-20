import MediaImage from "@/components/ui/media-image";
import { attractions } from "@/lib/data";

function AttractionItem({ title, description, imageUrl }) {
  return (
   
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/5 lg:w-1/2">
        <MediaImage
          src={imageUrl}
          alt={title}
          width={500}
          height={300}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="md:w-3/5 lg:w-1/2">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm font-normal text-muted-foreground">{description}</p>
      </div>
    </div>

  );
}

export default function Suggestion() {
  return (
    <div className="sm:pt-[1090px] pt-[800px]">
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Discover Paradise Around Our Homestay
      </h1>
      <p className="text-muted-foreground mb-6">North Goa, Goa, India</p>
      <div className="space-y-8">
        {attractions.map((attraction, index) => (
          <AttractionItem key={index} {...attraction} />
        ))}
      </div>
    </div>
    </div>
  );
}
