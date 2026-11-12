import { formatDisplayDate } from '@/src/shared/utils/date-format';
import { useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
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
    <details open className="group rounded-xl border border-slate-200">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-medblue-brand [&::-webkit-details-marker]:hidden">
        <span className="text-lg font-extrabold">Khám tổng quan</span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-medblue-700">
          <span className="group-open:hidden">Mở rộng</span>
          <span className="hidden group-open:inline">Thu gọn</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 group-open:rotate-180" />
        </span>
      </summary>
      <div className="space-y-4 px-4 pb-4">
        <p className="text-[13px] leading-6 text-slate-500">
          Ghi nhận thông tin khám lâm sàng và dấu hiệu sinh tồn của bệnh nhân.
        </p>
        <EncounterSection title="Thông tin ca khám">
          <EncounterField label="Lý do khám" value="Đau tức ngực, hồi hộp" />
          <EncounterField
            label="Khám thực thể"
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
    </details>
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

const lookupGridClass =
  'grid min-w-0 items-start gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]';
const lookupScrollClass =
  'h-[300px] space-y-2 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus-visible:outline-2 focus-visible:outline-medblue-brand md:h-[380px]';

function SearchPlaceholder({
  hasQuery,
  subject,
}: {
  hasQuery: boolean;
  subject: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-slate-500">
      <Search aria-hidden="true" className="mb-1 h-7 w-7 text-slate-400" />
      <strong className="text-slate-600">
        {hasQuery
          ? `Không tìm thấy ${subject} phù hợp`
          : 'Kết quả tìm kiếm sẽ hiển thị ở đây'}
      </strong>
      <span className="leading-6">
        {hasQuery
          ? 'Thử tìm kiếm bằng từ khóa khác.'
          : `Nhập từ khóa ${subject} vào ô tìm kiếm phía trên.`}
      </span>
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
        description="Tìm và chọn mã ICD-10 cho lượt khám."
      />
      <EncounterNotice>
        <div className="flex flex-wrap items-center gap-3">
          Tham chiếu: triệu chứng đau ngực, hồi hộp.
          <EncounterButton onClick={onResults}>Xem kết quả CLS</EncounterButton>
        </div>
      </EncounterNotice>
      <div className={lookupGridClass}>
        <div className="min-w-0">
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
          <h3 className="my-3 flex items-center gap-2 text-[13px] font-extrabold">
            Kết quả tìm kiếm{' '}
            {query.trim() && (
              <EncounterBadge>{matches.length} kết quả</EncounterBadge>
            )}
          </h3>
          <div
            key={query.trim()}
            role="region"
            aria-label="Kết quả tìm kiếm chẩn đoán"
            tabIndex={0}
            className={lookupScrollClass}
          >
            {matches.map((d) => (
              <div
                key={d.code}
                className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs"
              >
                <span className="min-w-0 flex-1 leading-5 wrap-anywhere">
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
            {!matches.length && (
              <SearchPlaceholder
                hasQuery={Boolean(query.trim())}
                subject="chẩn đoán"
              />
            )}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="mb-3 flex min-h-6 items-center gap-2 text-[13px] font-extrabold">
            Chẩn đoán đã chọn{' '}
            <EncounterBadge>{diagnoses.length}</EncounterBadge>
          </h3>
          <div
            role="region"
            aria-label="Chẩn đoán đã chọn"
            tabIndex={0}
            className={lookupScrollClass}
          >
            {diagnoses.length ? (
              diagnoses.map((d) => (
                <div
                  key={d.code}
                  className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1 text-xs leading-5 wrap-anywhere">
                    <span>
                      <b>{d.code}</b> · {d.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <EncounterButton
                      variant="danger"
                      aria-label={`Xóa chẩn đoán ${d.code}`}
                      onClick={() =>
                        onChange(
                          diagnoses.filter((item) => item.code !== d.code),
                        )
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
          </div>
        </div>
      </div>
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
      <div className={lookupGridClass}>
        <div className="min-w-0">
          <label
            htmlFor="drug-search"
            className="mb-2 block text-[11px] font-bold"
          >
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
          <h3 className="my-3 flex items-center gap-2 text-[13px] font-extrabold">
            Kết quả tìm kiếm{' '}
            {query.trim() && (
              <EncounterBadge>{matches.length} kết quả</EncounterBadge>
            )}
          </h3>
          <div
            key={query.trim()}
            role="region"
            aria-label="Kết quả tìm kiếm thuốc"
            tabIndex={0}
            className={lookupScrollClass}
          >
            {matches.map((name) => (
              <div
                key={name}
                className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs"
              >
                <span className="min-w-0 flex-1 leading-5 wrap-anywhere">
                  {name}
                </span>
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
            {!matches.length && (
              <SearchPlaceholder
                hasQuery={Boolean(query.trim())}
                subject="thuốc"
              />
            )}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="mb-3 flex min-h-6 items-center gap-2 text-[13px] font-extrabold">
            Thuốc đã kê <EncounterBadge>{drugs.length}</EncounterBadge>
          </h3>
          <div
            role="region"
            aria-label="Thuốc đã kê"
            tabIndex={0}
            className={lookupScrollClass}
          >
            {drugs.length ? (
              drugs.map((drug, i) => (
                <div
                  key={drug.id}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <strong className="min-w-0 text-xs leading-5 wrap-anywhere">
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
                  <div className="grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
                    <EncounterField
                      label="Liều dùng"
                      placeholder="Theo chỉ định"
                    />
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
          </div>
        </div>
      </div>
      <EncounterField
        label="Hướng dẫn dùng thuốc"
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
