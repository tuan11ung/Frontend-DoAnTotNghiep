function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').trim();
}

export function matchesHospital(
  hospital: { name: string; code: string; address?: string | null },
  query: string,
) {
  return matchesBookingQuery(`${hospital.name} ${hospital.code} ${hospital.address ?? ''}`, query);
}

export function matchesBookingQuery(text: string, query: string) {
  const searchable = normalize(text);
  return normalize(query).split(/\s+/).every((term) => searchable.includes(term));
}
