/** Les 3 dimensions indépendantes + la décision : formes distinctes, jamais confondues.
 *  Risque = pastille ronde · Priorité = pilule · Niveau = carré mono. */
import { DUE_LABEL, OUTCOME_LABEL, dueText, outcomeKey, priorityClass, riskClass } from '@/domain/lexique';
import type { Invoice, OutcomeKey, Priority, Risk } from '@/domain/types';

export const PriorityPill = ({ value }: { value: Priority | null }) => (
  <span className={`vq-prio ${priorityClass(value)}`}>{value ?? '—'}</span>
);

export const RiskBadge = ({ value }: { value: Risk | null }) => (
  <span className={`vq-risk ${riskClass(value)}`}>{value ?? '—'}</span>
);

export const LevelChip = ({ value }: { value: string | null }) =>
  value ? <span className="vq-level" title="Niveau de recouvrement (collection_level)">{value}</span> : null;

export const RankTag = ({ rank }: { rank: number | null }) =>
  rank === null ? null : <span className="vq-rank">#{String(rank).padStart(2, '0')}</span>;

export function OutcomeTag({ outcome }: { outcome: OutcomeKey }) {
  return <span className={`vq-outcome ${outcome.toLowerCase()}`}>{OUTCOME_LABEL[outcome]}</span>;
}

export const InvoiceOutcome = ({ invoice }: { invoice: Invoice }) => <OutcomeTag outcome={outcomeKey(invoice)} />;

export const DueStatus = ({ invoice }: { invoice: Invoice }) => (
  <span className={`vq-due ${invoice.dueStatus}`} title={DUE_LABEL[invoice.dueStatus]}>
    {dueText(invoice)}
  </span>
);
