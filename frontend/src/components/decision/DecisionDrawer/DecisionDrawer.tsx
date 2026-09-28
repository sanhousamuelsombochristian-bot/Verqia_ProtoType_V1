import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { holdsFor } from '@/services/store';
import { ApprovalDialog } from '@/components/forms';
import { HOLD_SCOPE_LABEL, HOLD_TYPE_LABEL, MAIN_PATH, STATE_LABEL, outcomeCode, outcomeKey } from '@/domain/lexique';
import { dateFr, fcfa } from '@/domain/format';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { LevelChip, OutcomeTag, PriorityPill, RankTag, RiskBadge } from '@/components/ui';
import './DecisionDrawer.css';

/**
 * Panneau « Pourquoi ? » — affiche la décision du Rule Engine, sans jamais la recalculer.
 * Utilisé par la vue d'ensemble, les factures, le recouvrement, le risque et les fiches facture.
 */
export function DecisionDrawer({ invoiceId, onClose }: { invoiceId: string | null; onClose: () => void }) {
  const { data } = useData();
  const { byId } = useInvoices();
  const clients = useClients();
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !deciding && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [invoiceId, onClose, deciding]);

  if (!invoiceId) return null;
  const inv = byId(invoiceId);
  const dec = data.decisions[invoiceId];
  if (!inv || !dec) return null;
  const key = outcomeKey(inv);
  const client = clients.byId(inv.clientId);
  const holds = holdsFor(data, inv);

  return (
    <div className="vq-drawer-scrim" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Détail de la décision du Rule Engine" className="vq-drawer" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="vq-btn sm close" aria-label="Fermer" onClick={onClose}>×</button>
        <div className="head">
          <div className="vq-eyebrow">Décision du Rule Engine</div>
          <div className="client">{client?.name}</div>
          <div className="vq-sub">{inv.id} · {fcfa(inv.amount)} FCFA · échéance {dateFr(inv.dueDate)} ({inv.delayLabel})</div>
        </div>

        <section>
          <div className="vq-label">Résumé · 3 dimensions indépendantes</div>
          <div className="dims">
            <div className="dim"><div className="vq-label">Risque</div><RiskBadge value={inv.risk} /><span className="vq-code">risk_level</span></div>
            <div className="dim"><div className="vq-label">Priorité · rang</div><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><PriorityPill value={inv.priority} /><RankTag rank={inv.rank} /></div><span className="vq-code">priority_level</span></div>
            <div className="dim"><div className="vq-label">Niv. de recouvrement</div><LevelChip value={inv.level} /><span className="vq-code">collection_level</span></div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <OutcomeTag outcome={key} />
            <span style={{ fontSize: 12.5, color: 'var(--muted2)' }}>Approbation : {inv.requiresApproval ? 'requise' : 'non requise'}</span>
          </div>
          <div className="vq-code">outcome = {outcomeCode(key)} · requires_approval = {String(inv.requiresApproval)}</div>
        </section>

        <section>
          <div className="vq-label">Pourquoi ?</div>
          <p className="why">{dec.why}</p>
          <dl className="trace">
            <div><dt>Exception principale</dt><dd>[primary_exception]</dd></div>
            <div><dt>Trace des exceptions</dt><dd>[exceptions_trace · {dec.traceCount}]</dd></div>
            <div><dt>Règle de référence</dt><dd>[rule_ref]</dd></div>
          </dl>
        </section>

        {holds.map((h) => (
          <div key={h.id ?? h.retryAt} className="vq-callout amber">
            <div className="title-amber">Mise en attente active (hold) · action différée</div>
            Type : {HOLD_TYPE_LABEL[h.type]} <span className="vq-code">{h.type}</span> · Portée : {HOLD_SCOPE_LABEL[h.scope]} <span className="vq-code">{h.scope}</span>
            <br />Réessai prévu : {dateFr(h.retryAt)} <span className="vq-code">retry_at</span>
            <br /><span className="vq-muted">Cause : {h.cause}</span>
          </div>
        ))}
        {dec.suppressionCode && (
          <div className="vq-callout">
            <strong>Action supprimée · décision métier</strong><br />
            Code de suppression : <span className="vq-mono">{dec.suppressionCode}</span><br />
            <span className="vq-muted">Une action supprimée n’est pas une erreur technique.</span>
          </div>
        )}
        {dec.override && (
          <div className="vq-callout" style={{ borderColor: 'var(--heading)' }}>
            <strong>Override actif · à revalider à l’exécution</strong><br />
            L’autorisation (grant) est une preuve, pas une autorité. Avant exécution, VERQIA revérifie : acteur actif · rôle suffisant · organisation active · exception toujours overridable · action manuelle · autorisation attachée.
          </div>
        )}
        {inv.requiresApproval && (
          <div className="vq-callout amber filled">
            <div className="title-amber">Approbation requise</div>
            L’action ne sera pas exécutée automatiquement. Un utilisateur habilité doit décider.
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" className="vq-btn sm" onClick={() => { onClose(); navigate('/app/recouvrement?tab=appro'); }}>Voir la demande</button>
              <button type="button" className="vq-btn sm primary" onClick={() => setDeciding(inv.id)}>Décider</button>
            </div>
          </div>
        )}
        {dec.stepIndex === -2 && <div className="vq-callout dashed">Aucune action n’est retournée par le Rule Engine pour cette facture à ce jour.</div>}

        {dec.stepIndex > -2 && (
          <section>
            <div className="vq-label">Cycle de l’action</div>
            <ol className="steps">
              {MAIN_PATH.map((code, i) => (
                <li key={code} className={i === dec.stepIndex ? 'now' : i < dec.stepIndex ? 'done' : ''}>
                  <span>{STATE_LABEL[code]}</span>
                  <span className="vq-code">{code}</span>
                </li>
              ))}
            </ol>
            <div style={{ fontSize: 13, color: 'var(--muted2)' }}>{dec.branch}</div>
            <div style={{ fontSize: 13.5 }}><strong style={{ color: 'var(--heading)' }}>Action :</strong> {inv.action}</div>
          </section>
        )}

        <ApprovalDialog invoiceId={deciding} onClose={() => setDeciding(null)} />
        <p className="foot">Cette interface affiche la décision du Rule Engine, elle ne la recalcule pas. Les codes entre crochets proviendront du moteur — valeurs de démonstration.</p>
      </aside>
    </div>
  );
}
