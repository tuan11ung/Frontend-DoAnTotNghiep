'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, X, UserCheck, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { DoctorItem } from '../types';
import { MOCK_DOCTORS } from '../data/booking-mock-data';

interface DoctorSelectModalProps {
  isOpen: boolean;
  selectedDoctorId: string;
  onSelect: (doctor: DoctorItem) => void;
  onClose: () => void;
}

export const DoctorSelectModal: React.FC<DoctorSelectModalProps> = ({
  isOpen,
  selectedDoctorId,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredDoctors = useMemo(() => {
    return MOCK_DOCTORS.filter((dr) => {
      return (
        dr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dr.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dr.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chọn Bác sĩ tiếp nhận</h3>
              <p className="text-xs text-slate-500">Đội ngũ bác sĩ chuyên khoa đầu ngành giàu kinh nghiệm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm bác sĩ... (VD: 'Dương Thị Hằng', 'Da Liễu')"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 outline-none"
            />
          </div>

          {/* List */}
          <div className="space-y-3">
            {paginatedDoctors.map((dr) => {
              const isSelected = dr.id === selectedDoctorId;
              return (
                <div
                  key={dr.id}
                  onClick={() => {
                    onSelect(dr);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100 shadow-xs">
                      <Image
                        src={dr.avatar}
                        alt={dr.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                          {dr.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-blue-600 font-semibold">{dr.role}</span>
                        <span
                          className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200"
                          title={dr.degreeTitle}
                        >
                          {dr.degree}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{dr.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-0 sm:pl-3 sm:border-l sm:border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Phí khám
                      </span>
                      <span className="text-sm font-bold text-blue-600 block">{dr.priceFormatted}</span>
                    </div>

                    {isSelected ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đang chọn
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition"
                      >
                        Chọn
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {paginatedDoctors.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Không tìm thấy bác sĩ nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Hiển thị <b className="text-slate-700">{paginatedDoctors.length}</b> /{' '}
            <b className="text-slate-700">{filteredDoctors.length}</b> bác sĩ
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
