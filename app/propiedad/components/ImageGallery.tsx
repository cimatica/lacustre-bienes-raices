"use client";

import { useState } from "react";
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
  
  const [currentMainImage, setCurrentMainImage] = useState<PropertyImage | null>(
    images && images.length > 0 ? (images.find((i) => i.is_main) || images[0]) : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0 || !currentMainImage) {
    return <div className="aspect-[16/10] bg-slate-200 rounded-xl animate-pulse"></div>;
  }

  // Thumbnails are all images except the one currently shown as main
  const galleryImages = images.filter((i) => i.id !== currentMainImage.id);

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={currentMainImage.image_url}
            alt={currentMainImage.image_alt || "Main property image"}
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
          <button 
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <span className="material-icons text-sm">grid_view</span>
            {dict?.property?.viewAllPhotos || "View All Photos"}
          </button>
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 0 && (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setCurrentMainImage(img)}
                className="flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start relative opacity-70 hover:opacity-100 transition-opacity"
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

      {/* Modal View All Photos */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-nordic-dark/80 backdrop-blur-sm transition-all"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-none bg-white dark:bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 z-10">
              <h2 className="text-xl font-semibold text-nordic-dark dark:text-white">
                {dict?.property?.viewAllPhotos || "View All Photos"} ({images.length})
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300 flex items-center justify-center"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-grow bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
              <div 
                className={`grid gap-4 sm:gap-6 ${
                  images.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                  images.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' : 
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {images.map((img) => (
                  <div 
                    key={img.id} 
                    className={`relative rounded-xl overflow-hidden shadow-md group ${
                      images.length === 1 ? 'aspect-[16/10]' : 'aspect-[4/3]'
                    }`}
                    onClick={() => {
                      setCurrentMainImage(img);
                      // Instead of closing, we just visually indicate it was selected or simply let them know it updated the background.
                      // Since the background is obscured, we don't necessarily need to close it.
                    }}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.image_alt || "Property photo"}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    />
                    
                    {/* Visual indicator if it is the current main image */}
                    {currentMainImage.id === img.id && (
                      <div className="absolute inset-0 ring-4 ring-inset ring-mosque/80 bg-mosque/10 pointer-events-none rounded-xl transition-all"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
