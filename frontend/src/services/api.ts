/**
 * Client HTTP vers le backend FastAPI (/api/*).
 * Si le backend n'est pas lancé, l'application bascule sur les données
 * locales (shared/demo-data.json) : le prototype reste utilisable.
 */
import type { Task } from '@/domain/types';
import type { AppState, ApprovalInput, HoldInput, NewClientInput, NewInvoiceInput, PaymentInput } from './store';

const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = Array.isArray(body?.detail) ? body.detail.map((d: { msg: string }) => d.msg).join(' · ') : body?.detail;
    throw new ApiError(res.status, detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

const post = <T,>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  state: () => request<AppState>('/api/state'),
  tasks: () => request<Task[]>('/api/tasks'),
  claimTask: (id: string) => post<Task>(`/api/tasks/${id}/claim`),
  completeTask: (id: string) => post<Task>(`/api/tasks/${id}/complete`),
  createClient: (b: NewClientInput) => post('/api/clients', b),
  createInvoice: (b: NewInvoiceInput) => post('/api/invoices', b),
  recordPayment: (b: PaymentInput) => post(`/api/invoices/${b.invoiceId}/payments`, b),
  placeHold: (b: HoldInput) => post('/api/holds', b),
  decideApproval: (b: ApprovalInput) => post(`/api/invoices/${b.invoiceId}/approval`, b),
  addNote: (b: { invoiceId: string; text: string }) => post(`/api/invoices/${b.invoiceId}/notes`, b),
  resetDemo: () => post<{ ok: boolean }>('/api/_reset'),
};
