'use client';

import React from 'react';
import Link from 'next/link';
import {
  Baby,
  User,
  Sparkles,
  Apple,
  Bone,
  ShieldCheck,
  Wind,
  Ear,
  Award,
  HeartPulse,
  Accessibility,
  Activity,
  Ambulance,
  Syringe,
  Smile,
  ShieldAlert,
  Droplets,
  Pill,
  Brain,
  Microscope,
  Droplet,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { SPECIALTIES_LIST } from '@/src/features/home/data/medical-data';
import { SpecialtyProps } from '@/src/types/medical';

interface MedicalSpecialtiesSectionProps {
  specialties?: SpecialtyProps[];
}

export const MedicalSpecialtiesSection: React.FC<MedicalSpecialtiesSectionProps> = ({
  specialties = SPECIALTIES_LIST,
}) => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'baby':
        return <Baby className="w-6 h-6" />;
      case 'person-standing':
        return <User className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'apple':
        return <Apple className="w-6 h-6" />;
      case 'bone':
        return <Bone className="w-6 h-6" />;
      case 'shield-alert':
        return <ShieldAlert className="w-6 h-6" />;
      case 'wind':
        return <Wind className="w-6 h-6" />;
      case 'ear':
        return <Ear className="w-6 h-6" />;
      case 'ribbon':
        return <Award className="w-6 h-6" />;
      case 'heart-pulse':
        return <HeartPulse className="w-6 h-6" />;
      case 'accessibility':
        return <Accessibility className="w-6 h-6" />;
      case 'activity':
        return <Activity className="w-6 h-6" />;
      case 'ambulance':
        return <Ambulance className="w-6 h-6" />;
      case 'syringe':
        return <Syringe className="w-6 h-6" />;
      case 'smile':
        return <Smile className="w-6 h-6" />;
      case 'droplets':
        return <Droplets className="w-6 h-6" />;
      case 'pill':
        return <Pill className="w-6 h-6" />;
      case 'brain':
        return <Brain className="w-6 h-6" />;
      case 'microscope':
        return <Microscope className="w-6 h-6" />;
      case 'droplet':
        return <Droplet className="w-6 h-6" />;
      case 'eye':
        return <Eye className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <section className="py-16 bg-slate-50/60 border-t border-slate-100" data-purpose="comprehensive-medical-specialties" id="chuyen-khoa">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đa dạng chuyên khoa khám
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Đặt khám dễ dàng và tiện lợi hơn với đầy đủ các chuyên khoa
          </p>
        </div>

        {/* Grid of 24 Specialties */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {specialties.map((spec) => (
            <Link
              key={spec.id}
              className="group bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-xs hover:shadow-md card-hover-transition flex flex-col items-center text-center cursor-pointer"
              href={spec.linkUrl || '#chuyen-khoa'}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${spec.iconBgClass} ${spec.iconColorClass} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}
              >
                {renderIcon(spec.iconName)}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {spec.name}
              </span>
            </Link>
          ))}
        </div>

        {/* View more specialties button */}
        <div className="mt-10 text-center">
          <button
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-6 py-2.5 rounded-full shadow-xs hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span>Xem thêm 20+ chuyên khoa khác</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
