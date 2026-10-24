'use client';

import React from 'react';
import Image from 'next/image';
import { X, Calendar, User, Clock, Share2, Bookmark, CheckCircle2 } from 'lucide-react';
import { NewsArticleItem } from '../types';

interface NewsArticleModalProps {
  article: NewsArticleItem | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${article.categoryColorClass}`}
            >
              {article.category}
            </span>
            {article.isSponsored && (
              <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                ĐƯỢC TÀI TRỢ
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {article.publishDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Thời gian đọc: 4 phút
            </span>
          </div>

          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden shadow-xs bg-slate-100">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-slate-700 space-y-3 leading-relaxed text-sm sm:text-base">
            <p className="font-semibold text-slate-900 text-base leading-normal">
              {article.excerpt}
            </p>
            <p className="text-slate-600">
              {article.content ||
                'Thông tin y tế được xuất bản trên nền tảng MedConnect đều trải qua quy trình kiểm duyệt nghiêm ngặt bởi Hội đồng tham vấn chuyên môn, gồm các Bác sĩ chuyên khoa và Dược sĩ lâm sàng đầu ngành tại các bệnh viện tuyến trung ương. Bài viết nhằm mục đích cung cấp kiến thức chăm sóc sức khỏe khoa học, chính xác, không thay thế cho việc chẩn đoán hoặc điều trị y khoa trực tiếp.'}
            </p>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs sm:text-sm text-blue-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Lưu ý chuyên môn:</strong>
                Mọi biểu hiện bất thường về sức khỏe cần được thăm khám tại các cơ sở y tế có thẩm quyền hoặc liên hệ đặt lịch tư vấn cùng bác sĩ chuyên khoa trên MedConnect để có phác đồ điều trị chuẩn xác nhất.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Lưu bài viết</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
