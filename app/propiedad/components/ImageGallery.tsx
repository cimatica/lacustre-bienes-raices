"use client";

import Image from "next/image";
import { useTranslation } from "@/app/components/I18nProvider";

type PropertyImage = {
  id: string;
  image_url: string;
  image_alt: string;
  is_main: boolean;
};

type Props = {
  images: PropertyImage[];
  badge?: string;
};

export default function ImageGallery({ images, badge }: Props) {
  const dict = useTranslation();

  if (!images || images.length === 0) {
    return <div className="aspect-[16/10] bg-slate-200 rounded-xl animate-pulse"></div>;
  }

  const mainImage = images.find((i) => i.is_main) || images[0];
  const galleryImages = images.filter((i) => i.id !== mainImage.id);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
        <Image
          src={mainImage.image_url}
          alt={mainImage.image_alt || "Main property image"}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {badge && (
            <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2">
          <span className="material-icons text-sm">grid_view</span>
          {dict?.property?.viewAllPhotos || "View All Photos"}
        </button>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 0 && (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {galleryImages.map((img, index) => (
            <div
              key={img.id}
              className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start relative ${
                index === 0
                  ? "ring-2 ring-mosque ring-offset-2 ring-offset-clear-day"
                  : "opacity-70 hover:opacity-100 transition-opacity"
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.image_alt || "Property thumbnail"}
                fill
                unoptimized
                sizes="192px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
