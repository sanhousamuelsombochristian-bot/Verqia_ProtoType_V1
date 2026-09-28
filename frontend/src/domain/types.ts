/**
 * Types du domaine VERQIA PILOT.
 * Risque, priorité et niveau de recouvrement sont trois dimensions
 * INDÉPENDANTES, retournées séparément par le Rule Engine.
 */
export type DueStatus = 'late' | 'near' | 'future' | 'paid';
export type Outcome = 'PROCEED' | 'DEFER' | 'SUPPRESS' | 'OVERRIDDEN';
export type ActionState =
  | 'PROPOSED' | 'SCHEDULED' | 'EXECUTING' | 'DONE' | 'CANCELLED' | 'SUPPRESSED' | 'FAILED'
  | 'CLAIMED' | 'COMPLETED' | 'RESCHEDULED';
export type Risk = 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
export type Priority = 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';

/** Clé d'affichage d'une décision (APPROVAL = PROCEED + requires_approval). */
export type OutcomeKey = Outcome | 'APPROVAL' | 'NONE' | 'PAID';

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  dueStatus: DueStatus;
  delayLabel: string;
  paidOn?: string | null;
  rank: number | null;
  priority: Priority | null;
  risk: Risk | null;
  level: string | null;
  outcome: Outcome | null;
  requiresApproval: boolean;
  actionState: ActionState | null;
  action: string;
  channel: string | null;
  note: string;
}

export interface Client {
  id: string;
  rank: number;
  name: string;
  priority: Priority;
  risk: Risk;
  level: string;
  openInvoices?: number;
  outstanding?: number;
}

export type EventCat = 'decision' | 'action' | 'hold' | 'promesse' | 'paiement' | 'facture';
export interface BusinessEvent {
  cat: EventCat;
  title: string;
  detail: string;
  at: string;
  tone: string;
}

export interface Hold {
  type: 'MANUAL_SUSPENSION' | 'LEGAL' | 'NEGOTIATION';
  scope: 'INVOICE' | 'CUSTOMER' | 'ORGANIZATION';
  retryAt: string;
  cause: string;
}

export interface DecisionDetail {
  why: string;
  traceCount: number;
  /** Index dans PROPOSED → SCHEDULED → EXECUTING → DONE ; -1 = supprimée, -2 = aucune action */
  stepIndex: number;
  branch: string;
  hold?: Hold;
  suppressionCode?: string;
  override?: boolean;
}

export interface PaymentPromise {
  invoiceId: string;
  clientId: string;
  amount: number;
  promisedFor: string | null;
  status: 'EN_COURS' | 'TENUE' | 'ROMPUE';
  createdAt: string | null;
  note: string;
}

export interface Task {
  id: string;
  invoiceId: string;
  label: string;
  state: ActionState;
  blockedByApproval: boolean;
}

export interface Kpi {
  value: number;
  count?: number;
  trend?: string;
  scenario?: string;
  note?: string;
}

export interface DemoData {
  today: string;
  disclaimer: string;
  invoices: Invoice[];
  clients: Client[];
  events: BusinessEvent[];
  decisions: Record<string, DecisionDetail>;
  promises: PaymentPromise[];
  tasks: Task[];
  kpis: Record<string, Kpi>;
  scenarios: { start: number; slopes: Record<'pess' | 'base' | 'opt', number>; note: string };
}
