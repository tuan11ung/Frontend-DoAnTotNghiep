export interface ChatSource {
  source: string;
  page: number;
  text: string;
}

export interface ChatAnswer {
  answer: string;
  mode: string;
  sources: ChatSource[];
}

export async function sendChatMessage(message: string, signal: AbortSignal): Promise<ChatAnswer> {
  const response = await fetch('/api/public/ai-chats/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    cache: 'no-store',
    signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || 'Không thể gửi câu hỏi. Vui lòng thử lại.');
  }
  const data = result.data;
  if (typeof data?.answer !== 'string' || typeof data.mode !== 'string' || !Array.isArray(data.sources)
      || !data.sources.every((source: ChatSource) => source && typeof source.source === 'string'
        && Number.isInteger(source.page) && source.page > 0 && typeof source.text === 'string')) {
    throw new Error('Phản hồi chưa đầy đủ. Vui lòng thử lại.');
  }
  return data;
}
