'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Building2,
  Stethoscope,
  Video,
  Pill,
  Search,
  BookOpen,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { DictionaryItem, DictionaryTab } from '../types';

interface NewsDictionarySectionProps {
  dictionaryItems: DictionaryItem[];
}

const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#',
];

const TABS: { key: DictionaryTab; label: string }[] = [
  { key: 'thuoc', label: 'Thuốc' },
  { key: 'duoc-lieu', label: 'Dược liệu' },
  { key: 'benh', label: 'Bệnh' },
  { key: 'co-the', label: 'Cơ thể' },
];

export const NewsDictionarySection: React.FC<NewsDictionarySectionProps> = ({
  dictionaryItems,
}) => {
  const [activeTab, setActiveTab] = useState<DictionaryTab>('thuoc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('W');
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);

  const filteredItems = useMemo(() => {
    return dictionaryItems.filter((item) => {
      const matchCategory = item.category === activeTab;
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.activeIngredient &&
          item.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLetter =
        !selectedLetter ||
        selectedLetter === '#' ||
        item.firstLetter.toUpperCase() === selectedLetter.toUpperCase() ||
        searchQuery !== '';

      return matchCategory && matchSearch && matchLetter;
    });
  }, [dictionaryItems, activeTab, searchQuery, selectedLetter]);

  return (
    <section
      data-purpose="medical-dictionary-and-services"
      id="medical-dictionary"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      {/* Left Column: Quick Service Booking Nav */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-600 flex items-center gap-1.5">
              <span>MedConnect</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Nền tảng đặt dịch vụ và sản phẩm y tế dành cho bạn và gia đình
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Service 1 */}
            <Link
              href="/search?type=doctor"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition">
                  Đặt khám Bác sĩ
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Service 2 */}
            <Link
              href="/search?type=clinic"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-600 transition">
                  Đặt khám Phòng khám
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Service 3 */}
            <Link
              href="/search?type=hospital"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition">
                  Đặt khám Bệnh viện
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Service 4 */}
            <Link
              href="/booking?step=1"
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-amber-600 transition">
                  Tư vấn trực tuyến
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Service 5 */}
            <button
              type="button"
              onClick={() => setActiveTab('thuoc')}
              className="w-full text-left flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-700 group-hover:text-rose-600 transition">
                  Thuốc và Dịch vụ y tế
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Right Column: Từ Điển Y Khoa */}
      <section
        aria-labelledby="dictionary-title"
        className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs"
      >
        {/* Header & Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900" id="dictionary-title">
              Từ Điển Y Khoa
            </h2>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Nhập tên ${activeTab === 'thuoc' ? 'thuốc' : activeTab === 'duoc-lieu' ? 'dược liệu' : activeTab === 'benh' ? 'bệnh lý' : 'bộ phận'} cần tra cứu...`}
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <div className="absolute right-3.5 top-3 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Alphabet Quick Search Index (A-Z) */}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Tra cứu bằng chữ cái đầu tiên:</p>
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {ALPHABET.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSearchQuery('');
                  }}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dictionary Articles Grid */}
        <div className="mt-6">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="border border-slate-200 rounded-xl p-3.5 hover:shadow-md hover:border-blue-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative h-32 rounded-lg bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-2 mb-3 shadow-2xs">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <p className="font-medium text-slate-700">{item.author}</p>
                    <p className="text-slate-400">Ngày đăng: {item.publishDate}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy kết quả phù hợp cho "{searchQuery || selectedLetter}"
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng thử chọn chữ cái khác hoặc tìm kiếm với từ khóa khác.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLetter('A');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Dictionary Detail Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {selectedItem.firstLetter}
                </span>
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                    Từ điển {selectedItem.category === 'thuoc' ? 'Thuốc' : selectedItem.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Thông tin chi tiết
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-full sm:w-40 h-36 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedItem.name}
                  </h4>
                  {selectedItem.activeIngredient && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-semibold">
                      <span>Hoạt chất:</span>
                      <strong>{selectedItem.activeIngredient}</strong>
                    </div>
                  )}
                  <div className="text-xs text-slate-500 pt-1">
                    Tham vấn y khoa: <span className="font-semibold text-slate-700">{selectedItem.author}</span> • {selectedItem.publishDate}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Mô tả và cơ chế
                </h5>
                <p className="text-xs sm:text-sm text-slate-600">
                  {selectedItem.detailDesc || selectedItem.shortDesc}
                </p>
              </div>

              {selectedItem.usage && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-emerald-900 space-y-1">
                  <span className="font-bold block text-emerald-800">Hướng dẫn sử dụng tham khảo:</span>
                  <p className="text-emerald-700">{selectedItem.usage}</p>
                </div>
              )}

              {selectedItem.contraindications && (
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs sm:text-sm text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0" /> Chống chỉ định:
                  </span>
                  <p className="text-rose-700">{selectedItem.contraindications}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
