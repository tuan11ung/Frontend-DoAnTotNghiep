import type { SearchSuggestionGroup } from '@/src/features/site-search/types';
const BACKEND = (process.env.BACKEND_API_URL ?? 'http://localhost:8081').replace(/\/$/, '').replace(/\/api\/v1$/, '');
interface Row { id: number; name?: string; title?: string; address?: string; summary?: string; specialtyName?: string }
async function search(endpoint: string, query: string, directory = false) {
  const response = await fetch(`${BACKEND}/api/v1/public/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: query, ...(directory ? { page: 0, size: 4 } : { pageable: { page: 0, size: 4 } }) }), cache: 'no-store', signal: AbortSignal.timeout(12000) });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error('Search unavailable');
  return result.data as { content: Row[]; totalElements: number };
}
export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 100);
  const headers = { 'Cache-Control': 'no-store' };
  if (query.length < 2) return Response.json({ query, groups: [] }, { headers });
  try {
    const [hospitals, doctors, articles] = await Promise.all([search('hospitals/search', query), search('directory/doctors/search', query, true), search('articles/search', query)]);
    const groups: SearchSuggestionGroup[] = [
      { id: 'hospitals', label: 'Bệnh viện', total: hospitals.totalElements, items: hospitals.content.map(r => ({ id: String(r.id), title: r.name ?? '', description: r.address ?? '', href: `/hospitals/${r.id}` })) },
      { id: 'doctors', label: 'Bác sĩ', total: doctors.totalElements, items: doctors.content.map(r => ({ id: String(r.id), title: r.name ?? '', description: r.specialtyName ?? '', href: `/doctors/${r.id}` })) },
      { id: 'articles', label: 'Bài viết', total: articles.totalElements, items: articles.content.map(r => ({ id: String(r.id), title: r.title ?? '', description: r.summary ?? '', href: `/news?article=${r.id}` })) },
    ];
    return Response.json({ query, groups: groups.filter(g => g.items.length) }, { headers });
  } catch { return Response.json({ message: 'Không thể tải gợi ý. Vui lòng thử lại.' }, { status: 502, headers }); }
}
