/**
 * Client HTTP vers le backend FastAPI (/api/*).
 * Si le backend n'est pas lancé, l'application bascule sur les données
 * locales (shared/demo-data.json) : le prototype reste utilisable.
 */
import type { Task } from '@/domain/types';

const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  tasks: () => request<Task[]>('/api/tasks'),
  claimTask: (id: string) => request<Task>(`/api/tasks/${id}/claim`, { method: 'POST' }),
  completeTask: (id: string) => request<Task>(`/api/tasks/${id}/complete`, { method: 'POST' }),
  resetDemo: () => request<{ ok: boolean }>('/api/tasks/_reset', { method: 'POST' }),
};
