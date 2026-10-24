import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ArrowRight } from 'lucide-react';
import { ExpertAdvisorItem } from '../types';

interface NewsAdvisoryBoardProps {
  experts: ExpertAdvisorItem[];
}

export const NewsAdvisoryBoard: React.FC<NewsAdvisoryBoardProps> = ({ experts }) => {
  return (
    <section
      data-purpose="medical-expert-board"
      id="expert-advisory"
      className="bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 md:p-10 shadow-xs"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Experts Avatar Grid (6 Doctors) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {experts.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200 group"
            >
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-blue-100 shadow-2xs shrink-0 bg-slate-100">
                <Image
                  src={exp.avatar}
                  alt={exp.name}
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug truncate">
                  {exp.name}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{exp.specialty}</p>
                {exp.workplace && (
                  <span className="text-[11px] text-blue-600 font-medium truncate block">
                    {exp.workplace}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Introduction & Action */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Award className="w-4 h-4" />
            <span>Hội Đồng Tham Vấn Y Khoa</span>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            Hội đồng tham vấn y khoa cùng đội ngũ biên tập viên là các bác sĩ, dược sĩ đảm bảo nội dung chúng tôi cung cấp chính xác về mặt y khoa và cập nhật những thông tin mới nhất.
          </p>

          <div className="pt-2">
            <Link
              href="/search?type=doctor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Đội ngũ chuyên gia</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
