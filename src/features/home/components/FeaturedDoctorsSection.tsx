import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DoctorProps } from '@/src/types/medical';
import { FEATURED_DOCTORS } from '@/src/features/home/data/medical-data';

interface FeaturedDoctorsSectionProps {
  doctors?: DoctorProps[];
}

export const FeaturedDoctorsSection: React.FC<FeaturedDoctorsSectionProps> = ({
  doctors = FEATURED_DOCTORS,
}) => {
  return (
    <section className="py-14 bg-white" data-purpose="featured-doctors-carousel" id="view-doctor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Action Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Đặt khám bác sĩ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Lựa chọn chuyên gia đầu ngành phù hợp theo tình trạng bệnh của bạn
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm hover:shadow transition-all"
            href="#tat-ca-bac-si"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Doctors Grid Container */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {doctors.map((doctor) => (
              <article
                key={doctor.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-xl card-hover-transition flex flex-col justify-between group"
                data-purpose="doctor-profile-card"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-28 h-28 rounded-full overflow-hidden ${
                      doctor.bgColorClass || 'bg-slate-100'
                    } p-1 ring-4 ${doctor.ringColorClass || 'ring-blue-50'} mb-4`}
                  >
                    <Image
                      alt={`${doctor.name} - ${doctor.specialty}`}
                      className="w-full h-full object-cover rounded-full"
                      src={doctor.imageUrl}
                      width={112}
                      height={112}
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 leading-snug transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 mb-4">
                    {doctor.specialty}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    className="w-full inline-flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 py-1 transition-colors"
                    href={doctor.bookingUrl || '#dat-lich'}
                  >
                    <span>Đặt lịch ngay</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Next slide button indicator */}
          <button
            aria-label="Xem thêm bác sĩ tiếp theo"
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-700 shadow-lg hover:bg-slate-50 hover:text-blue-600 transition-colors z-10 cursor-pointer"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
