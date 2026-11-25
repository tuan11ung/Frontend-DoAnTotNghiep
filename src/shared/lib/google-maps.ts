export function getGoogleMapsSearchHref(address: string | null | undefined, name: string) {
  const location = address?.trim();
  if (!location) return null;

  const query = [name.trim(), location].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
