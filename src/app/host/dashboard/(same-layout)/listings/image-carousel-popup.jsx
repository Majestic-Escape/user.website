import PhotoLightbox from "@/components/ui/photo-lightbox";

// Thin wrapper so the listings table keeps its existing props while sharing
// the same full-screen viewer (swipe, rotate, keyboard) as the stay page.
export function ImageCarouselPopup({ isOpen, onClose, images, propertyName }) {
  return (
    <PhotoLightbox
      images={images || []}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={propertyName}
    />
  );
}
