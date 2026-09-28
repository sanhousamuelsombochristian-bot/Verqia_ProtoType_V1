/**
 * Store de démonstration — fonctions PURES (état → nouvel état).
 * Miroir de backend/app/services.py : même comportement avec ou sans l'API Python.
 *
 * Règle métier : ces fonctions enregistrent des faits (client créé, facture
 * saisie, paiement reçu, mise en attente placée, approbation décidée…).
 * Elles ne calculent JAMAIS risque, priorité, rang ni niveau de recouvrement :
 * ces valeurs restent l'affaire du Rule Engine.
 */
import type { ActionState, BusinessEvent, Client, DecisionDetail, DemoData, Hold, Invoice, Kpi, Note, Payment, PaymentMethod, Task } from '@/domain/types';
import { dateFr, daysBetween, fcfa } from '@/domain/format';

/** Seuil « Proche » (jours avant échéance) — hypothèse du prototype, à valider. */
export const PROCHE_SEUIL_JOURS = 7;

export type AppState = Required<Pick<DemoData, 'payments' | 'holds' | 'notes'>> & DemoData;

export class StoreError extends Error {}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Horodatage « AAAA-MM-JJTHH:MM » à la date du jour de la démo. */
export function stamp(today: string, now = new Date()): string {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${today}T${hh}:${mm}`;
}

/** Statut d'échéance calculé à partir des dates (fait, pas une décision du moteur). */
export function dueInfo(dueDate: string, today: string): Pick<Invoice, 'dueStatus' | 'delayLabel'> {
  const d = daysBetween(today, dueDate);
  if (d < 0) return { dueStatus: 'late', delayLabel: `${-d} j de retard` };
  if (d === 0) return { dueStatus: 'near', delayLabel: 'aujourd’hui' };
  if (d === 1) return { dueStatus: 'near', delayLabel: 'demain' };
  return { dueStatus: d <= PROCHE_SEUIL_JOURS ? 'near' : 'future', delayLabel: `dans ${d} j` };
}

/** État initial : données de démo + paiements et mises en attente déduits. */
export function initialState(demo: DemoData): AppState {
  const d = clone(demo);
  const payments: Payment[] =
    d.payments ??
    d.invoices
      .filter((i) => i.dueStatus === 'paid')
      .map((i) => ({ id: `P-${i.id}`, invoiceId: i.id, amount: i.amount, date: i.paidOn ?? d.today, method: '[à préciser]', reconciled: true }));
  const holds: Hold[] =
    d.holds ??
    Object.entries(d.decisions)
      .filter(([, dec]) => dec.hold)
      .map(([invoiceId, dec], n) => ({
        ...dec.hold!,
        id: `H-${n + 1}`,
        targetId: dec.hold!.scope === 'INVOICE' ? invoiceId : d.invoices.find((i) => i.id === invoiceId)?.clientId,
        createdAt: '2026-09-27T17:00',
      }));
  return { ...d, payments, holds, notes: d.notes ?? [] };
}

function pushEvent(s: AppState, e: Omit<BusinessEvent, 'at'> & { at?: string }) {
  s.events = [{ at: e.at ?? stamp(s.today), ...e } as BusinessEvent, ...s.events];
}

const clientName = (s: AppState, id: string) => s.clients.find((c) => c.id === id)?.name ?? id;

// ---------------------------------------------------------------- identifiants
export function nextInvoiceId(s: AppState): string {
  const max = Math.max(0, ...s.invoices.map((i) => Number(i.id.replace(/\D/g, '')) || 0));
  return `F-${String(max + 1).padStart(4, '0')}`;
}

export function nextClientId(s: AppState): string {
  const used = new Set(s.clients.map((c) => c.id));
  for (let c = 65; c <= 90; c++) if (!used.has(String.fromCharCode(c))) return String.fromCharCode(c);
  let n = s.clients.length + 1;
  while (used.has(`C${n}`)) n++;
  return `C${n}`;
}

// ---------------------------------------------------------------- clients
export interface NewClientInput {
  name: string;
  email?: string;
  phone?: string;
  sector?: string;
}

export function createClient(state: AppState, input: NewClientInput): { state: AppState; client: Client } {
  const name = input.name.trim();
  if (name.length < 2) throw new StoreError('Le nom du client est obligatoire.');
  if (state.clients.some((c) => c.name.toLowerCase() === name.toLowerCase())) throw new StoreError('Un client porte déjà ce nom.');
  if (input.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) throw new StoreError('Adresse e-mail invalide.');
  const s = clone(state);
  const client: Client = { id: nextClientId(s), rank: null, name, priority: null, risk: null, level: null, email: input.email?.trim() || undefined, phone: input.phone?.trim() || undefined, sector: input.sector || undefined };
  s.clients.push(client);
  pushEvent(s, { cat: 'client', title: 'Client créé', detail: `${name} · en attente d’évaluation par le Rule Engine`, tone: 'mid' });
  return { state: s, client };
}

// ---------------------------------------------------------------- factures
export interface NewInvoiceInput {
  clientId: string;
  amount: number;
  dueDate: string;
  id?: string;
}

export function createInvoice(state: AppState, input: NewInvoiceInput): { state: AppState; invoice: Invoice } {
  if (!state.clients.some((c) => c.id === input.clientId)) throw new StoreError('Choisissez un client.');
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new StoreError('Le montant doit être supérieur à 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) throw new StoreError('Date d’échéance invalide.');
  const s = clone(state);
  const id = (input.id?.trim() || nextInvoiceId(s)).toUpperCase();
  if (s.invoices.some((i) => i.id === id)) throw new StoreError(`Le numéro ${id} existe déjà.`);
  const pending = 'En attente d’évaluation par le Rule Engine';
  const invoice: Invoice = {
    id, clientId: input.clientId, amount: Math.round(input.amount), dueDate: input.dueDate, ...dueInfo(input.dueDate, s.today),
    rank: null, priority: null, risk: null, level: null, outcome: null, requiresApproval: false, actionState: null,
    action: pending, channel: null, note: pending, amountPaid: 0,
  };
  s.invoices.push(invoice);
  s.decisions[id] = { why: 'Nouvelle facture : le Rule Engine ne l’a pas encore évaluée. Risque, priorité et niveau de recouvrement apparaîtront après son évaluation.', traceCount: 0, stepIndex: -2, branch: '' } satisfies DecisionDetail;
  pushEvent(s, { cat: 'facture', title: 'Facture créée', detail: `${id} · ${clientName(s, input.clientId)} · ${fcfa(invoice.amount)} FCFA · échéance ${dateFr(input.dueDate)}`, tone: 'mid' });
  return { state: s, invoice };
}

// ---------------------------------------------------------------- paiements
export interface PaymentInput {
  invoiceId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
}

export const remaining = (i: Invoice) => i.amount - (i.amountPaid ?? (i.dueStatus === 'paid' ? i.amount : 0));

export function recordPayment(state: AppState, input: PaymentInput): { state: AppState; payment: Payment } {
  const s = clone(state);
  const inv = s.invoices.find((i) => i.id === input.invoiceId);
  if (!inv) throw new StoreError('Facture introuvable.');
  if (inv.dueStatus === 'paid') throw new StoreError('Cette facture est déjà payée.');
  const rest = remaining(inv);
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new StoreError('Le montant doit être supérieur à 0.');
  if (input.amount > rest) throw new StoreError(`Le montant dépasse le reste dû (${fcfa(rest)} FCFA).`);
  const payment: Payment = { id: `P-${s.payments.length + 1}-${inv.id}`, invoiceId: inv.id, amount: Math.round(input.amount), date: input.date, method: input.method, reconciled: true };
  s.payments.push(payment);
  inv.amountPaid = (inv.amountPaid ?? 0) + payment.amount;
  const left = inv.amount - inv.amountPaid;
  if (left <= 0) {
    Object.assign(inv, {
      dueStatus: 'paid', delayLabel: `payée le ${dateFr(input.date).slice(0, 5)}`, paidOn: input.date,
      rank: null, priority: null, risk: null, level: null, outcome: null, requiresApproval: false, actionState: null,
      action: `Encaissée le ${dateFr(input.date)}`, note: `Encaissée le ${dateFr(input.date)}`,
    } satisfies Partial<Invoice>);
    s.tasks = s.tasks.filter((t) => t.invoiceId !== inv.id);
  } else {
    inv.note = `Paiement partiel : ${fcfa(inv.amountPaid)} encaissé · reste ${fcfa(left)} FCFA`;
  }
  pushEvent(s, { cat: 'paiement', title: left <= 0 ? 'Paiement reçu' : 'Paiement partiel reçu', detail: `${inv.id} · ${clientName(s, inv.clientId)} · ${fcfa(payment.amount)} FCFA · ${input.method}`, tone: 'lime' });
  return { state: s, payment };
}

// ---------------------------------------------------------------- mises en attente
export interface HoldInput {
  scope: Hold['scope'];
  type: Hold['type'];
  targetId?: string;
  retryAt: string;
  cause: string;
}

export function placeHold(state: AppState, input: HoldInput): { state: AppState; hold: Hold } {
  if (input.scope !== 'ORGANIZATION' && !input.targetId) throw new StoreError('Choisissez la facture ou le client concerné.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.retryAt)) throw new StoreError('Date de réessai invalide.');
  if (daysBetween(state.today, input.retryAt) <= 0) throw new StoreError('La date de réessai doit être postérieure à aujourd’hui.');
  const s = clone(state);
  const hold: Hold = { ...input, cause: input.cause.trim() || '[cause à préciser]', id: `H-${s.holds.length + 1}`, createdAt: stamp(s.today) };
  s.holds.push(hold);
  const target = input.scope === 'ORGANIZATION' ? 'toute l’organisation' : input.scope === 'CUSTOMER' ? clientName(s, input.targetId!) : input.targetId!;
  pushEvent(s, { cat: 'hold', title: 'Mise en attente placée', detail: `${target} · réessai prévu le ${dateFr(input.retryAt)} · décision à réévaluer par le Rule Engine`, tone: 'amber' });
  return { state: s, hold };
}

/** Mises en attente qui couvrent une facture (portée facture, client ou organisation). */
export const holdsFor = (s: Pick<AppState, 'holds'>, inv: Invoice) =>
  s.holds.filter((h) => h.scope === 'ORGANIZATION' || (h.scope === 'INVOICE' && h.targetId === inv.id) || (h.scope === 'CUSTOMER' && h.targetId === inv.clientId));

// ---------------------------------------------------------------- approbation
export interface ApprovalInput {
  invoiceId: string;
  decision: 'APPROVED' | 'REFUSED';
  reason: string;
}

export function decideApproval(state: AppState, input: ApprovalInput): { state: AppState } {
  const s = clone(state);
  const inv = s.invoices.find((i) => i.id === input.invoiceId);
  if (!inv) throw new StoreError('Facture introuvable.');
  if (!inv.requiresApproval) throw new StoreError('Aucune approbation n’est en attente sur cette facture.');
  if (input.reason.trim().length < 3) throw new StoreError('Indiquez un motif (3 caractères minimum).');
  inv.requiresApproval = false;
  if (input.decision === 'APPROVED') {
    inv.action = inv.action.replace(' · en attente d’approbation', '') + ' · approuvé';
    s.tasks = s.tasks.map((t) => (t.invoiceId === inv.id ? { ...t, blockedByApproval: false } : t));
  } else {
    inv.actionState = 'CANCELLED' as ActionState;
    inv.action = 'Action annulée · approbation refusée';
    s.tasks = s.tasks.map((t) => (t.invoiceId === inv.id ? { ...t, blockedByApproval: false, state: 'CANCELLED' } : t));
  }
  pushEvent(s, { cat: 'decision', title: input.decision === 'APPROVED' ? 'Approbation accordée' : 'Approbation refusée', detail: `${inv.id} · ${clientName(s, inv.clientId)} · motif : ${input.reason.trim()}`, tone: input.decision === 'APPROVED' ? 'lime' : 'red' });
  return { state: s };
}

// ---------------------------------------------------------------- notes
export function addNote(state: AppState, input: { invoiceId: string; text: string }): { state: AppState; note: Note } {
  const text = input.text.trim();
  if (!text) throw new StoreError('La note est vide.');
  const s = clone(state);
  const note: Note = { id: `N-${s.notes.length + 1}`, invoiceId: input.invoiceId, text, at: stamp(s.today) };
  s.notes.unshift(note);
  return { state: s, note };
}

// ---------------------------------------------------------------- tâches (ClaimTask / CompleteTask)
export function transitionTask(state: AppState, id: string, action: 'claim' | 'complete'): { state: AppState; task: Task } {
  const s = clone(state);
  const t = s.tasks.find((x) => x.id === id);
  if (!t) throw new StoreError('Tâche introuvable.');
  if (action === 'claim') {
    if (t.blockedByApproval) throw new StoreError('Approbation requise : prise en charge impossible.');
    if (!['RESCHEDULED', 'PROPOSED'].includes(t.state)) throw new StoreError(`Transition impossible depuis l’état ${t.state}.`);
    t.state = 'CLAIMED';
  } else {
    if (t.state !== 'CLAIMED') throw new StoreError('Seule une tâche prise en charge peut être clôturée.');
    t.state = 'COMPLETED';
  }
  pushEvent(s, { cat: 'action', title: action === 'claim' ? 'Tâche prise en charge' : 'Tâche clôturée', detail: `${t.invoiceId} · ${t.label}`, tone: action === 'claim' ? 'mid' : 'lime' });
  return { state: s, task: t };
}

// ---------------------------------------------------------------- indicateurs (calculés)
export function computeKpis(s: AppState): Record<string, Kpi> {
  const open = s.invoices.filter((i) => i.dueStatus !== 'paid');
  const sum = (xs: Invoice[]) => xs.reduce((a, i) => a + remaining(i), 0);
  const in30 = open.filter((i) => i.dueStatus !== 'late' && daysBetween(s.today, i.dueDate) <= 30);
  const late = open.filter((i) => i.dueStatus === 'late');
  const risky = open.filter((i) => i.risk === 'Élevé' || i.risk === 'Critique');
  const month = s.today.slice(0, 7);
  const monthPay = s.payments.filter((p) => p.date.startsWith(month));
  return {
    ...s.kpis,
    expected30d: { value: sum(in30), count: in30.length },
    collectedMonth: { value: monthPay.reduce((a, p) => a + p.amount, 0), count: monthPay.length },
    openReceivables: { value: sum(open), count: open.length },
    atRisk: { value: sum(risky), count: risky.length },
    late: { value: sum(late), count: late.length },
  };
}

/** Export CSV (séparateur « ; » pour Excel en français). */
export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const t = String(v);
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
}
