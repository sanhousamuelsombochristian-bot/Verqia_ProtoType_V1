import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { dateFr, fcfa } from '@/domain/format';
import { HOLD_SCOPE_LABEL, HOLD_TYPE_LABEL, STATE_LABEL, outcomeCode, outcomeKey } from '@/domain/lexique';
import { DecisionDrawer, TaskCard } from '@/components/decision';
import { ApprovalDialog, HoldDialog } from '@/components/forms';
import { InvoiceOutcome, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, Tabs } from '@/components/ui';

type TabKey = 'file' | 'appro' | 'hold' | 'diff' | 'task';

const GUARDS = [
  ['Le Rule Engine décide', 'L’interface affiche sa décision ; elle ne la recalcule jamais.'],
  ['Mise en attente → Différée', 'Une action sous mise en attente active attend la date de réessai prévue.'],
  ['Supprimée ≠ erreur', 'Une suppression est une décision métier, expliquée par son code.'],
  ['Override revalidé', 'Un override est une preuve, revérifiée au moment de l’exécution.'],
];

/** Recouvrement : exécuter les décisions du Rule Engine. */
export default function Recouvrement() {
  const { tasks, data } = useData();
  const { queue, byId } = useInvoices();
  const clients = useClients();
  const drawer = useDrawer();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as TabKey) || 'file';
  const setTab = (k: TabKey) => setParams({ tab: k }, { replace: true });
  const [deciding, setDeciding] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const name = (clientId: string) => clients.byId(clientId)?.name ?? '';
  const approvals = queue.filter((i) => i.requiresApproval);
  const deferredOrSuppressed = queue.filter((i) => i.outcome === 'DEFER' || i.outcome === 'SUPPRESS');

  return (
    <>
      <PageHeader title="Recouvrement" sub="Exécutez les décisions du Rule Engine : file d’actions, approbations, mises en attente et tâches manuelles." />
      <div className="vq-grid cols-4">
        {GUARDS.map(([t, d]) => (
          <div key={t} className="vq-tile"><strong style={{ color: 'var(--heading)' }}>{t}</strong><span className="vq-sub" style={{ lineHeight: 1.45 }}>{d}</span></div>
        ))}
      </div>
      <section className="vq-card" style={{ gap: 10 }}>
        <Tabs label="Vues du recouvrement" value={tab} onChange={setTab} tabs={[
          { key: 'file', label: 'File d’actions', count: queue.length },
          { key: 'appro', label: 'Approbations', count: approvals.length },
          { key: 'hold', label: 'Mises en attente', count: data.holds.length },
          { key: 'diff', label: 'Différées & supprimées', count: deferredOrSuppressed.length },
          { key: 'task', label: 'Tâches manuelles', count: tasks.length },
        ]} />

        {tab === 'file' && (
          <div className="vq-table-wrap">
            <table className="vq-table">
              <thead><tr><th>Rang</th><th>Client · facture</th><th className="num">Montant</th><th>Priorité</th><th>Risque</th><th>Niveau</th><th>Décision</th><th>État de l’action</th><th /></tr></thead>
              <tbody>
                {queue.map((i) => (
                  <tr key={i.id}>
                    <td><RankTag rank={i.rank} /></td>
                    <td><div className="strong">{name(i.clientId)}</div><div className="small">{i.id} · {i.delayLabel}</div></td>
                    <td className="num">{fcfa(i.amount)}</td>
                    <td><PriorityPill value={i.priority} /></td>
                    <td><RiskBadge value={i.risk} /></td>
                    <td><LevelChip value={i.level} /></td>
                    <td><InvoiceOutcome invoice={i} /></td>
                    <td>{i.actionState && <><strong style={{ color: 'var(--heading)' }}>{STATE_LABEL[i.actionState]}</strong> <span className="vq-code">{i.actionState}</span></>}<div className="small">{i.action}</div></td>
                    <td><button type="button" className="vq-btn sm" onClick={() => drawer.open(i.id)}>Pourquoi ?</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'appro' && approvals.length === 0 && <p className="vq-sub" style={{ padding: '12px 0' }}>Aucune approbation en attente. Les décisions prises sont tracées dans le journal des événements.</p>}
        {tab === 'appro' && approvals.map((i) => (
          <div key={i.id} className="vq-callout amber filled" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20 }}>
            <div className="title-amber">APPROBATION REQUISE</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--heading)' }}>{i.action.split(' · ')[0]} · {name(i.clientId)}</div>
            <div className="vq-sub"><span className="vq-mono">{i.id}</span> · {fcfa(i.amount)} FCFA · {i.delayLabel} · {i.note}</div>
            <div>Le Rule Engine a retourné « À exécuter » avec approbation requise : l’action ne sera pas exécutée automatiquement.</div>
            <div className="vq-code">outcome = {outcomeCode(outcomeKey(i))} · [primary_exception] · [rule_ref]</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="vq-btn sm" onClick={() => drawer.open(i.id)}>Examiner la décision</button>
              <button type="button" className="vq-btn sm primary" onClick={() => setDeciding(i.id)}>Décider</button>
            </div>
            <div className="vq-sub">Le parcours détaillé d’approbation (rôles habilités, motifs) reste à spécifier avec le moteur.</div>
          </div>
        ))}

        {tab === 'hold' && (
          <>
            <div className="vq-table-wrap">
              <table className="vq-table">
                <thead><tr><th>Objet</th><th>Portée</th><th>Type</th><th>Réessai prévu</th><th>Cause</th><th /></tr></thead>
                <tbody>
                  {data.holds.length === 0 && <tr><td colSpan={6} className="vq-muted">Aucune mise en attente active.</td></tr>}
                  {data.holds.map((h) => {
                    const inv = h.scope === 'INVOICE' ? byId(h.targetId ?? '') : queue.find((i) => i.clientId === h.targetId);
                    const label = h.scope === 'ORGANIZATION' ? 'Toute l’organisation' : h.scope === 'CUSTOMER' ? name(h.targetId ?? '') : `${h.targetId} · ${name(inv?.clientId ?? '')}`;
                    return (
                      <tr key={h.id ?? h.retryAt}>
                        <td><div className="strong">{label}</div>{inv && <div className="small">{inv.id} · {fcfa(inv.amount)} FCFA</div>}</td>
                        <td>{HOLD_SCOPE_LABEL[h.scope]} <div className="vq-code">{h.scope}</div></td>
                        <td style={{ color: 'var(--amber-text)', fontWeight: 700 }}>{HOLD_TYPE_LABEL[h.type]} <div className="vq-code">{h.type}</div></td>
                        <td>{dateFr(h.retryAt)} <div className="vq-code">retry_at</div></td>
                        <td className="vq-muted">{h.cause}</td>
                        <td>{inv && <button type="button" className="vq-btn sm" onClick={() => drawer.open(inv.id)}>Voir la décision</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="vq-grid cols-2">
              <div className="vq-tile"><div className="vq-label">Portées possibles</div>Facture <span className="vq-code">INVOICE</span> · Client <span className="vq-code">CUSTOMER</span> · Organisation <span className="vq-code">ORGANIZATION</span></div>
              <div className="vq-tile"><div className="vq-label">Types de mise en attente</div>Suspension manuelle <span className="vq-code">MANUAL_SUSPENSION</span> · Juridique <span className="vq-code">LEGAL</span> · Négociation <span className="vq-code">NEGOTIATION</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span className="vq-sub">Tant qu’une mise en attente est active, les actions concernées sont différées jusqu’au réessai prévu.</span>
              <button type="button" className="vq-btn sm" onClick={() => setHolding(true)}>+ Placer une mise en attente</button>
            </div>
          </>
        )}

        {tab === 'diff' && deferredOrSuppressed.map((i) => (
          <div key={i.id} className="vq-tile" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 200 }}><div className="strong" style={{ color: 'var(--heading)', fontWeight: 700 }}>{name(i.clientId)}</div><div className="vq-sub">{i.id} · {fcfa(i.amount)} FCFA</div></div>
            <div style={{ width: 170 }}><InvoiceOutcome invoice={i} /><div className="vq-code" style={{ marginTop: 6 }}>{outcomeCode(outcomeKey(i))}</div></div>
            <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, lineHeight: 1.5 }}>{i.outcome === 'DEFER' ? 'Mise en attente de négociation (portée Client). L’action est différée jusqu’au 02/10/2026, date de réessai prévue.' : 'Le moteur a supprimé le rappel prévu. La raison est portée par le code de suppression [suppression_code].'}</div>
            <button type="button" className="vq-btn sm" onClick={() => drawer.open(i.id)}>Pourquoi ?</button>
          </div>
        ))}

        {tab === 'task' && tasks.map((t) => <TaskCard key={t.id} task={t} onWhy={drawer.open} />)}
      </section>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
      <ApprovalDialog invoiceId={deciding} onClose={() => setDeciding(null)} />
      <HoldDialog open={holding} onClose={() => setHolding(false)} />
    </>
  );
}
