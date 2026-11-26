const localBackend = 'http://localhost:8081';
const probeIntervalMs = 10_000;
let probe: { origin: string; expiresAt: number; result: Promise<string> } | undefined;

export function configuredBackendOrigin() {
  return (process.env.BACKEND_API_URL?.trim() || localBackend).replace(/\/+$/, '').replace(/\/api\/v1$/i, '');
}

export async function resolveBackendOrigin() {
  const primary = configuredBackendOrigin();
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL || primary === localBackend) return primary;

  if (!probe || probe.origin !== primary || Date.now() >= probe.expiresAt) {
    // Probe a read-only endpoint before sending the original request so writes are never replayed.
    const result = fetch(`${primary}/api/v1/public/time/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    }).then(async response => {
      const health = await response.json();
      return response.ok && health?.success === true ? primary : localBackend;
    }).catch(() => localBackend);
    probe = { origin: primary, expiresAt: Date.now() + probeIntervalMs, result };
  }

  return probe.result;
}
