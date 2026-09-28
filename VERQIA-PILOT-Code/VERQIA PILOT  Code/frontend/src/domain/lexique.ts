/**
 * Vocabulaire métier VERQIA — source : shared/lexique.json.
 * Règle : un terme = un sens. Libellé français à l'écran, code moteur en détail.
 */
import lexique from '@shared/lexique.json';
import type { ActionState, DueStatus, Invoice, OutcomeKey, Priority, Risk } from './types';

export const LEXIQUE = lexique;
export const OUTCOME_LABEL = lexique.labels.outcome as Record<OutcomeKey, string>;
export const STATE_LABEL = lexique.labels.actionState as Record<ActionState, string>;
export const DUE_LABEL = lexique.labels.dueStatus as Record<DueStatus, string>;
export const HOLD_TYPE_LABEL = lexique.labels.holdType as Record<string, string>;
export const HOLD_SCOPE_LABEL = lexique.labels.holdScope as Record<string, string>;

/** Chemin principal du cycle d'une action. */
export const MAIN_PATH: ActionState[] = ['PROPOSED', 'SCHEDULED', 'EXECUTING', 'DONE'];
/** Chemin d'une tâche manuelle (ClaimTask → CompleteTask). */
export const TASK_PATH: ActionState[] = ['RESCHEDULED', 'CLAIMED', 'COMPLETED'];

/** Clé d'affichage de la décision d'une facture. */
export function outcomeKey(inv: Pick<Invoice, 'outcome' | 'requiresApproval' | 'dueStatus'>): OutcomeKey {
  if (inv.dueStatus === 'paid') return 'PAID';
  if (!inv.outcome) return 'NONE';
  if (inv.outcome === 'PROCEED' && inv.requiresApproval) return 'APPROVAL';
  return inv.outcome;
}

/** Code moteur affiché en détail. */
export function outcomeCode(key: OutcomeKey): string {
  if (key === 'APPROVAL') return 'PROCEED · requires_approval';
  if (key === 'NONE' || key === 'PAID') return '—';
  return key;
}

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Classe CSS d'un niveau de risque : « Élevé » → « eleve ». */
export const riskClass = (r: Risk | null) => (r ? strip(r) : 'none');
/** Classe CSS d'une priorité : « Urgente » → « urgente ». */
export const priorityClass = (p: Priority | null) => (p ? strip(p) : 'none');

/** Texte de statut d'échéance, ex. « En retard · 12 j ». */
export function dueText(inv: Invoice): string {
  if (inv.dueStatus === 'late') return `En retard · ${inv.delayLabel.replace(' de retard', '')}`;
  if (inv.dueStatus === 'paid') return `Payée · ${(inv.paidOn ?? '').slice(8, 10)}/${(inv.paidOn ?? '').slice(5, 7)}`;
  return `${DUE_LABEL[inv.dueStatus]} · ${inv.delayLabel}`;
}
