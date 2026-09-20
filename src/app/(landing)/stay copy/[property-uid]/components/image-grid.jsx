import MediaImage from "@/components/ui/media-image";

export default function ImageGrid({ images }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Large Image */}
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
        <MediaImage
          src={images[0]}
          alt="Property main image"
          fill
          className="object-cover"
        />
      </div>
      {/* Small Images Grid */}
      <div className="grid grid-cols-2 gap-4">
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="relative aspect-[4/3] rounded-lg overflow-hidden"
          >
            <MediaImage
              src={image}
              alt={`Property image ${index + 2}`}
              fill
              className="object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
