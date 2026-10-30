'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Stethoscope, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { SpecialtyItem } from '../types';
import { MOCK_SPECIALTIES } from '../data/booking-mock-data';

interface SpecialtySelectModalProps {
  isOpen: boolean;
  selectedSpecialtyId: string;
  onSelect: (specialty: SpecialtyItem) => void;
  onClose: () => void;
}

export const SpecialtySelectModal: React.FC<SpecialtySelectModalProps> = ({
  isOpen,
  selectedSpecialtyId,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredSpecialties = useMemo(() => {
    return MOCK_SPECIALTIES.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.room.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredSpecialties.length / pageSize) || 1;
  const paginatedSpecialties = filteredSpecialties.slice(
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
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chọn Chuyên khoa tiếp nhận</h3>
              <p className="text-xs text-slate-500">Lựa chọn chuyên khoa phù hợp với nhu cầu thăm khám</p>
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
              placeholder="Tìm theo tên chuyên khoa, phòng khám..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 outline-none"
            />
          </div>

          {/* List */}
          <div className="space-y-3">
            {paginatedSpecialties.map((spec) => {
              const isSelected = spec.id === selectedSpecialtyId;
              return (
                <div
                  key={spec.id}
                  onClick={() => {
                    onSelect(spec);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">{spec.name}</h4>
                    <p className="text-xs text-blue-700 font-semibold">{spec.room}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{spec.desc}</p>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pl-0 sm:pl-3 sm:border-l sm:border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Phí khám
                      </span>
                      <span className="text-sm font-bold text-blue-600 block">{spec.priceFormatted}</span>
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

            {paginatedSpecialties.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Không tìm thấy chuyên khoa nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Hiển thị <b className="text-slate-700">{paginatedSpecialties.length}</b> /{' '}
            <b className="text-slate-700">{filteredSpecialties.length}</b> chuyên khoa
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
