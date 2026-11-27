'use client';

import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { RELATIONSHIP_LABELS, type FamilyMemberSummary } from '../models/types/family.types';

interface FamilyMemberCardProps {
  member: FamilyMemberSummary;
  onEdit?: () => void;
  onDelete: () => void;
}

export function FamilyMemberCard({ member, onEdit, onDelete }: FamilyMemberCardProps) {
  const relationshipText = RELATIONSHIP_LABELS[member.relationship] || 'Người thân';
  const genderText = member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-1">
          <h3 className="font-semibold text-slate-900 wrap-anywhere">{member.fullName}</h3>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {relationshipText}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              type="button"
              className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700"
              title="Chỉnh sửa thông tin"
              aria-label="Chỉnh sửa thông tin"
            >
              <Edit2 className="size-4" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onDelete}
            type="button"
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700"
            title="Gỡ hồ sơ"
            aria-label="Gỡ hồ sơ"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 wrap-anywhere">
        <span>Giới tính: <span className="text-slate-900">{genderText}</span></span>
        {member.dob && <span>Ngày sinh: <span className="text-slate-900">{formatDisplayDate(member.dob)}</span></span>}
        {member.bhytNumber && <span>Mã BHYT: <span className="text-slate-900">{member.bhytNumber}</span></span>}
        {member.phone && <span>Số điện thoại: <span className="text-slate-900">{member.phone}</span></span>}
      </div>
      {member.note && (
        <p className="mt-2 text-sm text-slate-600 wrap-anywhere">
          <span className="font-medium">Tiền sử / Ghi chú: </span>{member.note}
        </p>
      )}
      <Link
        href={`/patient/family/${member.id}/health`}
        className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-blue-700 hover:underline"
      >
        Tiền sử &amp; dị ứng
      </Link>
    </article>
  );
}
