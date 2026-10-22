'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Building2, MapPin, Phone, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { HospitalItem } from '../types';
import { MOCK_HOSPITALS } from '../data/booking-mock-data';

interface HospitalSelectModalProps {
  isOpen: boolean;
  selectedHospitalId: string;
  onSelect: (hospital: HospitalItem) => void;
  onClose: () => void;
}

export const HospitalSelectModal: React.FC<HospitalSelectModalProps> = ({
  isOpen,
  selectedHospitalId,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const tiers = [
    { key: 'all', label: 'Tất cả cơ sở' },
    { key: 'tw', label: 'Tuyến Trung ương' },
    { key: 'province', label: 'Tuyến Tỉnh / TP' },
  ];

  const filteredHospitals = useMemo(() => {
    return MOCK_HOSPITALS.filter((h) => {
      const matchQuery =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTier =
        activeTier === 'all' ||
        (activeTier === 'tw' && h.tier.includes('Trung Ương')) ||
        (activeTier === 'province' && h.tier.includes('Tỉnh'));

      return matchQuery && matchTier;
    });
  }, [searchQuery, activeTier]);

  const totalPages = Math.ceil(filteredHospitals.length / pageSize) || 1;
  const paginatedHospitals = filteredHospitals.slice(
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Chọn cơ sở y tế tiếp nhận</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lựa chọn cơ sở y tế đúng tuyến ban đầu hoặc có tiếp nhận thông tuyến điện tử.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Search Box */}
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
              placeholder="Tìm theo tên bệnh viện, địa chỉ hoặc mã ĐKKCB..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
            {tiers.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTier(t.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full shrink-0 transition cursor-pointer ${
                  activeTier === t.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Hospitals List */}
          <div className="space-y-3">
            {paginatedHospitals.map((hosp) => {
              const isSelected = hosp.id === selectedHospitalId;
              return (
                <div
                  key={hosp.id}
                  onClick={() => {
                    onSelect(hosp);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{hosp.name}</h4>
                      {hosp.tag && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {hosp.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pl-0 sm:pl-9 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {hosp.address}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Hotline: {hosp.hotline}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-700 font-semibold bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px]">
                        Mã: {hosp.code}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {isSelected ? (
                      <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1">
                        <Check className="w-4 h-4" /> Đang chọn
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Chọn cơ sở
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {paginatedHospitals.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Không tìm thấy cơ sở y tế phù hợp với tìm kiếm của bạn.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Hiển thị <b className="text-slate-700">{paginatedHospitals.length}</b> /{' '}
            <b className="text-slate-700">{filteredHospitals.length}</b> cơ sở
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
