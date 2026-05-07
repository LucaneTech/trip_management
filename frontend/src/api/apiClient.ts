export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type FetchOptions = RequestInit & { retry?: boolean };

function getAccessToken() {
  return localStorage.getItem('accessToken');
}
function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}
function setTokens(access?: string | null, refresh?: string | null) {
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    setTokens(null, null);
    return null;
  }
  const data = await res.json();
  setTokens(data.access, refresh);
  return data.access;
}

export async function request<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = new Headers(opts.headers || {});
  if (!(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401 && !opts.retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return request(path, { ...opts, retry: true });
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let parsed: unknown;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

  if (!res.ok) {
    const err = new Error('API error') as Error & { status: number; data: unknown };
    err.status = res.status;
    err.data = parsed;
    throw err;
  }
  return parsed as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
  setTokens,
};
