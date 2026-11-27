'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, Send } from 'lucide-react';
import { sendChatMessage, type ChatAnswer } from './chat-api';

interface Exchange {
  id: number;
  question: string;
  response: ChatAnswer;
}

export function MedicalChatScreen() {
  const [draft, setDraft] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (exchanges.length || pending) bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [exchanges, pending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || draft.length > 4000 || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(question);
    setError('');
    try {
      const response = await sendChatMessage(question, controller.signal);
      setExchanges(current => [...current, { id: nextId.current++, question, response }]);
      setDraft('');
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error && cause.name === 'TimeoutError'
        ? 'Đã hết thời gian chờ. Bạn có thể gửi lại câu hỏi.'
        : cause instanceof Error ? cause.message : 'Không thể kết nối. Vui lòng thử lại.');
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = null;
        setPending(null);
        inputRef.current?.focus();
      }
    }
  }

  function chooseExample(example: string) {
    setDraft(example);
    setError('');
    inputRef.current?.focus();
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chatbot y tế</h1>
          <p className="mt-1 text-sm text-slate-600">Tra cứu thông tin trong tài liệu y tế.</p>
        </div>
        <button type="button" disabled={!exchanges.length || pending !== null}
          onClick={() => { setExchanges([]); setError(''); inputRef.current?.focus(); }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40">
          Xóa hội thoại
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <p className="font-semibold">Demo tra cứu PDF · Chưa có AI tạo câu trả lời</p>
        <p>Kết quả là trích đoạn nguyên văn tiếng Anh. Hãy dùng từ khóa tiếng Anh để tìm kiếm.</p>
        <p>Thông tin chỉ để tham khảo, không thay thế khám bác sĩ. Không nhập thông tin định danh.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div role="log" aria-label="Hội thoại tra cứu y tế" aria-live="polite" aria-relevant="additions"
          className="max-h-[60vh] min-h-56 space-y-6 overflow-y-auto p-4 sm:p-6">
          {!exchanges.length && !pending && <p className="py-8 text-center text-sm text-slate-500">Nhập câu hỏi hoặc chọn một từ khóa mẫu bên dưới để bắt đầu.</p>}
          {exchanges.map(({ id, question, response }) => (
            <article key={id} className="space-y-3">
              <div className="ml-auto w-fit max-w-[90%] rounded-xl bg-blue-600 px-4 py-3 text-white">
                <p className="mb-1 text-xs font-semibold text-blue-100">Bạn</p>
                <p className="whitespace-pre-wrap wrap-anywhere text-sm">{question}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Chatbot</span>
                  <span className="rounded border border-slate-200 bg-white px-2 text-xs text-slate-600">
                    {response.mode === 'local-search' ? 'Tra cứu PDF' : response.mode === 'mock' ? 'Phản hồi mô phỏng' : response.mode}
                  </span>
                </div>
                <p className="whitespace-pre-wrap wrap-anywhere">{response.answer}</p>
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <h2 className="font-semibold">Nguồn tham khảo ({response.sources.length})</h2>
                  {!response.sources.length && <p className="mt-1 text-slate-500">Không có nguồn phù hợp. Hãy thử từ khóa tiếng Anh khác.</p>}
                  {response.sources.map((source, index) => (
                    <details key={`${source.source}-${source.page}-${index}`} className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                      <summary className="cursor-pointer wrap-anywhere font-medium text-blue-700">{source.source} · Trang PDF {source.page}</summary>
                      <p className="mt-2 whitespace-pre-wrap wrap-anywhere text-slate-600">{source.text}</p>
                    </details>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {pending && <div className="space-y-3">
            <p className="ml-auto w-fit max-w-[90%] whitespace-pre-wrap rounded-xl bg-blue-600 px-4 py-3 text-sm wrap-anywhere text-white">{pending}</p>
            <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Đang tra cứu tài liệu…</p>
          </div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Từ khóa mẫu">
            {['acne', 'allergy', 'abdominal pain'].map(example => (
              <button key={example} type="button" disabled={pending !== null} onClick={() => chooseExample(example)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-40">{example}</button>
            ))}
          </div>
          <label htmlFor="medical-chat-question" className="mb-2 block text-sm font-semibold text-slate-800">Câu hỏi của bạn</label>
          <textarea ref={inputRef} id="medical-chat-question" value={draft} maxLength={4000} rows={3} required
            readOnly={pending !== null} onChange={event => setDraft(event.target.value)}
            aria-describedby={`medical-chat-hint${error ? ' medical-chat-error' : ''}`}
            placeholder="Ví dụ: What is acne?"
            className="block w-full resize-y rounded-lg border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-2 focus:outline-blue-100 read-only:bg-slate-50" />
          {error && <p id="medical-chat-error" role="alert" className="mt-2 text-sm text-red-700">{error} Câu hỏi vẫn được giữ để gửi lại.</p>}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p id="medical-chat-hint" className="text-xs text-slate-500">{draft.length}/4000 ký tự · Không lưu lịch sử sau khi rời trang.</p>
            <button type="submit" disabled={!draft.trim() || pending !== null}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
              <Send aria-hidden="true" className="size-4" />{pending ? 'Đang gửi…' : error ? 'Gửi lại' : 'Gửi câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
