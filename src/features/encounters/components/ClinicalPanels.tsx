import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  drugCatalog,
  icdCatalog,
  visitHistory,
  vitalFields,
} from '../data/encounter-demo';
import type { Diagnosis, OrderedService, PrescriptionItem } from '../types';
import {
  controlClass,
  EncounterBadge,
  EncounterButton,
  EncounterEmpty,
  EncounterField,
  EncounterNotice,
  EncounterSection,
  PanelHeading,
} from './EncounterControls';

export function OverviewPanel() {
  return (
    <div className="space-y-4">
      <PanelHeading
        title="Khám tổng quan"
        description="Ghi nhận thông tin khám lâm sàng và dấu hiệu sinh tồn của bệnh nhân."
      />
      <EncounterSection title="Thông tin ca khám">
        <EncounterField label="Lý do khám" value="Đau tức ngực, hồi hộp" />
        <EncounterField
          label="Bệnh sử / triệu chứng hiện tại"
          value="Đau tức ngực từng cơn, hồi hộp, mệt mỏi."
          multiline
        />
      </EncounterSection>
      <EncounterSection title="Dấu hiệu sinh tồn">
        <div className="grid gap-4 sm:grid-cols-2">
          {vitalFields.map((field) => (
            <EncounterField
              key={field.id}
              label={field.label}
              value={field.value}
              inputMode={field.id === 'blood-pressure' ? 'text' : 'decimal'}
            />
          ))}
        </div>
      </EncounterSection>
    </div>
  );
}

