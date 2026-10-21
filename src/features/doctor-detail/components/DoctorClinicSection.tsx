'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Map, X } from 'lucide-react';
import { ClinicImage } from '../types';

interface DoctorClinicSectionProps {
  clinicAddress: string;
  clinicMapQuery?: string;
  clinicImages: ClinicImage[];
}

export const DoctorClinicSection: React.FC<DoctorClinicSectionProps> = ({
  clinicAddress,
  clinicMapQuery,
  clinicImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<ClinicImage | null>(null);

  return (
    <section className="p-6 sm:p-8" data-purpose="clinic-info">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Clinic Location Card with Map Accent */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 text-white flex flex-col justify-between shadow-md relative overflow-hidden min-h-[170px]">
          {/* Background graphic abstraction */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-10 pointer-events-none text-white">
            <Map className="w-full h-full stroke-[1]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Địa chỉ phòng khám</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white mt-1 leading-snug">
              {clinicAddress}
            </h3>
          </div>

          <div className="relative z-10 mt-4">
            <a
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm transition-all hover:shadow cursor-pointer"
              href={`https://maps.google.com/?q=${encodeURIComponent(clinicMapQuery || clinicAddress)}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Mở bản đồ</span>
            </a>
          </div>
        </div>

        {/* Clinic Images Gallery */}
        <div className="flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 mb-3">Hình ảnh phòng khám</h3>
          <div className="grid grid-cols-4 gap-2 h-full min-h-[105px]">
            {clinicImages.slice(0, 3).map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer bg-slate-100 h-24"
              >
                <Image
                  alt={img.alt}
                  src={img.url}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="120px"
                  unoptimized
                />
              </div>
            ))}

            {/* Gallery More Placeholder (+2) */}
            <div
              onClick={() => setSelectedImage(clinicImages[0])}
              className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer font-bold text-slate-600 text-sm h-24"
            >
              2+
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[50vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="80vw"
                unoptimized
              />
            </div>
            <div className="p-3 text-white text-center">
              <p className="text-sm text-slate-200">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
