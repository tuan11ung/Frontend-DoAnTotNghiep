import { searchPublicCatalog } from '@/src/features/site-search/services/search-catalog';

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') || '';
  return Response.json(searchPublicCatalog(query), { headers: { 'Cache-Control': 'no-store' } });
}
