// Keep numeric dates consistent across server and browser locale implementations.
export function doctorScheduleDateLabel(date: string): string {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}`;
}
