"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/app/components/I18nProvider";
import FavoriteButton from "@/app/components/FavoriteButton";

type PropertyImage = {
  id: string;
  image_url: string;
  image_alt: string;
  is_main: boolean;
};

type Props = {
  images: PropertyImage[];
  badge?: string;
  propertyId?: string;
  userId?: string;
  initialIsFavorite?: boolean;
};

export default function ImageGallery({ images, badge, propertyId, userId, initialIsFavorite }: Props) {
  const dict = useTranslation();
  
  const [currentMainImage, setCurrentMainImage] = useState<PropertyImage | null>(
    images && images.length > 0 ? (images.find((i) => i.is_main) || images[0]) : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

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
          {propertyId && (
            <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-mosque transition-all shadow-lg border border-white/20">
              <FavoriteButton propertyId={propertyId} userId={userId} initialIsFavorite={initialIsFavorite} />
            </div>
          )}
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
          <div className="flex gap-4 overflow-x-auto custom-scrollbar-x pb-4 snap-x">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm transition-all"
          onClick={() => { setIsModalOpen(false); setSlideshowIndex(null); }}
        >
          {slideshowIndex === null ? (
            // GRID VIEW
            <div 
              className="bg-surface-dark rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-none px-6 py-4 flex justify-between items-center border-b border-slate-700/50 z-10">
                <h2 className="text-xl font-semibold text-white">
                  {dict?.property?.viewAllPhotos || "Ver Todas las Fotos"} ({images.length})
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-surface-darker hover:bg-surface-darkest border border-slate-700/50 rounded-full transition-colors text-slate-300 flex items-center justify-center"
                >
                  <span className="material-icons text-xl">close</span>
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scrollbar-y">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                  {images.map((img, idx) => {
                    // First 2 images take 6 columns each, next ones take 4
                    const isTopRow = idx < 2;
                    return (
                      <div 
                        key={img.id} 
                        className={`relative rounded-xl overflow-hidden shadow-md group cursor-pointer ${
                          isTopRow ? 'md:col-span-6 aspect-[4/3]' : 'md:col-span-4 aspect-[4/3]'
                        }`}
                        onClick={() => {
                          setSlideshowIndex(idx);
                        }}
                      >
                        <Image
                          src={img.image_url}
                          alt={img.image_alt || "Property photo"}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // SLIDESHOW VIEW
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-darkest/95 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
              
              {/* Header inside slideshow */}
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
                <div className="text-slate-300 font-medium tracking-widest text-sm">
                  {slideshowIndex + 1} / {images.length}
                </div>
                <button 
                  onClick={() => setSlideshowIndex(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white flex items-center justify-center"
                >
                  <span className="material-icons text-2xl">close</span>
                </button>
              </div>

              {/* Prev Button */}
              <button 
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-50 disabled:opacity-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideshowIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
                }}
                disabled={slideshowIndex === 0}
              >
                <span className="material-icons text-2xl">chevron_left</span>
              </button>

              {/* Main Slideshow Image */}
              <div className="relative w-full max-w-5xl h-[70vh] sm:h-[80vh] mx-16">
                <Image
                  src={images[slideshowIndex].image_url}
                  alt={images[slideshowIndex].image_alt || "Property photo"}
                  fill
                  unoptimized
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Next Button */}
              <button 
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-50 disabled:opacity-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideshowIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
                }}
                disabled={slideshowIndex === images.length - 1}
              >
                <span className="material-icons text-2xl">chevron_right</span>
              </button>
              
            </div>
          )}
        </div>
      )}
    </>
  );
}
