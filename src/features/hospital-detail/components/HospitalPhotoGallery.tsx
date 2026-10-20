'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { GalleryImage } from '../types';

interface HospitalPhotoGalleryProps {
  gallery: GalleryImage[];
}

export const HospitalPhotoGallery: React.FC<HospitalPhotoGalleryProps> = ({
  gallery,
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const mainImage = gallery.find((g) => g.isMain) || gallery[0];
  const sideImages = gallery.filter((g) => g.id !== mainImage?.id);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Primary Large Image */}
        {mainImage && (
          <div
            onClick={() => setSelectedImage(mainImage)}
            className="lg:col-span-7 relative rounded-2xl overflow-hidden shadow-sm group h-64 sm:h-[420px] cursor-pointer"
          >
            <Image
              src={mainImage.url}
              alt={mainImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5 shadow-xs">
                Khu vực chính
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                {mainImage.title}
              </h3>
              {mainImage.subtitle && (
                <p className="text-xs sm:text-sm text-slate-200 opacity-90 line-clamp-1 mt-0.5">
                  {mainImage.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Secondary Images Grid */}
        <div className="hidden sm:grid lg:col-span-5 grid-cols-2 lg:grid-rows-2 gap-3.5 h-full sm:h-[420px]">
          {sideImages[0] && (
            <div
              onClick={() => setSelectedImage(sideImages[0])}
              className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
            >
              <Image
                src={sideImages[0].url}
                alt={sideImages[0].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              <span className="absolute bottom-2.5 left-2.5 text-white text-xs font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {sideImages[0].title}
              </span>
            </div>
          )}

          {sideImages[1] && (
            <div
              onClick={() => setSelectedImage(sideImages[1])}
              className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
            >
              <Image
                src={sideImages[1].url}
                alt={sideImages[1].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              <span className="absolute bottom-2.5 left-2.5 text-white text-xs font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {sideImages[1].title}
              </span>
            </div>
          )}

          {sideImages[2] && (
            <div
              onClick={() => setSelectedImage(sideImages[2])}
              className="relative rounded-2xl overflow-hidden shadow-sm col-span-2 group cursor-pointer"
            >
              <Image
                src={sideImages[2].url}
                alt={sideImages[2].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-slate-900/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                {sideImages[2].title}
              </div>

              {/* Gallery Counter Badge */}
              <button
                type="button"
                className="absolute bottom-3 right-3 bg-slate-900/85 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-md backdrop-blur-md transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>8 ảnh cơ sở vật chất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[60vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <div className="p-4 text-white">
              <h4 className="font-bold text-base">{selectedImage.title}</h4>
              {selectedImage.subtitle && (
                <p className="text-xs text-slate-300 mt-1">{selectedImage.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