export function HistoryPanel({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const visit = selected === null ? null : visitHistory[selected];
  return (
    <div className="space-y-4">
      <PanelHeading
        title="Lịch sử khám"
        description="Xem các lượt khám trước, chẩn đoán, đơn thuốc và kết quả CLS của từng lượt."
      />
      <EncounterSection title="Lịch sử khám">
        <div className="grid gap-3 sm:grid-cols-2">
          {visitHistory.map((item, i) => (
            <button
              key={formatDisplayDate(item.date)}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={`cursor-pointer rounded-lg border p-3.5 text-left focus-visible:outline-2 focus-visible:outline-medblue-brand ${selected === i ? 'border-medblue-200 bg-medblue-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <strong className="block text-xs">
                {formatDisplayDate(item.date)} · {item.specialty}
              </strong>
              <span className="mt-2 block text-[11px] text-slate-500">
                {item.hospital} · {item.diagnosis.split(' – ')[1]}
              </span>
            </button>
          ))}
        </div>
        {visit && (
          <div className="space-y-2 rounded-lg bg-medblue-50 p-4 text-xs leading-6">
            <strong>
              {formatDisplayDate(visit.date)} · {visit.specialty}
            </strong>
            <p>Chẩn đoán: {visit.diagnosis}</p>
            <p>Đơn thuốc: {visit.drug}</p>
            <p>CLS: {visit.service}</p>
            <EncounterButton
              variant="light"
              onClick={() =>
                notify('Bản xem trước chưa có file kết quả CLS cũ đính kèm.')
              }
            >
              Xem kết quả CLS cũ
            </EncounterButton>
          </div>
        )}
      </EncounterSection>
      <p className="text-[11px] text-slate-500">
        Lượt khám tại cơ sở khác chỉ được hiển thị khi đủ quyền truy cập.
      </p>
    </div>
  );
}

export function DiagnosisPanel({
  diagnoses,
  onChange,
  onResults,
}: {
  diagnoses: Diagnosis[];
  onChange: (items: Diagnosis[]) => void;
  onResults: () => void;
}) {
  const [query, setQuery] = useState('');
  const matches = query.trim()
    ? icdCatalog.filter(
        (d) =>
          `${d.code} ${d.name}`
            .toLocaleLowerCase('vi')
            .includes(query.trim().toLocaleLowerCase('vi')) &&
          !diagnoses.some((item) => item.code === d.code),
      )
    : [];
  return (
    <div className="space-y-4">
      <PanelHeading
        title="Chẩn đoán"
        description="Tìm và chọn mã ICD-10, phân biệt chẩn đoán chính và chẩn đoán kèm theo."
      />
      <EncounterNotice>
        <div className="flex flex-wrap items-center gap-3">
          Tham chiếu: triệu chứng đau ngực, hồi hộp.
          <EncounterButton onClick={onResults}>Xem kết quả CLS</EncounterButton>
        </div>
      </EncounterNotice>
      <div>
        <label
          htmlFor="icd-search"
          className="mb-2 block text-[11px] font-bold"
        >
          Tìm theo mã ICD-10 hoặc tên bệnh
        </label>
        <input
          id="icd-search"
          name="icd-search"
          className={controlClass}
          placeholder="Nhập I10, R07.4, đau ngực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.map((d) => (
          <div
            key={d.code}
            className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-xs"
          >
            <span>
              <b>{d.code}</b> · {d.name}
            </span>
            <EncounterButton
              variant="light"
              onClick={() => {
                onChange([...diagnoses, d]);
                setQuery('');
              }}
            >
              + Chọn
            </EncounterButton>
          </div>
        ))}
        {query.trim() && !matches.length && (
          <p className="mt-2 text-xs text-slate-500">
            Không có mã ICD-10 phù hợp để thêm.
          </p>
        )}
      </div>
      <EncounterSection title="Chẩn đoán đã chọn">
        {diagnoses.length ? (
          diagnoses.map((d, i) => (
            <div
              key={d.code}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
                <EncounterBadge>
                  {i === 0 ? 'Chính' : 'Kèm theo'}
                </EncounterBadge>
                <span>
                  <b>{d.code}</b> · {d.name}
                </span>
              </div>
              <div className="flex gap-2">
                {i > 0 && (
                  <EncounterButton
                    onClick={() =>
                      onChange([
                        d,
                        ...diagnoses.filter((item) => item.code !== d.code),
                      ])
                    }
                  >
                    Đặt làm chính
                  </EncounterButton>
                )}
                <EncounterButton
                  aria-label={`Xóa chẩn đoán ${d.code}`}
                  onClick={() =>
                    onChange(diagnoses.filter((item) => item.code !== d.code))
                  }
                >
                  Xóa
                </EncounterButton>
              </div>
            </div>
          ))
        ) : (
          <EncounterEmpty>Chưa có chẩn đoán</EncounterEmpty>
        )}
      </EncounterSection>
      <EncounterField
        label="Ghi chú, diễn giải và kết luận"
        placeholder="Nhập kết luận lâm sàng và diễn giải..."
        multiline
      />
    </div>
  );
}

export function PrescriptionPanel({
  drugs,
  onChange,
}: {
  drugs: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [nextId, setNextId] = useState(1);
  const matches = query.trim()
    ? drugCatalog.filter((name) =>
        name
          .toLocaleLowerCase('vi')
          .includes(query.trim().toLocaleLowerCase('vi')),
      )
    : [];
  return (
    <div className="space-y-4">
      <PanelHeading
        title="Kê đơn thuốc"
        description="Đối chiếu bệnh nền, chẩn đoán và dấu hiệu sinh tồn trước khi kê đơn."
      />
      <EncounterNotice>
        Bệnh nền: Tăng huyết áp, Đái tháo đường type 2 · HA 145/90 mmHg · Mạch
        88 lần/phút · SpO₂ 98% · Nhiệt độ 36,8°C · 70 kg.
      </EncounterNotice>
      <EncounterSection title="Thêm thuốc vào đơn">
        <label htmlFor="drug-search" className="block text-[11px] font-bold">
          Tìm thuốc
        </label>
        <input
          id="drug-search"
          name="drug-search"
          className={controlClass}
          placeholder="Ví dụ: Amlodipin, Metformin..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.map((name) => (
          <div
            key={name}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-xs"
          >
            <span>{name}</span>
            <EncounterButton
              variant="light"
              disabled={drugs.some((d) => d.name === name)}
              onClick={() => {
                onChange([...drugs, { id: nextId, name }]);
                setNextId(nextId + 1);
                setQuery('');
              }}
            >
              {drugs.some((d) => d.name === name) ? 'Đã thêm' : '+ Thêm'}
            </EncounterButton>
          </div>
        ))}
        {query.trim() && !matches.length && (
          <p className="text-xs text-slate-500">
            Không tìm thấy thuốc phù hợp.
          </p>
        )}
      </EncounterSection>
      <EncounterSection
        title={
          <>
            Thuốc đã kê{' '}
            <EncounterBadge tone="gray">{drugs.length}</EncounterBadge>
          </>
        }
      >
        {drugs.length ? (
          drugs.map((drug, i) => (
            <div
              key={drug.id}
              className="rounded-lg border border-slate-200 p-3"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <strong className="text-xs">
                  {i + 1}. {drug.name}
                </strong>
                <EncounterButton
                  aria-label={`Xóa ${drug.name}`}
                  onClick={() =>
                    onChange(drugs.filter((d) => d.id !== drug.id))
                  }
                >
                  <X className="h-3.5 w-3.5" />
                  Xóa
                </EncounterButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <EncounterField label="Liều dùng" placeholder="Theo chỉ định" />
                <div>
                  <label
                    htmlFor={`route-${drug.id}`}
                    className="mb-2 block text-[11px] font-bold"
                  >
                    Đường dùng
                  </label>
                  <select
                    id={`route-${drug.id}`}
                    name={`route-${drug.id}`}
                    className={controlClass}
                  >
                    <option>Uống</option>
                    <option>Khác</option>
                  </select>
                </div>
                <EncounterField label="Tần suất" placeholder="Lần/ngày" />
                <EncounterField
                  label="Số ngày"
                  placeholder="Số ngày"
                  inputMode="decimal"
                />
                <EncounterField
                  label="Số lượng"
                  placeholder="Số viên"
                  inputMode="decimal"
                />
                <EncounterField
                  label="Hướng dẫn"
                  placeholder="Trước/sau ăn..."
                />
              </div>
            </div>
          ))
        ) : (
          <EncounterEmpty>Chưa có thuốc trong đơn</EncounterEmpty>
        )}
      </EncounterSection>
      <EncounterField
        label="Lời dặn và hướng dẫn dùng thuốc"
        placeholder="Nhập lời dặn dành cho bệnh nhân..."
        multiline
      />
      <p className="text-[11px] text-slate-500">
        Dữ liệu minh họa; chưa kiểm tra tương tác thuốc, chống chỉ định, liều
        dùng hoặc tồn kho.
      </p>
    </div>
  );
}

export function SummaryPanel({
  services,
  diagnoses,
  drugs,
  notify,
}: {
  services: OrderedService[];
  diagnoses: Diagnosis[];
  drugs: PrescriptionItem[];
  notify: (message: string) => void;
}) {
  return (
    <div className="space-y-4">
      <PanelHeading
        title="Tổng kết ca khám"
        description="Kiểm tra lại các thông tin trước khi hoàn tất lượt khám."
      />
      <EncounterSection title="Thông tin lượt khám">
        <dl>
          {[
            ['Thông tin khám tổng quan', 'Đã nhập'],
            ['Dịch vụ CLS', `${services.length} dịch vụ`],
            ['Chẩn đoán ICD-10', `${diagnoses.length} mã`],
            ['Thuốc trong đơn', `${drugs.length} thuốc`],
          ].map(([label, value], i) => (
            <div
              key={label}
              className="flex justify-between gap-4 border-b border-slate-200 py-3 text-[13px] last:border-0"
            >
              <dt>{label}</dt>
              <dd
                className={`flex shrink-0 items-center gap-1 font-bold ${i === 0 ? 'text-green-700' : ''}`}
              >
                {i === 0 && <Check className="h-4 w-4" />}
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </EncounterSection>
      <EncounterNotice>
        {services.some((s) => s.status !== 'done')
          ? 'Còn dịch vụ CLS chưa có kết quả hoặc chưa gửi chỉ định. Cần kiểm tra trước khi kết thúc lượt khám.'
          : 'Tất cả dịch vụ CLS trong bản xem trước đã có kết quả.'}
      </EncounterNotice>
      <EncounterField
        label="Lời dặn / Hẹn tái khám"
        placeholder="Lời dặn, hẹn tái khám..."
        multiline
      />
      <EncounterButton
        variant="primary"
        onClick={() =>
          notify('Minh họa hoàn tất lượt khám. Chưa lưu dữ liệu lên máy chủ.')
        }
      >
        Hoàn tất lượt khám
      </EncounterButton>
    </div>
  );
}
