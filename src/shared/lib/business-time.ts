// Only business dates use this clock. Authentication timers keep using real time.
let anchor: { epoch: number; tick: number } | null = null;

export function synchronizeBusinessTime(iso: string) {
  const epoch = Date.parse(iso);
  if (!Number.isFinite(epoch)) throw new Error('Giờ hệ thống không hợp lệ.');
  anchor = { epoch, tick: performance.now() };
}

export function businessNowMs(): number {
  return anchor ? anchor.epoch + (performance.now() - anchor.tick) : Date.now();
}

export function businessNow(): Date {
  return new Date(businessNowMs());
}
