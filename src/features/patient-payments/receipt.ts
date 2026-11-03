import { methodLabels, money, paymentDate, type BillingProfile, type Invoice, type PaymentTransaction } from './payment.types';
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
export function receiptHtml(invoice: Invoice, transaction: PaymentTransaction, profile: BillingProfile) {
  if (transaction.status !== 'SUCCESS' || !transaction.paidAt || transaction.invoiceId !== invoice.id || transaction.profileId !== profile.id || invoice.profileId !== profile.id) throw new Error('Chỉ tạo biên lai cho giao dịch thành công của đúng hồ sơ.');
  const rows = [['Hóa đơn', invoice.code], ['Người khám', profile.name], ['Ca khám', invoice.encounterCode], ['Cơ sở', invoice.facility], ['Mã giao dịch', transaction.reference], ['Phương thức', methodLabels[transaction.method]], ['Thời điểm', paymentDate(transaction.paidAt)], ['Đã thanh toán', money(transaction.amount)]];
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Biên lai mô phỏng ${escapeHtml(invoice.code)}</title><style>body{font:15px/1.7 Arial,sans-serif;color:#1e293b;margin:40px auto;padding:24px;max-width:680px}h1{color:#2563eb;font-size:26px}table{border-collapse:collapse;width:100%;margin:24px 0}td{padding:12px;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere}td:last-child{text-align:right;font-weight:bold}.notice{padding:16px;background:#eff6ff;color:#1d4ed8}.muted{font-size:12px;color:#64748b}@media print{body{margin:0;padding:20px}}</style></head><body><strong>MedConnect</strong><h1>Biên lai thanh toán điện tử</h1><p class="notice">BẢN MÔ PHỎNG · KHÔNG CÓ GIÁ TRỊ THANH TOÁN / THUẾ</p><table>${rows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}</table><p>Trạng thái: Thanh toán thành công (mô phỏng).</p><p class="muted">Biên lai được tạo từ dữ liệu thử trên trình duyệt. Không phải hóa đơn điện tử do cơ sở y tế phát hành.</p></body></html>`;
}
export function downloadReceipt(html: string, code: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `bien-lai-mo-phong-${code.replace(/[^A-Za-z0-9_-]/g, '')}.html`; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function printReceipt(html: string) {
  const frame = document.createElement('iframe'); frame.setAttribute('aria-hidden', 'true'); frame.title = 'Bản in biên lai'; frame.style.cssText = 'position:fixed;width:0;height:0;border:0;';
  frame.onload = () => { frame.contentWindow?.focus(); frame.contentWindow?.print(); window.setTimeout(() => frame.remove(), 60000); };
  frame.srcdoc = html; document.body.append(frame);
}
