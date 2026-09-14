export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('sentinelview_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function severityClass(severity: Severity) {
  return {
    INFO: 'bg-slate-700 text-slate-100',
    LOW: 'bg-sky-900 text-sky-100',
    MEDIUM: 'bg-amber-900 text-amber-100',
    HIGH: 'bg-orange-900 text-orange-100',
    CRITICAL: 'bg-red-900 text-red-100'
  }[severity];
}
