import { supabase } from './supabase';

const BASE = '/api';

async function getToken(): Promise<string | undefined> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function get<T>(path: string): Promise<T> {
  return handleResponse<T>(await fetch(`${BASE}${path}`));
}

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  return handleResponse<T>(
    await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function authPatch<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  return handleResponse<T>(
    await fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function authPut<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  return handleResponse<T>(
    await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

export async function authDelete(path: string): Promise<void> {
  const token = await getToken();
  await handleResponse<void>(
    await fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  );
}
