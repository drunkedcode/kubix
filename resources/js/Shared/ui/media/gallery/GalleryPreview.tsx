import { useState } from "react";
import { MediaOverlay } from "../MediaOverlay";
import { MediaLightbox } from "../MediaLightbox";
import { revokeMediaItem, type MediaItem } from "../media.types";

interface GalleryPreviewProps {
  items: MediaItem[];
  onRemove: (id: string) => void;
  className?: string;
}

export function GalleryPreview({
  items,
  onRemove,
  className = "",
}: GalleryPreviewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-3 gap-3 sm:grid-cols-4 ${className}`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-navy-700 bg-navy-950"
          >
            <img
              src={item.thumbnailUrl ?? item.url}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />

            <MediaOverlay
              actions={[
                {
                  icon: "view",
                  label: "Ver imagen",
                  onClick: () => setActiveIndex(index),
                },
                {
                  icon: "delete",
                  label: "Eliminar imagen",
                  onClick: () => {
                    revokeMediaItem(item);
                    onRemove(item.id);
                  },
                },
              ]}
            />
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <MediaLightbox
          items={items}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </>
  );
}

export default GalleryPreview;
