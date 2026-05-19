const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEMO_USER = {
  nombre: process.env.NEXT_PUBLIC_DEMO_USER_NAME || 'Usuario Demo RentOS',
  email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || 'demo@rentos.com',
  password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || 'Demo12345',
  role: 'admin',
  tenantId: process.env.NEXT_PUBLIC_DEMO_TENANT_ID || 'demo-tenant',
};

const TOKEN_KEY = 'rentos_access_token';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const isBrowser = () => typeof window !== 'undefined';

const getStoredToken = () => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

const storeToken = (token: string) => {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
};

async function authRequest(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Error ${response.status} en ${path}`);
  }

  return data;
}

export async function ensureAuthToken(): Promise<string> {
  const existingToken = getStoredToken();
  if (existingToken) return existingToken;

  try {
    const registered = await authRequest('/auth/register', DEMO_USER);
    const token = registered.access_token || registered.token;
    storeToken(token);
    return token;
  } catch (error) {
    const logged = await authRequest('/auth/login', {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
    });
    const token = logged.access_token || logged.token;
    storeToken(token);
    return token;
  }
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, retry = true): Promise<T> {
  const token = await ensureAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && retry) {
    clearToken();
    return request<T>(method, path, body, false);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || `Error ${response.status} en ${path}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export { API_URL, TOKEN_KEY };
